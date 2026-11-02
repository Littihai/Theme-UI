/**
 * An on/off switch for settings rows. The real control is a checkbox (hidden but focusable), so a
 * wrapping <label> still forwards clicks and space toggles it; the track and thumb are CSS
 * (`.switch` in styles/ui.css) driven by :checked.
 */
export function Switch({ checked, onChange, disabled, ariaLabel }: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  return (
    <span className="switch">
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="switch-track" aria-hidden />
    </span>
  );
}
