import { tool } from "ai";
import { z } from "zod";
import type { LinearClient } from "@linear/sdk";

export const createCreateIssueTool = (client: LinearClient) =>
	tool({
		description: "Create a new Linear issue",
		parameters: z.object({
			title: z.string().describe("The title of the issue to create"),
			teamId: z.string().describe("The id of the team to create the issue for"),

			description: z
				.string()
				.optional()
				.describe("The description of the issue to create"),
			priority: z.number().optional().describe("The priority of the issue"),
			projectId: z
				.string()
				.optional()
				.describe("The id of the project to create the issue for"),
			stateId: z
				.string()
				.optional()
				.describe("The id of the state to create the issue for"),
			assigneeId: z
				.string()
				.optional()
				.describe("The id of the assignee to create the issue for"),
			labelIds: z
				.array(z.string())
				.optional()
				.describe("The ids of the labels to create the issue for"),
			dueDate: z.string().optional().describe("The due date of the issue"),
		}),
		execute: async ({
			title,
			teamId,
			description,
			priority,
			projectId,
			stateId,
			assigneeId,
			labelIds,
			dueDate,
		}) => {
			console.log({
				title,
				teamId,
				description,
				priority,
				projectId,
				stateId,
				assigneeId,
				labelIds,
				dueDate,
			});

			try {
				const result = await client.createIssue({
					title,
					teamId,
					description,
					priority,
					projectId,
					stateId,
					assigneeId,
					labelIds,
					dueDate,
				});

				if (!result.issueId) {
					console.error("Issue not created", result);
					return "Issue not created";
				}

				const issue = await result.issue;

				if (!issue) {
					console.error("Issue not created", result);
					return "Issue not created";
				}

				console.log("Issue created", issue);
				return `Issue created: ${issue.identifier}`;
			} catch (error) {
				console.error("Error creating issue:", error);
				return `Error creating issue: ${error instanceof Error ? error.message : String(error)}`;
			}
		},
	});
