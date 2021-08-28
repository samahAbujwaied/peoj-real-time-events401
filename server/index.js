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
const cors=require('cors');
const express = require('express')
const app = express()
app.use(cors());
// const http = require('http').createServer(require('express')())
const uuid = require('uuid').v4
// keep port in dotenv
const io = require('socket.io')(4456);
// can be stored in a database/ cache/ ...
// my queue is an object
// keyed queue

//  there will be no ordered preserved
app.all('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next()
});

app.get('/', function(req, res, next) {
  // Handle the get for this route
  res.send('hello from back')
});

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
        discord.emit('res-client', {name: msgQueueClient.data[id].name,message: msgQueueClient.data[id].message,id:id });/// lal admin===
        // console.log("after add msgQueueClient ========> ", msgQueueClient);
    });

    socket.on('admin_msg', ({ name, message })=> {
      console.log("adding a new task ....")
      const id = uuid();
      console.log("id ====> ", id)
      msgQueueAdmin.data[id] = { name, message };
     
      discord.emit('admin-data', { name: msgQueueAdmin.data[id].name,message: msgQueueAdmin.data[id].message,id:id });
    //   console.log("after add msgQueueAdmin ========> ", msgQueueAdmin);
     
    console.log(msgQueueAdmin.data[id].name,msgQueueAdmin.data[id].message);
  });
 
  socket.on('accept_msg',(msg)=>{
    console.log('===================');
    console.log('msg------>',msg.accept,msg.gotmsg);
    // const acceptmsg = msgQueueClient.data[msg.id] ;
    discord.emit('sendaccept',{msgreq:msg.accept,massage:msg.gotmsg})

  })

  socket.on('ignore_msg',(msg)=>{
    // const ignoremsg = msgQueueClient.data[msg.id] ;
    console.log('ignnnnnnnnnoooore',msg.ignore,msg.gotmsg);
    discord.emit('sendignore',{msgreq:msg.ignore,massageig:msg.gotmsg})

  })

    socket.on('get_all', ()=> {
        console.log("get_all : all messages from client ")
        Object.keys(msgQueueClient.data).forEach(id=> {
            socket.emit('res-client', {name: msgQueueClient.data[id].name,message: msgQueueClient.data[id].message,id:id });
        });
    });
    
    socket.on('get_all-client', ()=> {
        console.log("get_all-client : all messages from admin")
        Object.keys(msgQueueAdmin.data).forEach(id=> {
            socket.emit('admin-data', { name: msgQueueAdmin.data[id].name,message: msgQueueAdmin.data[id].message ,id:id});
      });
    });

    socket.on('received-client', id => {
        console.log("admin received from client messages on queue will remove it ...")
        // he child confirmed receiving , remove from queue
        delete msgQueueClient.data[id];
        console.log("after delete msgQueueClient @@@@@@@@@@ ", msgQueueClient)
    })
    socket.on('received-admin', id => {
      console.log("client received from admin messages on queue will remove it ...")
      // he child confirmed receiving , remove from queue
    //   discord.emit('res-client','your message has been recevied');
      delete msgQueueAdmin.data[id];
      console.log("after delete msgQueueAdmin @@@@@@@@@@ ", msgQueueAdmin)
  })
});

// app.listen(4456, function() {
//     console.log('listening on port 4000')
//   })

  // app.get('/',(req,res)=>{
  //   res.send('hellloo')
  // })