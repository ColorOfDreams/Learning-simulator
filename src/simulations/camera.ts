export function getResponsiveFov(baseFov: number, aspect: number): number {
  if (!window.matchMedia("(max-width: 900px)").matches) return baseFov;
  const halfAngle = (baseFov * Math.PI) / 360;
  return (
    (360 / Math.PI) *
    Math.atan(Math.tan(halfAngle) * Math.max(1, 1.35 / Math.max(aspect, 0.1)))
  );
}
