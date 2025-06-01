import type { LinearClient } from "@linear/sdk";
import { tool } from "ai";
import { z } from "zod";

export const createListIssueLabelsTool = (client: LinearClient) =>
	tool({
		description:
			"List available issue labels in the user's Linear workspace or for a specific team. Returns JSON format with clear name and id separation.",
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
				return JSON.stringify(
					labels.nodes.map((label) => ({
						name: label.name,
						id: label.id,
						color: label.color,
					})),
					null,
					2,
				);
			}

			// Get all workspace labels
			const labels = await client.issueLabels();
			return JSON.stringify(
				labels.nodes.map((label) => ({
					name: label.name,
					id: label.id,
					color: label.color,
				})),
				null,
				2,
			);
		},
	});
