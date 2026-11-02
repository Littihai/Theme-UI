import { useUi } from "@/app/providers/UiProvider";
import { Tabs } from "./Tabs";
import { Icon } from "./Icon";

/**
 * The tab bar of a module page: the shared `Tabs` row (underlined on a desktop, wrapping pills on a phone so
 * nothing scrolls sideways). Each tab is a page of the module; `help` adds the manual button at the end of the row.
 */
export function ModuleTabs({ tabs, active, onPick, label, help }: {
  tabs: { id: string; label: string }[];
  active: string;
  onPick: (id: string) => void;
  label?: string;
  /** the manual, open at this page's section */
  help?: { label: string; onClick: () => void };
}) {
  const { mobile } = useUi();
  return (
    <Tabs
      tabs={tabs}
      active={active}
      onPick={onPick}
      label={label}
      pills={mobile}
      trailing={help && (
        <button onClick={help.onClick} title={help.label} aria-label={help.label} className="btn-icon" style={{ color: "var(--color-accent-700)" }}>
          <Icon name="question" size={16} />
        </button>
      )}
    />
  );
}
