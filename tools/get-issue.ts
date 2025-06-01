import { z } from "zod";
import type { LinearClient } from "@linear/sdk";
import { tool } from "ai";

export const createGetIssueTool = (client: LinearClient) =>
	tool({
		description: "Get an issue",
		parameters: z.object({
			issueId: z
				.string()
				.describe(
					"The id of the issue to get. Can be a UUID or a string in the format of 'ABC-123'",
				),
		}),
		execute: async ({ issueId }) => {
			const issue = await client.issue(issueId);
			const state = await issue.state;
			return `Issue: ${issue.identifier} ${issue.title} ${issue.description} - ${state?.name}`;
		},
	});
