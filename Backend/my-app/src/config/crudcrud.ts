import dotenv from 'dotenv';

dotenv.config();

export const CRUDCRUD_CONFIG = {
  API_URL: 'https://crudcrud.com/api',
  API_KEY: process.env.CRUDCRUD_API_KEY || 'your-api-key',
  DELAY_MS: 1000, // Delay between requests to avoid rate limiting
  COLLECTIONS: {
    USERS: 'users'
  }
}; 