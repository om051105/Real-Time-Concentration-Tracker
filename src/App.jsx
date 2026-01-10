import React, { useState, useEffect, useCallback, useRef } from 'react';
import Tracker from './components/Tracker';
import { AreaChart, Area, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertCircle, CheckCircle, Smartphone, Activity, Eye, Zap, Clock } from 'lucide-react';

function App() {
    const [status, setStatus] = useState("FOCUSED"); // FOCUSED | DISTRACTED
    const [score, setScore] = useState(100);
    const [details, setDetails] = useState([]);
    const [sessionTime, setSessionTime] = useState(0);
    const [distractionCount, setDistractionCount] = useState(0);
    const [chartData, setChartData] = useState([]); // { time, score }

    const statusRef = useRef("FOCUSED");
    const lastUpdateRef = useRef(Date.now());

    // Audio and Start State
    const [started, setStarted] = useState(false);
    const audioRef = useRef(null);

    useEffect(() => {
        // Initialize audio object with the Mahatma Gandhi meme sound
        audioRef.current = new Audio('/mahatma_gandhi.mp3');
        audioRef.current.loop = true;

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    // Handle Audio Playback
    useEffect(() => {
        if (!started || !audioRef.current) return;

        const playAudio = async () => {
            try {
                if (status === "DISTRACTED") {
                    audioRef.current.volume = 1.0; // Enforce max volume
                    await audioRef.current.play();
                } else {
                    audioRef.current.pause();
                    audioRef.current.currentTime = 0; // Reset to start
                }
            } catch (err) {
                console.error("Audio playback failed:", err);
            }
        };

        playAudio();

        // Enforce volume constantly
        const volInterval = setInterval(() => {
            if (audioRef.current && status === "DISTRACTED") {
                if (audioRef.current.volume !== 1.0) {
                    audioRef.current.volume = 1.0;
                }
            }
        }, 1000);

        return () => clearInterval(volInterval);
    }, [status, started]);

    const handleStart = () => {
        setStarted(true);
        // unlocking audio context
        if (audioRef.current) {
            audioRef.current.play().then(() => {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }).catch(e => console.log("Audio init failed", e));
        }
    };

    const handleTrackerUpdate = useCallback((data) => {
        if (!started) return;

        if (data.status !== statusRef.current) {
            statusRef.current = data.status;
            setStatus(data.status);
            if (data.status === "DISTRACTED") {
                setDistractionCount(prev => prev + 1);
            }
        }
        if (JSON.stringify(data.details) !== JSON.stringify(details)) {
            setDetails(data.details);
        }
    }, [details, started]);

    // Game Loop
    useEffect(() => {
        if (!started) return;

        const interval = setInterval(() => {
            const now = Date.now();
            const delta = (now - lastUpdateRef.current) / 1000;
            lastUpdateRef.current = now;

            setSessionTime(prev => prev + 1);

            setScore(prevScore => {
                let newScore = prevScore;
                if (statusRef.current === "FOCUSED") {
                    newScore += 0.5 * delta;
                } else {
                    newScore -= 2.0 * delta;
                }
                const clamped = Math.min(100, Math.max(0, newScore));

                // Update Chart
                setChartData(prevData => {
                    const newData = [...prevData, { time: new Date().toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }), value: Math.round(clamped) }];
                    if (newData.length > 20) newData.shift();
                    return newData;
                });

                return clamped;
            });

        }, 1000);
        return () => clearInterval(interval);
    }, [started]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getScoreColor = (value) => {
        if (value > 80) return '#10b981';
        if (value > 50) return '#f59e0b';
        return '#ef4444';
    };

    if (!started) {
        return (
            <div className="h-screen w-screen bg-[var(--bg-dark)] flex items-center justify-center text-white">
                <div className="text-center space-y-6 max-w-lg px-6">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">FocusFlow</h1>
                    <p className="text-[var(--text-secondary)]">
                        Ready to focus? Distractions will trigger the alarm.
                        <br />
                        <span className="text-xs text-red-400 mt-2 block">Warning: Audio will play at max volume.</span>
                    </p>
                    <button
                        onClick={handleStart}
                        className="px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform"
                    >
                        Start Session
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen bg-[var(--bg-dark)] text-white font-sans overflow-hidden flex flex-col">
            {/* Compact Header */}
            <header className="h-14 flex items-center justify-between px-6 border-b border-[var(--glass-border)] shrink-0 bg-[var(--glass-bg)]">
                <div className="flex items-center gap-2">
                    <Zap className="text-[var(--accent-primary)] w-6 h-6" />
                    <h1 className="text-lg font-bold tracking-tight">FocusFlow</h1>
                </div>
                <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
                    <div className="flex items-center gap-1 bg-[var(--bg-card)] px-3 py-1 rounded-full border border-[var(--glass-border)]">
                        <Clock size={14} />
                        <span className="font-mono">{formatTime(sessionTime)}</span>
                    </div>
                </div>
            </header>

            {/* Main Content - Grid Layout */}
            <main className="flex-1 grid grid-cols-12 gap-0 min-h-0">

                {/* Left Panel: Camera Feed */}
                <div className="col-span-9 relative bg-black flex flex-col justify-center items-center overflow-hidden">
                    {/* Status Overlay */}
                    <div className="absolute top-6 left-6 z-20 flex gap-2">
                        <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg backdrop-blur-md transition-colors duration-300
                    ${status === 'FOCUSED' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'}`}>
                            {status}
                        </span>
                        {details.map((d, i) => (
                            <span key={i} className="px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider bg-black/60 text-white border border-white/10 backdrop-blur-md">
                                {d}
                            </span>
                        ))}
                    </div>

                    <div className="w-full h-full relative">
                        <div className={`absolute inset-0 pointer-events-none border-[6px] z-10 transition-colors duration-500 ${status === 'DISTRACTED' ? 'border-red-500/50' : 'border-transparent'}`}></div>
                        <Tracker onUpdate={handleTrackerUpdate} />
                    </div>
                </div>

                {/* Right Panel: Analytics Sidebar */}
                <div className="col-span-3 bg-[var(--bg-card)] border-l border-[var(--glass-border)] flex flex-col p-6 gap-6 overflow-y-auto">

                    {/* Score Section */}
                    <div className="flex flex-col h-[200px] w-full p-4 border-b border-[var(--glass-border)]">
                        <span className="text-sm text-[var(--text-secondary)] font-medium mb-2">Concentration Trend</span>
                        <div className="flex-1 w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={getScoreColor(score)} stopOpacity={0.8} />
                                            <stop offset="95%" stopColor={getScoreColor(score)} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.5} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke={getScoreColor(score)}
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorScore)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                            <div className="absolute top-2 right-2 text-2xl font-bold" style={{ color: getScoreColor(score) }}>
                                {Math.round(score)}%
                            </div>
                        </div>
                    </div>

                    {/* Live Feedback */}
                    <div className="flex-1">
                        <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Live Status</h3>
                        {status === 'FOCUSED' ? (
                            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-200 transition-all">
                                <div className="flex items-center gap-2 mb-1">
                                    <CheckCircle size={18} />
                                    <span className="font-semibold">All Good</span>
                                </div>
                                <p className="text-xs opacity-70">Maintained focus. No anomalies detected.</p>
                            </div>
                        ) : (
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 transition-all animate-pulse-red">
                                <div className="flex items-center gap-2 mb-1">
                                    <AlertCircle size={18} />
                                    <span className="font-semibold">Distraction</span>
                                </div>
                                <p className="text-xs opacity-70">
                                    {details.includes('Phone Detected') ? "Phone detected in frame." : "User gaze deviation detected."}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-[var(--bg-dark)] p-3 rounded-lg border border-[var(--glass-border)] flex flex-col items-center text-center">
                            <span className="text-2xl font-bold mb-1 text-white">{distractionCount}</span>
                            <span className="text-[10px] text-[var(--text-secondary)] uppercase">Breaks</span>
                        </div>
                        <div className="bg-[var(--bg-dark)] p-3 rounded-lg border border-[var(--glass-border)] flex flex-col items-center text-center">
                            <Activity size={24} className={status === 'FOCUSED' ? 'text-green-500' : 'text-red-500'} />
                            <span className="text-[10px] text-[var(--text-secondary)] uppercase mt-2">Sensor</span>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="mt-auto pt-4 border-t border-[var(--glass-border)]">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                                <div className="flex items-center gap-1.5"><Smartphone size={12} /> <span>Obj Det</span></div>
                                <span className="text-green-400">Active</span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                                <div className="flex items-center gap-1.5"><Eye size={12} /> <span>Gaze Est</span></div>
                                <span className="text-green-400">Active</span>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}

export default App;
