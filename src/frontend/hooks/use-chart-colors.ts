import { useEffect, useState } from "react";

export type ChartColors = {
  chart1: string;
  chart2: string;
  grid: string;
  text: string;
};

// Reads the chart palette from the active CSS custom properties so the recharts
// visuals follow the current theme (light/dark). Falls back to sensible
// defaults during SSR / before the stylesheet is applied.
export function readChartColors(): ChartColors {
  if (typeof window === "undefined") {
    return { chart1: "#6d4ad8", chart2: "#9b7ff0", grid: "#e5e7eb", text: "#6b7280" };
  }
  const styles = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) =>
    styles.getPropertyValue(name).trim() || fallback;
  return {
    chart1: read("--chart-1", "#6d4ad8"),
    chart2: read("--chart-2", "#9b7ff0"),
    grid: read("--border", "#e5e7eb"),
    text: read("--muted-foreground", "#6b7280"),
  };
}

// Keeps chart colors in sync with theme changes by observing the root element's
// class/style/data-theme attributes.
export function useChartColors(): ChartColors {
  const [colors, setColors] = useState<ChartColors>(() => readChartColors());
  useEffect(() => {
    const observer = new MutationObserver(() => setColors(readChartColors()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme"],
    });
    setColors(readChartColors());
    return () => observer.disconnect();
  }, []);
  return colors;
}
