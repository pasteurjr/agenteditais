import { Search } from "lucide-react";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterBarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: {
    key: string;
    label: string;
    options: FilterOption[];
    value: string;
    onChange: (value: string) => void;
  }[];
  actions?: React.ReactNode;
}

export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  filters = [],
  actions,
}: FilterBarProps) {
  return (
    <div className="filter-bar">
      <div className="filter-bar-left">
        {onSearchChange && (
          <div className="filter-bar-search">
            <Search size={16} />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue || ""}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        )}

        {filters.map((filter) => (
          <div key={filter.key} className="filter-bar-select">
            <label>{filter.label}:</label>
            <select
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
            >
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {actions && <div className="filter-bar-right">{actions}</div>}
    </div>
  );
}
