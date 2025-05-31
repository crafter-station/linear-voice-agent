import { UserButton } from "@clerk/nextjs";

export default function Home() {
	return (
		<div className="min-h-[100dvh] bg-background flex flex-col">
			{/* Header */}
			<header className="border-b border-border/60">
				<div className="flex items-center justify-between px-6 py-3">
					<div className="flex items-center gap-4">
						<div className="w-6 h-6 bg-foreground rounded flex items-center justify-center">
							<span className="text-background font-medium text-[10px]">
								LV
							</span>
						</div>
						<span className="text-foreground font-medium text-sm">
							Linear Voice Assistant
						</span>
					</div>

					<UserButton />
				</div>
			</header>

			{/* Main Content */}
			<main className="flex flex-1 items-center justify-center">
				<div className="text-center space-y-4 max-w-md">
					<h1 className="text-xl font-medium text-foreground">
						Voice-powered Linear workflow
					</h1>
					<p className="text-sm text-muted-foreground leading-relaxed">
						Create issues, update statuses, and manage projects using natural
						voice commands.
					</p>

					<div className="pt-6">
						<button
							type="button"
							className="bg-foreground text-background hover:bg-foreground/90 px-4 py-2 rounded-md text-sm font-medium transition-colors"
						>
							Start voice session
						</button>
					</div>
				</div>
			</main>
		</div>
	);
}
