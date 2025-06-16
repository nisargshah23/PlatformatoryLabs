import { OAuth2Client } from 'google-auth-library';
import { OAUTH_CONFIG } from '../config/oauth';
import { CrudcrudService } from './crudcrudService';
import jwt from 'jsonwebtoken';

export class OAuthService {
  private static googleClient: OAuth2Client;

  static initialize() {
    this.googleClient = new OAuth2Client(
      OAUTH_CONFIG.GOOGLE.CLIENT_ID,
      OAUTH_CONFIG.GOOGLE.CLIENT_SECRET,
      OAUTH_CONFIG.GOOGLE.CALLBACK_URL
    );
  }

  static getGoogleAuthUrl() {
    return this.googleClient.generateAuthUrl({
      access_type: 'offline',
      scope: OAUTH_CONFIG.GOOGLE.SCOPES
    });
  }

  static async handleGoogleCallback(code: string) {
    try {
      const { tokens } = await this.googleClient.getToken(code);
      const ticket = await this.googleClient.verifyIdToken({
        idToken: tokens.id_token!,
        audience: OAUTH_CONFIG.GOOGLE.CLIENT_ID
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new Error('Failed to get user info from Google');
      }

      // Check if user exists
      let user = await CrudcrudService.getUserByEmail(payload.email!);
      
      if (!user) {
        // Create new user if doesn't exist
        const userData = {
          email: payload.email,
          name: payload.name,
          profile: {
            avatar: payload.picture
          },
          oauthProvider: 'google',
          oauthId: payload.sub
        };
        user = await CrudcrudService.createUser(userData);
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      return {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          profile: user.profile
        }
      };
    } catch (error) {
      throw new Error('Failed to authenticate with Google');
    }
  }
} 