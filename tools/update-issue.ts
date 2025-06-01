import type { LinearClient } from "@linear/sdk";
import { tool } from "ai";
import { z } from "zod";

export const createUpdateIssueTool = (client: LinearClient) =>
	tool({
		description: "Update an issue",
		parameters: z.object({
			id: z.string().describe("The id of the issue to update"),

			title: z.string().optional().describe("The title of the issue"),
			description: z
				.string()
				.optional()
				.describe("The description of the issue"),

			priority: z.number().optional().describe("The priority of the issue"),
			projectId: z.string().optional().describe("The project id of the issue"),
			stateId: z.string().optional().describe("The state id of the issue"),
			assigneeId: z
				.string()
				.optional()
				.describe("The assignee id of the issue"),
			labelIds: z
				.array(z.string())
				.optional()
				.describe("The label ids of the issue"),
			dueDate: z.string().optional().describe("The due date of the issue"),
		}),
		execute: async ({
			id,
			title,
			description,
			priority,
			projectId,
			stateId,
			assigneeId,
			dueDate,
			labelIds,
		}) => {
			const issue = await client.issue(id);
			await issue.update({
				title,
				description,
				priority,
				projectId,
				stateId,
				assigneeId,
				dueDate,
				labelIds,
			});
			return `Issue updated: ${issue.identifier}`;
		},
	});
