import { useCallback, useEffect, useRef, type RefObject } from "react";
import type { Box, Point } from "./layout";

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 3;
const MAX_FIT_ZOOM = 1.4;
/** Pointer travel (px) before a press counts as a drag rather than a click. */
const DRAG_THRESHOLD = 4;

/**
 * Pan (drag), wheel / pinch zoom for an SVG viewport. The transform is written straight to the
 * world <g> (no React re-render per pointer move). `movedRef` is true when the last press was a
 * drag, so click handlers can ignore the click that ends a pan.
 */
export function usePanZoom(viewRef: RefObject<HTMLElement | null>, worldRef: RefObject<SVGGElement | null>) {
  const t = useRef({ k: 1, x: 0, y: 0 });
  const movedRef = useRef(false);

  const apply = useCallback(() => {
    const { k, x, y } = t.current;
    worldRef.current?.setAttribute("transform", `translate(${x},${y}) scale(${k})`);
  }, [worldRef]);

  const zoomAt = useCallback((factor: number, cx: number, cy: number) => {
    const s = t.current;
    const k = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, s.k * factor));
    const f = k / s.k;
    s.x = cx - (cx - s.x) * f;
    s.y = cy - (cy - s.y) * f;
    s.k = k;
    apply();
  }, [apply]);

  /** Zooms so `box` (world coordinates) fills the viewport. No-op while the viewport is hidden. */
  const fit = useCallback((box: Box) => {
    const v = viewRef.current?.getBoundingClientRect();
    if (!v || !v.width) return;
    const s = t.current;
    s.k = Math.min(v.width / box.w, v.height / box.h, MAX_FIT_ZOOM) * 0.95;
    s.x = (v.width - box.w * s.k) / 2 - box.x * s.k;
    s.y = (v.height - box.h * s.k) / 2 - box.y * s.k;
    apply();
  }, [viewRef, apply]);

  const zoomAtCenter = useCallback((factor: number) => {
    const r = viewRef.current?.getBoundingClientRect();
    if (r) zoomAt(factor, r.width / 2, r.height / 2);
  }, [viewRef, zoomAt]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const pointers = new Map<number, Point>();
    let last: Point = { x: 0, y: 0 };
    let pinch: number | null = null;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = view.getBoundingClientRect();
      // ctrlKey = trackpad pinch gesture, which reports much smaller deltas.
      zoomAt(Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015)), e.clientX - r.left, e.clientY - r.top);
    };
    const onDown = (e: PointerEvent) => {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      movedRef.current = false;
      last = { x: e.clientX, y: e.clientY };
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()] as [Point, Point];
        pinch = Math.hypot(a.x - b.x, a.y - b.y);
      }
    };
    const onMove = (e: PointerEvent) => {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2 && pinch) {
        const [a, b] = [...pointers.values()] as [Point, Point];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        const r = view.getBoundingClientRect();
        zoomAt(d / pinch, (a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top);
        pinch = d;
        movedRef.current = true;
        return;
      }
      const dx = e.clientX - last.x, dy = e.clientY - last.y;
      if (!movedRef.current && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      if (!movedRef.current) {
        movedRef.current = true;
        view.classList.add("dragging");
        try { view.setPointerCapture(e.pointerId); } catch { /* pointer already gone */ }
      }
      t.current.x += dx;
      t.current.y += dy;
      last = { x: e.clientX, y: e.clientY };
      apply();
    };
    const onUp = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinch = null;
      view.classList.remove("dragging");
    };

    view.addEventListener("wheel", onWheel, { passive: false });
    view.addEventListener("pointerdown", onDown);
    view.addEventListener("pointermove", onMove);
    view.addEventListener("pointerup", onUp);
    view.addEventListener("pointercancel", onUp);
    return () => {
      view.removeEventListener("wheel", onWheel);
      view.removeEventListener("pointerdown", onDown);
      view.removeEventListener("pointermove", onMove);
      view.removeEventListener("pointerup", onUp);
      view.removeEventListener("pointercancel", onUp);
    };
  }, [viewRef, zoomAt, apply]);

  return { fit, zoomAtCenter, movedRef };
}
