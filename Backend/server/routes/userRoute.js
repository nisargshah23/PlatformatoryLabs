import express from "express";
import userModel from "../models/userModel.js";
import { Connection, Client } from "@temporalio/client";
import { log } from "console";

const router = express.Router();

const connection = await Connection.connect();
const temporalClient = new Client({ connection });

// Retrieve all users from the database
router.get("/", async (req, res) => {
  try {
    const allUsers = await userModel.find({});
    return res.status(200).json(allUsers);
  } catch (err) {
    console.error("Unable to fetch users:", err);
    return res.status(500).json({ error: "Something went wrong while retrieving users." });
  }
});

// Signup route
router.post("/signup", async (req, res) => {
  const { email, firstName, lastName, password, provider, photoURL } = req.body;

  console.log("Signup request received:", { email, firstName, lastName, provider, photoURL });

  if (!email?.trim()) {
    return res.status(400).json({ error: "Email is required." });
  }

  try {
    

    // For OAuth users, always create a new account
    if (provider === 'google') {
      try {
        // First check if user exists
        const existingUser = await userModel.findOne({ email });
        
        if (existingUser) {
          // If user exists, generate new token and return user data
          const token = Buffer.from(`${email}-${Date.now()}`).toString('base64');
          return res.status(200).json({
            message: "OAuth user login successful",
            token,
            user: {
              email: existingUser.email,
              firstName: existingUser.firstName,
              lastName: existingUser.lastName,
              photoURL: existingUser.photoURL
            }
          });
        }

        // If user doesn't exist, create new user
        console.log("Creating new OAuth user with data:", {
          email,
          firstName: firstName || '',
          lastName: lastName || '',
          provider: 'google',
          photoURL: photoURL || ''
        });

        const newUser = await userModel.create({
          email,
          firstName: firstName || '',
          lastName: lastName || '',
          password: `google-oauth-${Date.now()}`,
          provider: 'google',
          photoURL: photoURL || ''
        });

        console.log("New OAuth user created successfully:", newUser);

        // Generate token
        const token = Buffer.from(`${email}-${Date.now()}`).toString('base64');

        return res.status(201).json({
          message: "OAuth user created successfully",
          token,
          user: {
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            photoURL: newUser.photoURL
          }
        });
      } catch (createError) {
        console.error("OAuth user creation failed. Error details:", {
          message: createError.message,
          stack: createError.stack,
          code: createError.code
        });
        
        // Check for duplicate key error
        if (createError.code === 11000) {
          return res.status(400).json({ 
            error: "User already exists with this email",
            details: "Please try logging in instead"
          });
        }

        return res.status(500).json({ 
          error: "Failed to create OAuth user account",
          details: createError.message 
        });
      }
    }

    // For regular email signup
    if (!password?.trim()) {
      return res.status(400).json({ error: "Password is required for email signup." });
    }

    // Check if user exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists with this email." });
    }

    // Create new user for regular signup
    const newUser = await userModel.create({
      email,
      firstName,
      lastName,
      password,
      provider: 'email'
    });

    // Generate token
    const token = Buffer.from(`${email}-${Date.now()}`).toString('base64');

    return res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName
      }
    });
  } catch (err) {
    console.error("Signup failed:", err);
    return res.status(500).json({ 
      error: "Failed to create user account",
      details: err.message 
    });
  }
});

// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password?.trim()) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const user = await userModel.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ error: "No user found with this email." });
    }

    // Verify password (Note: In production, use proper password comparison)
    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid password." });
    }

    // Generate token
    const token = Buffer.from(`${email}-${Date.now()}`).toString('base64');

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (err) {
    console.error("Login failed:", err);
    return res.status(500).json({ error: "Login failed. Please try again." });
  }
});

// Fetch user details by email
router.get("/:email", async (req, res) => {
  const { email } = req.params;

  try {
    const foundUser = await userModel.findOne({ email });

    if (!foundUser) {
      return res.status(404).json({ error: "No user found with that email." });
    }

    return res.status(200).json({ user: foundUser });
  } catch (err) {
    console.error("Error retrieving user:", err);
    return res.status(500).json({ error: "Could not fetch user details." });
  }
});

// Trigger Temporal workflow for updating user profile
router.put("/:email", async (req, res) => {
  const { email } = req.params;
  const updateFields = req.body;
  console.log("Update request received:", { email, updateFields });

  try {
    // First check if user exists
    const existingUser = await userModel.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ error: "No user found with that email." });
    }

    // Start Temporal workflow
    const workflowRef = await temporalClient.workflow.start("updateUserProfileWorkflow", {
      args: [{ email, ...updateFields }],
      taskQueue: "user-profile-task-queue",
      workflowId: `profile-update-${Date.now()}-${email}`,
    });

    console.log("Temporal workflow started:", workflowRef.workflowId);

    // Update user in database
    const updatedUser = await userModel.findOneAndUpdate(
      { email },
      { 
        $set: {
          firstName: updateFields.firstName || existingUser.firstName,
          lastName: updateFields.lastName || existingUser.lastName,
          phoneNumber: updateFields.phoneNumber || existingUser.phoneNumber,
          city: updateFields.city || existingUser.city,
          pincode: updateFields.pincode || existingUser.pincode,
          photoURL: updateFields.photoURL || existingUser.photoURL
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      throw new Error("Failed to update user profile");
    }

    console.log("User updated successfully:", updatedUser);

    return res.status(200).json({ 
      message: "Profile update successful",
      user: updatedUser
    });
  } catch (err) {
    console.error("Profile update error:", err);
    return res.status(500).json({ 
      error: "Could not update profile",
      details: err.message 
    });
  }
});

export default router;
