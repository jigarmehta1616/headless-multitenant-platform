import type { ThemeConfig } from "./schema.js"

/**
 * Generates CSS root variables string from ThemeConfig
 */
export function generateCssVariables(config: ThemeConfig): string {
  const { colors, typography, spacing, radius, grid } = config

  return `:root {
  /* Colors */
  --color-primary: ${colors.primary};
  --color-secondary: ${colors.secondary};
  --color-surface: ${colors.surface};
  --color-text: ${colors.text};
  --color-accent: ${colors.accent};
  --color-muted: ${colors.muted ?? "#6b7280"};
  --color-border: ${colors.border ?? "#e5e7eb"};
  --color-error: ${colors.error ?? "#ef4444"};
  --color-success: ${colors.success ?? "#22c55e"};

  /* Typography */
  --font-heading: ${typography.heading}, sans-serif;
  --font-body: ${typography.body}, sans-serif;
  --font-scale: ${typography.scale};

  /* Spacing */
  --spacing-base: ${spacing.base}px;
  --spacing-section-y: ${spacing.sectionY}px;
  --container-max-width: ${spacing.containerMax}px;

  /* Border Radii */
  --radius-sm: ${radius.sm}px;
  --radius-md: ${radius.md}px;
  --radius-lg: ${radius.lg}px;
  --radius-full: ${radius.full ?? 9999}px;

  /* Grid */
  --grid-gap: ${grid.gap}px;
}`
}

/**
 * Generates Tailwind CSS theme extension object
 */
export function generateTailwindTheme(config: ThemeConfig) {
  return {
    extend: {
      colors: {
        brand: {
          primary: "var(--color-primary)",
          secondary: "var(--color-secondary)",
          surface: "var(--color-surface)",
          text: "var(--color-text)",
          accent: "var(--color-accent)",
          muted: "var(--color-muted)",
          border: "var(--color-border)",
          error: "var(--color-error)",
          success: "var(--color-success)",
        },
      },
      fontFamily: {
        heading: ["var(--font-heading)"],
        body: ["var(--font-body)"],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        full: "var(--radius-full)",
      },
      maxWidth: {
        container: "var(--container-max-width)",
      },
      spacing: {
        "section-y": "var(--spacing-section-y)",
      },
    },
  }
}
