"use server";

import { auth } from "@clerk/nextjs/server";

// ElevenLabs API configuration
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1";

interface Voice {
	voice_id: string;
	name: string;
	category: string;
	description?: string;
	preview_url?: string;
}

interface Agent {
	agent_id: string;
	name: string;
	first_message: string;
	system_prompt: string;
	voice_id: string;
	created_at: string;
}

interface TTSRequest {
	text: string;
	voice_id: string;
	model_id?: string;
	output_format?: string;
}

// Helper function to make authenticated requests to ElevenLabs
async function elevenLabsRequest(
	endpoint: string,
	options: RequestInit = {},
): Promise<Response> {
	if (!ELEVENLABS_API_KEY) {
		throw new Error("ElevenLabs API key not configured");
	}

	const url = `${ELEVENLABS_BASE_URL}${endpoint}`;

	const response = await fetch(url, {
		...options,
		headers: {
			"xi-api-key": ELEVENLABS_API_KEY,
			"Content-Type": "application/json",
			...options.headers,
		},
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`ElevenLabs API error: ${response.status} - ${error}`);
	}

	return response;
}

// Get available voices
export async function getVoices(): Promise<{ voices: Voice[] }> {
	const { userId } = await auth();
	if (!userId) {
		throw new Error("Unauthorized");
	}

	try {
		const response = await elevenLabsRequest("/voices");
		const data = (await response.json()) as { voices: Voice[] };

		return {
			voices: data.voices.map((voice: Voice) => ({
				voice_id: voice.voice_id,
				name: voice.name,
				category: voice.category,
				description: voice.description,
				preview_url: voice.preview_url,
			})),
		};
	} catch (error) {
		console.error("Failed to fetch voices:", error);
		throw new Error("Failed to fetch voices");
	}
}

// Text to Speech conversion
export async function textToSpeech(
	request: TTSRequest,
): Promise<{ audioUrl: string }> {
	const { userId } = await auth();
	if (!userId) {
		throw new Error("Unauthorized");
	}

	try {
		const response = await elevenLabsRequest(
			`/text-to-speech/${request.voice_id}`,
			{
				method: "POST",
				body: JSON.stringify({
					text: request.text,
					model_id: request.model_id || "eleven_multilingual_v2",
					voice_settings: {
						stability: 0.5,
						similarity_boost: 0.75,
					},
				}),
			},
		);

		// Convert response to base64 for client-side playback
		const audioBuffer = await response.arrayBuffer();
		const audioBase64 = Buffer.from(audioBuffer).toString("base64");
		const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;

		return { audioUrl };
	} catch (error) {
		console.error("Failed to convert text to speech:", error);
		throw new Error("Failed to convert text to speech");
	}
}

// Get user's agents
export async function getAgents(): Promise<{ agents: Agent[] }> {
	const { userId } = await auth();
	if (!userId) {
		throw new Error("Unauthorized");
	}

	try {
		const response = await elevenLabsRequest("/convai/agents");
		const data = (await response.json()) as { agents?: Agent[] };

		return {
			agents:
				data.agents?.map((agent: Agent) => ({
					agent_id: agent.agent_id,
					name: agent.name,
					first_message: agent.first_message,
					system_prompt: agent.system_prompt,
					voice_id: agent.voice_id,
					created_at: agent.created_at,
				})) || [],
		};
	} catch (error) {
		console.error("Failed to fetch agents:", error);
		return { agents: [] };
	}
}

// Create a new conversational AI agent
export async function createAgent(agentData: {
	name: string;
	first_message: string;
	system_prompt: string;
	voice_id: string;
}): Promise<{ agent: Agent; success: boolean }> {
	const { userId } = await auth();
	if (!userId) {
		throw new Error("Unauthorized");
	}

	try {
		const response = await elevenLabsRequest("/convai/agents", {
			method: "POST",
			body: JSON.stringify({
				name: agentData.name,
				first_message: agentData.first_message,
				system_prompt: agentData.system_prompt,
				voice_id: agentData.voice_id,
				language: "en",
				conversation_config: {
					turn_detection: {
						type: "server_vad",
						threshold: 0.5,
						prefix_padding_ms: 300,
						silence_duration_ms: 500,
					},
				},
			}),
		});

		const data = await response.json();

		return {
			agent: {
				agent_id: data.agent_id,
				name: data.name,
				first_message: data.first_message,
				system_prompt: data.system_prompt,
				voice_id: data.voice_id,
				created_at: data.created_at,
			},
			success: true,
		};
	} catch (error) {
		console.error("Failed to create agent:", error);
		throw new Error("Failed to create agent");
	}
}

// Delete an agent
export async function deleteAgent(
	agentId: string,
): Promise<{ success: boolean }> {
	const { userId } = await auth();
	if (!userId) {
		throw new Error("Unauthorized");
	}

	try {
		await elevenLabsRequest(`/convai/agents/${agentId}`, {
			method: "DELETE",
		});

		return { success: true };
	} catch (error) {
		console.error("Failed to delete agent:", error);
		throw new Error("Failed to delete agent");
	}
}

// Get conversations for an agent
export async function getConversations(agentId: string): Promise<{
	conversations: Array<{
		conversation_id: string;
		agent_id: string;
		status: string;
		created_at: string;
		end_timestamp?: string;
	}>;
}> {
	const { userId } = await auth();
	if (!userId) {
		throw new Error("Unauthorized");
	}

	try {
		const response = await elevenLabsRequest(
			`/convai/conversations?agent_id=${agentId}`,
		);
		const data = await response.json();

		return {
			conversations: data.conversations || [],
		};
	} catch (error) {
		console.error("Failed to fetch conversations:", error);
		return { conversations: [] };
	}
}

// Generate voice from text prompt (Voice Design feature)
export async function generateVoice(description: string): Promise<{
	voice_id: string;
	name: string;
	preview_url: string;
}> {
	const { userId } = await auth();
	if (!userId) {
		throw new Error("Unauthorized");
	}

	try {
		const response = await elevenLabsRequest(
			"/voice-generation/generate-voice",
			{
				method: "POST",
				body: JSON.stringify({
					text: description,
					voice_description: description,
				}),
			},
		);

		const data = await response.json();

		return {
			voice_id: data.voice_id,
			name: data.name || "Generated Voice",
			preview_url: data.preview_url,
		};
	} catch (error) {
		console.error("Failed to generate voice:", error);
		throw new Error("Failed to generate voice");
	}
}
