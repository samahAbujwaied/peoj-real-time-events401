import TextField from "@material-ui/core/TextField"
import React, { useEffect, useRef, useState } from "react"
import io from "socket.io-client"
import "./App.css"

function App() {
	const [ state, setState ] = useState({ignoreyourmsg:"",yourmsg:"",check:false,check2:false ,message: "", name: "" ,acceptmsg:"",ignoremsg:"",themsg:"",ignmsg:""})
	const [ chat, setChat ] = useState([])
	// console.log(state.acceptmsg);
	// console.log(state.ignoremsg);
	const socketRef = useRef()

	useEffect(
		
		() => {
			socketRef.current = io.connect("http://localhost:4456/discord")
			socketRef.current.on("sendaccept",msg=>{
				console.log('mssssssg====',msg.msgreq,msg.massage);
				setState({ acceptmsg:msg.msgreq,yourmsg:msg.massage, check:true})
			})
			socketRef.current.on("sendignore",msg=>{
				console.log(msg.msgreq);
				setState({ ignoremsg:msg.msgreq,ignoreyourmsg:msg.massageig, check2:true})
			})
			socketRef.current.on("admin-data", ({ name, message ,id}) => {
				setChat([ ...chat, { name, message } ])
				socketRef.current.emit('get_all-client');
				// socketRef.current.emit('received-client', id)
			})
			return () => socketRef.current.disconnect()
			
		},
		[ chat ]
	)

	const onTextChange = (e) => {
		setState({ ...state, [e.target.name]: e.target.value })
	}

	const onMessageSubmit = (e) => {
		const { name, message } = state
		socketRef.current.emit("client_msg", { name, message })
		e.preventDefault()
		setState({ message: "", name })
		
		
	}

	const renderChat = () => {
		return chat.map(({ name, message }, index) => (
			<div key={index}>
				<h3>
					{name}: <span>{message}</span>
				</h3>
			</div>
		))
	
		
	}

	return (
	

		<div className="card">
			<form onSubmit={onMessageSubmit}>
		
				<h1>Messenger</h1>
				<div className="name-field">
					<TextField name="name" onChange={(e) => onTextChange(e)} value={state.name} label="Name" />
				</div>
				<div>
					<TextField
						name="message"
						onChange={(e) => onTextChange(e)}
						value={state.message}
						id="outlined-multiline-static"
						variant="outlined"
						label="Message"
					/>
				</div>
				<button>Send Message</button>
			</form>
			<div className="render-chat">
				<h1>Chat Log</h1>
				{renderChat()}

				
			</div>

			<section>
			
			{state.check &&  <h1>{state.acceptmsg} -------- {state.yourmsg}</h1>}  
			</section>
			<section>
			{state.check2 && <h2>{state.ignoremsg} -------- {state.ignoreyourmsg} </h2>}
		
	     	</section>
		
		</div>
	)

}

export default App

