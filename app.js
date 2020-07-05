const express = require("express");
const app=express();
const PORT=3000 || process.env.PORT;
const http=require("http");
const path =require("path");
const socketIo=require("socket.io");
const mongoose=require('mongoose');
const bodyParser=require('body-parser');
const methodOverride=require('method-override');
const passport=require("passport");
const localStrategy = require("passport-local");


const formatMessages=require("./utils/messages");
const {userJoin,getCurrentUser,userLeave,getRoomUsers}=require("./utils/users");
var botName="chatchord"

const server=http.createServer(app);
const io=socketIo(server);


app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.set("view engine","ejs")
//set static folder 
app.use(express.static(path.join(__dirname,"public")))

/*****************DATABASE CONFIGURATION********************/
var uri="mongodb://localhost/chatApp";
mongoose.connect( uri,{ useNewUrlParser: true ,useUnifiedTopology: true });
const User=require("./models/user");
// const Post=require("./models/post");
const Room=require("./models/room");
/***********************************************************/


/*****************PASSPORT CONFIGURATION********************/

app.use(require("express-session")({
    secret : "do you know god of death likes apples",
    resave : false,
    saveUninitialized : false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req,res,next)=>{
    res.locals.currentUser=req.user;
    next();
});

/*****************SOCKET CONFIGURATION***********************/

// Run when server connects
io.on("connection",socket =>{
    // catching the server join room request
    socket.on("joinRoom",({username,room})=>{
        console.log("got the request ",username,room)
        const user=userJoin(socket.id,username,room);
        socket.join(user.room);
        // Welcome current user 
        socket.emit("message",formatMessages(botName,`Welcome to the ${botName}`));
        // Broadcast when a user connects
        socket.broadcast
        .to(user.room)
        .emit("message",formatMessages(botName,`${username} has joined a chat`));
        
        //sending the user room details
        io.to(user.room).emit("roomUsers",{
            room:user.room,
            users:getRoomUsers(user.room)
        })
    });

    // Listen for chat message
    socket.on("chatMessage",(msg)=>{
        // to display the message on the server
        //console.log(msg);
        // now every user will recieve the message
        const user=getCurrentUser(socket.id);
        io.to(user.room).emit("message",formatMessages(user.username,msg));
    });

    // Runs when client disconnects
    socket.on("disconnect",()=>{
        const user=userLeave(socket.id);
        if(user){
            io.to(user.room).emit("message",formatMessages(botName,`${user.username} has left the chat`));
            //sending the user room details
            io.to(user.room).emit("roomUsers",{
                room:user.room,
                users:getRoomUsers(user.room)
            })
        }
        
    });
    

    
});

/*************************HTTP ROUTES*******************************/

app.get("/",(req,res)=>{
    res.redirect("/home");
})
app.get("/home",isLoggedIn,(req,res)=>{
    console.log(req.user);
    res.render("home");
})
app.get("/chat",isLoggedIn,(req,res)=>{
    res.render("view-page");
})

app.get("/room",isLoggedIn,(req,res)=>{
    res.render("newRoom");
});

app.post("/room",isLoggedIn,(req,res)=>{
    var newRoom = req.body;
    newRoom.admin= req.user._id;
    Room.create(newRoom,(err,room)=>{
        if(err){
            console.log("some error occured while creating room",err);
        }else{
            console.log(`a new room has been created by ${req.user.username}`);
            room.users.push(req.user);
            room.save();
            console.log(room);
            User.findById(req.user._id,(err,newUser)=>{
                if(err){console.log(err);}
                else{
                    newUser.rooms.push(room);
                    newUser.save();
                    console.log(newUser);
                    res.redirect("/home");
                }
            })
        }
    })
});

/*******************PASSPORT ROUTES*************************/


app.get("/register",(req,res)=>{
    res.render("register");
});

app.post("/register",(req,res)=>{
    var newUser = {
        username:req.body.username,
        email:req.body.emailID,
        firstName:req.body.firstName,
        lastName:req.body.lastName
    };
    User.register(newUser,req.body.password,(err,user)=>{
        if(err){
            console.log(err);
            return res.redirect("/register");
        }
        passport.authenticate("local")(req,res,()=>{
            console.log(user);
            res.redirect("/home");
        });
    })
});

app.get("/login",(req,res)=>{
    res.render("login");
});

app.post("/login",passport.authenticate("local",{
    successRedirect:"/home",
    failureRedirect:"/login"
}),(req,res)=>{
});

app.get("/logout",(req,res)=>{
    req.logOut();
    res.redirect("/");
});

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }else{
        res.redirect("/login");
    }
}
/*****************************************************************/

server.listen(PORT,()=>{
    console.log("Server is running");
})
