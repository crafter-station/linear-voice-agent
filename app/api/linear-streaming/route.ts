import {
	auth,
	createClerkClient,
	type OauthAccessToken,
} from "@clerk/nextjs/server";
import { ClerkAPIResponseError } from "@clerk/shared";

import { streamLinearAI } from "@/tools";

export async function POST(request: Request) {
	try {
		const { prompt, userId } = await request.json();

		if (!prompt) {
			return Response.json({ error: "No prompt provided" }, { status: 400 });
		}

		if (!userId) {
			return Response.json(
				{ error: "Unauthorized: No user ID found" },
				{ status: 401 },
			);
		}

		const clerkClient = createClerkClient({
			secretKey: process.env.CLERK_SECRET_KEY,
		});

		let oauthTokens: OauthAccessToken[] | undefined;
		try {
			const oauthTokensResponse =
				await clerkClient.users.getUserOauthAccessToken(userId, "linear");
			oauthTokens = oauthTokensResponse.data;
		} catch (error) {
			if (error instanceof ClerkAPIResponseError) {
				return Response.json(
					{
						error: "Failed to retrieve Linear OAuth token",
						details: error.errors,
					},
					{ status: 400 },
				);
			}
			throw error;
		}

		if (!oauthTokens || oauthTokens.length === 0) {
			return Response.json(
				{ error: "Linear OAuth token not found for this user" },
				{ status: 400 },
			);
		}

		const token = oauthTokens[0].token;

		console.log(token);

		const result = streamLinearAI({
			messages: [{ role: "user", content: prompt, id: "1" }],
			oauthToken: token,
		});

		return result.toDataStreamResponse();
	} catch (error) {
		console.error(error);
		return Response.json(
			{ error: "Failed to process request" },
			{ status: 500 },
		);
	}
}
