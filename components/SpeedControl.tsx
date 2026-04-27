interface SpeedControlProps {
  value: number;
  onChange: (value: number) => void;
}

const speeds = [
  { value: 0.85, label: '🐢', title: 'Lent' },
  { value: 1.0, label: '🐇', title: 'Normal' },
];

export const SpeedControl = ({ value, onChange }: SpeedControlProps) => {
  return (
    <div className="flex items-center justify-center gap-3 mb-6">
      {speeds.map((speed) => (
        <button
          key={speed.value}
          onClick={() => onChange(speed.value)}
          title={speed.title}
          className={`w-14 h-14 rounded-xl text-2xl flex items-center justify-center transition-all duration-200
            ${value === speed.value
              ? 'bg-indigo-600 shadow-md shadow-indigo-200 scale-110'
              : 'bg-white border border-slate-200 hover:border-indigo-300'
            }`}
        >
          {speed.label}
        </button>
      ))}
    </div>
  );
};
