const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    try{
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]

        if(!token) return res.status(401).json({ success: false, message: 'Token is required' })

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.id = decoded.id
        next()
    }
    catch(error){
        if(error.name === 'TokenExpiredError') return res.status(419).json({ success: false, message: 'Token expired' })
        return res.status(401).json({ success: false, message: 'Invalid token' })
    }
}