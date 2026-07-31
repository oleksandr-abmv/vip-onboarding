import { useEffect, useRef } from 'react';

/**
 * Focus an element on mount **without letting the browser scroll to reveal it**.
 * Use this instead of the `autoFocus` attribute anywhere inside an overlay.
 *
 * Plain `autoFocus` in a bottom sheet is a layout-jump bug. The panel enters with
 * `sheetSlideUp`, so on the frame it mounts the field still sits a full panel
 * height below the fold; the browser then scrolls the nearest scrollable ancestor
 * to bring it into view. Those ancestors are clipped rather than scrollable by
 * design, so there is no scrollbar to explain what happened: the whole screen
 * lurches up by the panel's height and unwinds again as the animation lands.
 * `preventScroll` is the supported way to opt out of that reveal.
 */
export function useAutoFocus<T extends HTMLElement>(enabled = true) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (enabled) ref.current?.focus({ preventScroll: true });
  }, [enabled]);
  return ref;
}
