"use client";

export function ErrorRetryButton() {
	const handleRetry = () => {
		window.location.reload();
	};

	return (
		<button
			type="button"
			className="bg-foreground text-background hover:bg-foreground/90 px-4 py-2 rounded-md text-sm font-medium transition-colors"
			onClick={handleRetry}
		>
			Try again
		</button>
	);
}
