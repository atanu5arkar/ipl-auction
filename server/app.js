import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

import "./utils/dbConnect.js";
import redisClient from "./utils/redisClient.js";

import TeamModel from "./models/Team.js";
import PlayerModel from "./models/Player.js";

const app = express();
const port = 8000;
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*'
    }
});

app.use(cors());
const timers = {};

io.on('connection', (socket) => {
    socket.on('bid', async (bidData) => {
        try {
            const { teamid, playerid, amount } = bidData;
            
          console.log(bidData);
          
            const team = await TeamModel.findOne({ teamid });
           

            if (!team) return socket.emit('error', 'Invalid Team ID!');

            const player = await PlayerModel.findOne({ playerid }).populate('teamid');
            if (!player) return socket.emit('error', 'Invalid Player ID!');

           

            if (player.teamid.teamid == teamid || !player.status)
                return socket.emit('error', 'You cannot bid for this Player!');

            if (player.baseprice >= +amount)
                return socket.emit('error', 'Your Bid Amount is too low!');

            // Player is onBid
            // const currentBid = await redisClient.get(playerid);

            // if (currentBid && currentBid > amount)
            //     return socket.emit('error', 'Your Bid Amount is too low!');

            await redisClient.set(String(playerid), +amount, "EX", 20);

            io.emit('bid-placed', { playerid, teamid, amount });

            // console.log("updating");
            

            if (timers[playerid]) clearTimeout(timers[playerid]);

            timers[playerid] = setTimeout(async () => {
                try {
                    await TeamModel.updateOne(
                        { _id: player.teamid._id },
                        { $pull: { players: player._id } } 
                    );
                    await PlayerModel.updateOne({ playerid }, { teamid: team._id, status: false });
                    await TeamModel.updateOne(
                        { _id: team._id },
                        { $push: { players: player._id } } // Ensure `_id` types match
                    );
                    io.emit('update');
                } catch (error) {
                    return socket.emit('error', 'Something Went Wrong!');
                }
            }, 20 * 1000);


        } catch (error) {
            console.log(error);
            return socket.emit('error', 'Something Went Wrong!');
        }
    });
});

app.get('/', async (req, res) => {
    try {
        const teamData = await TeamModel.find({}).populate('players');
        return res.status(200).json(teamData);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: 'Internal Server Error!' });
    }
});

server.listen(port, () => {
    console.log('Server running at', port);
});