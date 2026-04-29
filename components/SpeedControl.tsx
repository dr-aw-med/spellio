interface SpeedControlProps {
  value: number;
  onChange: (value: number) => void;
}

const speeds = [
  { value: 0.65, label: 'Lent' },
  { value: 0.8, label: 'Normal' },
  { value: 1.0, label: 'Rapide' },
];

export const SpeedControl = ({ value, onChange }: SpeedControlProps) => {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {speeds.map((speed) => (
        <button
          key={speed.value}
          onClick={() => onChange(speed.value)}
          className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200
            ${value === speed.value
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'bg-white text-slate-400 border border-slate-200 hover:border-indigo-300 hover:text-indigo-500'
            }`}
        >
          {speed.label}
        </button>
      ))}
    </div>
  );
};
