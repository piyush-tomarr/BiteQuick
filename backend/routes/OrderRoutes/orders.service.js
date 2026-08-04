const pool = require('../../db')

module.exports = {

    getMenu: async()=>{
    const result = await pool.query('SELECT * FROM menu_items ')
    return result.rows
},

getMenuItemsByIds: async(ids)=>{
    const result = await pool.query('SELECT id, price FROM menu_items WHERE id = ANY($1::int[])', [ids])
    return result.rows
},

insertOrder: async(conn, user_id, customer_name, phone, address, total_amount)=>{
    let result = await conn.query('INSERT INTO orders (user_id, customer_name, phone, address, total_amount) VALUES ($1,$2,$3,$4,$5) RETURNING *', [user_id, customer_name, phone, address, total_amount])
    return result.rows[0]
},
insertOrderItem: async(client, order_id, menu_item_id, quantity, price)=>{
    let result = await client.query('INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES ($1,$2,$3,$4) RETURNING *', [order_id, menu_item_id, quantity, price])
    return result.rows[0]
},

getOrdersByUserId: async(user_id)=>{
    const result = await pool.query(
        `SELECT o.id, o.customer_name, o.phone, o.address, o.status, o.total_amount, o.created_at,
                json_agg(json_build_object(
                    'menu_item_id', oi.menu_item_id,
                    'name', mi.name,
                    'quantity', oi.quantity,
                    'price', oi.price
                )) as items
         FROM orders o
         JOIN order_items oi ON oi.order_id = o.id
         JOIN menu_items mi ON mi.id = oi.menu_item_id
         WHERE o.user_id = $1
         GROUP BY o.id
         ORDER BY o.created_at DESC`,
        [user_id]
    )
    return result.rows
},

getAllOrders: async()=>{
    let result = await pool.query(`
        SELECT o.id, o.customer_name, o.phone, o.address, o.status, o.total_amount, o.created_at,
               json_agg(json_build_object('menu_item_id', oi.menu_item_id, 'name', mi.name, 'quantity', oi.quantity, 'price', oi.price)) AS items
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        JOIN menu_items mi ON mi.id = oi.menu_item_id
        GROUP BY o.id
        ORDER BY o.created_at DESC
    `)
    return result.rows
},


updateOrderStatus: async(order_id, status)=>{
    let result = await pool.query('UPDATE orders SET status = $1 WHERE id = $2 RETURNING *', [status, order_id])
    return result.rows[0]
},

cancelOrder: async(order_id, user_id)=>{
    const result = await pool.query(
        `UPDATE orders SET status = 'Cancelled'
         WHERE id = $1 AND user_id = $2 AND status NOT IN ('Out For Delivery', 'Delivered', 'Cancelled')
         RETURNING *`,
        [order_id, user_id]
    )
    return result.rows[0]
}

}