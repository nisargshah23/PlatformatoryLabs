import jwt from 'jsonwebtoken';
import { CrudcrudService, User } from './services/crudcrudService';

export async function createUser(data: { email: string; password: string; name: string }): Promise<any> {
  try {
    const existingUser = await CrudcrudService.getUserByEmail(data.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const userData = {
      email: data.email,
      password: data.password,
      name: data.name,
      createdAt: new Date()
    };

    const user = await CrudcrudService.createUser(userData);

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    return {
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    };
  } catch (error) {
    throw error;
  }
}

export async function loginUser(data: { email: string; password: string }): Promise<any> {
  try {
    const user = await CrudcrudService.getUserByEmail(data.email);
    if (!user || user.password !== data.password) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    return {
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    };
  } catch (error) {
    throw error;
  }
}

export async function getUserProfile(userId: string): Promise<any> {
  try {
    const user = await CrudcrudService.getUserById(userId);
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    throw error;
  }
}

export async function updateUserProfile(userId: string, data: { name?: string; profile?: any }): Promise<any> {
  try {
    const user = await CrudcrudService.updateUser(userId, data);
    const { password, ...userWithoutPassword } = user;
    return {
      message: 'Profile updated successfully',
      user: userWithoutPassword
    };
  } catch (error) {
    throw error;
  }
}

export async function deleteUser(userId: string): Promise<any> {
  try {
    await CrudcrudService.deleteUser(userId);
    return { message: 'User deleted successfully' };
  } catch (error) {
    throw error;
  }
}
