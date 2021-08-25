'use strict';

const client = require('socket.io-client');
const host = "http://localhost:4000/discord";

const socket = client.connect(host);

// take the task value from argument form the terminal
// console.log(process.argv)
const value = process.argv.splice(2)[0];
console.log("value : ", value);
socket.emit('get_all-client');
socket.emit('client_msg', value);


// socket.emit('client_msg', "wash the dishes");


socket.on('added', payload=> {
    socket.on('res-client', item =>{
        console.log(item);
    });

    console.log("Thank you for adding : ", payload , " to the queue");
    // socket.disconnect();
});



socket.on('res-send', msg=> {
    console.log("client got this msg: ", msg)
    socket.emit('received-client', msg)

})