import { z } from "zod";
import { streamText, tool, type Message } from "ai";
import { openai } from "@ai-sdk/openai";
import { LinearClient } from "@linear/sdk";

import { createListUsersTool } from "./list-users";
import { createListIssuesTool } from "./list-issues";
import { createCreateIssueTool } from "./create-issue";
import { createListIssueLabelsTool } from "./list-labels";
import { createGetIssueTool } from "./get-issue";
import { createListIssueStatusesTool } from "./list-issue-statuses";
import { createGetUserTool } from "./get-user";

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
			getUser: createGetUserTool(linear),

			createIssue: createCreateIssueTool(linear),
			listIssues: createListIssuesTool(linear),
			getIssue: createGetIssueTool(linear),

			listIssueLabels: createListIssueLabelsTool(linear),
			listIssueStatuses: createListIssueStatusesTool(linear),
		},
		maxSteps: 10,
		messages,
	});

	return result;
}
