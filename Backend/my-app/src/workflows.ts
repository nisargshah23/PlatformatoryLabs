import { proxyActivities } from '@temporalio/workflow';
// Only import the activity types
import type * as activities from './activities';

const { createUser, loginUser, getUserProfile, updateUserProfile, deleteUser } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
});

/** A workflow that simply calls an activity */
export async function example(name: string): Promise<string> {
  return await greet(name);
}

export async function userSignupWorkflow(data: { email: string; password: string; name: string }): Promise<any> {
  return await createUser(data);
}

export async function userLoginWorkflow(data: { email: string; password: string }): Promise<any> {
  return await loginUser(data);
}

export async function userProfileWorkflow(userId: string): Promise<any> {
  return await getUserProfile(userId);
}

export async function userUpdateWorkflow(userId: string, data: { name?: string; profile?: any }): Promise<any> {
  return await updateUserProfile(userId, data);
}

export async function userDeleteWorkflow(userId: string): Promise<any> {
  return await deleteUser(userId);
}
