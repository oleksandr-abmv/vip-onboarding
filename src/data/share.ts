// ─── Sharing ─────────────────────────────────────────────────────────────────
//
// One way to hand something to someone else, used by the collection page's nav
// bar and the product page's. It prefers the OS share sheet (`navigator.share`),
// which is what a phone expects and what puts the app in front of the other
// person, and falls back to the clipboard where the browser has no sheet.
//
// The caller decides what to say afterwards, so both pages confirm through the
// same snackbar the rest of the app uses rather than inventing their own.

export type ShareOutcome = 'shared' | 'cancelled' | 'copied' | 'failed';

export interface SharePayload {
  title: string;
  text: string;
  url: string;
}

export async function shareContent(payload: SharePayload): Promise<ShareOutcome> {
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share(payload);
      return 'shared';
    } catch (err) {
      // Dismissing the OS sheet rejects with AbortError. That is a decision, not
      // a failure, and it must not fall through to the clipboard - copying
      // something the user just backed out of is worse than doing nothing.
      if (err instanceof DOMException && err.name === 'AbortError') return 'cancelled';
    }
  }
  try {
    await navigator.clipboard.writeText(`${payload.text}\n${payload.url}`);
    return 'copied';
  } catch {
    return 'failed';
  }
}

/**
 * What the snackbar should say. `null` means stay quiet: the OS sheet already
 * confirmed the hand-off, and a cancel was deliberate.
 */
export const shareMessage = (outcome: ShareOutcome): string | null => {
  if (outcome === 'copied') return 'Copied to your clipboard';
  if (outcome === 'failed') return 'Could not share this right now';
  return null;
};
