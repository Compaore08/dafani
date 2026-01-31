import React, { useState, useRef, useEffect, type FormEvent } from 'react'
import axios from 'axios'
import './App.css'

const API_URL = 'http://localhost:8000' // Assurez-vous que FastAPI tourne ici

type Role = 'user' | 'assistant'

type Message = {
  role: Role
  content: string
}

type ChatResponse = {
  response: string
  conversation_id: string
}

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [conversationId, setConversationId] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const { data } = await axios.post<ChatResponse>(
        `${API_URL}/chat`,
        {
          message: userMessage,
          conversation_id: conversationId,
        },
        { timeout: 30000 }
      )

      if (!conversationId) setConversationId(data.conversation_id)

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch (error: any) {
      let errorMessage = '❌ Erreur : '
      if (error.code === 'ECONNABORTED') {
        errorMessage += 'Temps de réponse dépassé.'
      } else if (error.response) {
        errorMessage += error.response.data.detail || 'Erreur serveur.'
      } else {
        errorMessage += 'Impossible de joindre le serveur.'
      }
      setMessages(prev => [...prev, { role: 'assistant', content: errorMessage }])
    } finally {
      setLoading(false)
    }
  }

  const resetConversation = () => {
    setMessages([])
    setConversationId(null)
    setInput('')
  }

  return (
    <div className="app">
      <div className="chat-container">
        <div className="chat-header">
          <h1>💬 Support Client AI – Dafani</h1>
          <button onClick={resetConversation} className="btn-reset">
            Nouvelle conversation
          </button>
        </div>

        <div className="messages-container">
          {messages.length === 0 && (
            <div className="welcome-message">
              <h2>Bienvenue 👋</h2>
              <p>Posez votre question sur les produits Dafani.</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.role}`}>
              <div className="message-avatar">{msg.role === 'user' ? '👤' : '🤖'}</div>
              <div className="message-content">{msg.content}</div>
            </div>
          ))}

          {loading && (
            <div className="message assistant">
              <div className="message-avatar">🤖</div>
              <div className="message-content">Réponse en cours...</div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="input-container">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Tapez votre message..."
            disabled={loading}
            className="message-input"
          />
          <button type="submit" disabled={loading || !input.trim()} className="btn-send">
            📤
          </button>
        </form>
      </div>
    </div>
  )
}

export default App
