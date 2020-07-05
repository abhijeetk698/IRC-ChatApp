const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");


const userSchema = new mongoose.Schema({
    username: String,
    password : String,
    firstName: String,
    lastName : String,
    email : String,
    posts:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Post"
    }],
    rooms:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Room"
    }]
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User",userSchema);