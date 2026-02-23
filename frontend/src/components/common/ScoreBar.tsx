// --- StarRating: converts score 0-100 to 0-5 stars ---

interface StarRatingProps {
  score: number;
  maxStars?: number;
  size?: number;
}

export function StarRating({ score, maxStars = 5, size = 20 }: StarRatingProps) {
  const starValue = Math.round((score / 100) * maxStars * 2) / 2; // round to 0.5
  const fullStars = Math.floor(starValue);
  const hasHalf = starValue - fullStars >= 0.5;
  const emptyStars = maxStars - fullStars - (hasHalf ? 1 : 0);
  const starColor = "#eab308";

  const renderStar = (type: "full" | "half" | "empty", idx: number) => {
    if (type === "full") {
      return (
        <svg key={idx} width={size} height={size} viewBox="0 0 24 24" fill={starColor} stroke={starColor} strokeWidth="1">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      );
    }
    if (type === "half") {
      return (
        <svg key={idx} width={size} height={size} viewBox="0 0 24 24" strokeWidth="1">
          <defs>
            <clipPath id={`half-clip-${idx}`}>
              <rect x="0" y="0" width="12" height="24" />
            </clipPath>
          </defs>
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="none" stroke={starColor} />
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill={starColor} clipPath={`url(#half-clip-${idx})`} />
        </svg>
      );
    }
    return (
      <svg key={idx} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={starColor} strokeWidth="1">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
      </svg>
    );
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
      <div style={{ display: "flex", gap: "1px" }}>
        {Array.from({ length: fullStars }, (_, i) => renderStar("full", i))}
        {hasHalf && renderStar("half", fullStars)}
        {Array.from({ length: emptyStars }, (_, i) => renderStar("empty", fullStars + (hasHalf ? 1 : 0) + i))}
      </div>
      <span style={{ fontSize: "13px", fontWeight: 600, color: starColor }}>{starValue.toFixed(1)}/{maxStars}</span>
    </div>
  );
}

// --- ScoreBar ---

interface ScoreBarProps {
  score: number;
  label?: string;
  showValue?: boolean;
  size?: "small" | "medium" | "large";
  showLevel?: boolean;
}

export function ScoreBar({ score, label, showValue = true, size = "medium", showLevel = false }: ScoreBarProps) {
  const getColor = (value: number) => {
    if (value >= 80) return "#22c55e"; // green
    if (value >= 50) return "#eab308"; // yellow
    return "#ef4444"; // red
  };

  const getLevel = (value: number): { text: string; color: string } => {
    if (value >= 70) return { text: "High", color: "#22c55e" };
    if (value >= 40) return { text: "Medium", color: "#eab308" };
    return { text: "Low", color: "#ef4444" };
  };

  const level = showLevel ? getLevel(score) : null;

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
      {level && <span style={{ fontSize: "11px", fontWeight: 600, color: level.color, marginLeft: "4px" }}>({level.text})</span>}
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
