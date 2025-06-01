import { tool } from "ai";
import { z } from "zod";
import type { LinearClient } from "@linear/sdk";

export const createListUsersTool = (client: LinearClient) =>
	tool({
		description: "List all users in the current team",
		parameters: z.object({}),
		execute: async () => {
			const users = await client.users();
			return users.nodes.map((user) => `${user.name} - ${user.id}`).join("\n");
		},
	});
