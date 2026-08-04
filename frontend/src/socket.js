import { io } from 'socket.io-client'

// const socket = io('http://localhost:2212', { autoConnect: false })
const socket = io('https://bitequick-backend.onrender.com', { autoConnect: false })

export default socket