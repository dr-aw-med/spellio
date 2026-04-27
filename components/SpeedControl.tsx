interface SpeedControlProps {
  value: number;
  onChange: (value: number) => void;
}

export const SpeedControl = ({ value, onChange }: SpeedControlProps) => {
  return (
    <div className="flex items-center justify-center gap-3 mb-6 bg-slate-50 p-2 rounded-xl">
      <span className="text-xl">🐢</span>
      <input
        type="range"
        min="0.7"
        max="1.3"
        step="0.1"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-32 accent-indigo-500 cursor-pointer"
      />
      <span className="text-xl">🐇</span>
    </div>
  );
};
