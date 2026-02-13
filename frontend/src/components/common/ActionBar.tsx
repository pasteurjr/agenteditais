import { ReactNode } from "react";

interface ActionBarProps {
  children: ReactNode;
  position?: "top" | "bottom";
}

export function ActionBar({ children, position = "top" }: ActionBarProps) {
  return (
    <div className={`action-bar action-bar-${position}`}>
      {children}
    </div>
  );
}

interface ActionButtonProps {
  icon?: ReactNode;
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger" | "success";
  disabled?: boolean;
  loading?: boolean;
}

export function ActionButton({
  icon,
  label,
  onClick,
  variant = "secondary",
  disabled = false,
  loading = false,
}: ActionButtonProps) {
  return (
    <button
      className={`action-button action-button-${variant}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <span className="loading-spinner small" />
      ) : (
        icon && <span className="action-button-icon">{icon}</span>
      )}
      <span>{label}</span>
    </button>
  );
}
