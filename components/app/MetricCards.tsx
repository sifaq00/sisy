"use client";

interface MetricCardsProps {
  activeCount: number;
  queuedCount: number;
  completedCount: number;
  totalActualHours: number;
  totalPlannedHours: number;
}

const formatDuration = (hours?: number) => {
  if (!hours || hours <= 0) return "0h";
  const totalMin = Math.round(hours * 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
};

export default function MetricCards({
  activeCount,
  queuedCount,
  completedCount,
  totalActualHours,
  totalPlannedHours,
}: MetricCardsProps) {
  const percentDone =
    totalPlannedHours > 0
      ? Math.min(100, Math.round((totalActualHours / totalPlannedHours) * 100))
      : 0;

  return (
    <div className="max-w-[1400px] w-full mx-auto px-6 pt-5 pb-0">
      <div className="flex flex-wrap items-center justify-between gap-4 py-2.5 px-4 bg-[#FFFDF7] border border-[#E2D9C6] rounded-2xl text-xs font-mono shadow-2xs">
        <div className="flex items-center gap-5 text-[#57534A]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#C9662A] animate-pulse" />
            <span className="text-[#211F1A] font-bold">{activeCount}</span>
            <span className="text-[#8C867A]">active</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#8C867A]" />
            <span className="text-[#211F1A] font-bold">{queuedCount}</span>
            <span className="text-[#8C867A]">queued</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#5A684B]" />
            <span className="text-[#5A684B] font-bold">{completedCount}</span>
            <span className="text-[#8C867A]">completed</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-[#8C867A]">
          <div className="flex items-center gap-2">
            <span>Workload:</span>
            <span className="text-[#211F1A] font-semibold">{formatDuration(totalActualHours)}</span>
            <span>/</span>
            <span>{formatDuration(totalPlannedHours)} planned</span>
          </div>
          {totalPlannedHours > 0 && (
            <div className="w-20 h-2 bg-[#E9E1CF] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#5A684B] rounded-full transition-all duration-500"
                style={{ width: `${percentDone}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
