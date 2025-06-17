// server/temporal/workflows.ts

import { proxyActivities, sleep } from "@temporalio/workflow";
import type { UserProfilePayload } from "./activities";

// Define available activity proxies with timeout configuration
const { handleProfileUpdate } = proxyActivities<{
  handleProfileUpdate(data: UserProfilePayload): Promise<any>;
}>({
  startToCloseTimeout: "30 seconds",
});

// Main workflow to delay and then process the user profile update
export async function updateUserProfileWorkflow(
  input: UserProfilePayload
): Promise<void> {
  console.log("Workflow initiated. Pausing for 10 seconds before continuing...");
  await sleep(10000);
  await handleProfileUpdate(input);
  console.log("Workflow completed. Profile data pushed to external service.");
}
