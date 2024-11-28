import mongoose from "mongoose";
import TeamModel from "../models/Team.js";
import PlayerModel from "../models/Player.js";

async function connectDB() {
    try {
        await mongoose.connect('mongodb+srv://atanusarkar1:Bootcamp@cs23.2jvvw4x.mongodb.net/ipl');
        console.log('Connected to Mongo.');

        // await PlayerModel.insertMany([
        //     {
        //         teamid: '6747e84738a0be00f0d32aed',
        //         fullname: 'MS Dhoni',
        //         playerid: 107,
        //         baseprice: 25,
        //         status: true,
        //     },
        //     {
        //         teamid: '6747e84738a0be00f0d32aed',
        //         fullname: 'Ravindra Jadeja',
        //         playerid: 108,
        //         baseprice: 18,
        //         status: true,
        //     },
        //     {
        //         teamid: '6747e84738a0be00f0d32aed',
        //         fullname: 'Deepak Chahar',
        //         playerid: 109,
        //         baseprice: 12,
        //         status: true,
        //     },
        //     {
        //         teamid: '6747e84738a0be00f0d32aed',
        //         fullname: 'Ruturaj Gaikwad',
        //         playerid: 110,
        //         baseprice: 15,
        //         status: true,
        //     },
        //     {
        //         teamid: '6747e84738a0be00f0d32aed',
        //         fullname: 'Moeen Ali',
        //         playerid: 111,
        //         baseprice: 13,
        //         status: true,
        //     },
        //     {
        //         teamid: '6747e84738a0be00f0d32aed',
        //         fullname: 'Dwayne Bravo',
        //         playerid: 112,
        //         baseprice: 11,
        //         status: true,
        //     },
        // ])

        let ids = await PlayerModel.find({ teamid: '6747e84738a0be00f0d32aed' }, "_id");
        ids = ids.map(obj => obj._id);
        await TeamModel.updateOne({ _id: "6747e84738a0be00f0d32aed" }, { players: ids });
        console.log('Done')

    } catch (error) {
        console.log('Unable to connect Mongo.');
    }
}

connectDB();