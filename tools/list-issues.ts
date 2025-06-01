import { tool } from "ai";
import { z } from "zod";
import type { LinearClient } from "@linear/sdk";

export const createListIssuesTool = (client: LinearClient) =>
	tool({
		description: "List issues in the user's Linear workspace",
		parameters: z.object({
			query: z.string().optional().describe("The query to search for"),
			teamId: z
				.string()
				.optional()
				.describe("The id of the team to get issues for"),
			stateId: z
				.string()
				.optional()
				.describe("The id of the state to get issues for"),
			assigneeId: z
				.string()
				.optional()
				.describe("The id of the assignee to get issues for"),
			includeArchived: z
				.boolean()
				.optional()
				.describe("Whether to include archived issues"),
			limit: z.number().optional().describe("The number of issues to return"),
		}),
		execute: async ({
			query,
			teamId,
			stateId,
			assigneeId,
			includeArchived,
			limit,
		}) => {
			const issues = await client.issues({
				filter: {
					or: query
						? [
								{
									title: {
										containsIgnoreCaseAndAccent: query,
									},
								},
								{
									description: {
										containsIgnoreCaseAndAccent: query,
									},
								},
							]
						: undefined,
					team: { id: { eq: teamId } },
					state: { id: { eq: stateId } },
					assignee: { id: { eq: assigneeId } },
				},
				includeArchived,
				first: limit,
			});

			let text = "Found issues: \n";
			for (const issue of issues.nodes) {
				text += `${issue.title} - ${issue.id}\n`;
			}
			return text;
		},
	});
