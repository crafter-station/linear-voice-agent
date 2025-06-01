import type { LinearClient } from "@linear/sdk";
import { tool } from "ai";
import { z } from "zod";

export const createListLabelsTool = (client: LinearClient) =>
	tool({
		description: "List labels in the user's Linear workspace",
		parameters: z.object({}),
		execute: async () => {
			const labels = await client.issueLabels();
			return labels.nodes
				.map((label) => `${label.name} - ${label.id}`)
				.join("\n");
		},
	});
