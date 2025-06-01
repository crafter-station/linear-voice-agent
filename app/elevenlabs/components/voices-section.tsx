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
import { Input } from "@/components/ui/input";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Mic, Play, Plus, Loader2, Wand2 } from "lucide-react";
import { generateVoice } from "../actions";

interface Voice {
	voice_id: string;
	name: string;
	category: string;
	description?: string;
	preview_url?: string;
}

interface VoicesSectionProps {
	voices: Voice[];
}

export function VoicesSection({ voices }: VoicesSectionProps) {
	const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
	const [voiceDescription, setVoiceDescription] = useState("");
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [playingVoice, setPlayingVoice] = useState<string>("");

	const handleGenerateVoice = async () => {
		if (!voiceDescription.trim()) return;

		setIsGeneratingVoice(true);
		try {
			const result = await generateVoice(voiceDescription.trim());

			// Voice generated successfully
			alert(
				`Voice "${result.name}" generated successfully! Refresh the page to see it.`,
			);
			setIsDialogOpen(false);
			setVoiceDescription("");
		} catch (error) {
			console.error("Voice generation error:", error);
			alert("Failed to generate voice. Please try again.");
		} finally {
			setIsGeneratingVoice(false);
		}
	};

	const handlePlayPreview = async (voice: Voice) => {
		if (!voice.preview_url) return;

		if (playingVoice === voice.voice_id) {
			// Stop current playback
			setPlayingVoice("");
			return;
		}

		try {
			setPlayingVoice(voice.voice_id);
			const audio = new Audio(voice.preview_url);

			audio.onended = () => setPlayingVoice("");
			audio.onerror = () => {
				setPlayingVoice("");
				alert("Failed to play preview");
			};

			await audio.play();
		} catch (error) {
			setPlayingVoice("");
			alert("Failed to play preview");
		}
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="flex items-center gap-2">
							<Mic className="h-5 w-5" />
							Voice Library
						</CardTitle>
						<CardDescription>
							Browse and manage your available voices
						</CardDescription>
					</div>

					<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
						<DialogTrigger asChild>
							<Button className="flex items-center gap-2">
								<Plus className="h-4 w-4" />
								Generate Voice
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle className="flex items-center gap-2">
									<Wand2 className="h-5 w-5" />
									Generate Custom Voice
								</DialogTitle>
								<DialogDescription>
									Describe the voice you want to create and our AI will generate
									it for you.
								</DialogDescription>
							</DialogHeader>

							<div className="space-y-4">
								<div className="space-y-2">
									<label
										htmlFor="voice-description"
										className="text-sm font-medium text-foreground"
									>
										Voice Description
									</label>
									<Input
										id="voice-description"
										value={voiceDescription}
										onChange={(e) => setVoiceDescription(e.target.value)}
										placeholder="e.g., A warm, friendly female voice with a slight British accent"
										className="w-full"
									/>
								</div>

								<div className="flex items-center gap-3">
									<Button
										onClick={handleGenerateVoice}
										disabled={isGeneratingVoice || !voiceDescription.trim()}
										className="flex items-center gap-2"
									>
										{isGeneratingVoice ? (
											<Loader2 className="h-4 w-4 animate-spin" />
										) : (
											<Wand2 className="h-4 w-4" />
										)}
										Generate Voice
									</Button>

									<Button
										variant="outline"
										onClick={() => setIsDialogOpen(false)}
										disabled={isGeneratingVoice}
									>
										Cancel
									</Button>
								</div>
							</div>
						</DialogContent>
					</Dialog>
				</div>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{voices.length > 0 ? (
						voices.map((voice) => (
							<Card key={voice.voice_id} className="p-4">
								<div className="space-y-3">
									<div className="flex items-start justify-between">
										<div className="space-y-1">
											<h4 className="font-medium text-sm">{voice.name}</h4>
											<Badge variant="secondary" className="text-xs">
												{voice.category}
											</Badge>
										</div>

										{voice.preview_url && (
											<Button
												variant="outline"
												size="sm"
												onClick={() => handlePlayPreview(voice)}
												className="flex items-center gap-1"
											>
												<Play
													className={`h-3 w-3 ${playingVoice === voice.voice_id ? "text-green-600" : ""}`}
												/>
												{playingVoice === voice.voice_id
													? "Playing"
													: "Preview"}
											</Button>
										)}
									</div>

									{voice.description && (
										<p className="text-xs text-muted-foreground line-clamp-2">
											{voice.description}
										</p>
									)}

									<div className="text-xs text-muted-foreground">
										ID: {voice.voice_id.slice(0, 8)}...
									</div>
								</div>
							</Card>
						))
					) : (
						<div className="col-span-full text-center py-8">
							<Mic className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
							<p className="text-muted-foreground">No voices available</p>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
