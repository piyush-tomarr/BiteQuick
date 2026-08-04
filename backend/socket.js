let io

module.exports = {
    init: (server)=>{
        io = require('socket.io')(server, { cors: { origin: '*' } })

        io.on('connection', (socket)=>{
            socket.on('join_order', (orderId)=>{
                socket.join(`order_${orderId}`)
            })

            socket.on('join_admin', ()=>{
                socket.join('admin')
            })
        })

        return io
    },

    getIO: ()=>{
        return io || null
    }
}