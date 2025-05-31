import { UserButton } from "@clerk/nextjs";
import { TeamList } from "../components/team-list";
import { getLinearData } from "../actions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Team {
	id: string;
	name: string;
	description: string;
	createdAt: string;
}

export default async function TeamPage() {
	let teams: Team[] = [];
	let error: string | null = null;

	try {
		const data = await getLinearData();
		teams = data.teams;
	} catch (err) {
		error = err instanceof Error ? err.message : "Failed to load teams";
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
								LV
							</span>
						</div>
						<span className="text-foreground font-medium text-sm">Teams</span>
					</div>

					<UserButton />
				</div>
			</header>

			{/* Main Content */}
			<main className="flex flex-1 flex-col max-w-4xl mx-auto w-full px-6 py-8">
				<div className="mb-8">
					<h1 className="text-2xl font-medium text-foreground mb-2">
						Your Teams
					</h1>
					<p className="text-sm text-muted-foreground">
						Manage your Linear teams and view recent issues
					</p>
				</div>

				{error ? (
					<div className="flex-1 flex items-center justify-center">
						<div className="text-center space-y-4">
							<h2 className="text-lg font-medium text-foreground">
								Unable to load teams
							</h2>
							<p className="text-sm text-muted-foreground max-w-md">
								{error}. Make sure you've connected your Linear account.
							</p>
							<button
								type="button"
								className="bg-foreground text-background hover:bg-foreground/90 px-4 py-2 rounded-md text-sm font-medium transition-colors"
								onClick={() => window.location.reload()}
							>
								Try again
							</button>
						</div>
					</div>
				) : teams.length > 0 ? (
					<TeamList teams={teams} />
				) : (
					<div className="flex-1 flex items-center justify-center">
						<div className="text-center space-y-4">
							<h2 className="text-lg font-medium text-foreground">
								No teams found
							</h2>
							<p className="text-sm text-muted-foreground">
								You don't have access to any Linear teams yet.
							</p>
						</div>
					</div>
				)}
			</main>
		</div>
	);
}
