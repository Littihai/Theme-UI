/**
 * What a scanner station says back without the screen: a short tone and a vibration for "accepted", a lower
 * double tone and a longer buzz for "refused". Both are best effort: a desktop without an audio context or a
 * device without a vibration motor simply stays silent. The tone uses the Web Audio API, so no sound file ships.
 */

type Kind = "ok" | "stop" | "tick";

let ctx: AudioContext | null = null;
const audio = (): AudioContext | null => {
  try {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx ??= new Ctor();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch { return null; }
};

function tone(freq: number, at: number, ms: number, gain = 0.08) {
  const c = audio();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "sine";
  o.frequency.value = freq;
  g.gain.value = gain;
  o.connect(g).connect(c.destination);
  o.start(c.currentTime + at);
  o.stop(c.currentTime + at + ms / 1000);
}

/** Plays the sound and vibration of a scan result. `enabled` false keeps the station quiet (an office desk). */
export function feedback(kind: Kind, enabled = true) {
  if (!enabled) return;
  try {
    if (kind === "ok") { tone(1320, 0, 90); navigator.vibrate?.(40); }
    else if (kind === "tick") { tone(880, 0, 50, 0.05); navigator.vibrate?.(15); }
    else { tone(330, 0, 160); tone(262, 0.18, 220); navigator.vibrate?.([120, 60, 160]); }
  } catch { /* no sound on this device: the screen still says it */ }
}
