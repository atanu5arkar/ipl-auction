import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

import "./utils/dbConnect.js";
import TeamModel from "./models/Team.js";
import PlayerModel from "./models/Player.js";

const app = express();
const port = 8000;
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());

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