import { ListFilter, XIcon } from "lucide-react";
import { Button } from "../ui/button";
import { LabelFilter } from "./types";
import { useState } from "react";
import { cn } from "@/lib/utils";

type AlertFiltersProps = {
  filters: LabelFilter[];
  setFilters: (value: LabelFilter[]) => void;
};

export function AlertFilters(props: AlertFiltersProps) {
  const { filters, setFilters } = props;

  const addFilter = (filter: LabelFilter) => {
    setFilters([...filters, filter]);
  };

  // No filters, display the filters button
  if (filters.length === 0) {
    return (
      <div className="-ml-1">
        <AddFilterButton addFilter={addFilter} label="Filters" />
      </div>
    );
  }

  return (
    <div className="gap-2 flex items-center">
      {filters.map((filter, i) => (
        <EditableFilterButton
          key={i}
          filter={filter}
          editFilter={(filter) => {
            const newFilters = [...filters];
            newFilters[i] = filter;
            setFilters(newFilters);
          }}
          deleteFilter={() => {
            const newFilters = [...filters];
            newFilters.splice(i, 1);
            setFilters(newFilters);
          }}
        />
      ))}
      <AddFilterButton addFilter={addFilter} label="" />
    </div>
  );
}

function filterOperand(isEqual: boolean, isRegex: boolean) {
  return isRegex ? (isEqual ? "=~" : "!~") : isEqual ? "=" : "!=";
}

function AddFilterButton(props: {
  addFilter: (filter: LabelFilter) => void;
  label: string;
}) {
  const { addFilter, label } = props;
  const [isEditing, setIsEditing] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [hasError, setHasError] = useState(false);

  const tryParse = (text: string) => {
    const match = text.match(/^([^=!~]+)([=!~]+)(.+)$/);
    if (!match) return null;
    const [, labelKey, operator, value] = match;
    return {
      label: labelKey.trim(),
      value: value.trim(),
      exclude: operator.startsWith("!"),
      regex: operator.includes("~"),
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = tryParse(filterText);
    if (parsed) {
      addFilter(parsed);
      setFilterText("");
      setHasError(false);
      setIsEditing(false);
    } else {
      setHasError(true);
    }
  };

  const handleBlur = () => {
    // Close only if input is empty; keep open with error if text was entered
    if (!filterText.trim()) {
      setIsEditing(false);
      setHasError(false);
    } else {
      const parsed = tryParse(filterText);
      if (!parsed) setHasError(true);
    }
  };

  if (isEditing) {
    return (
      <div className="flex flex-col gap-1">
        <form onSubmit={handleSubmit} className="flex">
          <input
            type="text"
            value={filterText}
            onChange={(e) => { setFilterText(e.target.value); setHasError(false); }}
            placeholder="label=value"
            aria-label="Add filter"
            aria-describedby={hasError ? "filter-error" : "filter-hint"}
            aria-invalid={hasError}
            className={cn(
              "px-2 py-1 text-sm border rounded-sm focus:outline-hidden focus:ring-1 focus:ring-primary",
              hasError && "border-destructive focus:ring-destructive"
            )}
            autoFocus
            onBlur={handleBlur}
          />
        </form>
        {/* {hasError ? (
          <span id="filter-error" className="text-xs text-destructive">
            Use format: <code className="font-mono">label=value</code>,{" "}
            <code className="font-mono">label!=value</code>, or{" "}
            <code className="font-mono">label=~regex</code>
          </span>
        ) : (
          <span id="filter-hint" className="text-xs text-muted-foreground">
            <code className="font-mono">label=value</code> ·{" "}
            <code className="font-mono">label!=value</code> ·{" "}
            <code className="font-mono">label=~regex</code>
          </span>
        )} */}
      </div>
    );
  }

  return (
    <Button
      variant="secondary"
      size="xs"
      className={cn(
        "w-full text-muted-foreground justify-between bg-background font-normal hover:bg-secondary",
        {
          "px-3": label.length > 0,
        }
      )}
      onClick={() => setIsEditing(true)}
    >
      <ListFilter
        size={16}
        strokeWidth={2}
        className="shrink-0 text-muted-foreground/80"
        aria-hidden="true"
      />
      {label}
    </Button>
  );
}

function EditableFilterButton(props: {
  filter: LabelFilter;
  editFilter: (filter: LabelFilter) => void;
  deleteFilter: () => void;
}) {
  const { filter, editFilter, deleteFilter } = props;

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(
    `${filter.label}${filterOperand(!filter.exclude, filter.regex)}${
      filter.value
    }`
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const match = editValue.match(/^([^=!~]+)([=!~]+)(.+)$/);
    if (match) {
      const [, label, operator, value] = match;
      const isExclude = operator.startsWith("!");
      const isRegex = operator.includes("~");

      const updatedFilter = {
        label: label.trim(),
        value: value.trim(),
        exclude: isExclude,
        regex: isRegex,
      };

      editFilter(updatedFilter);
      setIsEditing(false);
    }
  };

  return (
    <div
      className="flex items-center px-2 py-0.5 bg-secondary rounded-sm shadow-xs border-border/20"
    >
      {isEditing ? (
        <form onSubmit={handleSubmit} className="flex">
          <input
            autoFocus
            aria-label="Edit filter"
            className="bg-transparent outline-hidden w-full min-w-[150px]"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={(e) => handleSubmit(e)}
          />
        </form>
      ) : (
        <button onClick={() => setIsEditing(true)}>
          <span className="font-semibold font-mono">{filter.label}</span>
          <span className="text-muted-foreground">
            {filterOperand(!filter.exclude, filter.regex)}
          </span>
          <span className="truncate">{filter.value}</span>
        </button>
      )}
      <button
        className="ml-1"
        title="Remove filter"
        aria-label="Delete filter"
        onClick={deleteFilter}
      >
        <XIcon size={14} className="text-muted-foreground" />
      </button>
    </div>
  );
}
