import { ThemeProvider } from "next-themes";

export const shadcnAppearance = {
	elements: {
		headerTitle: "!text-foreground !text-lg",
		formButtonPrimary:
			"!bg-primary !border-border !text-primary-foreground hover:!bg-primary/90",
		card: "!bg-card !text-card-foreground !shadow-sm",
		socialButtonsBlockButton:
			"!bg-muted !border !border-foreground/10 !text-muted-foreground hover:!bg-foreground/10",
		socialButtonsIconButton:
			"!border !border-input !bg-background hover:!bg-accent hover:!text-accent-foreground",
		formButtonReset: "!text-muted-foreground hover:!text-foreground",
		formFieldInput:
			"!text-foreground !border !border-input !bg-muted focus-visible:!bg-background !placeholder-muted-foreground focus-visible:!ring-offset-0 focus-visible:!ring-0 focus-visible:!ring-transparent",
		formFieldLabel: "!text-foreground !text-sm",
		formFieldAction: "!text-muted-foreground !text-sm",
		dividerText: "!text-muted-foreground !text-sm",
		dividerLine: "!bg-border",
		socialButtonsBlockButtonText: "!text-muted-foreground",
		userPreviewMainIdentifier: "!text-foreground !font-medium",
		userPreviewSecondaryIdentifier: "!text-muted-foreground !text-sm",
		socialButtonsProviderIcon__github: "dark:invert",
		userButtonAvatarBox: "h-5 w-5",
		userButtonAvatarImage: "h-5 w-5",
		userButtonBox: "!text-foreground !flex-row-reverse !gap-2 items-center",
		userButtonOuterIdentifier:
			"text-sm font-medium truncate group-data-[collapsible=icon]:!hidden",
		userButtonPopoverMain: "!bg-card !text-card-foreground",
		userButtonPopoverCard: "!bg-card !text-card-foreground",
		userButtonPopoverActionButton:
			"!bg-muted border-t !border-input !text-muted-foreground hover:!bg-foreground/10",
		userButtonPopoverActions: "!border-t !border-input",
	},
};

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
			{children}
		</ThemeProvider>
	);
}
