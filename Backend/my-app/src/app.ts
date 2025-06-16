import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import { CrudcrudService } from './services/crudcrudService';
import { OAuthService } from './services/oauthService';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize services
const CRUDCRUD_API_KEY = process.env.CRUDCRUD_API_KEY || 'your-api-key';
CrudcrudService.initialize(CRUDCRUD_API_KEY);
OAuthService.initialize();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
  
// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 