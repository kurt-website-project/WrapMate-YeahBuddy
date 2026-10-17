// Shared helpers for route modules.

// Left-pads a number with zeros to the given width, e.g. pad(1, 3) -> "001".
// Used to build order codes (WM-001) and SKUs (WM-PROD-001).
export function pad(num, size) {
  return String(num).padStart(size, "0");
}
