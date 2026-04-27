interface SpeedControlProps {
  value: number;
  onChange: (value: number) => void;
}

const speeds = [
  { value: 0.7, label: '🐢', title: 'Très lent' },
  { value: 0.85, label: '×1', title: 'Lent' },
  { value: 1.0, label: '×2', title: 'Normal' },
  { value: 1.2, label: '🐇', title: 'Rapide' },
];

export const SpeedControl = ({ value, onChange }: SpeedControlProps) => {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {speeds.map((speed) => (
        <button
          key={speed.value}
          onClick={() => onChange(speed.value)}
          title={speed.title}
          className={`w-12 h-12 rounded-xl font-bold text-sm flex items-center justify-center transition-all duration-200
            ${value === speed.value
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-110'
              : 'bg-white text-slate-500 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
            }`}
        >
          {speed.label}
        </button>
      ))}
    </div>
  );
};
