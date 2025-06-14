import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TTSSection } from "./components/tts-section";
import { VoicesSection } from "./components/voices-section";
import { AgentsSection } from "./components/agents-section";
import { ErrorRetryButton } from "./components/error-retry-button";
import { getVoices, getAgents } from "./actions";

// Force dynamic rendering since we use auth() which requires headers
export const dynamic = "force-dynamic";

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

export default async function ElevenLabsPage() {
	// Fetch initial data
	let voices: Voice[] = [];
	let agents: Agent[] = [];
	let error: string | null = null;

	try {
		const [voicesResult, agentsResult] = await Promise.all([
			getVoices(),
			getAgents(),
		]);
		voices = voicesResult.voices;
		agents = agentsResult.agents;
	} catch (err) {
		error =
			err instanceof Error ? err.message : "Failed to load ElevenLabs data";
		console.error("ElevenLabs page error:", err);
	}

	return (
		<div className="min-h-[100dvh] bg-background flex flex-col">
			{/* Header */}
			<header className="border-b border-border/60">
				<div className="flex items-center justify-between px-6 py-3">
					<div className="flex items-center gap-4">
						<Link
							href="/"
							className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
						>
							<ArrowLeft className="h-4 w-4" />
							<span className="text-sm">Back</span>
						</Link>
						<div className="w-6 h-6 bg-foreground rounded flex items-center justify-center">
							<span className="text-background font-medium text-[10px]">
								EL
							</span>
						</div>
						<span className="text-foreground font-medium text-sm">
							ElevenLabs Integration
						</span>
					</div>

					<UserButton />
				</div>
			</header>

			{/* Main Content */}
			<main className="flex flex-1 flex-col max-w-6xl mx-auto w-full px-6 py-8">
				<div className="mb-8">
					<h1 className="text-2xl font-medium text-foreground mb-2">
						AI Voice Platform
					</h1>
					<p className="text-sm text-muted-foreground">
						Create lifelike speech, build conversational agents, and generate
						custom voices
					</p>
				</div>

				{/* Quick Access to Voice Agent */}
				<div className="mb-8 p-6 border border-border/60 rounded-lg bg-muted/20">
					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<h3 className="text-lg font-medium text-foreground">
								Linear Voice Agent
							</h3>
							<p className="text-sm text-muted-foreground">
								Interactive conversational AI with real-time audio visualization
							</p>
						</div>
						<Link href="/elevenlabs/agent">
							<Button className="flex items-center gap-2">
								<MessageCircle className="h-4 w-4" />
								Start Conversation
							</Button>
						</Link>
					</div>
				</div>

				{error ? (
					<div className="flex-1 flex items-center justify-center">
						<div className="text-center space-y-4">
							<h2 className="text-lg font-medium text-foreground">
								Unable to load ElevenLabs data
							</h2>
							<p className="text-sm text-muted-foreground max-w-md">
								{error}. Make sure your ElevenLabs API key is configured.
							</p>
							<ErrorRetryButton />
						</div>
					</div>
				) : (
					<div className="space-y-8">
						{/* Text to Speech Section */}
						<TTSSection voices={voices} />

						{/* Voices Management Section */}
						<VoicesSection voices={voices} />

						{/* Conversational AI Agents Section */}
						<AgentsSection agents={agents} voices={voices} />
					</div>
				)}
			</main>
		</div>
	);
}
