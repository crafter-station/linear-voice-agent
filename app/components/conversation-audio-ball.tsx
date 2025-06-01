"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { useThemeColors } from "@/hooks/useThemeColors";

interface ConversationAudioBallProps {
	isActive?: boolean;
	className?: string;
}

export interface ConversationAudioBallRef {
	connectAudioStream: (stream: MediaStream) => void;
	disconnectAudio: () => void;
}

const ConversationAudioBall = forwardRef<
	ConversationAudioBallRef,
	ConversationAudioBallProps
>(({ isActive = false, className = "" }, ref) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const asciiRef = useRef<HTMLDivElement>(null);
	const animationRef = useRef<number>(0);
	const audioContextRef = useRef<AudioContext | null>(null);
	const analyserRef = useRef<AnalyserNode | null>(null);
	const dataArrayRef = useRef<Uint8Array | null>(null);
	const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
	const streamRef = useRef<MediaStream | null>(null);

	// Get theme colors efficiently
	const { bg, fg } = useThemeColors();

	// ASCII characters from darkest to lightest
	const asciiChars = " .:-=+*#%@";

	// Ball properties
	const ballRef = useRef({
		x: 0,
		y: 0,
		baseRadius: 120,
		currentRadius: 120,
		targetRadius: 120,
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

	// Expose methods to parent component
	useImperativeHandle(ref, () => ({
		connectAudioStream: (stream: MediaStream) => {
			try {
				// Store the stream reference
				streamRef.current = stream;

				// Initialize audio context if not already done
				if (!audioContextRef.current) {
					const audioContext = new (
						window.AudioContext ||
						// biome-ignore lint/suspicious/noExplicitAny: Browser compatibility
						(window as any).webkitAudioContext
					)({
						sampleRate: 48000,
					});
					audioContextRef.current = audioContext;
				}

				// Create analyser
				const analyser = audioContextRef.current.createAnalyser();
				analyser.fftSize = 256;
				analyser.smoothingTimeConstant = 0.6;

				// Create source from stream
				const source = audioContextRef.current.createMediaStreamSource(stream);

				// Add gain for better sensitivity
				const gainNode = audioContextRef.current.createGain();
				gainNode.gain.value = 2.5;

				source.connect(gainNode);
				gainNode.connect(analyser);

				analyserRef.current = analyser;
				sourceRef.current = source;
				dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

				console.log("Audio stream connected to conversation ball");
			} catch (error) {
				console.error("Failed to connect audio stream:", error);
			}
		},

		disconnectAudio: () => {
			if (sourceRef.current) {
				sourceRef.current.disconnect();
				sourceRef.current = null;
			}
			if (audioContextRef.current) {
				audioContextRef.current.close();
				audioContextRef.current = null;
			}
			analyserRef.current = null;
			dataArrayRef.current = null;
			streamRef.current = null;
			console.log("Audio disconnected from conversation ball");
		},
	}));

	const addParticles = (intensity: number, canvas: HTMLCanvasElement) => {
		const ball = ballRef.current;
		const particleCount = Math.floor(intensity * 8);

		for (let i = 0; i < particleCount; i++) {
			const angle = Math.random() * Math.PI * 2;
			const speed = 3 + Math.random() * 6;
			ball.particles.push({
				x: ball.x + Math.cos(angle) * ball.currentRadius,
				y: ball.y + Math.sin(angle) * ball.currentRadius,
				vx: Math.cos(angle) * speed,
				vy: Math.sin(angle) * speed,
				life: 80,
				maxLife: 80,
				size: 2 + Math.random() * 4,
			});
		}

		if (ball.particles.length > 300) {
			ball.particles.splice(0, ball.particles.length - 300);
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

		// ASCII grid dimensions
		const charWidth = 3;
		const charHeight = 6;
		const cols = Math.floor(canvas.width / charWidth);
		const rows = Math.floor(canvas.height / charHeight);

		if (cols <= 0 || rows <= 0) return;

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
				const pixelX = Math.floor(x * charWidth + charWidth / 2);
				const pixelY = Math.floor(y * charHeight + charHeight / 2);

				if (pixelX >= canvas.width || pixelY >= canvas.height) {
					asciiString += " ";
					continue;
				}

				const pixelIndex = (pixelY * canvas.width + pixelX) * 4;

				if (pixelIndex >= pixels.length) {
					asciiString += " ";
					continue;
				}

				const r = pixels[pixelIndex] || 0;
				const g = pixels[pixelIndex + 1] || 0;
				const b = pixels[pixelIndex + 2] || 0;
				const brightness = (r + g + b) / 3;

				const charIndex = Math.floor(
					(brightness / 255) * (asciiChars.length - 1),
				);
				asciiString += asciiChars[charIndex];
			}
			asciiString += "\n";
		}

		asciiDiv.textContent = asciiString;
	};

	const animate = () => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		if (canvas.width <= 0 || canvas.height <= 0) {
			animationRef.current = requestAnimationFrame(animate);
			return;
		}

		const ball = ballRef.current;

		// Clear canvas with theme background
		ctx.fillStyle = bg || "oklch(0.145 0 0)";
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		// Analyze audio if available and active
		let volume = 0;
		let dominantFreq = 0;

		if (isActive && analyserRef.current && dataArrayRef.current) {
			analyserRef.current.getByteFrequencyData(dataArrayRef.current);

			const sum = dataArrayRef.current.reduce((a, b) => a + b, 0);
			let rawNormalizedVolume = sum / dataArrayRef.current.length / 255;
			rawNormalizedVolume = Number.isNaN(rawNormalizedVolume)
				? 0
				: Math.max(0, rawNormalizedVolume);

			volume = rawNormalizedVolume ** 0.5;
			volume = Math.min(1, volume * 1.5); // Boost sensitivity

			let maxAmplitude = 0;
			let maxIndex = 0;
			for (let i = 0; i < dataArrayRef.current.length; i++) {
				if (dataArrayRef.current[i] > maxAmplitude) {
					maxAmplitude = dataArrayRef.current[i];
					maxIndex = i;
				}
			}
			dominantFreq = maxIndex / dataArrayRef.current.length;

			ball.targetRadius = ball.baseRadius * (0.3 + volume * 2.2);
			ball.targetHue = 180 + dominantFreq * 180;

			const particleActivationThreshold = 0.05;
			if (volume > particleActivationThreshold) {
				addParticles(volume, canvas);
			}
		} else {
			// Gentle pulse when inactive
			const time = Date.now() / 2000;
			const pulseFactor = Math.sin(time) * 0.15 + 0.85;
			ball.targetRadius = ball.baseRadius * pulseFactor;
			ball.targetHue = 200;
		}

		// Smooth transitions
		ball.currentRadius += (ball.targetRadius - ball.currentRadius) * 0.15;
		ball.hue += (ball.targetHue - ball.hue) * 0.08;

		// Update ball position
		ball.x = canvas.width / 2;
		ball.y = canvas.height / 2;

		// Draw ball with enhanced glow
		const fgColor = fg || "oklch(0.985 0 0)";

		// Outer glow
		ctx.shadowColor = fgColor.replace(")", " / 0.6)");
		ctx.shadowBlur = 40;

		const gradient = ctx.createRadialGradient(
			ball.x,
			ball.y,
			0,
			ball.x,
			ball.y,
			ball.currentRadius,
		);

		gradient.addColorStop(0, fgColor.replace(")", " / 1)"));
		gradient.addColorStop(0.6, fgColor.replace(")", " / 0.7)"));
		gradient.addColorStop(1, fgColor.replace(")", " / 0.1)"));

		ctx.fillStyle = gradient;
		ctx.beginPath();
		ctx.arc(ball.x, ball.y, ball.currentRadius, 0, Math.PI * 2);
		ctx.fill();

		// Inner core
		ctx.shadowBlur = 0;
		const coreGradient = ctx.createRadialGradient(
			ball.x,
			ball.y,
			0,
			ball.x,
			ball.y,
			ball.currentRadius * 0.4,
		);
		coreGradient.addColorStop(0, fgColor.replace(")", " / 1)"));
		coreGradient.addColorStop(1, fgColor.replace(")", " / 0.2)"));

		ctx.fillStyle = coreGradient;
		ctx.beginPath();
		ctx.arc(ball.x, ball.y, ball.currentRadius * 0.4, 0, Math.PI * 2);
		ctx.fill();

		// Draw particles
		ball.particles.forEach((particle, index) => {
			particle.x += particle.vx;
			particle.y += particle.vy;
			particle.life--;

			const alpha = particle.life / particle.maxLife;
			ctx.fillStyle = fgColor.replace(")", ` / ${alpha * 0.8})`);
			ctx.shadowColor = fgColor.replace(")", ` / ${alpha * 0.6})`);
			ctx.shadowBlur = 6;
			ctx.beginPath();
			ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
			ctx.fill();

			if (particle.life <= 0) {
				ball.particles.splice(index, 1);
			}
		});

		// Draw frequency bars if audio is active
		if (isActive && analyserRef.current && dataArrayRef.current) {
			const barCount = 24;
			const angleStep = (Math.PI * 2) / barCount;

			for (let i = 0; i < barCount; i++) {
				const angle = i * angleStep;
				let amplitude = dataArrayRef.current[i * 5] / 255;
				amplitude = Math.min(1, amplitude * 2.5);

				const barLength = amplitude * 80;

				const startX = ball.x + Math.cos(angle) * (ball.currentRadius + 15);
				const startY = ball.y + Math.sin(angle) * (ball.currentRadius + 15);
				const endX =
					ball.x + Math.cos(angle) * (ball.currentRadius + 15 + barLength);
				const endY =
					ball.y + Math.sin(angle) * (ball.currentRadius + 15 + barLength);

				ctx.strokeStyle = fgColor.replace(")", ` / ${amplitude * 1.2})`);
				ctx.lineWidth = 4;
				ctx.shadowColor = fgColor.replace(")", ` / ${amplitude * 0.8})`);
				ctx.shadowBlur = 3;
				ctx.beginPath();
				ctx.moveTo(startX, startY);
				ctx.lineTo(endX, endY);
				ctx.stroke();
			}
		}

		ctx.shadowBlur = 0;
		convertToAscii();
		animationRef.current = requestAnimationFrame(animate);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: Only run on mount
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const resizeCanvas = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		};

		resizeCanvas();
		window.addEventListener("resize", resizeCanvas);

		// Start animation
		setTimeout(() => {
			animate();
		}, 100);

		return () => {
			window.removeEventListener("resize", resizeCanvas);
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current);
			}
		};
	}, []);

	return (
		<div className={`fixed inset-0 bg-background ${className}`}>
			<canvas ref={canvasRef} className="w-full h-full opacity-0" />
			<div
				ref={asciiRef}
				className="fixed inset-0 font-mono text-foreground whitespace-pre overflow-hidden pointer-events-none flex items-center justify-center"
				style={{
					fontSize: "4px",
					lineHeight: "4px",
					letterSpacing: "-0.5px",
				}}
			/>
		</div>
	);
});

ConversationAudioBall.displayName = "ConversationAudioBall";

export default ConversationAudioBall;
