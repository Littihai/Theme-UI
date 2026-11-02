import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { useI18n } from "@/app/providers/I18nProvider";
import type { StatusTone } from "@/types";

export interface SelectOption {
  value: string;
  label: string;
  /** a small coloured dot before the label (a status), always paired with the text */
  tone?: StatusTone;
  disabled?: boolean;
  /** options that share a group are listed under its heading (consecutive options, like <optgroup>) */
  group?: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  /** a list long enough to need it: the field becomes a text box that filters the options */
  searchable?: boolean;
  /** `sm` for table cells and dense toolbars */
  size?: "md" | "sm";
  id?: string;
  "aria-label"?: string;
  title?: string;
  invalid?: boolean;
  disabled?: boolean;
  /** an empty value stops the surrounding <form> from submitting, as a native required select does */
  required?: boolean;
  autoFocus?: boolean;
  /** a filter's name shown in the trigger ("Status: Pending"); the trigger is highlighted while it filters */
  prefix?: string;
  /** with `prefix`: the value that means "not filtering" (default "") */
  emptyValue?: string;
  style?: CSSProperties;
}

const DOT: Record<StatusTone, string> = {
  ok: "var(--tone-ok-solid)",
  warn: "var(--tone-warn-solid)",
  stop: "var(--tone-stop-solid)",
  accent: "var(--color-accent)",
  neutral: "var(--color-neutral-400)",
};

function highlight(label: string, q: string): ReactNode {
  if (!q) return label;
  const at = label.toLocaleLowerCase().indexOf(q.toLocaleLowerCase());
  if (at < 0) return label;
  return <>{label.slice(0, at)}<mark>{label.slice(at, at + q.length)}</mark>{label.slice(at + q.length)}</>;
}

/**
 * The platform's drop-down: a field-height trigger, a floating list with status dots, a tick on the chosen row
 * and disabled rows that say why by their label. ↑↓ move, Enter picks, Esc closes and returns the focus,
 * typing a letter jumps to the next match. `searchable` turns the trigger into a combobox that filters as you type.
 */
