import type { LinearClient } from "@linear/sdk";
import { tool } from "ai";
import { z } from "zod";

export const createListIssueLabelsTool = (client: LinearClient) =>
	tool({
		description:
			"List available issue labels in the user's Linear workspace or for a specific team",
		parameters: z.object({
			teamId: z
				.string()
				.optional()
				.describe(
					"The team ID to get labels for. If not provided, returns all workspace labels.",
				),
		}),
		execute: async ({ teamId }) => {
			if (teamId) {
				// Get team-specific labels
				const team = await client.team(teamId);
				const labels = await team.labels();
				return labels.nodes
					.map((label) => `${label.name} - ${label.id}`)
					.join("\n");
			}

			// Get all workspace labels
			const labels = await client.issueLabels();
			return labels.nodes
				.map((label) => `${label.name} - ${label.id}`)
				.join("\n");
		},
	});
