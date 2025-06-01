import type { LinearClient } from "@linear/sdk";
import { tool } from "ai";
import { z } from "zod";

export const createGetUserTool = (client: LinearClient) =>
	tool({
		description: "Get a user",
		parameters: z.object({
			userId: z.string().describe("The id of the user to get"),
		}),
		execute: async ({ userId }) => {
			const user = await client.user(userId);
			return `User: ${user.name} - ${user.email} - ${user.id} - ${user.timezone} - Active: ${user.active} - Created at: ${user.createdAt} - Updated at: ${user.updatedAt}`;
		},
	});
