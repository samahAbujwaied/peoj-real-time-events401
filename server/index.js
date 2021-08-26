// const app = require('express')()
// // const http = require('http').createServer(app)
// const io = require('socket.io')(4000)

// io.on('connection', socket => {
//   socket.on('message', ({ name, message }) => {
//     io.emit('message', { name, message })
//   })
// })


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 'use strict';
const app = require('express')()
const http = require('http').createServer(app)
const uuid = require('uuid').v4
// keep port in dotenv
const io = require('socket.io')(4000);
// can be stored in a database/ cache/ ...
// my queue is an object
// keyed queue

//  there will be no ordered preserved
const msgQueueClient = {
    data : {}
}
const msgQueueAdmin = {
    data : {}
}

const discord = io.of('/discord'); //namespace
discord.on('connection', socket=> {
    console.log("CONNECTED", socket.id)
    // when the parent adds a new chore
    socket.on('client_msg', ({ name, message })=> {
        console.log("adding a new task ....")
        const id = uuid();
        console.log("id ====> ", id)
        msgQueueClient.data[id] = { name, message };
        // socket.emit('added', payload); // telling the clinet a task was added      
        discord.emit('res-client', {name: msgQueueClient.data[id].name,message: msgQueueClient.data[id].message });/// lal admin===
        // console.log("after add msgQueueClient ========> ", msgQueueClient);
    });

    socket.on('admin_msg', ({ name, message })=> {
      console.log("adding a new task ....")
      const id = uuid();
      console.log("id ====> ", id)
      msgQueueAdmin.data[id] = { name, message };
      discord.emit('admin-data', { name: msgQueueAdmin.data[id].name,message: msgQueueAdmin.data[id].message });
    //   console.log("after add msgQueueAdmin ========> ", msgQueueAdmin);
    console.log(msgQueueAdmin.data[id].name,msgQueueAdmin.data[id].message);
  });


    socket.on('get_all', ()=> {
        console.log("get_all : all messages from client ")
        Object.keys(msgQueueClient.data).forEach(id=> {
            socket.emit('res-client', {name: msgQueueClient.data[id].name,message: msgQueueClient.data[id].message });
        });
    });
    
    socket.on('get_all-client', ()=> {
        console.log("get_all-client : all messages from admin")
        Object.keys(msgQueueAdmin.data).forEach(id=> {
            socket.emit('admin-data', { name: msgQueueAdmin.data[id].name,message: msgQueueAdmin.data[id].message });
      });
    });

    socket.on('received-client', msg => {
        console.log("admin received from client messages on queue will remove it ...")
        // he child confirmed receiving , remove from queue
        delete msgQueueClient.data[msg.id];
        console.log("after delete msgQueueClient @@@@@@@@@@ ", msgQueueClient)
    })
    socket.on('received-admin', msg => {
      console.log("client received from admin messages on queue will remove it ...")
      // he child confirmed receiving , remove from queue
    //   discord.emit('res-client','your message has been recevied');
      delete msgQueueAdmin.data[msg.id];
      console.log("after delete msgQueueAdmin @@@@@@@@@@ ", msgQueueAdmin)
  })
});

http.listen(4000, function() {
    console.log('listening on port 4000')
  })