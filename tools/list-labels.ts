import type { LinearClient } from "@linear/sdk";
import { tool } from "ai";
import { z } from "zod";

export const createListIssueLabelsTool = (client: LinearClient) =>
	tool({
		description: "List available issue labels in the user's Linear workspace",
		parameters: z.object({}),
		execute: async () => {
			const labels = await client.issueLabels();
			return labels.nodes
				.map((label) => `${label.name} - ${label.id}`)
				.join("\n");
		},
	});
