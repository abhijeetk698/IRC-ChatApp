const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
    created:{type:Date,default:Date.now},
    roomName: String,
    posts:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Post"
    }],
    users:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    admin : {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
});

module.exports = mongoose.model("Room",roomSchema);