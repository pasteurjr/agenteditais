interface ScoreBarProps {
  score: number;
  label?: string;
  showValue?: boolean;
  size?: "small" | "medium" | "large";
}

export function ScoreBar({ score, label, showValue = true, size = "medium" }: ScoreBarProps) {
  const getColor = (value: number) => {
    if (value >= 80) return "#22c55e"; // green
    if (value >= 50) return "#eab308"; // yellow
    return "#ef4444"; // red
  };

  return (
    <div className={`score-bar-container score-bar-${size}`}>
      {label && <span className="score-bar-label">{label}</span>}
      <div className="score-bar-track">
        <div
          className="score-bar-fill"
          style={{
            width: `${Math.min(100, Math.max(0, score))}%`,
            backgroundColor: getColor(score),
          }}
        />
      </div>
      {showValue && <span className="score-bar-value">{score}%</span>}
    </div>
  );
}

interface ScoreCircleProps {
  score: number;
  size?: number;
  label?: string;
}

export function ScoreCircle({ score, size = 100, label }: ScoreCircleProps) {
  const getColor = (value: number) => {
    if (value >= 80) return "#22c55e";
    if (value >= 50) return "#eab308";
    return "#ef4444";
  };

  const strokeWidth = size * 0.1;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="score-circle-container" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          className="score-circle-bg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <circle
          className="score-circle-fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={getColor(score)}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="score-circle-text">
        <span className="score-circle-value">{score}</span>
        <span className="score-circle-max">/100</span>
      </div>
      {label && <span className="score-circle-label">{label}</span>}
    </div>
  );
}
