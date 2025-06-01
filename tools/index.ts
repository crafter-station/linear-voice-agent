import { z } from "zod";
import {
	streamText,
	tool,
	type Message,
	generateText,
	generateObject,
	StreamTextResult,
	GenerateTextResult,
} from "ai";
import { openai } from "@ai-sdk/openai";
import { LinearClient } from "@linear/sdk";

import { createListUsersTool } from "./list-users";
import { createListIssuesTool } from "./list-issues";
import { createCreateIssueTool } from "./create-issue";
import { createListIssueLabelsTool } from "./list-labels";
import { createGetIssueTool } from "./get-issue";
import { createListIssueStatusesTool } from "./list-issue-statuses";
import { createGetUserTool } from "./get-user";
import { systemPrompt } from "./system-prompt";

const createTools = (linear: LinearClient) => ({
	listUsers: createListUsersTool(linear),
	getUser: createGetUserTool(linear),

	createIssue: createCreateIssueTool(linear),
	listIssues: createListIssuesTool(linear),
	getIssue: createGetIssueTool(linear),

	listIssueLabels: createListIssueLabelsTool(linear),
	listIssueStatuses: createListIssueStatusesTool(linear),
});

export async function runLinearAI(
	options: {
		oauthToken: string;
	} & (
		| {
				prompt: string;
		  }
		| {
				messages: Message[];
		  }
	),
) {
	const linear = new LinearClient({
		accessToken: options.oauthToken,
	});

	const tools = createTools(linear);

	const result = await generateText({
		model: openai("gpt-4.1-nano"),
		tools,
		prompt: "prompt" in options ? options.prompt : undefined,
		messages: "messages" in options ? options.messages : undefined,
		maxSteps: 10,
		system: systemPrompt,
	});

	return result;
}

export async function runLinearAIStream(
	options: {
		oauthToken: string;
	} & (
		| {
				prompt: string;
		  }
		| {
				messages: Message[];
		  }
	),
) {
	const linear = new LinearClient({
		accessToken: options.oauthToken,
	});

	const tools = createTools(linear);

	return streamText({
		model: openai("gpt-4.1-nano"),
		tools,
		messages: "messages" in options ? options.messages : undefined,
		prompt: "prompt" in options ? options.prompt : undefined,
		maxSteps: 10,
		system: systemPrompt,
	});
}
