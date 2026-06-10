import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext({
  isDark: false,
  toggleTheme: () => {},
})

/**
 * 主题上下文 Provider
 * - 首次加载读取 localStorage，未设置则跟随系统偏好
 * - 切换时持久化到 localStorage
 * - 在 <html> 元素上切换 .dark 类，配合 CSS 变量驱动全局样式
 */
export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    // 初始化时同步读取（避免闪烁）
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme')
      if (stored === 'dark') return true
      if (stored === 'light') return false
      return window.matchMedia('(prefers-color-scheme:dark)').matches
    }
    return false
  })

  // 同步 .dark class 到 <html>
  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  // 监听系统偏好变化（仅当用户未手动设置过时）
  useEffect(() => {
    const stored = localStorage.getItem('theme')
    if (stored) return // 用户已手动选择，不再跟随系统

    const mq = window.matchMedia('(prefers-color-scheme:dark)')
    const handler = (e) => setIsDark(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const toggleTheme = () => setIsDark((prev) => !prev)

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
