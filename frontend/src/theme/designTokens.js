/**
 * 设计令牌 (Design Tokens)
 * 基于 PRD 第三章定义的 Material Design 3 语义化色彩系统
 */

// 配色方案 — 明主题 (Light)
export const colors = {
  primary: '#3d32e6',
  primaryContainer: '#5852ff',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#f2eeff',
  surface: '#fcf9f8',
  surfaceDim: '#dcd9d9',
  surfaceBright: '#fcf9f8',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f6f3f2',
  surfaceContainer: '#f0eded',
  surfaceContainerHigh: '#eae7e7',
  surfaceContainerHighest: '#e5e2e1',
  surfaceVariant: '#e5e2e1',
  onSurface: '#1c1b1b',
  onSurfaceVariant: '#464556',
  secondary: '#5d5f5f',
  secondaryContainer: '#dcdddd',
  onSecondary: '#ffffff',
  onSecondaryContainer: '#5f6161',
  tertiary: '#632fcc',
  tertiaryContainer: '#7c4de6',
  onTertiary: '#ffffff',
  onTertiaryContainer: '#f5edff',
  outline: '#777588',
  outlineVariant: '#c7c4d9',
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  onError: '#ffffff',
  onErrorContainer: '#93000a',
  inverseSurface: '#313030',
  inverseOnSurface: '#f3f0ef',
  inversePrimary: '#c2c1ff',
  background: '#fcf9f8',
  onBackground: '#1c1b1b',
}

// 配色方案 — 暗主题 (Dark)
export const colorsDark = {
  primary: '#c3c0ff',
  primaryContainer: '#8682ff',
  onPrimary: '#1e00a5',
  onPrimaryContainer: '#190092',
  surface: '#051424',
  surfaceDim: '#051424',
  surfaceBright: '#2c3a4c',
  surfaceContainerLowest: '#010f1f',
  surfaceContainerLow: '#0d1c2d',
  surfaceContainer: '#122131',
  surfaceContainerHigh: '#1c2b3c',
  surfaceContainerHighest: '#273647',
  surfaceVariant: '#273647',
  onSurface: '#d4e4fa',
  onSurfaceVariant: '#c7c4d6',
  secondary: '#7bd0ff',
  secondaryContainer: '#00a6e0',
  onSecondary: '#00354a',
  onSecondaryContainer: '#00374d',
  tertiary: '#ffb869',
  tertiaryContainer: '#cd7f0e',
  onTertiary: '#482900',
  onTertiaryContainer: '#3f2300',
  outline: '#918fa0',
  outlineVariant: '#464554',
  error: '#ffb4ab',
  errorContainer: '#93000a',
  onError: '#690005',
  onErrorContainer: '#ffdad6',
  inverseSurface: '#d4e4fa',
  inverseOnSurface: '#233143',
  inversePrimary: '#514ad1',
  background: '#051424',
  onBackground: '#d4e4fa',
}

// 字体系统
export const typography = {
  headlineLg: { fontSize: '32px', lineHeight: 1.2, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif" },
  headlineMd: { fontSize: '24px', lineHeight: 1.3, fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif" },
  headlineSm: { fontSize: '18px', lineHeight: 1.4, fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif" },
  headlineLgMobile: { fontSize: '26px', lineHeight: 1.2, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif" },
  bodyLg: { fontSize: '16px', lineHeight: 1.6, fontWeight: 400, fontFamily: "Inter, sans-serif" },
  bodyMd: { fontSize: '14px', lineHeight: 1.5, fontWeight: 400, fontFamily: "Inter, sans-serif" },
  labelMd: { fontSize: '12px', lineHeight: 1.0, fontWeight: 500, fontFamily: "Inter, sans-serif" },
}

// 圆角规范
export const borderRadius = {
  DEFAULT: '4px',
  lg: '8px',
  xl: '12px',
  full: '9999px',
}

// 间距规范
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '40px',
  sidebarWidth: '280px',
  maxChatWidth: '800px',
}

// 布局尺寸
export const layout = {
  sidebarWidth: 280,
  topBarHeight: 64,
  maxChatWidth: 800,
}
