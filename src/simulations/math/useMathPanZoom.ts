import { useState, useRef, useCallback } from 'react';
import type React from 'react';

export interface MathPanZoom {
  ox: number;
  oy: number;
  scale: number;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  svgHandlers: {
    onWheel: React.WheelEventHandler<SVGSVGElement>;
    onMouseDown: React.MouseEventHandler<SVGSVGElement>;
    onMouseMove: React.MouseEventHandler<SVGSVGElement>;
    onMouseUp: React.MouseEventHandler<SVGSVGElement>;
    onMouseLeave: React.MouseEventHandler<SVGSVGElement>;
    style: React.CSSProperties;
  };
  groupTransform: string;
  resetView(): void;
  isDirty: boolean;
}

export function useMathPanZoom(defaultScale: number, W: number, H: number): MathPanZoom {
  const [ox, setOx] = useState(W / 2);
  const [oy, setOy] = useState(H / 2);
  const [scale, setScale] = useState(defaultScale);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef({ x: 0, y: 0 });

  const onWheel = useCallback((e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const svgX = (e.clientX - rect.left) * (W / rect.width);
    const svgY = (e.clientY - rect.top) * (H / rect.height);
    const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
    setScale(prev => {
      const next = Math.min(Math.max(prev * factor, defaultScale * 0.08), defaultScale * 25);
      const r = next / prev;
      setOx(o => svgX + (o - svgX) * r);
      setOy(o => svgY + (o - svgY) * r);
      return next;
    });
  }, [W, H, defaultScale]);

  const onMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
    dragRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!dragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const dx = (e.clientX - dragRef.current.x) * (W / rect.width);
    const dy = (e.clientY - dragRef.current.y) * (H / rect.height);
    setOx(o => o + dx);
    setOy(o => o + dy);
    dragRef.current = { x: e.clientX, y: e.clientY };
  }, [dragging, W, H]);

  const onMouseUp = useCallback(() => setDragging(false), []);

  const resetView = useCallback(() => {
    setOx(W / 2);
    setOy(H / 2);
    setScale(defaultScale);
  }, [W, H, defaultScale]);

  const zoom = scale / defaultScale;

  return {
    ox, oy, scale,
    xMin: -ox / scale,
    xMax: (W - ox) / scale,
    yMin: -(H - oy) / scale,
    yMax: oy / scale,
    svgHandlers: {
      onWheel, onMouseDown, onMouseMove, onMouseUp,
      onMouseLeave: onMouseUp,
      style: { cursor: dragging ? 'grabbing' : 'grab' },
    },
    groupTransform: `translate(${ox},${oy}) scale(${zoom}) translate(${-W / 2},${-H / 2})`,
    resetView,
    isDirty: Math.abs(ox - W / 2) > 1 || Math.abs(oy - H / 2) > 1 || Math.abs(scale - defaultScale) > 0.5,
  };
}
