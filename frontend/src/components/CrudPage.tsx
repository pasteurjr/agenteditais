import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Plus, Save, Trash2, X, Database, ChevronLeft } from "lucide-react";
import { crudList, crudGet, crudCreate, crudUpdate, crudDelete } from "../api/crud";
import type { CrudColumnSchema } from "../api/crud";

// ─── Field configuration for each CRUD table ──────────────────────────────────

export interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "number" | "email" | "date" | "datetime" | "textarea" | "select" | "boolean" | "json" | "decimal" | "readonly";
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  width?: "full" | "half" | "third";
  hidden?: boolean;
  fkTable?: string;
  fkLabel?: string;
}

export interface CrudPageConfig {
  table: string;
  title: string;
  icon?: React.ReactNode;
  fields: FieldConfig[];
  searchPlaceholder?: string;
  parentFk?: string;
  parentTable?: string;
  parentLabelField?: string;
  parentLabelFn?: (item: Record<string, unknown>) => string;
}

interface CrudPageProps {
  config: CrudPageConfig;
}

// ─── Format field labels from column names ─────────────────────────────────────

function formatLabel(name: string): string {
  return name
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\bId\b/g, "ID")
    .replace(/\bUf\b/g, "UF")
    .replace(/\bCnpj\b/g, "CNPJ")
    .replace(/\bCep\b/g, "CEP")
    .replace(/\bCpf\b/g, "CPF")
    .replace(/\bNcm\b/g, "NCM")
    .replace(/\bUrl\b/g, "URL");
}

// ─── Auto-generate field config from schema ────────────────────────────────────

