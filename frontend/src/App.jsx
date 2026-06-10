import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import NewChatPage from './pages/NewChatPage'
import ChatPage from './pages/ChatPage'
import AgentCenterPage from './pages/AgentCenterPage'
import SkillsCenterPage from './pages/SkillsCenterPage'
import KnowledgeBasePage from './pages/KnowledgeBasePage'
import DocumentManagementPage from './pages/DocumentManagementPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/chat/new" replace />} />
        <Route path="chat/new" element={<NewChatPage />} />
        <Route path="chat/:id" element={<ChatPage />} />
        <Route path="agents" element={<AgentCenterPage />} />
        <Route path="skills" element={<SkillsCenterPage />} />
        <Route path="knowledge-base" element={<KnowledgeBasePage />} />
        <Route path="knowledge-base/:id/documents" element={<DocumentManagementPage />} />
      </Route>
    </Routes>
  )
}

export default App
