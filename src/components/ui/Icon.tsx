import type { ComponentType, CSSProperties } from "react";
import type { OcticonProps } from "@primer/octicons-react";
import { ICON, type IconName } from "@/constants/icons";

interface IconProps {
  name: IconName;
  size?: number;
  /** defaults to the surrounding text colour */
  color?: string;
  /** sits inside running text: aligned to the text and followed by a small gap */
  inline?: boolean;
  style?: CSSProperties;
  /** for a stylesheet to colour or move the glyph (it takes its colour from `color` by default) */
  className?: string;
}

/** A GitHub Octicon by name — the platform's only icon primitive. */
export function Icon({ name, size = 16, color = "currentColor", inline, style, className }: IconProps) {
  // the generated per-icon type omits props the component does support (style, aria-hidden)
  const Glyph = ICON[name] as ComponentType<OcticonProps>;
  const place: CSSProperties = inline ? { verticalAlign: "text-bottom", marginRight: "0.35em" } : { verticalAlign: "middle" };
  return <Glyph size={size} fill={color} aria-hidden="true" className={className} style={{ flex: "none", ...place, ...style }} />;
}
