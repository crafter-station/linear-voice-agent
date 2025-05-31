"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2 } from "lucide-react";
import { createIssue } from "../actions";

interface CreateIssueDialogProps {
	teamId: string;
	teamName: string;
	onIssueCreated?: () => void;
}

export function CreateIssueDialog({
	teamId,
	teamName,
	onIssueCreated,
}: CreateIssueDialogProps) {
	const [open, setOpen] = useState(false);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [isCreating, setIsCreating] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim()) return;

		setIsCreating(true);
		try {
			await createIssue(teamId, title.trim(), description.trim() || undefined);
			setTitle("");
			setDescription("");
			setOpen(false);
			onIssueCreated?.();
		} catch (error) {
			console.error("Failed to create issue:", error);
			// You could add a toast notification here
		} finally {
			setIsCreating(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm" className="h-8 gap-2">
					<Plus className="h-3 w-3" />
					Create Issue
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>Create Issue</DialogTitle>
						<DialogDescription>
							Create a new issue in {teamName}
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="title">Title</Label>
							<Input
								id="title"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder="Enter issue title..."
								disabled={isCreating}
								autoFocus
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="description">Description (optional)</Label>
							<Textarea
								id="description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="Describe the issue..."
								disabled={isCreating}
								rows={3}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
							disabled={isCreating}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={!title.trim() || isCreating}
							className="gap-2"
						>
							{isCreating && <Loader2 className="h-4 w-4 animate-spin" />}
							Create Issue
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
