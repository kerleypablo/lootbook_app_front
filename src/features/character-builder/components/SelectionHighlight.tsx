"use client";

type SelectionHighlightProps = {
  color: string;
  top: number;
};

export default function SelectionHighlight({
  color,
  top,
}: SelectionHighlightProps) {
  return (
    <div
      className="absolute left-0 w-full z-0 transition-all duration-500 ease-in-out pointer-events-none"
      style={{
        height: "150px",
        top: `${top - 15}px`,
        backgroundColor: color,
        borderRadius: "10px",
        filter: "blur(30px)",
        opacity: 1.8,
      }}
    />
  );
}
