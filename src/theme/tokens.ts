/**
 * Theme tokens (hex) for use in JS – e.g. FinisherHeader, canvas, SVG.
 * Keep in sync with :root variables in src/index.css (HSL source of truth).
 */

export const themeColors = {
  white: "#ffffff",
  sectionCream: "#f3f2ec",
  sectionDark: "#173c40",
  primaryDeep: "#21494d",
  accentTeal: "#328488",
  accentMint: "#B0D5CD",
  accentTaupe: "#b6a892",
  accentTaupeLight: "#c6b9a1",
  accentOlive: "#9aa864",
  surfaceWarmMid: "#e7e3d6",
  surfaceWarmDark: "#d6cfbe",
  particleBlue: "#a7e8ff",
  particleGreen: "#e3f2df",
  particlePeach: "#f7e0d9",
  navActive: "#D2691E",
  navActiveHover: "#b65916",
  navLink: "#FFD2A3",
  navLinkHover: "#FFE0BF",
} as const;

/** Default particle set for Index / generic hero */
export const defaultParticleColors = [
  themeColors.accentTeal,
  themeColors.white,
  themeColors.accentTaupe,
] as const;

/** Particle set for Partnerships page */
export const partnershipsParticleColors = [
  themeColors.accentTeal,
  themeColors.white,
  themeColors.accentOlive,
] as const;

/** Particle set for About page */
export const aboutParticleColors = [
  themeColors.particleBlue,
  themeColors.particleGreen,
  themeColors.particlePeach,
] as const;
