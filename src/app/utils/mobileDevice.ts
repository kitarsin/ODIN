/** Detect mobile browsers even when they request a desktop-sized viewport. */
export function isMobileDevice(): boolean {
  const ua = navigator.userAgent;
  return /Android|iPhone|iPad|iPod|Mobile|IEMobile|Opera Mini/i.test(ua)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    || window.matchMedia('(max-width: 767px) and (pointer: coarse)').matches;
}
