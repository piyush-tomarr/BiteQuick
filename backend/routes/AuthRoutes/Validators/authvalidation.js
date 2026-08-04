const { z } = require('zod');

const signupSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').regex(/[a-z]/, 'Password must contain a lowercase letter').regex(/[A-Z]/, 'Password must contain an uppercase letter').regex(/[0-9]/, 'Password must contain a number'),
});

module.exports = { signupSchema };