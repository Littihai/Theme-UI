import type { ReactNode } from "react";
import { Icon } from "./Icon";
import type { IconName } from "@/constants/icons";

export interface TabDef {
  id: string;
  label: string;
  icon?: IconName;
  /** a count after the label (the inbox size, the number of rows) */
  count?: number;
  /** paint the count red: something is waiting on the person */
  hot?: boolean;
}

/**
 * The one tab row of the platform (looks in styles/ui.css): an underlined row by default, wrapping pills with
 * `pills` on a phone so nothing scrolls sideways. Module pages, the workspace and the settings sections all use it,
 * so a tab looks and behaves the same everywhere. `trailing` sits at the far end of the row (a help button).
 */
export function Tabs({ tabs, active, onPick, label, pills = false, trailing }: {
  tabs: TabDef[];
  active: string;
  onPick: (id: string) => void;
  label?: string;
  pills?: boolean;
  trailing?: ReactNode;
}) {
  return (
    <div role="tablist" aria-label={label} className={pills ? "tabs-pills" : "tabs scroll-thin"}>
      {tabs.map((x) => {
        const on = active === x.id;
        return (
          <button key={x.id} role="tab" aria-selected={on} onClick={() => onPick(x.id)} className={pills ? "tab-pill" : "tab"}>
            {x.icon && <Icon name={x.icon} size={15} />}
            {x.label}
            {x.count != null && x.count > 0 && <span className={`tab-count${x.hot ? " hot" : ""}`}>{x.count.toLocaleString()}</span>}
          </button>
        );
      })}
      {trailing && <span style={{ marginLeft: pills ? 0 : "auto", alignSelf: "center", display: "inline-flex" }}>{trailing}</span>}
    </div>
  );
}
