let users = [];

function enterUser(userID, username, roomID, socketID) {
	let user = { userID, username, roomID, socketID };
	users.push(user);
	return user;
}


// function userLeave(id) {
// 	const index = users.find((user) => user.socketId === id);
// 	if (index !== -1) {
// 		return users.splice(index, 1)[0];
// 	}
// }


function getAllRoomUsers(roomID) {
	//console.log(users);
	return users.filter((user) => user.roomID === roomID);
}

function getCurrentUser(socketID) {
	return users.find((user) => user.socketID === socketID);
}


module.exports = {
    enterUser,
    getAllRoomUsers,
	getCurrentUser
};