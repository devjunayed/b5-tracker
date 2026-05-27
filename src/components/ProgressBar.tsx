interface ProgressBarProps {
  pct: number;
  size?: 'sm' | 'md';
}

export function ProgressBar({ pct, size = 'md' }: ProgressBarProps) {
  const height = size === 'sm' ? 4 : 8;

  return (
    <div
      style={{
        background: 'var(--track)',
        borderRadius: 99,
        height,
        overflow: 'hidden',
        width: '100%',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${pct}%`,
          background: 'var(--accent)',
          borderRadius: 99,
          transition: 'width 0.4s cubic-bezier(0.4,0,0.2,1)',
        }}
      />
    </div>
  );
}
