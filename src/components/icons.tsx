// Original icon set (generic, no copyrighted marks). Geometric glyphs matching
// the design handoff. `s` = pixel size, `c` = fill color.

interface IconProps {
  s?: number;
  c?: string;
}
const base = (s: number, c: string) => ({
  width: s,
  height: s,
  viewBox: "0 0 24 24",
  fill: c,
  "aria-hidden": true as const,
  style: { display: "block", flex: "0 0 auto" }
});

export const GoldIcon = ({ s = 17, c = "var(--gold)" }: IconProps) => (
  <svg {...base(s, c)}>
    <path d="M12 3l6.4 9-6.4 9-6.4-9z" />
  </svg>
);
export const NitraIcon = ({ s = 17, c = "var(--nitra)" }: IconProps) => (
  <svg {...base(s, c)}>
    <path d="M12 3l6.2 4.6-2.4 9.8H8.2L5.8 7.6z" />
  </svg>
);
export const HomeIcon = ({ s = 18, c = "currentColor" }: IconProps) => (
  <svg {...base(s, c)}>
    <path d="M3 11 12 3l9 8v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />
  </svg>
);
export const CrewIcon = ({ s = 22, c = "currentColor" }: IconProps) => (
  <svg {...base(s, c)}>
    <path d="M12 4.5a7.5 7.5 0 0 0-7.5 7.5v.6h15v-.6A7.5 7.5 0 0 0 12 4.5z" />
    <path d="M3 13h18v2.6H3z" />
  </svg>
);
export const EndIcon = ({ s = 22, c = "currentColor" }: IconProps) => (
  <svg {...base(s, c)}>
    <path d="M6 3h1.8v18H6z" />
    <path d="M8.2 4.2h10.6l-2.8 3.9 2.8 3.9H8.2z" />
  </svg>
);
export const ShopIcon = ({ s = 22, c = "currentColor" }: IconProps) => (
  <svg {...base(s, c)}>
    <path d="M4.4 11.3 11.6 4.1h7.9v7.9L12.3 19.2 4.4 11.3z" />
    <circle cx="15.7" cy="7.9" r="1.5" fill="var(--bg)" />
  </svg>
);
export const LaunchIcon = ({ s = 22, c = "currentColor" }: IconProps) => (
  <svg {...base(s, c)}>
    <path d="M12 3.2l6.4 7.6h-3.8v9.2h-5.2v-9.2H5.6z" />
  </svg>
);
export const LogIcon = ({ s = 22, c = "currentColor" }: IconProps) => (
  <svg {...base(s, c)}>
    <path d="M4 6h16v2.4H4z" />
    <path d="M4 10.8h16v2.4H4z" />
    <path d="M4 15.6h10.5v2.4H4z" />
  </svg>
);
export const WarnIcon = ({ s = 13, c = "var(--danger)" }: IconProps) => (
  <svg {...base(s, c)}>
    <path d="M12 4.2 21 19.4H3z" />
  </svg>
);
export const CheckIcon = ({ s = 13, c = "var(--ok)" }: IconProps) => (
  <svg {...base(s, c)}>
    <path d="M9.6 16.2 4.8 11.4l1.7-1.7 3.1 3.1 7.2-7.2 1.7 1.7z" />
  </svg>
);
export const ShieldIcon = ({ s = 17, c = "var(--gold)" }: IconProps) => (
  <svg {...base(s, c)}>
    <path d="M12 2 4 5v6c0 5 3.4 8.5 8 10 4.6-1.5 8-5 8-10V5z" />
  </svg>
);
export const PlusIcon = ({ s = 18, c = "currentColor" }: IconProps) => (
  <svg {...base(s, c)}>
    <path d="M11 11V4h2v7h7v2h-7v7h-2v-7H4v-2z" />
  </svg>
);
export const ImportIcon = ({ s = 17, c = "currentColor" }: IconProps) => (
  <svg {...base(s, c)}>
    <path d="M11 3h2v9.2l3.1-3.1 1.4 1.4L12 16 6.5 10.5l1.4-1.4L11 12.2zM5 19h14v2H5z" />
  </svg>
);
export const ExportIcon = ({ s = 15, c = "currentColor" }: IconProps) => (
  <svg {...base(s, c)}>
    <path d="M13 3v9.2l3.1-3.1 1.4 1.4L12 16 6.5 10.5l1.4-1.4L11 12.2V3zM5 19h14v2H5z" />
  </svg>
);
export const TrashIcon = ({ s = 17, c = "currentColor" }: IconProps) => (
  <svg {...base(s, c)}>
    <path d="M7 6V4.5A1.5 1.5 0 0 1 8.5 3h7A1.5 1.5 0 0 1 17 4.5V6h3v2h-1.1l-.8 11.1A2 2 0 0 1 16.1 21H7.9a2 2 0 0 1-2-1.9L5.1 8H4V6zm2 0h6V5H9z" />
  </svg>
);
export const RerollIcon = ({ s = 20, c = "currentColor" }: IconProps) => (
  <svg {...base(s, c)}>
    <path d="M12 5V2L8 6l4 4V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z" />
  </svg>
);
export const EditIcon = ({ s = 14, c = "currentColor" }: IconProps) => (
  <svg {...base(s, c)}>
    <path d="M14.06 6.19l3.75 3.75L8.06 19.7 3 21l1.3-5.06zM20.7 5.63l-2.34 2.34-3.75-3.75 2.34-2.34a1 1 0 0 1 1.42 0l2.33 2.33a1 1 0 0 1 0 1.42z" />
  </svg>
);
export const CopyIcon = ({ s = 16, c = "currentColor" }: IconProps) => (
  <svg {...base(s, c)}>
    <path d="M9 3h8a2 2 0 0 1 2 2v10h-2V5H9zM5 7h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z" />
  </svg>
);
export const ChevronIcon = ({ s = 18, c = "var(--muted-4)" }: IconProps) => (
  <svg {...base(s, c)}>
    <path d="M9 6l6 6-6 6" />
  </svg>
);
export const BoltIcon = ({ s = 12, c = "currentColor" }: IconProps) => (
  <svg {...base(s, c)}>
    <path d="M13 3 5 13h5l-1 8 8-11h-5z" />
  </svg>
);
