import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { CrudcrudService } from '../services/crudcrudService';

interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
    
    // Verify user exists in crudcrud
    try {
      await CrudcrudService.getUserById(decoded.userId);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token. User not found.' });
    }
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
}; 