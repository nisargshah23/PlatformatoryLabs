# User Authentication and Profile Management System

A full-stack application that provides user authentication, profile management, and OAuth integration using Google Sign-In.

## Features

- User Authentication
  - Email/Password login
  - Google OAuth Sign-In
  - JWT-based authentication
  - Secure token management

- Profile Management
  - View user profile
  - Update profile information
  - Display user statistics
  - Profile picture support

- Security
  - Protected routes
  - Token-based authentication
  - Secure password handling
  - OAuth integration

## Tech Stack

### Frontend
- React.js
- React Router for navigation
- Context API for state management
- Tailwind CSS for styling
- Firebase for Google OAuth

### Backend
- Node.js
- Express.js
- JWT for authentication
- Crudcrud.com for data storage
- TypeScript

## Project Structure

```
P_labs/
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   └── firebase/
│   └── package.json
└── Backend/
    ├── my-app/
    │   ├── src/
    │   │   ├── routes/
    │   │   ├── services/
    │   │   └── middleware/
    │   └── package.json
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Google Cloud Platform account (for OAuth)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd P_labs
```

2. Install Frontend dependencies:
```bash
cd Frontend
npm install
```

3. Install Backend dependencies:
```bash
cd ../Backend/my-app
npm install
```

4. Set up environment variables:
   - Create `.env` file in the Backend directory
   - Add the following variables:
     ```
     JWT_SECRET=your_jwt_secret
     GOOGLE_CLIENT_ID=your_google_client_id
     ```

### Running the Application

1. Start the Backend server:
```bash
cd Backend/my-app
npm start
```

2. Start the Frontend development server:
```bash
cd Frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:3000

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/google` - Google OAuth login

### Profile
- `GET /api/profile/profile` - Get user profile
- `PUT /api/profile/profile` - Update user profile

## Features in Detail

### Authentication
- Email/Password login with JWT token generation
- Google OAuth integration
- Secure token storage in localStorage
- Protected route implementation

### Profile Management
- View and edit user information
- Update profile details
- Display user statistics
- Profile picture support

### Security Features
- JWT-based authentication
- Protected API endpoints
- Secure password handling
- OAuth integration with Google

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Firebase for OAuth integration
- Crudcrud.com for data storage
- React and Node.js communities for their excellent documentation