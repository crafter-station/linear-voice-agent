import type { LinearClient } from "@linear/sdk";
import { tool } from "ai";
import { z } from "zod";

export const createListIssueStatusesTool = (client: LinearClient) =>
	tool({
		description:
			"List available issues statuses in the user's Linear workspace",
		parameters: z.object({}),
		execute: async () => {
			const statuses = await client.projectStatuses();
			return statuses.nodes
				.map((status) => `${status.name} - ${status.id}`)
				.join("\n");
		},
	});
