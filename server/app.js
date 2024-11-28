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

const timers = {}

io.on('connection', (socket) => {

    function setTimer(team, player) {
        const { playerid, _id } = player;

        const timeout = setTimeout(async () => {
            try {
                await PlayerModel.updateOne({ playerid }, { teamid: team._id, status: false });

                // Update the new team
                await TeamModel.updateOne({ _id: team._id }, { $push: { players: player._id } });

                // Update the old team
                await TeamModel.updateOne({ teamid: player.teamid.teamid }, { $pull: { players: player._id } });
                return io.emit('update');
            } catch (error) {
                return socket.emit('error', 'Something Went Wrong!');
            }
        }, 90 * 1000);
        return timers[playerid] = timeout;
    }

    socket.on('bid', async (bidData) => {
        try {
            let { teamid, playerid, amount } = bidData;

            const team = await TeamModel.findOne({ teamid });
            if (!team) return socket.emit('error', 'Invalid Team ID!');

            const player = await PlayerModel.findOne({ playerid }).populate('teamid');
            if (!player) return socket.emit('error', 'Invalid Player ID!');

            // No bidding if the player is placed or already on the team
            if (player.teamid.teamid == teamid || !player.status)
                return socket.emit('error', 'You cannot bid for the Player!');

            if (player.baseprice >= +amount)
                return socket.emit('error', 'Your Bid is Too Low!');

            if (player.currentbid) {
                if (player.currentbid >= amount)
                    return socket.emit('error', 'Your Bid is Too Low!');

                const timerid = timers[playerid];
                if (timerid) clearTimeout(timerid);
            }

            setTimer(team, player);

            await PlayerModel.updateOne({ playerid }, { currentbid: amount, endbid: Date.now() + 90 * 1000 });
            return io.emit('update');

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