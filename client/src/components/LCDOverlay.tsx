export function LCDOverlay() {
  return (
    <>
      <div className="lcd-pixel-grid" aria-hidden="true" />
      <div className="lcd-scanlines" aria-hidden="true" />
      <div className="lcd-noise" aria-hidden="true" />
    </>
  );
}
