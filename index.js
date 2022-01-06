'use strict';

const constants = require('./constants');
const SOCKET_EVENT = constants.Sockets;
var nodeStatic = require('node-static');
var http = require('http');
var socketIO = require('socket.io');
const port = process.env.PORT || 3000;

var fileServer = new (nodeStatic.Server)();
var app = http.createServer(function (req, res) {
	fileServer.serve(req, res);
}).listen(port, () => console.log("listen ", port));

const io = socketIO(app);

io.sockets.on(SOCKET_EVENT.CONNECTION, function (socket) {
	console.log('Connected id ==> ', socket.id);

	socket.on(SOCKET_EVENT.C2S_CREATE_ROOM, function (room) {
		console.log('Created Room===>', room);

		socket.join(room.name);
		socket.emit(SOCKET_EVENT.S2C_CREATED_ROOM, room);
	});

	socket.on(SOCKET_EVENT.C2S_JOIN_ROOM, function (room) {
		console.log("Joined Room===>", room);

		socket.join(room.name);
		io.to(room.name).emit(SOCKET_EVENT.S2C_JOINED_ROOM, room);
	});

	socket.on(SOCKET_EVENT.C2S_ONLY_SIGNAL_ROOM, function (room) {
		console.log("Only Signal Room===>", room);

		socket.leave(room.name);
		io.to(room.name).emit(SOCKET_EVENT.S2C_ONLY_SIGNAL_ROOM, room);
	});

	socket.on(SOCKET_EVENT.C2S_ACCEPT_ROOM, function (room) {
		console.log("Accepted Room===>", room);

		io.to(room.name).emit(SOCKET_EVENT.S2C_ACCEPTED_ROOM, room);
	});

	socket.on(SOCKET_EVENT.C2S_DECLINE_ROOM, function (room) {
		console.log("Declined Room=====>", room);

		socket.leave(room.name);

		io.to(room.name).emit(SOCKET_EVENT.S2C_DECLINED_ROOM, room);
	});

	socket.on(SOCKET_EVENT.C2S_SEND_DATA_TO_ROOM, function (data) {
		console.log("Received Data=====>", data);

		io.to(data.room_name).emit(SOCKET_EVENT.S2C_SEND_DATA_TO_ROOM, data);
	});

	socket.on(SOCKET_EVENT.C2S_LEAVE_ROOM, function (room) {
		console.log("Left Room=====>", room);

		socket.leave(room.name);

		io.to(room.name).emit(SOCKET_EVENT.S2C_LEFT_ROOM, room);
	});
});
