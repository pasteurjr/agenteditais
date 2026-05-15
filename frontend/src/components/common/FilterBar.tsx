import { Search } from "lucide-react";
import { useRef } from "react";

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
  const searchInputRef = useRef<HTMLInputElement>(null);
  // obs 1 validador V8: lupa clicavel. A busca ja e reativa ao digitar;
  // o botao da affordance de "buscar", foca o campo e reaplica o filtro.
  const handleSearchClick = () => {
    searchInputRef.current?.focus();
    if (onSearchChange) onSearchChange(searchValue || "");
  };
  return (
    <div className="filter-bar">
      <div className="filter-bar-left">
        {onSearchChange && (
          <div className="filter-bar-search">
            <button
              type="button"
              onClick={handleSearchClick}
              title="Buscar"
              aria-label="Buscar"
              style={{ background: "none", border: "none", padding: 0, margin: 0, cursor: "pointer", display: "flex", alignItems: "center", color: "inherit" }}
            >
              <Search size={16} />
            </button>
            <input
              ref={searchInputRef}
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue || ""}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSearchClick(); }}
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
