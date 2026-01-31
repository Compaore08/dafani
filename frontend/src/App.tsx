import { useState, useEffect, useRef, type FormEvent } from "react"
import axios from "axios"
import "./App.css"

const API_URL = "https://dafani.onrender.com"

type Message = {
  role: "user" | "assistant"
  content: string
}

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput("")
    setMessages(prev => [...prev, { role: "user", content: userMessage }])
    setLoading(true)

    try {
      const response = await axios.post(
        `${API_URL}/chat`,
        { message: userMessage },
        { timeout: 30000 }
      )

      setMessages(prev => [
        ...prev,
        { role: "assistant", content: response.data.response }
      ])
    } catch (error: any) {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content:
            error?.response?.data?.detail ||
            "❌ Erreur serveur. Veuillez réessayer."
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const resetConversation = () => {
    setMessages([])
    setInput("")
  }

  return (
    <div className="app">
      <div className="chat-container">

        <header className="chat-header">
          <div className="header-content">
            <h1>🤖 Support Dafani</h1>
            <p>Votre assistant intelligent</p>
          </div>
          <button onClick={resetConversation} className="reset-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
              <path d="M21 3v5h-5"/>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
              <path d="M3 21v-5h5"/>
            </svg>
          </button>
        </header>

        <div className="messages">
          {messages.length === 0 && (
            <div className="welcome">
              <div className="welcome-icon">💬</div>
              <h2>Bienvenue !</h2>
              <p>Posez vos questions sur nos produits et services</p>
            </div>
          )}

          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.role}`}>
              <div className="message-avatar">
                {msg.role === "user" ? "👤" : "🤖"}
              </div>
              <div className="message-content">
                <p>{msg.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="message assistant">
              <div className="message-avatar">🤖</div>
              <div className="message-content loading-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="input-area">
          <input
            type="text"
            placeholder="Écrivez votre message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13"/>
              <path d="M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
          </button>
        </form>

      </div>
    </div>
  )
}

export default App
