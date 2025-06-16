import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { CrudcrudService } from '../services/crudcrudService';

const router = express.Router();

interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}

// Get user profile
router.get('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const user = await CrudcrudService.getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const { 
      name,
      phoneNumber, 
      city, 
      pincode,
      email 
    } = req.body;
    console.log('Update request:', { name, phoneNumber, city, pincode, email });

    // First get the user by email to get their ID
    const user = await CrudcrudService.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('Found user:', user);

    // Prepare update data
    const updateData = {
      email: user.email,
      name: name || user.name || '',
      phoneNumber: phoneNumber || user.phoneNumber || '',
      city: city || user.city || '',
      pincode: pincode || user.pincode || '',
      provider: user.provider,
      createdAt: user.createdAt,
      updatedAt: new Date().toISOString()
    };
    
    const updatedUser = await CrudcrudService.updateUser(user._id, updateData);
    console.log('Updated user:', updatedUser);

    const { password, ...userWithoutPassword } = updatedUser;
    res.json({
      message: 'Profile updated successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Profile update error:', error);
    if (error) {
      console.error('Error details:', error);
    }
    res.status(500).json({ 
      message: 'Error updating profile', 
      error: error || error 
    });
  }
});

export default router; 