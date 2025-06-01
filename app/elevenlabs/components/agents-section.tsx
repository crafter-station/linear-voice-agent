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
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
	Bot,
	Plus,
	Trash2,
	MessageCircle,
	Loader2,
	ExternalLink,
} from "lucide-react";
import { createAgent, deleteAgent, getConversations } from "../actions";

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

interface AgentsSectionProps {
	agents: Agent[];
	voices: Voice[];
}

export function AgentsSection({
	agents: initialAgents,
	voices,
}: AgentsSectionProps) {
	const [agents, setAgents] = useState<Agent[]>(initialAgents);
	const [isCreating, setIsCreating] = useState(false);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
	const [conversationsCount, setConversationsCount] = useState<
		Record<string, number>
	>({});

	// Form state
	const [formData, setFormData] = useState({
		name: "",
		first_message: "",
		system_prompt: "",
		voice_id: "",
	});

	const handleCreateAgent = async () => {
		if (!formData.name.trim() || !formData.voice_id) return;

		setIsCreating(true);
		try {
			const result = await createAgent({
				name: formData.name.trim(),
				first_message:
					formData.first_message.trim() || "Hello! How can I help you today?",
				system_prompt:
					formData.system_prompt.trim() || "You are a helpful AI assistant.",
				voice_id: formData.voice_id,
			});

			if (result.success) {
				setAgents((prev) => [...prev, result.agent]);
				setIsDialogOpen(false);
				setFormData({
					name: "",
					first_message: "",
					system_prompt: "",
					voice_id: "",
				});
			}
		} catch (error) {
			console.error("Agent creation error:", error);
			alert("Failed to create agent. Please try again.");
		} finally {
			setIsCreating(false);
		}
	};

	const handleDeleteAgent = async (agentId: string) => {
		if (
			!confirm(
				"Are you sure you want to delete this agent? This action cannot be undone.",
			)
		) {
			return;
		}

		try {
			await deleteAgent(agentId);
			setAgents((prev) => prev.filter((agent) => agent.agent_id !== agentId));
		} catch (error) {
			console.error("Agent deletion error:", error);
			alert("Failed to delete agent. Please try again.");
		}
	};

	const handleViewConversations = async (agent: Agent) => {
		try {
			const result = await getConversations(agent.agent_id);
			setConversationsCount((prev) => ({
				...prev,
				[agent.agent_id]: result.conversations.length,
			}));
			setSelectedAgent(agent);
			// You could open a modal here to show conversations
			alert(
				`Agent "${agent.name}" has ${result.conversations.length} conversations.`,
			);
		} catch (error) {
			console.error("Failed to fetch conversations:", error);
			alert("Failed to load conversations.");
		}
	};

	const getVoiceName = (voiceId: string) => {
		const voice = voices.find((v) => v.voice_id === voiceId);
		return voice?.name || "Unknown Voice";
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="flex items-center gap-2">
							<Bot className="h-5 w-5" />
							Conversational AI Agents
						</CardTitle>
						<CardDescription>
							Create and manage AI voice agents for customer support, sales, and
							more
						</CardDescription>
					</div>

					<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
						<DialogTrigger asChild>
							<Button className="flex items-center gap-2">
								<Plus className="h-4 w-4" />
								Create Agent
							</Button>
						</DialogTrigger>
						<DialogContent className="max-w-2xl">
							<DialogHeader>
								<DialogTitle className="flex items-center gap-2">
									<Bot className="h-5 w-5" />
									Create Conversational AI Agent
								</DialogTitle>
								<DialogDescription>
									Configure your AI agent's personality, voice, and behavior.
								</DialogDescription>
							</DialogHeader>

							<div className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<label
											htmlFor="agent-name"
											className="text-sm font-medium text-foreground"
										>
											Agent Name *
										</label>
										<Input
											id="agent-name"
											value={formData.name}
											onChange={(e) =>
												setFormData((prev) => ({
													...prev,
													name: e.target.value,
												}))
											}
											placeholder="Customer Support Agent"
										/>
									</div>

									<div className="space-y-2">
										<label
											htmlFor="agent-voice"
											className="text-sm font-medium text-foreground"
										>
											Voice *
										</label>
										<Select
											value={formData.voice_id}
											onValueChange={(value) =>
												setFormData((prev) => ({ ...prev, voice_id: value }))
											}
										>
											<SelectTrigger id="agent-voice">
												<SelectValue placeholder="Select a voice" />
											</SelectTrigger>
											<SelectContent>
												{voices.map((voice) => (
													<SelectItem
														key={voice.voice_id}
														value={voice.voice_id}
													>
														{voice.name} ({voice.category})
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								</div>

								<div className="space-y-2">
									<label
										htmlFor="first-message"
										className="text-sm font-medium text-foreground"
									>
										First Message
									</label>
									<Input
										id="first-message"
										value={formData.first_message}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												first_message: e.target.value,
											}))
										}
										placeholder="Hello! How can I help you today?"
									/>
								</div>

								<div className="space-y-2">
									<label
										htmlFor="system-prompt"
										className="text-sm font-medium text-foreground"
									>
										System Prompt
									</label>
									<Textarea
										id="system-prompt"
										value={formData.system_prompt}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												system_prompt: e.target.value,
											}))
										}
										placeholder="You are a helpful customer support agent. Be friendly, professional, and helpful..."
										className="min-h-[100px]"
									/>
								</div>

								<div className="flex items-center gap-3">
									<Button
										onClick={handleCreateAgent}
										disabled={
											isCreating || !formData.name.trim() || !formData.voice_id
										}
										className="flex items-center gap-2"
									>
										{isCreating ? (
											<Loader2 className="h-4 w-4 animate-spin" />
										) : (
											<Plus className="h-4 w-4" />
										)}
										Create Agent
									</Button>

									<Button
										variant="outline"
										onClick={() => setIsDialogOpen(false)}
										disabled={isCreating}
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
					{agents.length > 0 ? (
						agents.map((agent) => (
							<Card key={agent.agent_id} className="p-4">
								<div className="space-y-4">
									<div className="space-y-2">
										<div className="flex items-start justify-between">
											<h4 className="font-medium text-sm">{agent.name}</h4>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleDeleteAgent(agent.agent_id)}
												className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1"
											>
												<Trash2 className="h-3 w-3" />
											</Button>
										</div>

										<div className="space-y-1">
											<Badge variant="outline" className="text-xs">
												{getVoiceName(agent.voice_id)}
											</Badge>

											<p className="text-xs text-muted-foreground line-clamp-2">
												{agent.first_message}
											</p>
										</div>
									</div>

									<div className="flex items-center gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleViewConversations(agent)}
											className="flex items-center gap-1 text-xs"
										>
											<MessageCircle className="h-3 w-3" />
											Conversations
											{conversationsCount[agent.agent_id] !== undefined && (
												<span className="ml-1">
													({conversationsCount[agent.agent_id]})
												</span>
											)}
										</Button>

										<Button
											variant="outline"
											size="sm"
											asChild
											className="flex items-center gap-1 text-xs"
										>
											<a
												href={`https://elevenlabs.io/app/conversational-ai/agents/${agent.agent_id}`}
												target="_blank"
												rel="noopener noreferrer"
											>
												<ExternalLink className="h-3 w-3" />
												Open
											</a>
										</Button>
									</div>

									<div className="text-xs text-muted-foreground">
										Created: {new Date(agent.created_at).toLocaleDateString()}
									</div>
								</div>
							</Card>
						))
					) : (
						<div className="col-span-full text-center py-8">
							<Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
							<p className="text-muted-foreground">No agents created yet</p>
							<p className="text-xs text-muted-foreground mt-1">
								Create your first conversational AI agent to get started
							</p>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
