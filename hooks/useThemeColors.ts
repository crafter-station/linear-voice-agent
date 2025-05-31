import { useEffect, useState, useCallback } from "react";
import { useTheme } from "next-themes";

export const useThemeColors = () => {
	const { theme, resolvedTheme, systemTheme } = useTheme();

	const [colors, set] = useState(() => {
		// Check if we're in the browser
		if (typeof window === "undefined" || typeof document === "undefined") {
			// Return fallback values for SSR - default to dark
			return {
				bg: "oklch(0.145 0 0)",
				fg: "oklch(0.985 0 0)",
			};
		}

		const s = getComputedStyle(document.documentElement);
		return {
			bg: s.getPropertyValue("--background").trim(),
			fg: s.getPropertyValue("--foreground").trim(),
		};
	});

	const [mounted, setMounted] = useState(false);

	// Handle initial mount
	useEffect(() => {
		setMounted(true);
	}, []);

	// Memoized color update function
	const updateColors = useCallback(() => {
		if (typeof window === "undefined" || typeof document === "undefined") {
			return;
		}

		const s = getComputedStyle(document.documentElement);
		const newColors = {
			bg: s.getPropertyValue("--background").trim(),
			fg: s.getPropertyValue("--foreground").trim(),
		};

		set((prevColors) => {
			// Only update if colors actually changed
			if (prevColors.bg !== newColors.bg || prevColors.fg !== newColors.fg) {
				return newColors;
			}
			return prevColors;
		});
	}, []);

	// Update colors when theme actually changes
	useEffect(() => {
		if (!mounted) return;

		// Update immediately when theme changes
		updateColors();

		// Also listen for CSS changes (backup)
		const observer = new MutationObserver(updateColors);
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class", "data-theme", "style"],
		});

		return () => observer.disconnect();
	}, [mounted, updateColors]);

	// Handle system theme changes
	useEffect(() => {
		if (!mounted || theme !== "system") return;

		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const handleSystemChange = () => {
			// Small delay to ensure CSS has updated
			setTimeout(() => {
				const s = getComputedStyle(document.documentElement);
				set({
					bg: s.getPropertyValue("--background").trim(),
					fg: s.getPropertyValue("--foreground").trim(),
				});
			}, 50);
		};

		mediaQuery.addEventListener("change", handleSystemChange);
		return () => mediaQuery.removeEventListener("change", handleSystemChange);
	}, [mounted, theme]);

	if (!mounted) {
		// Return SSR-safe defaults
		return {
			bg: "oklch(0.145 0 0)",
			fg: "oklch(0.985 0 0)",
			theme,
			resolvedTheme,
			systemTheme,
			isSystemTheme: theme === "system",
			mounted: false,
		};
	}

	return {
		...colors,
		theme,
		resolvedTheme,
		systemTheme,
		isSystemTheme: theme === "system",
		mounted: true,
	};
};
