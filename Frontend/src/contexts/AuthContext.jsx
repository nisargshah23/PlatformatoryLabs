import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  updateProfile,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase/config';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign up with email and password
  async function signup(email, password, displayName) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update the user's display name
    await updateProfile(result.user, {
      displayName: displayName
    });
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', result.user.uid), {
      displayName: displayName,
      email: email,
      createdAt: new Date(),
      provider: 'email'
    });
    
    return result;
  }

  // Login with email and password
  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      console.log('Login response:', data);

      // Store token and email
      localStorage.setItem('token', data.token);
      localStorage.setItem('userEmail', email);

      // Fetch user profile
      const profileResponse = await fetch('http://localhost:3000/api/profile/profile', {
        headers: {
          'Authorization': `Bearer ${data.token}`
        }
      });

      if (!profileResponse.ok) {
        throw new Error('Failed to fetch profile');
      }

      const profileData = await profileResponse.json();
      console.log('Fetched profile:', profileData);

      setCurrentUser(profileData);
      return profileData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log('Google sign-in result:', result);

      // Get the Google OAuth token
      const googleToken = await result.user.getIdToken();
      console.log('Google token:', googleToken);

      // Send OAuth details to backend for token generation
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: result.user.email,
          name: result.user.displayName,
          photoURL: result.user.photoURL,
          provider: 'google',
          googleToken
        })
      });

      if (!response.ok) {
        throw new Error('Failed to authenticate with backend');
      }

      const data = await response.json();
      console.log('Backend auth response:', data);

      // Store the token and email
      localStorage.setItem('token', data.token);
      localStorage.setItem('userEmail', result.user.email);

      // Fetch user profile
      const profileResponse = await fetch('http://localhost:3000/api/profile/profile', {
        headers: {
          'Authorization': `Bearer ${data.token}`
        }
      });

      if (!profileResponse.ok) {
        throw new Error('Failed to fetch profile');
      }

      const profileData = await profileResponse.json();
      console.log('Fetched profile:', profileData);

      setCurrentUser(profileData);
      return { token: data.token, user: profileData };
    } catch (error) {
      console.error('Google sign-in error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in cancelled by user');
      }
      throw error;
    }
  };

  // Logout
  async function logout() {
    try {
      localStorage.removeItem('token');
      setCurrentUser(null);
    } catch (error) {
      throw new Error('Failed to log out');
    }
  }

  // Update user profile
  async function updateUserProfile(updates) {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch('http://localhost:3000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      // Update current user state with new profile data
      setCurrentUser(prevUser => ({
        ...prevUser,
        ...data
      }));

      return data;
    } catch (error) {
      throw new Error(error.message || 'Failed to update profile');
    }
  }

  // Check authentication status
  async function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
      setCurrentUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Invalid token');
      }

      const userData = await response.json();
      setCurrentUser(userData);
    } catch (error) {
      localStorage.removeItem('token');
      setCurrentUser(null);
    }
    setLoading(false);
  }

  // Check auth status on mount and token changes
  useEffect(() => {
    checkAuth();
  }, []);

  const value = {
    currentUser,
    login,
    logout,
    signInWithGoogle,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}