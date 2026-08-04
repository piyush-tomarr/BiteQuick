const { getExistingUser, hashPassword, createNewUser, generateJWT } = require("./auth.service")
const { signupSchema } = require("./Validators/authvalidation")
const bcrypt = require('bcrypt')

module.exports = {
    signupController: async (req, res) => {
        let result = signupSchema.safeParse(req.body)
        if (!result.success) return res.status(400).json({ success: false, message: result.error.issues[0].message })

        const { username, email, password } = result.data

        try{

            let usernameExists = await getExistingUser(username)
            if (usernameExists.length > 0) return res.status(409).json({ success: false, message: 'Username already exists' })

            let emailExists = await getExistingUser(null, email)
            if (emailExists.length > 0) return res.status(409).json({ success: false, message: 'This email is associated with some other account, please try again with a new email address' })
            
            let hashedPassword = await hashPassword(password)

            let createdUser = await createNewUser(username,email,hashedPassword)
            let token = await generateJWT(createdUser.id)
            return res.status(200).json({ success: true, message: 'User created successfully', token })
        }
        catch(error){
           console.log(error)
        return res.status(500).json({ success: false, message:'Internal server error' })
        }
    },

    signinController: async(req,res)=>{
        let {username,email,password}= req.body
        
        try{
            if(!username && !email) return res.status(400).json({ success: false, message: 'email or username is required' })
            if(!password) return res.status(400).json({ success: false, message: 'Password is required' })
            let userDetails
            if(!email && username) userDetails = await getExistingUser(username)
            if(!username && email) userDetails = await getExistingUser(null, email)
            if(userDetails.length === 0) return res.status(404).json({ success: false, message: 'User not found' })
            const varifiedPassword =  await bcrypt.compare(password, userDetails[0].password_hash)
            if(!varifiedPassword) return res.status(401).json({ success: false, message: 'Invalid password' })
            let token = await generateJWT(userDetails[0].id)
            return res.status(200).json({ success: true, message: 'Signin Successful', token })

        }
        catch(error){
        console.log(error)
        return res.status(500).json({ success: false, message:'Internal server error' })

        }

    }
}