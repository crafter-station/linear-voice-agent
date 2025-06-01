"use client";

import { useEffect, useRef, useState } from "react";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft, Mic, Phone, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Conversation } from "@elevenlabs/client";
import ConversationAudioBall, {
	type ConversationAudioBallRef,
} from "@/app/components/conversation-audio-ball";

export default function ConversationalAgentPage() {
	const [isConnected, setIsConnected] = useState(false);
	const [isRecording, setIsRecording] = useState(false);
	const [status, setStatus] = useState<string>("Disconnected");
	const [error, setError] = useState<string | null>(null);

	// biome-ignore lint/suspicious/noExplicitAny: ElevenLabs SDK types are not fully typed
	const conversationRef = useRef<any>(null);
	const audioBallRef = useRef<ConversationAudioBallRef>(null);
	const audioStreamRef = useRef<MediaStream | null>(null);

	const AGENT_ID = "agent_01jwmck1v3fa3tdss91mw9kjad";

	const startConversation = async () => {
		try {
			setError(null);
			setStatus("Requesting microphone access...");

			// Request microphone access
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: {
					echoCancellation: false,
					noiseSuppression: false,
					autoGainControl: false,
					sampleRate: 48000,
					channelCount: 1,
				},
			});

			audioStreamRef.current = stream;

			setStatus("Connecting to agent...");

			// Connect the audio stream to the visualization
			if (audioBallRef.current) {
				audioBallRef.current.connectAudioStream(stream);
			}

			// Start conversation with ElevenLabs
			const conversation = await Conversation.startSession({
				agentId: AGENT_ID,
				onConnect: () => {
					console.log("Connected to agent");
					setIsConnected(true);
					setStatus("Connected - Agent is listening");
				},
				onDisconnect: () => {
					console.log("Disconnected from agent");
					setIsConnected(false);
					setIsRecording(false);
					setStatus("Disconnected");
				},
				// biome-ignore lint/suspicious/noExplicitAny: ElevenLabs SDK callback types
				onError: (error: any) => {
					console.error("Conversation error:", error);
					setError(`Conversation error: ${error.message || error}`);
					setStatus("Error occurred");
				},
				onModeChange: ({ mode }: { mode: string }) => {
					console.log("Mode changed:", mode);
					const isListening = mode === "listening" || mode === "speaking";
					setIsRecording(isListening);

					if (mode === "listening") {
						setStatus("🎤 Agent is listening...");
					} else if (mode === "speaking") {
						setStatus("🗣️ Agent is speaking...");
					} else if (mode === "thinking") {
						setStatus("🤔 Agent is thinking...");
					}
				},
				// biome-ignore lint/suspicious/noExplicitAny: ElevenLabs SDK callback types
				onMessage: (message: any) => {
					console.log("Message:", message);
				},
				onStatusChange: ({ status }: { status: string }) => {
					console.log("Status changed:", status);
					setStatus(status);
				},
			});

			conversationRef.current = conversation;
		} catch (error) {
			console.error("Failed to start conversation:", error);
			const errorMessage =
				error instanceof Error ? error.message : String(error);
			setError(`Failed to start conversation: ${errorMessage}`);
			setStatus("Connection failed");

			// Cleanup on error
			if (audioStreamRef.current) {
				for (const track of audioStreamRef.current.getTracks()) {
					track.stop();
				}
				audioStreamRef.current = null;
			}
			if (audioBallRef.current) {
				audioBallRef.current.disconnectAudio();
			}
		}
	};

	const endConversation = async () => {
		try {
			// End the conversation
			if (conversationRef.current) {
				await conversationRef.current.endSession();
				conversationRef.current = null;
			}

			// Stop audio stream
			if (audioStreamRef.current) {
				for (const track of audioStreamRef.current.getTracks()) {
					track.stop();
				}
				audioStreamRef.current = null;
			}

			// Disconnect audio from visualization
			if (audioBallRef.current) {
				audioBallRef.current.disconnectAudio();
			}

			setIsConnected(false);
			setIsRecording(false);
			setStatus("Disconnected");
			setError(null);
		} catch (error) {
			console.error("Failed to end conversation:", error);
			const errorMessage =
				error instanceof Error ? error.message : String(error);
			setError(`Failed to end conversation: ${errorMessage}`);
		}
	};

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (conversationRef.current) {
				conversationRef.current.endSession();
			}
			if (audioStreamRef.current) {
				for (const track of audioStreamRef.current.getTracks()) {
					track.stop();
				}
			}
			if (audioBallRef.current) {
				audioBallRef.current.disconnectAudio();
			}
		};
	}, []);

	return (
		<div className="min-h-[100dvh] bg-background flex flex-col relative">
			{/* Audio Reactive Ball Background */}
			<div className="absolute inset-0">
				<ConversationAudioBall
					ref={audioBallRef}
					isActive={isConnected && isRecording}
				/>
			</div>

			{/* Header */}
			<header className="border-b border-border/60 bg-background/90 backdrop-blur-sm relative z-10">
				<div className="flex items-center justify-between px-6 py-3">
					<div className="flex items-center gap-4">
						<Link
							href="/elevenlabs"
							className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
						>
							<ArrowLeft className="h-4 w-4" />
							<span className="text-sm">Back</span>
						</Link>
						<div className="w-6 h-6 bg-foreground rounded flex items-center justify-center">
							<span className="text-background font-medium text-[10px]">
								AI
							</span>
						</div>
						<span className="text-foreground font-medium text-sm">
							Conversational Agent
						</span>
					</div>

					<UserButton />
				</div>
			</header>

			{/* Main Content */}
			<main className="flex flex-1 flex-col items-center justify-center px-6 py-8 relative z-10">
				<div className="text-center space-y-6 bg-background/90 backdrop-blur-sm rounded-lg p-8 border border-border/60 shadow-2xl">
					<div className="space-y-2">
						<h1 className="text-3xl font-medium text-foreground">
							Linear Voice Agent
						</h1>
						<p className="text-muted-foreground">
							Conversational AI agent with real-time audio visualization
						</p>
					</div>

					{/* Status Display */}
					<div className="space-y-2">
						<div className="flex items-center justify-center gap-2">
							{isRecording && (
								<div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
							)}
							<span className="text-sm font-medium text-foreground">
								{status}
							</span>
						</div>

						{error && (
							<div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/20 p-3 rounded border border-red-200 dark:border-red-800">
								{error}
							</div>
						)}
					</div>

					{/* Controls */}
					<div className="flex items-center justify-center gap-4">
						{!isConnected ? (
							<Button
								onClick={startConversation}
								size="lg"
								className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
							>
								<Phone className="h-4 w-4" />
								Start Conversation
							</Button>
						) : (
							<Button
								onClick={endConversation}
								variant="destructive"
								size="lg"
								className="flex items-center gap-2"
							>
								<PhoneOff className="h-4 w-4" />
								End Conversation
							</Button>
						)}
					</div>

					{/* Agent Info */}
					<div className="text-xs text-muted-foreground space-y-1 border-t border-border/60 pt-4">
						<div>Agent ID: {AGENT_ID}</div>
						<div className="flex items-center justify-center gap-4 text-xs">
							{isConnected && (
								<span className="flex items-center gap-1">
									<Mic className="h-3 w-3" />
									Audio: {isRecording ? "Active" : "Standby"}
								</span>
							)}
							<span>Status: {isConnected ? "Connected" : "Disconnected"}</span>
						</div>
					</div>

					{/* Instructions */}
					{!isConnected && !error && (
						<div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded border">
							💡 Click "Start Conversation" to connect with the AI agent. The
							visualization will react to your voice and the agent's responses.
						</div>
					)}
				</div>
			</main>
		</div>
	);
}
