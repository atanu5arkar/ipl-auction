import mongoose from "mongoose";

const playerSchema = new mongoose.Schema({
    teamid: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'team'
    },
    fullname: {
        type: String,
        required: true
    },
    playerid: {
        type: Number,
        required: true
    },
    baseprice: {
        type: Number,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        required: true
    }
});

const PlayerModel = mongoose.model('player', playerSchema, 'players');
export default PlayerModel;