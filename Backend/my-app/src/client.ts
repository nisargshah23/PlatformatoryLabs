import { Connection, Client } from '@temporalio/client';
import { userSignupWorkflow, userLoginWorkflow, userProfileWorkflow, userUpdateWorkflow, userDeleteWorkflow } from './workflows';
import { nanoid } from 'nanoid';

async function run() {
  // Connect to the default Server location
  const connection = await Connection.connect({ address: 'localhost:7233' });
  // In production, pass options to configure TLS and other settings:
  // {
  //   address: 'foo.bar.tmprl.cloud',
  //   tls: {}
  // }

  const client = new Client({
    connection,
    // namespace: 'foo.bar', // connects to 'default' namespace if not specified
  });

  // Example usage of workflows
  async function signup(email: string, password: string, name: string) {
    const handle = await client.workflow.start(userSignupWorkflow, {
      taskQueue: 'user-management',
      workflowId: 'signup-' + nanoid(),
      args: [{ email, password, name }],
    });
    return await handle.result();
  }

  async function login(email: string, password: string) {
    const handle = await client.workflow.start(userLoginWorkflow, {
      taskQueue: 'user-management',
      workflowId: 'login-' + nanoid(),
      args: [{ email, password }],
    });
    return await handle.result();
  }

  async function getProfile(userId: string) {
    const handle = await client.workflow.start(userProfileWorkflow, {
      taskQueue: 'user-management',
      workflowId: 'profile-' + nanoid(),
      args: [userId],
    });
    return await handle.result();
  }

  async function updateProfile(userId: string, data: { name?: string; profile?: any }) {
    const handle = await client.workflow.start(userUpdateWorkflow, {
      taskQueue: 'user-management',
      workflowId: 'update-' + nanoid(),
      args: [userId, data],
    });
    return await handle.result();
  }

  async function deleteUser(userId: string) {
    const handle = await client.workflow.start(userDeleteWorkflow, {
      taskQueue: 'user-management',
      workflowId: 'delete-' + nanoid(),
      args: [userId],
    });
    return await handle.result();
  }

  // Example usage
  try {
    // Signup
    const signupResult = await signup('test@example.com', 'password123', 'Test User');
    console.log('Signup result:', signupResult);

    // Login
    const loginResult = await login('test@example.com', 'password123');
    console.log('Login result:', loginResult);

    // Get Profile
    const profileResult = await getProfile(loginResult.user.id);
    console.log('Profile result:', profileResult);

    // Update Profile
    const updateResult = await updateProfile(loginResult.user.id, {
      name: 'Updated Name',
      profile: { bio: 'New bio' }
    });
    console.log('Update result:', updateResult);

    // Delete User
    const deleteResult = await deleteUser(loginResult.user.id);
    console.log('Delete result:', deleteResult);
  } catch (error) {
    console.error('Error:', error);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
