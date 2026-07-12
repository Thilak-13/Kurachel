import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

/**
 * Register a new user in the system
 */
export const registerUser = async ({ email, username, password, name, roleName = 'DRIVER' }) => {
  // 1. Check if email already exists
  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    const error = new Error('Email is already registered');
    error.statusCode = 409;
    throw error;
  }

  // 2. Check if username already exists
  const existingUsername = await prisma.user.findUnique({ where: { username } });
  if (existingUsername) {
    const error = new Error('Username is already taken');
    error.statusCode = 409;
    throw error;
  }

  // 3. Find the specified role in the database
  const role = await prisma.role.findUnique({ where: { name: roleName } });
  if (!role) {
    const error = new Error(`Specified role '${roleName}' does not exist`);
    error.statusCode = 400;
    throw error;
  }

  // 4. Hash the password (10 salt rounds)
  const hashedPassword = await bcrypt.hash(password, 10);

  // 5. Create the new user record
  const newUser = await prisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
      name,
      roleId: role.id
    },
    include: {
      role: true
    }
  });

  // Remove password from returned user object
  const { password: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

/**
 * Verify user credentials and generate authentication token
 */
export const loginUser = async ({ loginIdentifier, password }) => {
  // 1. Find user by email OR username
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: loginIdentifier },
        { username: loginIdentifier }
      ]
    },
    include: {
      role: true
    }
  });

  if (!user) {
    const error = new Error('Invalid email/username or password');
    error.statusCode = 401;
    throw error;
  }

  // 2. Verify password match
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error('Invalid email/username or password');
    error.statusCode = 401;
    throw error;
  }

  // 3. Generate JWT Token
  const tokenPayload = {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role.name
  };

  const token = jwt.sign(
    tokenPayload,
    process.env.JWT_SECRET || 'fallback_secret_key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  // Remove password from returned user object
  const { password: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token
  };
};
