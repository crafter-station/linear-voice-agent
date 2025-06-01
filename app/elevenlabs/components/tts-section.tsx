"use client";

import { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Play, Square, Volume2, Loader2 } from "lucide-react";
import { textToSpeech } from "../actions";

interface Voice {
	voice_id: string;
	name: string;
	category: string;
	description?: string;
	preview_url?: string;
}

interface TTSSectionProps {
	voices: Voice[];
}

export function TTSSection({ voices }: TTSSectionProps) {
	const [text, setText] = useState(
		"Welcome to ElevenLabs! This is a demonstration of our text-to-speech technology.",
	);
	const [selectedVoice, setSelectedVoice] = useState<string>("");
	const [isLoading, setIsLoading] = useState(false);
	const [audioUrl, setAudioUrl] = useState<string>("");
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(
		null,
	);

	const handleTextToSpeech = async () => {
		if (!text.trim() || !selectedVoice) return;

		setIsLoading(true);
		try {
			const result = await textToSpeech({
				text: text.trim(),
				voice_id: selectedVoice,
				model_id: "eleven_multilingual_v2",
			});

			setAudioUrl(result.audioUrl);
		} catch (error) {
			console.error("TTS Error:", error);
			alert("Failed to generate speech. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const handlePlayAudio = () => {
		if (!audioUrl) return;

		if (currentAudio) {
			currentAudio.pause();
			setCurrentAudio(null);
			setIsPlaying(false);
		}

		const audio = new Audio(audioUrl);
		setCurrentAudio(audio);
		setIsPlaying(true);

		audio.onended = () => {
			setIsPlaying(false);
			setCurrentAudio(null);
		};

		audio.onerror = () => {
			setIsPlaying(false);
			setCurrentAudio(null);
			alert("Failed to play audio");
		};

		audio.play().catch(() => {
			setIsPlaying(false);
			setCurrentAudio(null);
			alert("Failed to play audio");
		});
	};

	const handleStopAudio = () => {
		if (currentAudio) {
			currentAudio.pause();
			setCurrentAudio(null);
			setIsPlaying(false);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Volume2 className="h-5 w-5" />
					Text to Speech
				</CardTitle>
				<CardDescription>
					Convert text to lifelike speech using AI voices
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Voice Selection */}
				<div className="space-y-2">
					<label
						htmlFor="voice-select"
						className="text-sm font-medium text-foreground"
					>
						Voice
					</label>
					<Select value={selectedVoice} onValueChange={setSelectedVoice}>
						<SelectTrigger id="voice-select">
							<SelectValue placeholder="Select a voice" />
						</SelectTrigger>
						<SelectContent>
							{voices.map((voice) => (
								<SelectItem key={voice.voice_id} value={voice.voice_id}>
									<div className="flex items-center justify-between w-full">
										<span>{voice.name}</span>
										<span className="text-xs text-muted-foreground ml-2">
											{voice.category}
										</span>
									</div>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Text Input */}
				<div className="space-y-2">
					<label
						htmlFor="text-input"
						className="text-sm font-medium text-foreground"
					>
						Text
					</label>
					<Textarea
						id="text-input"
						value={text}
						onChange={(e) => setText(e.target.value)}
						placeholder="Enter text to convert to speech..."
						className="min-h-[100px]"
						maxLength={5000}
					/>
					<div className="text-xs text-muted-foreground text-right">
						{text.length}/5000 characters
					</div>
				</div>

				{/* Controls */}
				<div className="flex items-center gap-3">
					<Button
						onClick={handleTextToSpeech}
						disabled={isLoading || !text.trim() || !selectedVoice}
						className="flex items-center gap-2"
					>
						{isLoading ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<Volume2 className="h-4 w-4" />
						)}
						Generate Speech
					</Button>

					{audioUrl && (
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={isPlaying ? handleStopAudio : handlePlayAudio}
								className="flex items-center gap-2"
							>
								{isPlaying ? (
									<Square className="h-3 w-3" />
								) : (
									<Play className="h-3 w-3" />
								)}
								{isPlaying ? "Stop" : "Play"}
							</Button>
						</div>
					)}
				</div>

				{/* Audio Element (hidden) */}
				{audioUrl && (
					<audio controls className="w-full">
						<source src={audioUrl} type="audio/mpeg" />
						<track kind="captions" srcLang="en" label="English captions" />
						Your browser does not support the audio element.
					</audio>
				)}
			</CardContent>
		</Card>
	);
}
