interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

export const ProgressBar = ({ current, total, label = "Mot" }: ProgressBarProps) => {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm font-bold text-slate-400 mb-2">
        <span>{label} {current}/{total}</span>
        <span>{percentage}%</span>
      </div>
      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
