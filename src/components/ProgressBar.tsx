import { theme } from '../theme';

interface ProgressBarProps {
  step: number;
  totalSteps?: number;
}

export default function ProgressBar({ step, totalSteps = 7 }: ProgressBarProps) {
  const pct = (step / totalSteps) * 100;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        background: theme.colors.progressBg,
        zIndex: 50,
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${pct}%`,
          background: theme.colors.progressFill,
          transition: 'width 300ms ease',
        }}
      />
    </div>
  );
}