export function Select({ value, onChange, options, placeholder, searchable, size = "md", id, title, invalid, disabled, required, autoFocus, prefix, emptyValue = "", style, ...rest }: SelectProps) {
  const { t } = useI18n();
  const auto = useId();
  const baseId = id ?? `sel-${auto}`;
  const listId = `${baseId}-list`;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(-1);
  const box = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  // the focus coming back after a pick must not open the list again
  const quiet = useRef(false);

  const chosen = options.find((o) => o.value === value);
  const shown = useMemo(
    () => (searchable && query ? options.filter((o) => o.label.toLocaleLowerCase().includes(query.toLocaleLowerCase())) : options),
    [options, query, searchable],
  );

  // a click anywhere else closes the list
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) close(false); };
    document.addEventListener("mousedown", away);
    return () => document.removeEventListener("mousedown", away);
  });

  useEffect(() => {
    if (autoFocus) (searchable ? input : trigger).current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (open && active >= 0) list.current?.querySelector(`#${CSS.escape(`${baseId}-o${active}`)}`)?.scrollIntoView({ block: "nearest" });
  }, [open, active, baseId]);

  function openList() {
    if (disabled) return;
    const at = shown.findIndex((o) => o.value === value);
    setActive(at >= 0 ? at : shown.findIndex((o) => !o.disabled));
    setOpen(true);
  }
  function close(refocus: boolean) {
    setOpen(false);
    setQuery("");
    if (refocus) { quiet.current = true; (searchable ? input : trigger).current?.focus(); quiet.current = false; }
  }
  function pick(o: SelectOption | undefined) {
    if (!o || o.disabled) return;
    onChange(o.value);
    close(true);
  }
  function step(from: number, dir: 1 | -1) {
    for (let i = 1; i <= shown.length; i++) {
      const n = (from + dir * i + shown.length) % shown.length;
      if (!shown[n].disabled) return n;
    }
    return from;
  }
  function onKey(e: KeyboardEvent) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) { openList(); return; }
      setActive((a) => step(a < 0 ? (e.key === "ArrowDown" ? -1 : 0) : a, e.key === "ArrowDown" ? 1 : -1));
    } else if (e.key === "Home" && open) { e.preventDefault(); setActive(step(-1, 1)); }
    else if (e.key === "End" && open) { e.preventDefault(); setActive(step(shown.length, -1)); }
    else if (e.key === "Enter" || (e.key === " " && !searchable)) {
      e.preventDefault();
      if (open) pick(shown[active]); else openList();
    } else if (e.key === "Escape" && open) { e.preventDefault(); e.stopPropagation(); close(true); }
    else if (e.key === "Tab" && open) close(false);
    else if (!searchable && e.key.length === 1 && /\S/.test(e.key)) {
      // type-ahead: the next option whose label starts with the letter
      const k = e.key.toLocaleLowerCase();
      const from = open ? active : options.findIndex((o) => o.value === value);
      for (let i = 1; i <= shown.length; i++) {
        const n = (from + i + shown.length) % shown.length;
        if (!shown[n].disabled && shown[n].label.toLocaleLowerCase().startsWith(k)) {
          if (open) setActive(n); else onChange(shown[n].value);
          break;
        }
      }
    }
  }

  const activeId = open && active >= 0 && shown[active] ? `${baseId}-o${active}` : undefined;

  return (
    <div ref={box} className={size === "sm" ? "sel sel-sm" : "sel"} style={style} title={title}>
      {searchable ? (
        <div className="sel-search" data-invalid={invalid || undefined}>
          <Icon name="search" size={14} />
          <input
            ref={input}
            id={baseId}
            type="text"
            role="combobox"
            aria-label={rest["aria-label"]}
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls={listId}
            aria-activedescendant={activeId}
            aria-invalid={invalid || undefined}
            aria-required={required || undefined}
            disabled={disabled}
            placeholder={chosen?.label ?? placeholder ?? t("select.search")}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActive(0); if (!open) setOpen(true); }}
            onFocus={() => { if (!open && !quiet.current) openList(); }}
            onClick={() => { if (!open) openList(); }}
            onKeyDown={onKey}
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button type="button" className="btn-icon" aria-label={t("select.clear")} onClick={() => { setQuery(""); input.current?.focus(); }} style={{ padding: 6 }}>
              <Icon name="x" size={14} />
            </button>
          )}
        </div>
      ) : (
        <button
          ref={trigger}
          id={baseId}
          type="button"
          className="sel-trigger"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={activeId}
          aria-label={rest["aria-label"]}
          aria-invalid={invalid || undefined}
          aria-required={required || undefined}
          data-filled={prefix && value !== emptyValue ? "" : undefined}
          disabled={disabled}
          onClick={() => (open ? close(false) : openList())}
          onKeyDown={onKey}
        >
          <span className="sel-value" data-empty={chosen ? undefined : ""}>
            {prefix && <span className="sel-prefix">{prefix}:</span>}
            {chosen?.tone && <span className="sel-dot" aria-hidden style={{ background: DOT[chosen.tone] }} />}
            {chosen?.label ?? placeholder ?? t("select.placeholder")}
          </span>
          <Icon name={open ? "chevronUp" : "chevronDown"} size={16} color="var(--color-neutral-600)" />
        </button>
      )}

      {open && (
        shown.length === 0 ? (
          <div id={listId} className="sel-list sel-empty menu-slide" role="status" onClick={(e) => e.preventDefault()}>
            {query ? (
              <>
                <strong style={{ fontWeight: 600 }}>{t("select.noMatch", { q: query })}</strong>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--color-neutral-600)" }}>{t("select.noMatchHint")}</span>
              </>
            ) : <span style={{ color: "var(--color-neutral-600)" }}>{t("select.none")}</span>}
          </div>
        ) : (
          // inside a <label> (DataKit Field) a click would also "click" the trigger and reopen the list
          <ul ref={list} id={listId} role="listbox" aria-label={rest["aria-label"]} className="sel-list menu-slide" onClick={(e) => e.preventDefault()}>
            {shown.map((o, i) => [
              o.group && o.group !== shown[i - 1]?.group && (
                <li key={`g-${i}`} role="presentation" className="sel-group">{o.group}</li>
              ),
              <li
                key={o.value}
                id={`${baseId}-o${i}`}
                role="option"
                aria-selected={o.value === value}
                aria-disabled={o.disabled || undefined}
                data-active={i === active ? "" : undefined}
                className="sel-opt"
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => { if (!o.disabled) setActive(i); }}
                onClick={() => pick(o)}
              >
                {o.tone && <span className="sel-dot" aria-hidden style={{ background: o.disabled ? DOT.neutral : DOT[o.tone] }} />}
                <span style={{ flex: 1, minWidth: 0 }}>{highlight(o.label, searchable ? query : "")}</span>
                {o.value === value && <Icon name="check" size={16} />}
              </li>,
            ])}
          </ul>
        )
      )}
      {required && (
        // the native "fill this in" check of the surrounding form; after the trigger so a wrapping <label> still targets the trigger
        <input
          className="sel-native"
          tabIndex={-1}
          aria-hidden
          required
          value={value}
          onChange={() => {}}
          // the browser focuses the invalid input itself after this event: hand the focus to the visible control afterwards
          onInvalid={() => setTimeout(() => { quiet.current = true; (searchable ? input : trigger).current?.focus(); quiet.current = false; })}
        />
      )}
    </div>
  );
}
