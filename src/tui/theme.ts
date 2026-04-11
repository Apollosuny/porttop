import pc from 'picocolors';

export const theme = {
  // Core Palette (Cyberpunk / Synthwave)
  magenta: pc.magentaBright,
  cyan: pc.cyanBright,
  yellow: pc.yellowBright,
  green: pc.greenBright,
  red: pc.redBright,
  white: pc.whiteBright,
  gray: pc.gray,
  dim: pc.dim,

  // Semantic mappings
  border: pc.magentaBright,
  title: pc.magentaBright,
  label: pc.cyanBright,
  value: pc.yellowBright,
  success: pc.greenBright,
  danger: pc.redBright,
  info: pc.blueBright,
  
  // Compat Aliases (to prevent regressions)
  muted: (text: string) => pc.gray(text),
  accent: (text: string) => pc.magentaBright(text),
  warning: (text: string) => pc.yellowBright(text),
  strong: (text: string) => pc.whiteBright(text),
  
  // Custom Utilities
  brand: (text: string) => pc.bold(pc.cyanBright(text)),
  selected: (text: string) => pc.bgMagenta(pc.black(pc.bold(text))),
  highlight: (text: string) => pc.bgCyan(pc.black(text)),
};



