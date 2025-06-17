
import axios from "axios";
import connectDB from "../config/db.js";
import userModel from "../models/userModel.js";

// Input type for the profile update
export interface UserProfilePayload {
  email: string;
  firstName: string;
  lastName: string;
}

// Constants
const CRUDCRUD_ENDPOINT = "https://crudcrud.com/api/2e64e828332c4b0dab68078707653d7e/profiles";
const DELAY_MS = 10000;

/**
 * Utility to pause execution for given milliseconds
 */
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

/**
 * Update user's profile in MongoDB
 */
async function updateUserInDB(email: string, data: Partial<UserProfilePayload>) {
  try {
    const result = await userModel.findOneAndUpdate({ email }, data, { new: true });
    result
      ? console.log(" MongoDB updated:", result)
      : console.warn(` No user found with email: ${email}`);
  } catch (err: any) {
    console.error(" MongoDB error:", err.message);
  }
}

/**
 * Send updated user data to CrudCrud API
 */
async function pushToCrudCrud(payload: UserProfilePayload) {
  try {
    const res = await axios.post(CRUDCRUD_ENDPOINT, payload);
    console.log("Data sent to CrudCrud:", res.data);
    return res.data;
  } catch (err: any) {
    console.error(" Failed to sync with CrudCrud:", err.message);
  }
}


export async function processUserProfileUpdate(input: UserProfilePayload): Promise<any> {
  await connectDB();

  await updateUserInDB(input.email, {
    firstName: input.firstName,
    lastName: input.lastName,
  });

  await delay(DELAY_MS);

  return await pushToCrudCrud(input);
}
