"use client";

import { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
	ChevronDownIcon,
	ChevronRightIcon,
	ExternalLinkIcon,
} from "lucide-react";
import { getTeamIssues } from "../actions";
import { CreateIssueDialog } from "./create-issue-dialog";

interface Team {
	id: string;
	name: string;
	description: string;
	createdAt: string;
}

interface Issue {
	id: string;
	title: string;
	description: string;
	url: string;
	createdAt: string;
	updatedAt: string;
	state: {
		name: string;
		color: string;
	};
}

interface TeamListProps {
	teams: Team[];
}

export function TeamList({ teams }: TeamListProps) {
	const [openTeams, setOpenTeams] = useState<Set<string>>(new Set());
	const [teamIssues, setTeamIssues] = useState<Record<string, Issue[]>>({});
	const [loadingTeams, setLoadingTeams] = useState<Set<string>>(new Set());

	const fetchTeamIssues = async (teamId: string) => {
		setLoadingTeams(new Set([...loadingTeams, teamId]));
		try {
			const issues = await getTeamIssues(teamId);
			setTeamIssues((prev) => ({ ...prev, [teamId]: issues }));
		} catch (error) {
			console.error("Failed to fetch team issues:", error);
			setTeamIssues((prev) => ({ ...prev, [teamId]: [] }));
		} finally {
			setLoadingTeams((prev) => {
				const newSet = new Set(prev);
				newSet.delete(teamId);
				return newSet;
			});
		}
	};

	const toggleTeam = async (teamId: string) => {
		const newOpenTeams = new Set(openTeams);

		if (openTeams.has(teamId)) {
			newOpenTeams.delete(teamId);
		} else {
			newOpenTeams.add(teamId);

			// Fetch issues if not already loaded
			if (!teamIssues[teamId]) {
				await fetchTeamIssues(teamId);
			}
		}

		setOpenTeams(newOpenTeams);
	};

	const handleIssueCreated = async (teamId: string) => {
		// Refresh the issues for this team
		await fetchTeamIssues(teamId);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
		});
	};

	return (
		<div className="space-y-4">
			{teams.map((team) => {
				const isOpen = openTeams.has(team.id);
				const isLoading = loadingTeams.has(team.id);
				const issues = teamIssues[team.id] || [];

				return (
					<Card key={team.id} className="w-full">
						<Collapsible open={isOpen} onOpenChange={() => toggleTeam(team.id)}>
							<CollapsibleTrigger asChild>
								<CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											{isOpen ? (
												<ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
											) : (
												<ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
											)}
											<div>
												<CardTitle className="text-lg">{team.name}</CardTitle>
												<CardDescription className="text-sm">
													{team.description}
												</CardDescription>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<Badge variant="secondary" className="text-xs">
												{formatDate(team.createdAt)}
											</Badge>
											<div
												onClick={(e) => e.stopPropagation()}
												onMouseDown={(e) => e.stopPropagation()}
												onKeyDown={(e) => e.stopPropagation()}
											>
												<CreateIssueDialog
													teamId={team.id}
													teamName={team.name}
													onIssueCreated={() => handleIssueCreated(team.id)}
												/>
											</div>
										</div>
									</div>
								</CardHeader>
							</CollapsibleTrigger>

							<CollapsibleContent>
								<CardContent className="pt-0">
									<div className="border-t border-border pt-4">
										<h4 className="text-sm font-medium text-muted-foreground mb-3">
											Recent Issues
										</h4>

										{isLoading ? (
											<div className="space-y-2">
												{[1, 2, 3].map((item) => (
													<div
														key={`skeleton-${team.id}-${item}`}
														className="flex items-center space-x-3"
													>
														<Skeleton className="h-2 w-2 rounded-full" />
														<Skeleton className="h-4 flex-1" />
														<Skeleton className="h-4 w-16" />
													</div>
												))}
											</div>
										) : issues.length > 0 ? (
											<div className="space-y-3">
												{issues.map((issue) => (
													<div
														key={issue.id}
														className="flex items-center justify-between group hover:bg-muted/20 -mx-2 px-2 py-1 rounded"
													>
														<div className="flex items-center gap-3 flex-1 min-w-0">
															<div
																className="w-2 h-2 rounded-full flex-shrink-0"
																style={{ backgroundColor: issue.state.color }}
															/>
															<div className="flex-1 min-w-0">
																<p className="text-sm font-medium text-foreground truncate">
																	{issue.title}
																</p>
																<p className="text-xs text-muted-foreground">
																	{issue.state.name} •{" "}
																	{formatDate(issue.updatedAt)}
																</p>
															</div>
														</div>
														<Button
															variant="ghost"
															size="sm"
															className="opacity-0 group-hover:opacity-100 transition-opacity"
															asChild
														>
															<a
																href={issue.url}
																target="_blank"
																rel="noopener noreferrer"
																className="flex items-center gap-1"
															>
																<ExternalLinkIcon className="h-3 w-3" />
															</a>
														</Button>
													</div>
												))}
											</div>
										) : (
											<p className="text-sm text-muted-foreground">
												No recent issues
											</p>
										)}
									</div>
								</CardContent>
							</CollapsibleContent>
						</Collapsible>
					</Card>
				);
			})}
		</div>
	);
}
