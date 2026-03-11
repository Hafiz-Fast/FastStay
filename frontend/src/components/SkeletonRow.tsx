import React, { useEffect } from "react";

// Inject shimmer keyframe once into <head>
function injectShimmerKeyframes() {
  if (typeof document === "undefined") return;
  if (document.getElementById("skeleton-shimmer-kf")) return;
  const style = document.createElement("style");
  style.id = "skeleton-shimmer-kf";
  style.textContent = `
    @keyframes skeletonShimmer {
      0%   { background-position: -200% 0; }
      100% { background-position:  200% 0; }
    }
  `;
  document.head.appendChild(style);
}

const shimmerStyle: React.CSSProperties = {
  display: "block",
  borderRadius: "6px",
  background: "linear-gradient(90deg, #e0d4c8 25%, #f5ece3 50%, #e0d4c8 75%)",
  backgroundSize: "200% 100%",
  animation: "skeletonShimmer 1.4s ease-in-out infinite",
};

// ---------------------------------------------------------------------------
// SkeletonBlock — single shimmer bar, use inside cards / any non-table element
// ---------------------------------------------------------------------------
export const SkeletonBlock: React.FC<{ width?: string; height?: string }> = ({
  width = "60%",
  height = "26px",
}) => {
  useEffect(() => { injectShimmerKeyframes(); }, []);
  return (
    <span style={{ ...shimmerStyle, width, height, marginTop: "4px" }} />
  );
};

// ---------------------------------------------------------------------------
// SkeletonRow — N shimmer rows inside a <tbody>, use while a table loads
// ---------------------------------------------------------------------------
interface SkeletonRowProps {
  cols: number;
  rows?: number;
}

const WIDTHS = ["68%", "38%", "55%", "45%", "30%", "60%", "50%"];

const tdStyle: React.CSSProperties = {
  padding: "14px 12px",
  borderBottom: "1px solid #dfd6cb",
};

const SkeletonRow: React.FC<SkeletonRowProps> = ({ cols, rows = 7 }) => {
  useEffect(() => { injectShimmerKeyframes(); }, []);

  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} style={{ opacity: 1 - r * 0.08 }}>
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} style={tdStyle}>
              <span style={{ ...shimmerStyle, height: "15px", width: WIDTHS[c % WIDTHS.length] }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

export default SkeletonRow;
