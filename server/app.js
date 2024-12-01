import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import "./utils/dbConnect.js";
import authMiddleware from "./middlewares/auth.js";

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
app.use(express.json());

const timers = {};
const tokenExpiry = Date.now() + 1000 * 60 * 60 * 8;

// Socket Authentication
io.use((socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error('Token not available!'));
        jwt.verify(token, 'sherl0ck');
        return next();
    } catch (error) {
        return next(new Error('Invalid Token!'));
    }
});

io.on('connection', (socket) => {
    setTimeout(() => socket.emit('auction-over'), 1000 * 60 * 60 * 4);

    function setTimer(team, player) {
        const { playerid, _id } = player;

        const timeout = setTimeout(async () => {
            try {
                await PlayerModel.updateOne({ playerid }, { teamid: team._id, status: false });

                // Update the new team
                await TeamModel.updateOne({ _id: team._id }, { $push: { players: player._id } });

                // Update the old team
                await TeamModel.updateOne({ teamid: player.teamid.teamid }, { $pull: { players: player._id } });
                return io.emit('update', `${player.fullname} is Sold to ${team.team}.`);

            } catch (error) {
                console.log(error);
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
            return io.emit('update', `${player.fullname} is On Bid for ${amount} Lakhs by ${team.team}.`);

        } catch (error) {
            console.log(error);
            return socket.emit('error', 'Something Went Wrong!');
        }
    });
});

app.get('/', authMiddleware, async (req, res) => {
    try {
        const teamData = await TeamModel.find({}).populate('players');
        return res.status(200).json(teamData);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: 'Internal Server Error!' });
    }
});

app.get('/auth', authMiddleware, (req, res) => {
    const { teamId } = req.team;
    return res.status(200).json({ teamId });
});

app.post('/login', async (req, res) => {
    try {
        const { teamId, password } = req.body;

        const team = await TeamModel.findOne({ teamid: +teamId });
        if (!team)
            return res.status(400).json({ msg: 'Invalid Credentials!' });

        const isPasswdValid = await bcrypt.compare(password, team.password);
        if (!isPasswdValid)
            return res.status(400).json({ msg: 'Invalid Credentials!' });

        const token = jwt.sign({ exp: tokenExpiry, teamId }, 'sherl0ck');
        return res.status(200).json({ token });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: 'Internal Server Error!' });
    }
});

server.listen(port, () => {
    console.log('Server running at', port);
});