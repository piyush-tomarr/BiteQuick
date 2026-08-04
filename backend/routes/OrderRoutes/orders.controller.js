const { getMenu, insertOrderItem, insertOrder, getAllOrders, updateOrderStatus, getMenuItemsByIds, getOrdersByUserId, cancelOrder } = require("./orders.service")
const pool = require('../../db')
const { placeOrderSchema, updateStatusSchema, cancelOrderSchema } = require("./Validators/orderValidation")
const { getIO } = require('../../socket')
module.exports = {

    getMenuController: async(req,res)=>{
    try{
        let menuData = await getMenu()

        let groupedMenu = menuData.reduce((acc, item)=>{
            if(!acc[item.category]) acc[item.category] = []
            acc[item.category].push(item)
            return acc
        }, {})

        return res.status(200).json({ success: true, data: groupedMenu })
    }
    catch(error){
        console.log(error)
        return res.status(500).json({ success: false, message: 'Internal server error' })
    }
},



   placeOrderController: async(req,res)=>{
    let conn
    try{
        conn = await pool.connect()
        let result = placeOrderSchema.safeParse(req.body)
        if(!result.success) return res.status(400).json({ success: false, message: result.error.issues[0].message })

        const { customer_name, phone, address, items } = result.data
        let user_id = req.id

        let menuItemIds = items.map(item => item.menu_item_id)
        let dbItems = await getMenuItemsByIds(menuItemIds)
        let priceMap = {}
        for(let dbItem of dbItems){
            priceMap[dbItem.id] = parseFloat(dbItem.price)
        } 

        for(let item of items){
            if(!priceMap[item.menu_item_id]) return res.status(400).json({ success: false, message: `Invalid menu item id: ${item.menu_item_id}` })
        }

        let total_amount = items.reduce((sum, item)=> sum + (priceMap[item.menu_item_id] * item.quantity), 0)

        await conn.query('BEGIN')
        let order = await insertOrder(conn, user_id, customer_name, phone, address, total_amount)

        for(let item of items){
            await insertOrderItem(conn, order.id, item.menu_item_id, item.quantity, priceMap[item.menu_item_id])
        }

        await conn.query('COMMIT')
        return res.status(200).json({ success: true, message: 'Order placed successfully', order })
    }
    catch(error){
        if(conn) await conn.query('ROLLBACK')
        console.log(error)
        return res.status(500).json({ success: false, message: 'Internal server error' })
    }
    finally{
        if(conn) conn.release()
    }
},


orderHistoryController: async(req,res)=>{
    try{
        let user_id = req.id
        let orders = await getOrdersByUserId(user_id)
        return res.status(200).json({ success: true, orders })
    }
    catch(error){
        console.log(error)
        return res.status(500).json({ success: false, message: 'Internal server error' })
    }
},


getOrders: async(req,res)=>{
    try{
        let orders = await getAllOrders()
        return res.status(200).json({ success: true, data: orders })
    }
    catch(error){
        console.log(error)
        return res.status(500).json({ success: false, message: 'Internal server error' })
    }
},

updateStatusController: async(req,res)=>{
    try{
        let result = updateStatusSchema.safeParse(req.body)
        if(!result.success) return res.status(400).json({ success: false, message: result.error.issues[0].message })
        const { order_id, status } = result.data

        let updatedOrder = await updateOrderStatus(order_id, status)

        if(!updatedOrder) return res.status(404).json({ success: false, message: 'Order not found' })

        const io = getIO()
        if(io){
            io.to(`order_${order_id}`).emit('status_update', { order_id, status: updatedOrder.status })
            io.to('admin').emit('order_status_changed', updatedOrder)
        }

        return res.status(200).json({ success: true, message: 'Status updated successfully', order: updatedOrder })
    }
    catch(error){
        console.log(error)
        return res.status(500).json({ success: false, message: 'Internal server error' })
    }
},

cancelOrderController: async(req,res)=>{
    try{
        let result = cancelOrderSchema.safeParse(req.body)
        if(!result.success) return res.status(400).json({ success: false, message: result.error.issues[0].message })

        const { order_id } = result.data
        let user_id = req.id

        let cancelledOrder = await cancelOrder(order_id, user_id)
        if(!cancelledOrder) return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage' })

        const io = getIO()
        if(io){
            io.to(`order_${order_id}`).emit('status_update', { order_id, status: 'Cancelled' })
            io.to('admin').emit('order_status_changed', cancelledOrder)
        }

        return res.status(200).json({ success: true, message: 'Order cancelled successfully', order: cancelledOrder })
    }
    catch(error){
        console.log(error)
        return res.status(500).json({ success: false, message: 'Internal server error' })
    }
}



}