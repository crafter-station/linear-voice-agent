import { openai } from "@ai-sdk/openai";
import {
	experimental_createMCPClient as createMCPClient,
	generateText,
} from "ai";

let mcp: Awaited<ReturnType<typeof createMCPClient>> | undefined;
try {
	const auth = `${process.env.LINEAR_API_KEY}`;
	console.log(auth);

	mcp = await createMCPClient({
		transport: {
			type: "sse",
			url: "https://mcp.linear.app/sse",
			headers: {
				Authorization: auth,
			},
		},
	});
	const tools = await mcp.tools();
	const result = await generateText({
		model: openai("gpt-4.1-nano"),
		tools,
		maxSteps: 10,
		prompt: "Cuáles son los issues de text0?",
	});

	console.log(result.text);
} catch (error) {
	console.error(error);
} finally {
	if (mcp) {
		await mcp.close();
	}
}
