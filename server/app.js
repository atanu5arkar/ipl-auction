import express from "express";
import http from "http";
import { Server } from "socket.io";

import "./utils/dbConnect.js";
import TeamModel from "./models/Team.js";

const app = express();
const port = 8000;
const server = http.createServer(app);
const io = new Server(server);

app.get('/', async (req, res) => {
    try {
        await TeamModel.find({})
    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: 'Internal Server Error!' });
    }
});

server.listen(port, () => {
    console.log('Server running at', port);
});