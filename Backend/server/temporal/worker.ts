// server/temporal/worker.ts

import { Worker } from "@temporalio/worker";
import * as taskActivities from "./activities.js"; // Points to compiled .js activities
import connectDB from "../config/db.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Resolve __dirname in an ES Module context
const currentFile = fileURLToPath(import.meta.url);
const currentDir = dirname(currentFile);

// Path to compiled workflow file
const compiledWorkflows = join(currentDir, "workflows.js");

async function initializeWorker(): Promise<void> {
  try {
    // Establish database connection
    await connectDB();

    const workerInstance = await Worker.create({
      workflowsPath: compiledWorkflows,
      activities: taskActivities,
      taskQueue: "user-profile-task-queue",
    });

    console.log("Temporal Worker is now running.");
    await workerInstance.run();
  } catch (error) {
    console.error("Worker initialization failed:", error);
  }
}

initializeWorker();
