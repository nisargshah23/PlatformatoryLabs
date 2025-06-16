import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { CrudcrudService } from '../services/crudcrudService';
import { OAuthService } from '../services/oauthService';

const router = express.Router();

// Signup route
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    console.log('Signup request:', { email, name });

    // Check if user already exists
    const existingUser = await CrudcrudService.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const userData = {
      email,
      password, // In production, hash this password
      name,
      provider: 'email',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      profile: {
        bio: '',
        avatar: ''
      }
    };

    console.log('Creating user with data:', userData);
    const user = await CrudcrudService.createUser(userData);
    console.log('Created user:', user);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        provider: user.provider,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Error creating user', error });
  }
});

// Login route
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password, name, photoURL, provider, googleToken } = req.body;
    console.log('Login request:', { email, provider });

    let user = await CrudcrudService.getUserByEmail(email);
    console.log('Found user:', user ? 'Yes' : 'No');

    if (!user) {
      // If user doesn't exist and it's an OAuth login, create the user
      if (provider === 'google' && googleToken) {
        console.log('Creating new user from Google OAuth');
        const newUser = {
          email,
          name: name || email.split('@')[0],
          photoURL: photoURL || '',
          provider: 'google',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        user = await CrudcrudService.createUser(newUser);
        console.log('Created new user:', user);
      } else {
        console.log('User not found and not OAuth login');
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    } else if (provider !== 'google') {
      // For regular email/password login, check password
      console.log('Checking password for email login');
      if (!password || user.password !== password) {
        console.log('Invalid password');
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    console.log('Generated token for user');

    const response = {
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        photoURL: user.photoURL,
        provider: user.provider
      }
    };
    console.log('Sending response:', response);

    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error during login', error });
  }
});

// Get all users (admin route)
router.get('/users', async (req: Request, res: Response) => {
  try {
    const users = await CrudcrudService.getAllUsers();
    // Remove passwords from response
    const sanitizedUsers = users.map(({ password, ...user }:any) => user);
    res.json(sanitizedUsers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
});

// Get user by ID
router.get('/users/:id', async (req: Request, res: Response) => {
  try {
    const user = await CrudcrudService.getUserById(req.params.id);
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(404).json({ message: 'User not found' });
  }
});

// Delete user
router.delete('/users/:id', async (req: Request, res: Response) => {
  try {
    await CrudcrudService.deleteUser(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error });
  }
});

// Google OAuth routes
router.get('/google', (req: Request, res: Response) => {
  const authUrl = OAuthService.getGoogleAuthUrl();
  res.redirect(authUrl);
});

router.get('/google/callback', async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ message: 'Invalid authorization code' });
    }

    const result = await OAuthService.handleGoogleCallback(code);
    
    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${result.token}`);
  } catch (error) {
    res.status(500).json({ message: 'Error authenticating with Google', error });
  }
});

export default router; 