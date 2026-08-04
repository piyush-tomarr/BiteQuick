const request = require('supertest')
const app = require('../app')
const pool = require('../db')
jest.setTimeout(15000)
describe('Auth API', () => {
  const testUser = {
    username: 'testuser_' + Date.now(),
    email: `test_${Date.now()}@example.com`,
    password: 'Test1234'
  }

  afterAll(async () => {
    await pool.query('DELETE FROM users WHERE username = $1', [testUser.username])
    await pool.end()
  })

  describe('POST /api/v1/signup', () => {
    it('should register a new user with valid data', async () => {
      const res = await request(app).post('/api/v1/signup').send(testUser)

      expect(res.statusCode).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.token).toBeDefined()
    })

    it('should fail if username already exists', async () => {
      const res = await request(app).post('/api/v1/signup').send(testUser)

      expect(res.statusCode).toBe(409)
      expect(res.body.success).toBe(false)
    })

    it('should fail with invalid email', async () => {
      const res = await request(app).post('/api/v1/signup').send({
        username: 'randomuser123',
        email: 'not-an-email',
        password: 'Test1234'
      })

      expect(res.statusCode).toBe(400)
      expect(res.body.success).toBe(false)
    })

    it('should fail with weak password', async () => {
      const res = await request(app).post('/api/v1/signup').send({
        username: 'randomuser456',
        email: 'random456@example.com',
        password: 'weak'
      })

      expect(res.statusCode).toBe(400)
    })
  })

  describe('POST /api/v1/signin', () => {
    it('should login with correct credentials', async () => {
      const res = await request(app).post('/api/v1/signin').send({
        username: testUser.username,
        password: testUser.password
      })

      expect(res.statusCode).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.token).toBeDefined()
    })

    it('should fail with wrong password', async () => {
      const res = await request(app).post('/api/v1/signin').send({
        username: testUser.username,
        password: 'WrongPass123'
      })

      expect(res.statusCode).toBe(401)
      expect(res.body.success).toBe(false)
    })

    it('should fail with non-existent user', async () => {
      const res = await request(app).post('/api/v1/signin').send({
        username: 'no_such_user_999',
        password: 'Test1234'
      })

      expect(res.statusCode).toBe(404)
    })
  })
})