export function generateFieldsFromSchema(columns: CrudColumnSchema[]): FieldConfig[] {
  return columns
    .filter((col) => !["id", "user_id", "created_at", "updated_at"].includes(col.name))
    .map((col) => {
      const field: FieldConfig = {
        name: col.name,
        label: formatLabel(col.name),
        type: "text",
        required: col.required,
        width: "half",
      };

      if (col.options && col.options.length > 0) {
        field.type = "select";
        field.options = col.options.map((o) => ({ value: o, label: formatLabel(o) }));
      } else if (col.type === "BOOLEAN") {
        field.type = "boolean";
        field.width = "half";
      } else if (col.type === "DECIMAL" || col.type === "NUMERIC") {
        field.type = "decimal";
      } else if (col.type === "INTEGER" || col.type === "INT") {
        field.type = "number";
      } else if (col.type === "DATE") {
        field.type = "date";
      } else if (col.type === "DATETIME") {
        field.type = "datetime";
      } else if (col.type === "TEXT" || col.type === "LONGTEXT") {
        field.type = "textarea";
        field.width = "full";
      } else if (col.type === "JSON") {
        field.type = "json";
        field.width = "full";
      }

      // FK fields
      if (col.fk) {
        field.type = "text";
        field.placeholder = `ID de ${col.fk.split(".")[0]}`;
      }

      return field;
    });
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function CrudPage({ config }: CrudPageProps) {
  const { table, title, icon, fields, searchPlaceholder, parentFk, parentTable, parentLabelField, parentLabelFn } = config;

  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // ─── Parent selector state (for child tables) ────────────────────────────
  const isChildTable = Boolean(parentFk && parentTable);
  const [parentItems, setParentItems] = useState<Record<string, unknown>[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [parentLoading, setParentLoading] = useState(false);
  const [parentSearch, setParentSearch] = useState("");
  const parentDebounceRef = useRef<ReturnType<typeof setTimeout>>();

  const getParentLabel = useCallback((item: Record<string, unknown>): string => {
    if (parentLabelFn) return parentLabelFn(item);
    if (parentLabelField) {
      const val = item[parentLabelField];
      return val ? String(val) : String(item.id).slice(0, 8);
    }
    // Auto-detect: try nome, razao_social, numero, titulo, termo, orgao, then first string
    for (const key of ["nome", "razao_social", "numero", "titulo", "termo", "orgao", "numero_contrato"]) {
      if (item[key]) return String(item[key]);
    }
    return String(item.id).slice(0, 8);
  }, [parentLabelField, parentLabelFn]);

  // ─── Load parent items ─────────────────────────────────────────────────────

  const loadParentItems = useCallback(async (query?: string) => {
    if (!parentTable) return;
    setParentLoading(true);
    try {
      const result = await crudList(parentTable, { q: query || undefined, limit: 100 });
      setParentItems(result.items);
    } catch {
      // Silently fail — parent list not critical
    } finally {
      setParentLoading(false);
    }
  }, [parentTable]);

  useEffect(() => {
    if (isChildTable) {
      loadParentItems();
    }
  }, [isChildTable, loadParentItems]);

  const handleParentSearch = (value: string) => {
    setParentSearch(value);
    if (parentDebounceRef.current) clearTimeout(parentDebounceRef.current);
    parentDebounceRef.current = setTimeout(() => {
      loadParentItems(value);
    }, 300);
  };

  const handleSelectParent = (parentId: string) => {
    setSelectedParentId(parentId);
    setSelectedId(null);
    setIsNew(false);
    setFormData({});
  };

  // ─── Load items ────────────────────────────────────────────────────────────

  const loadItems = useCallback(async (query?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params: { q?: string; parent_id?: string; limit?: number } = { q: query || undefined, limit: 200 };
      if (isChildTable && selectedParentId) {
        params.parent_id = selectedParentId;
      }
      const result = await crudList(table, params);
      setItems(result.items);
      setTotal(result.total);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [table, isChildTable, selectedParentId]);

  useEffect(() => {
    if (isChildTable && !selectedParentId) {
      // Don't load child items until a parent is selected
      setItems([]);
      setTotal(0);
      return;
    }
    loadItems();
  }, [loadItems, isChildTable, selectedParentId]);

  // ─── Debounced search ──────────────────────────────────────────────────────

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadItems(value);
    }, 300);
  };

  // ─── Search Enter → load record ───────────────────────────────────────────

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && items.length > 0) {
      e.preventDefault();
      const firstItem = items[0];
      handleSelectItem(firstItem);
    }
  };

  // ─── Select item for editing ──────────────────────────────────────────────

  const handleSelectItem = async (item: Record<string, unknown>) => {
    const id = String(item.id);
    setSelectedId(id);
    setIsNew(false);
    setError(null);
    setSuccessMsg(null);
    try {
      const full = await crudGet(table, id);
      setFormData(full);
    } catch (err) {
      setFormData(item);
    }
  };

  // ─── New record ───────────────────────────────────────────────────────────

  const handleNew = () => {
    setSelectedId(null);
    setIsNew(true);
    setError(null);
    setSuccessMsg(null);
    const emptyForm: Record<string, unknown> = {};
    fields.forEach((f) => {
      if (f.type === "boolean") emptyForm[f.name] = false;
      else emptyForm[f.name] = "";
    });
    // Auto-fill parent FK when creating child record
    if (parentFk && selectedParentId) {
      emptyForm[parentFk] = selectedParentId;
    }
    setFormData(emptyForm);
  };

  // ─── Save ─────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      if (isNew) {
        const created = await crudCreate(table, formData);
        setSelectedId(String(created.id));
        setFormData(created);
        setIsNew(false);
        setSuccessMsg("Registro criado com sucesso!");
      } else if (selectedId) {
        const updated = await crudUpdate(table, selectedId, formData);
        setFormData(updated);
        setSuccessMsg("Registro atualizado com sucesso!");
      }
      loadItems(searchTerm);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  // ─── Delete ───────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!selectedId) return;
    if (!confirm("Tem certeza que deseja excluir este registro?")) return;

    setError(null);
    try {
      await crudDelete(table, selectedId);
      setSelectedId(null);
      setIsNew(false);
      setFormData({});
      setSuccessMsg("Registro excluído com sucesso!");
      loadItems(searchTerm);
    } catch (err) {
      setError((err as Error).message);
    }
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // ─── Cancel / Back to list ────────────────────────────────────────────────

  const handleCancel = () => {
    setSelectedId(null);
    setIsNew(false);
    setFormData({});
    setError(null);
    setSuccessMsg(null);
  };

  // ─── Update form field ────────────────────────────────────────────────────

  const updateField = (name: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ─── Render field input ───────────────────────────────────────────────────

  const renderField = (field: FieldConfig) => {
    if (field.hidden) return null;
    const value = formData[field.name] ?? "";

    switch (field.type) {
      case "select":
        return (
          <select
            className="select-input"
            value={String(value)}
            onChange={(e) => updateField(field.name, e.target.value)}
          >
            <option value="">Selecione...</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );
      case "boolean":
        return (
          <label className="checkbox-wrapper">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => updateField(field.name, e.target.checked)}
            />
            <span className="checkbox-label">{value ? "Sim" : "Não"}</span>
          </label>
        );
      case "textarea":
        return (
          <textarea
            className="textarea-input"
            value={String(value)}
            onChange={(e) => updateField(field.name, e.target.value)}
            placeholder={field.placeholder}
            rows={4}
          />
        );
      case "json":
        return (
          <textarea
            className="textarea-input"
            value={typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
            onChange={(e) => {
              try {
                updateField(field.name, JSON.parse(e.target.value));
              } catch {
                updateField(field.name, e.target.value);
              }
            }}
            placeholder="JSON..."
            rows={4}
          />
        );
      case "date":
        return (
          <input
            type="date"
            className="text-input"
            value={String(value).slice(0, 10)}
            onChange={(e) => updateField(field.name, e.target.value)}
          />
        );
      case "datetime":
        return (
          <input
            type="datetime-local"
            className="text-input"
            value={String(value).slice(0, 16)}
            onChange={(e) => updateField(field.name, e.target.value)}
          />
        );
      case "readonly":
        return (
          <input
            type="text"
            className="text-input"
            value={String(value)}
            disabled
          />
        );
      default:
        return (
          <input
            type={field.type === "decimal" ? "number" : field.type}
            className="text-input"
            value={String(value)}
            onChange={(e) => updateField(field.name, e.target.value)}
            placeholder={field.placeholder}
            step={field.type === "decimal" ? "0.01" : undefined}
          />
        );
    }
  };

  // ─── Display value in table list ──────────────────────────────────────────

  const getDisplayValue = (item: Record<string, unknown>, field: FieldConfig): string => {
    const val = item[field.name];
    if (val === null || val === undefined) return "-";
    if (field.type === "boolean") return val ? "Sim" : "Não";
    if (field.type === "json") return typeof val === "object" ? JSON.stringify(val) : String(val);
    if (field.type === "select" && field.options) {
      const opt = field.options.find((o) => o.value === String(val));
      return opt ? opt.label : String(val);
    }
    const s = String(val);
    return s.length > 50 ? s.slice(0, 50) + "..." : s;
  };

  // ─── Visible fields for table columns (first 6 non-hidden, skip parent FK) ─

  const tableFields = fields
    .filter((f) => !f.hidden && f.type !== "json" && f.type !== "textarea" && !(isChildTable && f.name === parentFk))
    .slice(0, 6);
  const formFields = fields.filter((f) => !(isChildTable && f.name === parentFk));
  const showForm = isNew || selectedId !== null;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          {icon || <Database size={24} />}
          <div>
            <h1>{title}</h1>
            <p>
              {isChildTable && !selectedParentId
                ? "Selecione um registro principal abaixo"
                : `${total} registro${total !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>
      </div>

      <div className="page-content">
        {/* Parent selector for child tables */}
        {isChildTable && (
          <div className="card crud-parent-selector">
            <div className="card-content">
              <label className="form-field-label crud-parent-label">
                Selecione o registro principal:
              </label>
              <div className="crud-parent-search-row">
                <div className="crud-search-box">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder={`Buscar...`}
                    value={parentSearch}
                    onChange={(e) => handleParentSearch(e.target.value)}
                  />
                  {parentSearch && (
                    <button className="crud-search-clear" onClick={() => { setParentSearch(""); loadParentItems(); }}>
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
              {parentLoading ? (
                <div className="crud-parent-loading"><div className="loading-spinner small" /> Carregando...</div>
              ) : (
                <div className="crud-parent-list">
                  {parentItems.map((item) => (
                    <button
                      key={String(item.id)}
                      className={`crud-parent-item ${selectedParentId === String(item.id) ? "active" : ""}`}
                      onClick={() => handleSelectParent(String(item.id))}
                    >
                      <span className="crud-parent-item-label">{getParentLabel(item)}</span>
                      {selectedParentId === String(item.id) && <span className="crud-parent-check">&#10003;</span>}
                    </button>
                  ))}
                  {parentItems.length === 0 && (
                    <div className="crud-parent-empty">Nenhum registro encontrado</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Search bar + New button */}
        <div className="crud-toolbar" style={isChildTable && !selectedParentId ? { opacity: 0.5, pointerEvents: "none" } : {}}>
          <div className="crud-search-box">
            <Search size={16} />
            <input
              ref={searchRef}
              type="text"
              placeholder={searchPlaceholder || `Buscar ${title.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
            {searchTerm && (
              <button className="crud-search-clear" onClick={() => { setSearchTerm(""); loadItems(); }}>
                <X size={14} />
              </button>
            )}
          </div>
          <button className="action-button action-button-primary" onClick={handleNew}>
            <Plus size={16} />
            <span>Novo</span>
          </button>
        </div>

        {/* Messages */}
        {error && <div className="crud-message crud-message-error">{error}</div>}
        {successMsg && <div className="crud-message crud-message-success">{successMsg}</div>}

        {/* Form area */}
        {showForm && (
          <div className="card">
            <div className="card-header">
              <div className="card-header-left">
                <button className="crud-back-btn" onClick={handleCancel} title="Voltar à lista">
                  <ChevronLeft size={18} />
                </button>
                <h3 className="card-title">{isNew ? `Novo ${title}` : `Editar ${title}`}</h3>
              </div>
              <div className="card-header-right">
                <button
                  className="action-button action-button-primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? <span className="loading-spinner small" /> : <Save size={16} />}
                  <span>Salvar</span>
                </button>
                {selectedId && !isNew && (
                  <button className="action-button action-button-danger" onClick={handleDelete}>
                    <Trash2 size={16} />
                    <span>Excluir</span>
                  </button>
                )}
                <button className="action-button action-button-secondary" onClick={handleCancel}>
                  <X size={16} />
                  <span>Cancelar</span>
                </button>
              </div>
            </div>
            <div className="card-content">
              <div className="form-grid form-grid-2">
                {formFields.filter((f) => !f.hidden).map((field) => (
                  <div
                    key={field.name}
                    className={`form-field ${field.width === "full" ? "form-field-full" : ""}`}
                  >
                    <label className="form-field-label">
                      {field.label}
                      {field.required && <span className="form-field-required">*</span>}
                    </label>
                    {renderField(field)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Table list */}
        <div className="card">
          <div className="card-content" style={{ padding: 0 }}>
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    {tableFields.map((f) => (
                      <th key={f.name}>{f.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={tableFields.length} className="data-table-loading">
                        <div className="loading-spinner small" />
                        Carregando...
                      </td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={tableFields.length} className="data-table-empty">
                        Nenhum registro encontrado
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr
                        key={String(item.id)}
                        className={`clickable ${selectedId === String(item.id) ? "selected" : ""}`}
                        onClick={() => handleSelectItem(item)}
                      >
                        {tableFields.map((f) => (
                          <td key={f.name}>{getDisplayValue(item, f)}</td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
