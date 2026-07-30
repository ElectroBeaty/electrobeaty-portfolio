const iconPaths = {
  bolt: (
    <>
      <path d="M13.5 2.5 5 13h6.2l-1.1 8.5L19 10.4h-6.4l.9-7.9Z" />
    </>
  ),
  orbit: (
    <>
      <circle cx="12" cy="12" r="3.3" />
      <path d="M3.8 13.8c3.6 4.2 11.3 5.5 15.4 2.4 3.1-2.4 1.3-5.5-3.9-7.1C10 7.5 4.1 8.4 2.9 11.3c-.4 1 .1 1.9.9 2.5Z" />
      <path d="M20.2 10.2c-3.6-4.2-11.3-5.5-15.4-2.4" />
    </>
  ),
  grid: (
    <>
      <path d="M5 5h5v5H5z" />
      <path d="M14 5h5v5h-5z" />
      <path d="M5 14h5v5H5z" />
      <path d="M14 14h5v5h-5z" />
    </>
  ),
  book: (
    <>
      <path d="M4.5 5.5h6.2c.7 0 1.3.6 1.3 1.3v12.7c0-.9-.7-1.6-1.6-1.6H4.5V5.5Z" />
      <path d="M19.5 5.5h-6.2c-.7 0-1.3.6-1.3 1.3v12.7c0-.9.7-1.6 1.6-1.6h5.9V5.5Z" />
    </>
  ),
  cross: (
    <>
      <path d="M12 3.5 19.4 8v8L12 20.5 4.6 16V8L12 3.5Z" />
      <path d="m8.7 8.7 6.6 6.6" />
      <path d="m15.3 8.7-6.6 6.6" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 3.5 14.2 9l5.8 3-5.8 3L12 20.5 9.8 15 4 12l5.8-3L12 3.5Z" />
      <path d="M4.8 4.8 6 7.2l2.4 1.2L6 9.6 4.8 12 3.6 9.6 1.2 8.4l2.4-1.2 1.2-2.4Z" />
    </>
  ),
  wave: (
    <>
      <path d="M3 14c2.2-4.7 5.6-4.7 7.8 0s5.6 4.7 7.8 0" />
      <path d="M3 9.5c2.2-4.7 5.6-4.7 7.8 0s5.6 4.7 7.8 0" />
    </>
  ),
  disc: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="2.4" />
      <path d="M16.6 7.8h.1" />
      <path d="M7.4 16.2h.1" />
    </>
  ),
};

export function CategoryIcon({ icon = "sparkle", className = "category-symbol" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {iconPaths[icon] || iconPaths.sparkle}
    </svg>
  );
}
