const pool = require('../../db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')  

module.exports  = {
    
getExistingUser : async(username,email)=>{
    const result = await pool.query('SELECT * FROM users WHERE username = $1 OR email = $2', [username, email])
    return result.rows
},

hashPassword:async(password)=>{
    let saltRounds = 10
     const hashedPassword = await bcrypt.hash(password, saltRounds)
    return hashedPassword
},

createNewUser: async(username, email, password)=>{
    const result = await pool.query('INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at', [username, email, password])
    return result.rows[0]
},

generateJWT: async(id)=>{
    const secret = process.env.JWT_SECRET
    const token = jwt.sign({ id }, secret, { expiresIn: '7d' })
    return token
}
}