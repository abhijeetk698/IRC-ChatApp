var chatForm=document.getElementById("chat-form")
// get username and room from the url
const socket=io();

const roomName=document.getElementById("room-name");
const userList=document.getElementById("users");

const {username , room} = Qs.parse(location.search,{
    ignoreQueryPrefix:true
})

// joining room
socket.emit("joinRoom",{username,room});

socket.on('message',(message)=>{
    // logging the message
    console.log(message);

    // displaying message for every one
    ouputMessage(message);
    //managing scrolling 
    chatMessages.scrollTop=chatMessages.scrollHeight;

})

socket.on("roomUsers",({room,users})=>{
    console.log(users);
    outputRoomName(room);
    outputUser(users);
});


var chatMessages=document.querySelector(".chat-messages");
chatForm.addEventListener("submit",(e)=>{
    e.preventDefault();
    var msg=e.target.elements.msg.value;
    // get message text
    console.log(msg);

    // emit message to the server
    socket.emit('chatMessage',msg);

    // clearing the input 
    e.target.elements.msg.value='';
    e.target.elements.msg.focus();
});

// ouput message to the DOM

function ouputMessage(message) {
    const div=document.createElement('div');
    div.classList.add('message');
    div.innerHTML=`
    <p class="meta">${message.username}  <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>
    `;
    document.querySelector(".chat-messages").appendChild(div);
}

function outputRoomName(room){
    roomName.innerText = room;
}

// function to add users in the room
function outputUser(users){
    userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}
  `;
}