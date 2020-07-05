const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    created:{type:Date,default:Date.now},
    roomName: String,
    body:String,
    userID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    roomID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Post"
    }
});

module.exports = mongoose.model("Post",postSchema);