/**
 * When the app uses its phone layout (off-canvas nav drawer, stacked settings
 * screens): on phones, and on touch tablets in either orientation.
 *
 * Width alone cannot tell a tablet (768–1366 px) from a laptop, so the primary
 * input decides: a touch screen as the main pointer (`pointer: coarse`) gets the
 * phone layout up to TABLET_MAX; a mouse keeps the desktop rail however narrow
 * the window, until it is phone-sized.
 */
export const PHONE_MAX = 768;
export const TABLET_MAX = 1400;
export const TOUCH_QUERY = "(pointer: coarse)";

export function usesPhoneLayout(width: number, touch: boolean): boolean {
  return width < PHONE_MAX || (touch && width < TABLET_MAX);
}
