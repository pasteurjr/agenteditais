import { useState } from "react";
import { ChevronUp, ChevronDown, Search } from "lucide-react";

export interface Column<T> {
  key: keyof T | string;
  header: string;
  width?: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  rowClassName?: (item: T) => string;
  selectedId?: string | number;
  idKey?: keyof T;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  loading?: boolean;
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  onRowClick,
  rowClassName,
  selectedId,
  idKey = "id" as keyof T,
  searchable = false,
  searchPlaceholder = "Buscar...",
  emptyMessage = "Nenhum item encontrado",
  loading = false,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchTerm, setSearchTerm] = useState("");

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const filteredData = searchable && searchTerm
    ? data.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : data;

  const sortedData = sortKey
    ? [...filteredData].sort((a, b) => {
        const aVal = a[sortKey as keyof T];
        const bVal = b[sortKey as keyof T];
        const comparison = String(aVal).localeCompare(String(bVal));
        return sortDirection === "asc" ? comparison : -comparison;
      })
    : filteredData;

  return (
    <div className="data-table-container">
      {searchable && (
        <div className="data-table-search">
          <Search size={16} />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  style={{ width: col.width }}
                  className={col.sortable ? "sortable" : ""}
                  onClick={() => col.sortable && handleSort(String(col.key))}
                >
                  <span>{col.header}</span>
                  {col.sortable && sortKey === col.key && (
                    sortDirection === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="data-table-loading">
                  <div className="loading-spinner small" />
                  Carregando...
                </td>
              </tr>
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="data-table-empty">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sortedData.map((item, index) => (
                <tr
                  key={String(item[idKey]) || index}
                  className={`${onRowClick ? "clickable" : ""} ${
                    selectedId === item[idKey] ? "selected" : ""
                  } ${rowClassName ? rowClassName(item) : ""}`}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((col) => (
                    <td key={String(col.key)}>
                      {col.render
                        ? col.render(item)
                        : String(item[col.key as keyof T] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
