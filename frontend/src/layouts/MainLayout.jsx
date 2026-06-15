import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'
import { ThemeProvider } from '../contexts/ThemeContext'
import { ToastProvider } from '../contexts/ToastContext'
import { ColumnNotificationProvider } from '../contexts/ColumnNotificationContext'

function MainLayout() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <ColumnNotificationProvider>
          <div
            className="flex min-h-screen transition-colors duration-200"
            style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-on-background)' }}
          >
            {/* 左侧固定侧边栏 - 自身不可滚动 */}
            <Sidebar />

            {/* 右侧主内容区 - 使用 min-h-screen 让长内容撑高 body，
                鼠标滚轮在浏览器窗口任意位置都可滚动整页。
                ChatPage 内部使用 h-full + overflow-hidden 自行管理消息区滚动。 */}
            <div className="flex-1 flex flex-col ml-[280px] min-w-0 min-h-screen">
              {/* 顶部应用栏 */}
              <TopBar />

              {/* 页面内容区域 - 子页面继承父高度即可 */}
              <main className="flex-1 min-h-0">
                <Outlet />
              </main>
            </div>
          </div>
        </ColumnNotificationProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}

export default MainLayout
