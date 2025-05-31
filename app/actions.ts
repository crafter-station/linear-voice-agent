"use server";

import { auth } from "@clerk/nextjs/server";
import { type OauthAccessToken, createClerkClient } from "@clerk/backend";
import { ClerkAPIResponseError } from "@clerk/shared";
import { LinearClient, LinearDocument } from "@linear/sdk";

export async function getLinearData() {
	try {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized: No user ID found");
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
				throw new Error("Failed to retrieve Linear OAuth token");
			}
			throw error;
		}

		if (!oauthTokens || oauthTokens.length === 0) {
			throw new Error("Linear OAuth token not found for this user");
		}

		const token = oauthTokens[0].token;
		const linearClient = new LinearClient({ accessToken: token });

		// Fetch teams with proper ordering
		const teams = await linearClient.teams({
			orderBy: LinearDocument.PaginationOrderBy.CreatedAt,
		});
		const teamData = teams.nodes.map((team) => ({
			id: team.id,
			name: team.name,
			description: team.description ?? "No description",
			createdAt: team.createdAt.toString(),
		}));

		return { teams: teamData };
	} catch (error) {
		console.error("Error fetching Linear data:", error);
		throw new Error("Failed to fetch Linear data");
	}
}

export async function getTeamIssues(teamId: string) {
	try {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized: No user ID found");
		}

		const clerkClient = createClerkClient({
			secretKey: process.env.CLERK_SECRET_KEY,
		});

		const oauthTokensResponse = await clerkClient.users.getUserOauthAccessToken(
			userId,
			"linear",
		);
		const oauthTokens = oauthTokensResponse.data;

		if (!oauthTokens || oauthTokens.length === 0) {
			throw new Error("Linear OAuth token not found for this user");
		}

		const token = oauthTokens[0].token;
		const linearClient = new LinearClient({ accessToken: token });

		// Fetch team and its issues with proper ordering
		const team = await linearClient.team(teamId);
		const issues = await team.issues({
			first: 5,
			orderBy: LinearDocument.PaginationOrderBy.UpdatedAt,
		});

		const issueData = [];
		for (const issue of issues.nodes) {
			const state = await issue.state;
			issueData.push({
				id: issue.id,
				title: issue.title,
				description: issue.description ?? "No description",
				url: issue.url,
				createdAt: issue.createdAt.toString(),
				updatedAt: issue.updatedAt.toString(),
				state: {
					name: state?.name ?? "Unknown",
					color: state?.color ?? "#000000",
				},
			});
		}

		return issueData;
	} catch (error) {
		console.error("Error fetching team issues:", error);
		throw new Error("Failed to fetch team issues");
	}
}

export async function createIssue(
	teamId: string,
	title: string,
	description?: string,
) {
	try {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized: No user ID found");
		}

		const clerkClient = createClerkClient({
			secretKey: process.env.CLERK_SECRET_KEY,
		});

		const oauthTokensResponse = await clerkClient.users.getUserOauthAccessToken(
			userId,
			"linear",
		);
		const oauthTokens = oauthTokensResponse.data;

		if (!oauthTokens || oauthTokens.length === 0) {
			throw new Error("Linear OAuth token not found for this user");
		}

		const token = oauthTokens[0].token;
		const linearClient = new LinearClient({ accessToken: token });

		// Create the issue
		const issuePayload = await linearClient.createIssue({
			teamId,
			title,
			description,
		});

		if (issuePayload.success && issuePayload.issue) {
			const issue = await issuePayload.issue;
			return {
				success: true,
				issue: {
					id: issue.id,
					title: issue.title,
					url: issue.url,
				},
			};
		}

		throw new Error("Failed to create issue");
	} catch (error) {
		console.error("Error creating issue:", error);
		throw new Error("Failed to create issue");
	}
}

export async function updateIssue(
	issueId: string,
	data: { title?: string; description?: string },
) {
	try {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized: No user ID found");
		}

		const clerkClient = createClerkClient({
			secretKey: process.env.CLERK_SECRET_KEY,
		});

		const oauthTokensResponse = await clerkClient.users.getUserOauthAccessToken(
			userId,
			"linear",
		);
		const oauthTokens = oauthTokensResponse.data;

		if (!oauthTokens || oauthTokens.length === 0) {
			throw new Error("Linear OAuth token not found for this user");
		}

		const token = oauthTokens[0].token;
		const linearClient = new LinearClient({ accessToken: token });

		// Update the issue
		const issuePayload = await linearClient.updateIssue(issueId, data);

		if (issuePayload.success && issuePayload.issue) {
			const issue = await issuePayload.issue;
			return {
				success: true,
				issue: {
					id: issue.id,
					title: issue.title,
					url: issue.url,
				},
			};
		}

		throw new Error("Failed to update issue");
	} catch (error) {
		console.error("Error updating issue:", error);
		throw new Error("Failed to update issue");
	}
}
