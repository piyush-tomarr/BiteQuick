const request = require('supertest')
const app = require('../app')
const pool = require('../db')

describe('Orders API', () => {
  let token
  let validMenuItemId
  let orderId
  const testUser = {
    username: 'orderuser_' + Date.now(),
    email: `orderuser_${Date.now()}@example.com`,
    password: 'Test1234'
  }

  jest.setTimeout(15000)

  beforeAll(async () => {
    const signupRes = await request(app).post('/api/v1/signup').send(testUser)
    token = signupRes.body.token

    const menuRes = await pool.query('SELECT id FROM menu_items LIMIT 1')
    validMenuItemId = menuRes.rows[0].id
  })

  afterAll(async () => {
    await pool.query('DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE user_id = (SELECT id FROM users WHERE username = $1))', [testUser.username])
    await pool.query('DELETE FROM orders WHERE user_id = (SELECT id FROM users WHERE username = $1)', [testUser.username])
    await pool.query('DELETE FROM users WHERE username = $1', [testUser.username])
    await pool.end()
  })

  describe('POST /api/v1/place-order', () => {
    it('should place a valid order', async () => {
      const res = await request(app)
        .post('/api/v1/place-order')
        .set('Authorization', `Bearer ${token}`)
        .send({
          customer_name: 'Test Customer',
          phone: '9999999999',
          address: 'Test Address, City',
          items: [{ menu_item_id: validMenuItemId, quantity: 2, price: 999 }]
        })

      expect(res.statusCode).toBe(200)
      expect(res.body.success).toBe(true)
      orderId = res.body.order.id
    })

    it('should fail without token', async () => {
      const res = await request(app)
        .post('/api/v1/place-order')
        .send({ customer_name: 'X', phone: '123', address: 'Y', items: [] })

      expect(res.statusCode).toBe(401)
    })

    it('should fail with missing fields', async () => {
      const res = await request(app)
        .post('/api/v1/place-order')
        .set('Authorization', `Bearer ${token}`)
        .send({ phone: '9999999999', address: 'Test', items: [{ menu_item_id: validMenuItemId, quantity: 1, price: 100 }] })

      expect(res.statusCode).toBe(400)
    })

    it('should fail with invalid menu_item_id', async () => {
      const res = await request(app)
        .post('/api/v1/place-order')
        .set('Authorization', `Bearer ${token}`)
        .send({
          customer_name: 'Test',
          phone: '9999999999',
          address: 'Test',
          items: [{ menu_item_id: 999999, quantity: 1, price: 100 }]
        })

      expect(res.statusCode).toBe(400)
    })
  })

  describe('PATCH /api/v1/orders/status', () => {
    it('should update status with valid admin key', async () => {
      const res = await request(app)
        .patch('/api/v1/orders/status')
        .set('x-admin-key', process.env.ADMIN_SECRET)
        .send({ order_id: orderId, status: 'Preparing' })

      expect(res.statusCode).toBe(200)
      expect(res.body.order.status).toBe('Preparing')
    })

    it('should fail without admin key', async () => {
      const res = await request(app)
        .patch('/api/v1/orders/status')
        .send({ order_id: orderId, status: 'Preparing' })

      expect(res.statusCode).toBe(403)
    })

    it('should fail with invalid status value', async () => {
      const res = await request(app)
        .patch('/api/v1/orders/status')
        .set('x-admin-key', process.env.ADMIN_SECRET)
        .send({ order_id: orderId, status: 'Random Status' })

      expect(res.statusCode).toBe(400)
    })

    it('should fail with non-existent order_id', async () => {
      const res = await request(app)
        .patch('/api/v1/orders/status')
        .set('x-admin-key', process.env.ADMIN_SECRET)
        .send({ order_id: 999999, status: 'Preparing' })

      expect(res.statusCode).toBe(404)
    })
  })
})