"use client";

import { useEffect, useRef } from "react";
import { useThemeColors } from "@/hooks/useThemeColors";

export default function Component() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const asciiRef = useRef<HTMLDivElement>(null);
	const animationRef = useRef<number>(0);
	const audioContextRef = useRef<AudioContext>(null);
	const analyserRef = useRef<AnalyserNode>(null);
	const dataArrayRef = useRef<Uint8Array>(null);
	const sourceRef = useRef<MediaStreamAudioSourceNode>(null);
	const streamRef = useRef<MediaStream>(null);

	// Get theme colors efficiently
	const { bg, fg } = useThemeColors();

	// ASCII characters from darkest to lightest
	const asciiChars = " .:-=+*#%@";

	// Ball properties
	const ballRef = useRef({
		x: 0,
		y: 0,
		baseRadius: 100,
		currentRadius: 100,
		targetRadius: 100,
		hue: 200,
		targetHue: 200,
		particles: [] as Array<{
			x: number;
			y: number;
			vx: number;
			vy: number;
			life: number;
			maxLife: number;
			size: number;
		}>,
	});

	const addParticles = (intensity: number, canvas: HTMLCanvasElement) => {
		const ball = ballRef.current;
		const particleCount = Math.floor(intensity * 5);

		for (let i = 0; i < particleCount; i++) {
			const angle = Math.random() * Math.PI * 2;
			const speed = 2 + Math.random() * 4;
			ball.particles.push({
				x: ball.x + Math.cos(angle) * ball.currentRadius,
				y: ball.y + Math.sin(angle) * ball.currentRadius,
				vx: Math.cos(angle) * speed,
				vy: Math.sin(angle) * speed,
				life: 60,
				maxLife: 60,
				size: 2 + Math.random() * 3,
			});
		}

		if (ball.particles.length > 200) {
			ball.particles.splice(0, ball.particles.length - 200);
		}
	};

	const convertToAscii = () => {
		const canvas = canvasRef.current;
		const asciiDiv = asciiRef.current;
		if (!canvas || !asciiDiv) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		// Check if canvas has valid dimensions
		if (canvas.width <= 0 || canvas.height <= 0) return;

		// ASCII grid dimensions - adjusted for better aspect ratio
		const charWidth = 3;
		const charHeight = 6;
		const cols = Math.floor(canvas.width / charWidth);
		const rows = Math.floor(canvas.height / charHeight);

		// Ensure we have valid grid dimensions
		if (cols <= 0 || rows <= 0) return;

		// Get image data with error handling
		let imageData: ImageData;
		try {
			imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		} catch (error) {
			console.warn("Failed to get image data:", error);
			return;
		}

		const pixels = imageData.data;

		let asciiString = "";

		for (let y = 0; y < rows; y++) {
			for (let x = 0; x < cols; x++) {
				// Sample pixel from the center of each character cell
				const pixelX = Math.floor(x * charWidth + charWidth / 2);
				const pixelY = Math.floor(y * charHeight + charHeight / 2);

				// Ensure pixel coordinates are within bounds
				if (pixelX >= canvas.width || pixelY >= canvas.height) {
					asciiString += " ";
					continue;
				}

				const pixelIndex = (pixelY * canvas.width + pixelX) * 4;

				// Ensure pixel index is within bounds
				if (pixelIndex >= pixels.length) {
					asciiString += " ";
					continue;
				}

				// Calculate brightness (0-255)
				const r = pixels[pixelIndex] || 0;
				const g = pixels[pixelIndex + 1] || 0;
				const b = pixels[pixelIndex + 2] || 0;
				const brightness = (r + g + b) / 3;

				// Map brightness to ASCII character
				const charIndex = Math.floor(
					(brightness / 255) * (asciiChars.length - 1),
				);
				asciiString += asciiChars[charIndex];
			}
			asciiString += "\n";
		}

		// Update ASCII display
		asciiDiv.textContent = asciiString;
	};

	const animate = () => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		// Check if canvas has valid dimensions before proceeding
		if (canvas.width <= 0 || canvas.height <= 0) {
			animationRef.current = requestAnimationFrame(animate);
			return;
		}

		const ball = ballRef.current;

		// Clear canvas with theme background
		ctx.fillStyle = bg || "oklch(0.145 0 0)";
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		// Analyze audio if available
		let volume = 0;
		let dominantFreq = 0;

		if (analyserRef.current && dataArrayRef.current) {
			analyserRef.current.getByteFrequencyData(dataArrayRef.current);

			const sum = dataArrayRef.current.reduce((a, b) => a + b, 0);

			let rawNormalizedVolume = sum / dataArrayRef.current.length / 255;
			rawNormalizedVolume = Number.isNaN(rawNormalizedVolume)
				? 0
				: Math.max(0, rawNormalizedVolume);

			volume = rawNormalizedVolume ** 0.6;
			volume = Math.min(1, volume);

			let maxAmplitude = 0;
			let maxIndex = 0;
			for (let i = 0; i < dataArrayRef.current.length; i++) {
				if (dataArrayRef.current[i] > maxAmplitude) {
					maxAmplitude = dataArrayRef.current[i];
					maxIndex = i;
				}
			}
			dominantFreq = maxIndex / dataArrayRef.current.length;

			ball.targetRadius = ball.baseRadius * (0.4 + volume * 1.8);
			ball.targetHue = 200 + dominantFreq * 160;

			const particleActivationThreshold = 0.07;
			if (volume > particleActivationThreshold) {
				addParticles(volume, canvas);
			}
		} else {
			// Add subtle animation when no audio is available
			const time = Date.now() / 1000;
			const pulseFactor = Math.sin(time) * 0.1 + 0.9;
			ball.targetRadius = ball.baseRadius * pulseFactor;
		}

		// Smooth transitions
		ball.currentRadius += (ball.targetRadius - ball.currentRadius) * 0.2;
		ball.hue += (ball.targetHue - ball.hue) * 0.1;

		// Update ball position
		ball.x = canvas.width / 2;
		ball.y = canvas.height / 2;

		// Draw ball with theme-aware gradient maintaining original contrast ratios
		const gradient = ctx.createRadialGradient(
			ball.x,
			ball.y,
			0,
			ball.x,
			ball.y,
			ball.currentRadius,
		);

		// Use foreground color with same opacity ratios as original
		const fgColor = fg || "oklch(0.985 0 0)";
		gradient.addColorStop(0, fgColor.replace(")", " / 1)"));
		gradient.addColorStop(0.7, fgColor.replace(")", " / 0.8)"));
		gradient.addColorStop(1, fgColor.replace(")", " / 0.2)"));

		// Enhanced glow for better ASCII visibility
		ctx.shadowColor = fgColor.replace(")", " / 0.8)");
		ctx.shadowBlur = 30;
		ctx.fillStyle = gradient;
		ctx.beginPath();
		ctx.arc(ball.x, ball.y, ball.currentRadius, 0, Math.PI * 2);
		ctx.fill();

		// Brighter inner core
		ctx.shadowBlur = 0;
		const coreGradient = ctx.createRadialGradient(
			ball.x,
			ball.y,
			0,
			ball.x,
			ball.y,
			ball.currentRadius * 0.3,
		);
		coreGradient.addColorStop(0, fgColor.replace(")", " / 1)"));
		coreGradient.addColorStop(1, fgColor.replace(")", " / 0.3)"));

		ctx.fillStyle = coreGradient;
		ctx.beginPath();
		ctx.arc(ball.x, ball.y, ball.currentRadius * 0.3, 0, Math.PI * 2);
		ctx.fill();

		// Draw particles with theme colors
		ball.particles.forEach((particle, index) => {
			particle.x += particle.vx;
			particle.y += particle.vy;
			particle.life--;

			const alpha = particle.life / particle.maxLife;
			ctx.fillStyle = fgColor.replace(")", ` / ${alpha * 0.86})`); // 0.86 ≈ 220/255 from original
			ctx.shadowColor = fgColor.replace(")", ` / ${alpha})`);
			ctx.shadowBlur = 8;
			ctx.beginPath();
			ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
			ctx.fill();

			if (particle.life <= 0) {
				ball.particles.splice(index, 1);
			}
		});

		// Draw enhanced frequency bars with theme colors
		if (analyserRef.current && dataArrayRef.current) {
			const barCount = 32;
			const angleStep = (Math.PI * 2) / barCount;

			for (let i = 0; i < barCount; i++) {
				const angle = i * angleStep;

				// Get amplitude with boost
				let amplitude = dataArrayRef.current[i * 4] / 255;
				amplitude = Math.min(1, amplitude * 3);

				const barLength = amplitude * 60;

				const startX = ball.x + Math.cos(angle) * (ball.currentRadius + 10);
				const startY = ball.y + Math.sin(angle) * (ball.currentRadius + 10);
				const endX =
					ball.x + Math.cos(angle) * (ball.currentRadius + 10 + barLength);
				const endY =
					ball.y + Math.sin(angle) * (ball.currentRadius + 10 + barLength);

				// Use theme color with amplitude-based opacity (maintaining original intensity ratios)
				ctx.strokeStyle = fgColor.replace(")", ` / ${amplitude * 1.5})`);
				ctx.lineWidth = 3;
				ctx.shadowColor = fgColor.replace(")", ` / ${amplitude})`);
				ctx.shadowBlur = 4;
				ctx.beginPath();
				ctx.moveTo(startX, startY);
				ctx.lineTo(endX, endY);
				ctx.stroke();
			}
		}

		ctx.shadowBlur = 0;

		// Convert to ASCII
		convertToAscii();

		animationRef.current = requestAnimationFrame(animate);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const resizeCanvas = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		};

		resizeCanvas();
		window.addEventListener("resize", resizeCanvas);

		const initAudio = async () => {
			try {
				const constraints = {
					audio: {
						echoCancellation: false,
						noiseSuppression: false,
						autoGainControl: false,
						sampleRate: 48000,
						channelCount: 1,
						volume: 1.0,
					},
				};

				const stream = await navigator.mediaDevices.getUserMedia(constraints);
				streamRef.current = stream;

				const audioContext = new (
					window.AudioContext ||
					(window as unknown as { webkitAudioContext: AudioContext })
						.webkitAudioContext
				)({
					sampleRate: 48000,
				});

				const analyser = audioContext.createAnalyser();
				const source = audioContext.createMediaStreamSource(stream);

				analyser.fftSize = 256;
				analyser.smoothingTimeConstant = 0.5;

				const gainNode = audioContext.createGain();
				gainNode.gain.value = 3.0;
				source.connect(gainNode);
				gainNode.connect(analyser);

				audioContextRef.current = audioContext;
				analyserRef.current = analyser;
				sourceRef.current = source;
				dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

				console.log("Audio initialized with high sensitivity for all devices");
			} catch (err) {
				console.error("Error accessing microphone:", err);
			}
		};

		initAudio();

		setTimeout(() => {
			animate();
		}, 100);

		return () => {
			window.removeEventListener("resize", resizeCanvas);
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current);
			}
			if (streamRef.current) {
				for (const track of streamRef.current.getTracks()) {
					track.stop();
				}
			}
			if (audioContextRef.current) {
				audioContextRef.current.close();
			}
		};
	}, []);

	return (
		<div className="fixed inset-0 bg-background">
			<canvas ref={canvasRef} className="w-full h-full opacity-0" />
			<div
				ref={asciiRef}
				className="fixed inset-0 font-mono text-foreground whitespace-pre overflow-hidden pointer-events-none flex items-center justify-center"
				style={{
					fontSize: "5px",
					lineHeight: "5px",
					letterSpacing: "-0.5px",
				}}
			/>
		</div>
	);
}
