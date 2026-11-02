/**
 * Everything the person can customise about how the app looks and is laid out, all per device (localStorage, like the
 * theme and the language). Each choice is one attribute on `<html>`; CSS reads them (styles/tokens.css, styles/ui.css,
 * styles/layout.css) and `public/theme-init.js` sets them before first paint. A default has NO attribute, so the
 * stylesheet's own values stay the default look and a cleared storage means exactly that.
 *
 * Colour scheme (light / dark / system) and text size have their own providers; this file is the rest.
 */

import { storageKey } from "@/constants/brand";

export interface Choice<T extends string> {
  /** localStorage key */
  key: string;
  /** attribute on <html> */
  attr: string;
  default: T;
  values: readonly T[];
}

const choice = <T extends string>(name: string, def: T, values: readonly T[]): Choice<T> => ({
  key: storageKey(name),
  attr: `data-${name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`,
  default: def,
  values,
});

export type Accent = "steel" | "teal" | "green" | "violet" | "rose" | "amber" | "indigo" | "azure" | "slate";
export type Contrast = "standard" | "high";
export type Motion = "auto" | "reduce" | "full";
/** typeface; every option reads Thai */
export type FontFamily = "inter" | "plex" | "sarabun" | "system";
/** the grey palette behind every surface */
export type GreyBase = "slate" | "gray" | "zinc" | "neutral" | "stone";
export type Radius = "none" | "sm" | "md" | "lg" | "xl";
/** where the main menu lives: a bar under the top bar, a sidebar, or a sidebar of icons only */
export type NavLayout = "top" | "side" | "rail";
export type Container = "narrow" | "standard" | "wide" | "fluid";
/** what stays on screen while the page scrolls: the top bar only, the top bar and the menu, nothing */
export type Sticky = "header" | "all" | "none";
/** the bars and side panels: flush with the window edges, or inset and floating on a shadow */
export type Edges = "attached" | "floating";

export interface AppearanceState {
  accent: Accent;
  contrast: Contrast;
  motion: Motion;
  font: FontFamily;
  base: GreyBase;
  radius: Radius;
  nav: NavLayout;
  container: Container;
  sticky: Sticky;
  navStyle: Edges;
  panelStyle: Edges;
}

export const CHOICES: { [K in keyof AppearanceState]: Choice<AppearanceState[K]> } = {
  accent: choice<Accent>("accent", "steel", ["steel", "teal", "green", "violet", "rose", "amber", "indigo", "azure", "slate"]),
  contrast: choice<Contrast>("contrast", "standard", ["standard", "high"]),
  motion: choice<Motion>("motion", "auto", ["auto", "reduce", "full"]),
  font: choice<FontFamily>("font", "inter", ["inter", "plex", "sarabun", "system"]),
  base: choice<GreyBase>("base", "slate", ["slate", "gray", "zinc", "neutral", "stone"]),
  radius: choice<Radius>("radius", "sm", ["none", "sm", "md", "lg", "xl"]),
  nav: choice<NavLayout>("nav", "top", ["top", "side", "rail"]),
  container: choice<Container>("container", "standard", ["narrow", "standard", "wide", "fluid"]),
  sticky: choice<Sticky>("sticky", "header", ["header", "all", "none"]),
  navStyle: choice<Edges>("navStyle", "attached", ["attached", "floating"]),
  panelStyle: choice<Edges>("panelStyle", "attached", ["attached", "floating"]),
};

export const DEFAULTS: AppearanceState = Object.fromEntries(
  Object.entries(CHOICES).map(([k, c]) => [k, c.default]),
) as unknown as AppearanceState;

/** `swatch` is the light-theme colour, shown on the picker; the ramp itself lives in tokens.css. */
export const ACCENTS: readonly { id: Accent; swatch: string }[] = [
  { id: "steel", swatch: "#066fd1" },
  { id: "azure", swatch: "#0b78a8" },
  { id: "teal", swatch: "#2f7f86" },
  { id: "green", swatch: "#3f7f58" },
  { id: "indigo", swatch: "#4c58c4" },
  { id: "violet", swatch: "#6b5fb0" },
  { id: "rose", swatch: "#b0566f" },
  { id: "amber", swatch: "#a8612a" },
  { id: "slate", swatch: "#4f6076" },
];

/** Corner of the radius preview, in px (the real values are the --radius-* tokens). */
export const RADIUS_PREVIEW: Record<Radius, number> = { none: 0, sm: 4, md: 8, lg: 12, xl: 18 };

// the keys the first version used, kept so a saved choice survives the move to this table
export const ACCENT_KEY = CHOICES.accent.key;
export const CONTRAST_KEY = CHOICES.contrast.key;
export const MOTION_KEY = CHOICES.motion.key;

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null; // storage blocked — the defaults
  }
}

export function saved<K extends keyof AppearanceState>(k: K): AppearanceState[K] {
  const c = CHOICES[k] as Choice<AppearanceState[K]>;
  const v = read(c.key);
  return c.values.includes(v as AppearanceState[K]) ? (v as AppearanceState[K]) : c.default;
}

export function savedAll(): AppearanceState {
  return Object.fromEntries(Object.keys(CHOICES).map((k) => [k, saved(k as keyof AppearanceState)])) as unknown as AppearanceState;
}

export function store<K extends keyof AppearanceState>(k: K, v: AppearanceState[K]) {
  const c = CHOICES[k];
  try {
    if (v === c.default) localStorage.removeItem(c.key);
    else localStorage.setItem(c.key, v);
  } catch {
    /* not remembered, still applied now */
  }
}

/** Put every choice on <html>; a default removes its attribute so the stylesheet is untouched. */
export function applyAppearance(a: AppearanceState) {
  const root = document.documentElement;
  for (const k of Object.keys(CHOICES) as (keyof AppearanceState)[]) {
    const c = CHOICES[k];
    if (a[k] === c.default) root.removeAttribute(c.attr);
    else root.setAttribute(c.attr, a[k]);
  }
}

/** True while anything differs from the defaults. */
export function isCustomised(a: AppearanceState): boolean {
  return (Object.keys(CHOICES) as (keyof AppearanceState)[]).some((k) => a[k] !== CHOICES[k].default);
}
