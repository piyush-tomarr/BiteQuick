const express = require('express')
const {  getMenuController, placeOrderController, getOrders, updateStatusController, orderHistoryController, cancelOrderController } = require('./orders.controller')
const authMiddleware = require('../../Middleware/auth.middleware')
const adminMiddleware = require('../../Middleware/admin.middleware')
const router = express.Router()

router.get('/menu',authMiddleware,getMenuController)
router.post('/place-order', authMiddleware, placeOrderController)
router.get('/order-history' ,authMiddleware, orderHistoryController )

router.get('/orders',adminMiddleware,getOrders)
router.patch('/orders/status',adminMiddleware, updateStatusController)
router.patch('/cancel-order', authMiddleware, cancelOrderController)
module.exports = router