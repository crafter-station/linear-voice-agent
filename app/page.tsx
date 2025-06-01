import { UserButton } from "@clerk/nextjs";
import AudioReactiveBall from "./components/audio-reactive-ball";
import Link from "next/link";
import { Users, Mic } from "lucide-react";

export default function Home() {
	return (
		<div className="min-h-[100dvh] bg-background relative">
			{/* Header */}
			<header className="absolute top-0 left-0 right-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur-sm">
				<div className="flex items-center justify-between px-6 py-3">
					<div className="flex items-center gap-4">
						<div className="w-6 h-6 bg-foreground rounded flex items-center justify-center">
							<span className="text-background font-medium text-[10px]">
								VA
							</span>
						</div>
						<span className="text-foreground font-medium text-sm">
							Voice Assistant
						</span>
						<Link
							href="/team"
							className="text-muted-foreground hover:text-foreground transition-colors text-sm ml-4"
						>
							Teams
						</Link>
						<Link
							href="/elevenlabs"
							className="text-muted-foreground hover:text-foreground transition-colors text-sm"
						>
							ElevenLabs
						</Link>
					</div>

					<div className="flex items-center gap-3">
						<UserButton />
					</div>
				</div>
			</header>

			{/* Audio Reactive Ball */}
			<AudioReactiveBall />

			{/* Overlay Content */}
			<div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
				<div className="text-center space-y-6">
					<div className="space-y-2">
						<h1 className="text-3xl font-medium text-foreground/90">
							Voice-powered Linear workflow
						</h1>
						<p className="text-muted-foreground text-lg max-w-lg mx-auto">
							Speak naturally to create issues, update statuses, and manage your
							projects
						</p>
					</div>

					<div className="pointer-events-auto">
						<button
							type="button"
							className="bg-muted/20 backdrop-blur-sm text-foreground hover:bg-muted/30 border border-border/40 px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-3 mx-auto"
						>
							<Mic className="h-5 w-5" />
							Start listening
						</button>
					</div>

					<div className="text-muted-foreground/70 text-xs pointer-events-auto">
						<Link
							href="/team"
							className="hover:text-muted-foreground transition-colors underline"
						>
							Or manage your teams manually
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
