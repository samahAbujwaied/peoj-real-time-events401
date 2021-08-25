// const app = require('express')()
// // const http = require('http').createServer(app)
// const io = require('socket.io')(4000)

// io.on('connection', socket => {
//   socket.on('message', ({ name, message }) => {
//     io.emit('message', { name, message })
//   })
// })

// http.listen(4000, function() {
//   console.log('listening on port 4000')
// })
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 'use strict';

const uuid = require('uuid').v4
// keep port in dotenv
const io = require('socket.io')(4000);
// can be stored in a database/ cache/ ...
// my queue is an object
// keyed queue

//  there will be no ordered preserved
const msgQueue = {
    chores : {}
}

const discord = io.of('/discord'); //namespace
discord.on('connection', socket=> {
    console.log("CONNECTED", socket.id)
    // when the parent adds a new chore
    socket.on('client_msg', payload=> {
        console.log("adding a new task ....")
        const id = uuid();
        console.log("id ====> ", id)
        msgQueue.chores[id] = payload;

        socket.emit('added', payload); // telling the clinet a task was added
        
        discord.emit('chore', {id: id, payload: msgQueue.chores[id]});
        console.log("after add msgQueue ========> ", msgQueue)
    });

    socket.on('admin_msg', payload=> {
      console.log("adding a new task ....")
      const id = uuid();
      console.log("id ====> ", id)
      msgQueue.chores[id] = payload;
      discord.emit('res-send', {id: id, payload: msgQueue.chores[id]});
      console.log("after add msgQueue ========> ", msgQueue);
  });


    socket.on('get_all', ()=> {
        console.log("get_all : admin wants to get its msgs ")
        Object.keys(msgQueue.chores).forEach(id=> {
            socket.emit('chore', {id: id, payload: msgQueue.chores[id] })
        });
    });

    socket.on('get_all-client', ()=> {
      console.log("get_all : client wants to get its msgs ")
      Object.keys(msgQueue.chores).forEach(id=> {
          socket.emit('res-send', {id: id, payload: msgQueue.chores[id] })
      });
  });

    socket.on('received-client', msg => {
        console.log("received on queue will remove it ...")
        // he child confirmed receiving , remove from queue
       
        delete msgQueue.chores[msg.id];
        console.log("after delete msgQueue @@@@@@@@@@ ", msgQueue)
    })
    socket.on('received-admin', msg => {
      console.log("received on queue will remove it ...")
      // he child confirmed receiving , remove from queue
      discord.emit('res-client','your message has been recevied');
      delete msgQueue.chores[msg.id];
      console.log("after delete msgQueue @@@@@@@@@@ ", msgQueue)
  })
});
