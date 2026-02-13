interface StatusBadgeProps {
  status: "success" | "warning" | "error" | "info" | "neutral";
  label: string;
  size?: "small" | "medium";
}

const STATUS_COLORS = {
  success: { bg: "#dcfce7", color: "#166534", icon: "🟢" },
  warning: { bg: "#fef9c3", color: "#854d0e", icon: "🟡" },
  error: { bg: "#fee2e2", color: "#991b1b", icon: "🔴" },
  info: { bg: "#dbeafe", color: "#1e40af", icon: "🔵" },
  neutral: { bg: "#f3f4f6", color: "#374151", icon: "⚪" },
};

export function StatusBadge({ status, label, size = "medium" }: StatusBadgeProps) {
  const colors = STATUS_COLORS[status];

  return (
    <span
      className={`status-badge status-badge-${size}`}
      style={{
        backgroundColor: colors.bg,
        color: colors.color,
      }}
    >
      <span className="status-badge-icon">{colors.icon}</span>
      {label}
    </span>
  );
}

// Helper para converter score em status
export function getScoreStatus(score: number): "success" | "warning" | "error" {
  if (score >= 80) return "success";
  if (score >= 50) return "warning";
  return "error";
}

// Helper para formatar score com cor
export function ScoreBadge({ score }: { score: number }) {
  const status = getScoreStatus(score);
  return <StatusBadge status={status} label={`${score}%`} />;
}
