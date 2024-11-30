import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
    team: {
        type: String,
        required: true
    },
    teamid: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    players: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'player'
    }]
});

const TeamModel = mongoose.model('team', teamSchema, 'teams');
export default TeamModel;