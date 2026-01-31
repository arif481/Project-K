import { HudCard } from './HudComponents';

export default function Timeline({ milestones, maxItems = 5 }) {
    if (!milestones || milestones.length === 0) return null;

    return (
        <HudCard title="EVENT HORIZON">
            <div className="flex flex-col gap-4 relative">
                {/* Timeline Spine */}
                <div className="absolute left-[7px] top-2 bottom-2 w-[1px] bg-[var(--border-dim)]" />

                {milestones.slice(0, maxItems).map((item, idx) => {
                    const isCompleted = item.type === 'past';
                    const isCurrent = item.type === 'current';

                    return (
                        <div key={idx} className={`relative pl-6 flex flex-col ${isCompleted ? 'opacity-50 grayscale' : ''}`}>
                            {/* Dot Indicator */}
                            <div className={`absolute left-[3px] top-1.5 w-[9px] h-[9px] rounded-full border border-black z-10 ${isCurrent ? 'bg-[var(--neon-cyan)] animate-pulse shadow-[0_0_10px_var(--neon-cyan)]' :
                                    isCompleted ? 'bg-[var(--text-dim)]' : 'bg-[var(--bg-grid)] border-[var(--border-bright)]'
                                }`} />

                            <div className="flex justify-between items-start">
                                <span className={`text-xs font-mono font-bold ${isCurrent ? 'text-[var(--neon-cyan)]' : 'text-white'}`}>
                                    {item.label}
                                </span>
                                <span className="text-[10px] text-[var(--text-secondary)] font-mono">
                                    {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'PENDING'}
                                </span>
                            </div>

                            <p className="text-[10px] text-[var(--text-secondary)] mt-1 uppercase tracking-wide">
                                {item.physical || item.desc}
                            </p>
                        </div>
                    );
                })}
            </div>
        </HudCard>
    );
}
