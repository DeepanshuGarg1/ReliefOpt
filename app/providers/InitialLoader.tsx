"use client"

import { useEffect, useState, useCallback } from "react"

export function InitialLoader({ children }: { children: React.ReactNode }) {
    const [progress, setProgress] = useState(0)
    const [phase, setPhase] = useState<"loading" | "exiting" | "done">("loading")

    const tick = useCallback(() => {
        setProgress((prev) => {
            if (prev >= 100) return 100
            // accelerate near the end
            const increment = prev < 60 ? 1.8 : prev < 85 ? 2.4 : 3.6
            return Math.min(prev + increment, 100)
        })
    }, [])

    useEffect(() => {
        const id = setInterval(tick, 30)
        return () => clearInterval(id)
    }, [tick])

    useEffect(() => {
        if (progress >= 100 && phase === "loading") {
            const t = setTimeout(() => setPhase("exiting"), 200)
            return () => clearTimeout(t)
        }
    }, [progress, phase])

    useEffect(() => {
        if (phase === "exiting") {
            const t = setTimeout(() => setPhase("done"), 600)
            return () => clearTimeout(t)
        }
    }, [phase])

    if (phase === "done") return <>{children}</>

    return (
        <>
            {/* Pre-render children hidden so they mount early */}
            <div className="hidden">{children}</div>

            <div
                className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-500 ${phase === "exiting" ? "opacity-0" : "opacity-100"
                    }`}
                style={{
                    background: `
    radial-gradient(1200px circle at 15% 20%, rgba(16,185,129,0.18), transparent 45%),
    radial-gradient(900px circle at 85% 75%, rgba(34,197,94,0.15), transparent 40%),
    radial-gradient(700px circle at 50% 50%, rgba(16,185,129,0.12), transparent 55%),
    linear-gradient(180deg, hsl(222 47% 6%), hsl(160 30% 6%), hsl(222 47% 6%))
  `,
                }}

            >
                {/* Animated background grid */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div
                        className="absolute inset-0 opacity-[0.03]"
                        style={{
                            backgroundImage:
                                "linear-gradient(hsl(160 84% 39%) 1px, transparent 1px), linear-gradient(90deg, hsl(160 84% 39%) 1px, transparent 1px)",
                            backgroundSize: "60px 60px",
                        }}
                    />
                    {/* Radial glow behind hero content */}
                    <div
                        className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-[120px]"
                        style={{
                            background:
                                "radial-gradient(circle, hsl(160 84% 39% / 0.4), transparent 70%)",
                        }}
                    />
                </div>

                {/* Content */}
                <div className="relative flex max-w-xl flex-col items-center gap-8 px-6 text-center">

                    {/* Title */}
                    <h1
                        className="text-balance font-sans text-4xl font-bold leading-tight tracking-tight sm:text-7xl animate-fade-slide-up"
                        style={{
                            color: "hsl(150 20% 92%)",
                            animationDelay: "120ms",
                        }}
                    >
                        Predict. Prepare.
                        <br />
                        <span
                            style={{
                                background: "linear-gradient(135deg, hsl(160 84% 39%), hsl(200 70% 50%))",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                            }}
                        >
                            Protect Lives.
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p
                        className="max-w-md text-pretty text-sm leading-relaxed sm:text-base animate-fade-slide-up"
                        style={{
                            color: "hsl(215 15% 55%)",
                            animationDelay: "240ms",
                        }}
                    >
                        AI-powered disaster management platform that predicts dangers 2
                        hours in advance. Unifying 17+ agencies on one secure dashboard.
                    </p>

                    {/* Progress section */}
                    <div
                        className="flex w-full max-w-xs flex-col items-center gap-3 animate-fade-slide-up"
                        style={{ animationDelay: "360ms" }}
                    >
                        {/* Progress bar track */}
                        <div
                            className="h-1 w-full overflow-hidden rounded-full"
                            style={{ background: "hsl(215 28% 14%)" }}
                        >
                            <div
                                className="h-full rounded-full transition-all duration-100 ease-linear"
                                style={{
                                    width: `${progress}%`,
                                    background:
                                        "linear-gradient(90deg, hsl(160 84% 39%), hsl(200 70% 50%))",
                                }}
                            />
                        </div>

                        {/* Status line */}
                        <div
                            className="flex w-full items-center justify-between font-mono text-[11px]"
                            style={{ color: "hsl(215 15% 55%)" }}
                        >
                            <span>
                                {progress < 30
                                    ? "Loading Sentinel TFT..."
                                    : progress < 60
                                        ? "Initializing Commander MILP..."
                                        : progress < 85
                                            ? "Connecting district feeds..."
                                            : "Launching dashboard..."}
                            </span>
                            <span style={{ color: "hsl(160 84% 39%)" }}>
                                {Math.round(progress)}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
