var users = [];

// pushing a user in the chat
function userJoin(id,username,room){
    const user={id, username, room}
    users.push(user);
    return user;
}

// getting the user

function getCurrentUser(id){
    return users.find(user=> user.id === id);
}

// when user leaves
function userLeave(id){
    var index=users.find(user=> user,id===id);
    if(index!=-1){
        return users.splice(index,1)[0];
    }
}

function getRoomUsers(room){
    return users.filter(users=> users.room===room);
}
module.exports={
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers
};