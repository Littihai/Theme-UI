import { openConfirm } from "@/overlays/ConfirmDialog";
import { toast } from "@/overlays/Toast";

/**
 * App-wide feedback: a confirmation Modal (overlays/ConfirmDialog) when the user must decide before going on,
 * a Toast (overlays/Toast) when the app only reports what happened. A mistake the user must fix in a form
 * belongs next to the field (Field `error`, InlineError), not in a toast.
 */

/** Confirmation modal — resolves true when the user confirms. */
export async function confirmDialog(opts: {
  title: string;
  text?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  /** with `danger`: the action deletes something (a trash icon, and the text drops into it) */
  trash?: boolean;
  icon?: "warning" | "question" | "info";
}): Promise<boolean> {
  const { danger, ...rest } = opts;
  return (await openConfirm({ ...rest, tone: danger ? "danger" : "primary" })).ok;
}

/**
 * Asks for a piece of text that must not be empty (e.g. why a request is not approved).
 * Resolves the trimmed text, or null when the user cancels.
 */
export async function reasonDialog(opts: {
  title: string;
  placeholder?: string;
  initial?: string;
  confirmText?: string;
  requiredText: string;
}): Promise<string | null> {
  const r = await openConfirm({
    title: opts.title,
    confirmText: opts.confirmText,
    tone: "danger",
    input: { placeholder: opts.placeholder, initial: opts.initial, requiredText: opts.requiredText, maxLength: 500 },
  });
  return r.ok ? r.value ?? "" : null;
}

/** Something was saved or done; closes itself. */
export function toastSuccess(title: string, text?: string) {
  toast({ tone: "success", title, text });
}

/** Something failed; stays until the user closes it. */
export function toastError(title: string, text?: string) {
  toast({ tone: "error", title, text });
}

/** An incoming real-time notification; clicking it opens what it is about. */
export function toastInfo(title: string, onClick?: () => void) {
  toast({ tone: "info", title, onOpen: onClick });
}
