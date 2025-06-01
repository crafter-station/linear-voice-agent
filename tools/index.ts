import { z } from "zod";
import { streamText, tool, type Message } from "ai";
import { openai } from "@ai-sdk/openai";
import { LinearClient } from "@linear/sdk";

import { createListUsersTool } from "./list-users";
import { createListIssuesTool } from "./list-issues";
import { createCreateIssueTool } from "./create-issue";
import { createListLabelsTool } from "./list-labels";

export function streamLinearAI({
	messages,
	oauthToken,
}: { messages: Message[]; oauthToken: string }) {
	const linear = new LinearClient({
		accessToken: oauthToken,
	});

	const result = streamText({
		model: openai("gpt-4.1-nano"),
		tools: {
			listUsers: createListUsersTool(linear),
			listIssues: createListIssuesTool(linear),
			createIssue: createCreateIssueTool(linear),
			listLabels: createListLabelsTool(linear),

			getIssue: tool({
				description: "Get an issue",
				parameters: z.object({
					issueId: z.string().describe("The id of the issue to get"),
				}),
				execute: async ({ issueId }) => {
					const issue = await linear.issue(issueId);
					return `${issue.title} ${issue.description}`;
				},
			}),
			listIssueStatuses: tool({
				description: "List available issues statuses in a the current team",
				parameters: z.object({}),
				execute: async () => {
					const statuses = await linear.projectStatuses();
					return statuses.nodes
						.map((status) => `${status.name} - ${status.id}`)
						.join("\n");
				},
			}),
		},
		maxSteps: 10,
		messages,
	});

	return result;
}
