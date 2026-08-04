const { z } = require('zod')

const placeOrderSchema = z.object({
  customer_name: z.string().min(1, 'Customer name is required'),
  phone: z.string().min(1, 'Phone is required'),
  address: z.string().min(1, 'Address is required'),
  items: z.array(
    z.object({
      menu_item_id: z.number(),
      quantity: z.number().min(1, 'Quantity must be at least 1'),
      price: z.number()
    })
  ).min(1, 'At least one item is required')
})


const updateStatusSchema = z.object({
  order_id: z.number(),
  status: z.enum(['Preparing', 'Out For Delivery', 'Delivered'], 'Invalid status value')
})
const cancelOrderSchema = z.object({
  order_id: z.number()
})

module.exports = { placeOrderSchema ,updateStatusSchema , cancelOrderSchema}