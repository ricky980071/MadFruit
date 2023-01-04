import mongoose from 'mongoose';
const Schema = mongoose.Schema;


const RoomSchema = new Schema({
    id: {
        type:String
    },
    player1: {
        id: {
            type:String
        },

        name: {
            type: String
        },
        isReady: {
            type: Number
        },
        character: {
            type: Number
        }
    },
    player2: {
        id: {
            type:String
        },
        name: {
            type: String,
        },
        isReady: {
            type: Number
        },
        character: {
            type: Number
        }
    }
});
const RoomModel =
    mongoose.model('Room',
        RoomSchema);

export default RoomModel