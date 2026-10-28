import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '../context/AuthContext'

const API_URL =
  import.meta.env.VITE_API_URL || 'https://cinebook-backend-92ez.onrender.com'

function LiveChat() {
  const { user, token, isAuthenticated, openAuthModal } = useAuth()

  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [socketConnected, setSocketConnected] = useState(false)
  const [isOtherTyping, setIsOtherTyping] = useState(false)
  const [userSearch, setUserSearch] = useState('')

  const socketRef = useRef(null)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  // 1. Establish Socket.IO connection
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return

    const socket = io(API_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      setSocketConnected(true)
      socket.emit('join_user', user.id)
    })

    socket.on('disconnect', () => {
      setSocketConnected(false)
    })

    // Real-time message receiver
    socket.on('new_message', (incomingMsg) => {
      // Check if message belongs to current conversation
      setMessages((prev) => {
        // Prevent duplicate messages
        const exists = prev.some(
          (m) =>
            (m._id && m._id === incomingMsg._id) ||
            (m.createdAt === incomingMsg.createdAt && m.text === incomingMsg.text)
        )
        if (exists) return prev

        // Only append if it's for current selected user or from current user
        return [...prev, incomingMsg]
      })
    })

    // Typing indicators
    socket.on('user_typing', ({ senderId }) => {
      if (selectedUser && (selectedUser._id || selectedUser.id) === senderId) {
        setIsOtherTyping(true)
      }
    })

    socket.on('user_stop_typing', ({ senderId }) => {
      if (selectedUser && (selectedUser._id || selectedUser.id) === senderId) {
        setIsOtherTyping(false)
      }
    })

    return () => {
      socket.disconnect()
    }
  }, [isAuthenticated, user?.id, selectedUser])

  // 2. Fetch available users to chat with
  useEffect(() => {
    if (!isAuthenticated) return

    let active = true
    async function loadUsers() {
      setLoadingUsers(true)
      try {
        const headers = {}
        if (token) headers.Authorization = `Bearer ${token}`

        const res = await fetch(
          `${API_URL}/api/chat/users?currentUserId=${encodeURIComponent(user?.id || '')}`,
          { headers }
        )

        if (!res.ok) throw new Error('Could not fetch users')

        const data = await res.json()
        if (active && Array.isArray(data)) {
          setUsers(data)
          // If no user selected and list has users, select the first one
          if (!selectedUser && data.length > 0) {
            setSelectedUser(data[0])
          }
        }
      } catch (err) {
        console.warn('Chat users load error:', err.message)
      } finally {
        if (active) setLoadingUsers(false)
      }
    }

    loadUsers()

    return () => {
      active = false
    }
  }, [isAuthenticated, token, user?.id])

  // 3. Fetch message history when selectedUser changes
  useEffect(() => {
    if (!isAuthenticated || !selectedUser) return

    let active = true
    const otherId = selectedUser._id || selectedUser.id

    async function loadHistory() {
      try {
        const headers = {}
        if (token) headers.Authorization = `Bearer ${token}`

        const res = await fetch(
          `${API_URL}/api/chat/messages/${otherId}?userId=${encodeURIComponent(user?.id || '')}`,
          { headers }
        )

        if (!res.ok) throw new Error('Could not fetch message history')

        const data = await res.json()
        if (active && Array.isArray(data)) {
          setMessages(data)
        }
      } catch (err) {
        console.warn('Chat history error:', err.message)
      }
    }

    loadHistory()

    return () => {
      active = false
    }
  }, [selectedUser, isAuthenticated, token, user?.id])

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isOtherTyping])

  // Handle input changes & typing emit
  const handleInputChange = (e) => {
    setInputMessage(e.target.value)

    if (!socketRef.current || !selectedUser) return

    const otherId = selectedUser._id || selectedUser.id

    socketRef.current.emit('typing', {
      senderId: user?.id,
      senderName: user?.name,
      receiverId: otherId,
    })

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit('stop_typing', {
        senderId: user?.id,
        receiverId: otherId,
      })
    }, 1500)
  }

  // Send Message
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault()

    const trimmed = inputMessage.trim()
    if (!trimmed || !selectedUser) return

    const otherId = selectedUser._id || selectedUser.id

    const messagePayload = {
      senderId: user?.id,
      senderName: user?.name || 'User',
      receiverId: otherId,
      receiverName: selectedUser.name || 'User',
      text: trimmed,
    }

    setInputMessage('')

    // 1. Try sending via Socket.IO
    if (socketRef.current && socketConnected) {
      socketRef.current.emit('send_message', messagePayload, (response) => {
        if (!response?.success) {
          console.warn('Socket message delivery fallback required')
        }
      })
    } else {
      // 2. HTTP Fallback
      try {
        const headers = { 'Content-Type': 'application/json' }
        if (token) headers.Authorization = `Bearer ${token}`

        const res = await fetch(`${API_URL}/api/chat/messages`, {
          method: 'POST',
          headers,
          body: JSON.stringify(messagePayload),
        })

        if (res.ok) {
          const savedMsg = await res.json()
          setMessages((prev) => [...prev, savedMsg])
        }
      } catch (err) {
        console.error('HTTP chat send failed:', err)
      }
    }
  }

  // Quick Emoji Click
  const handleAddEmoji = (emoji) => {
    setInputMessage((prev) => prev + emoji)
  }

  // Filter users by search
  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase().trim()
    if (!q) return true
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q))
    )
  })

  // Format time (e.g. 7:45 PM)
  const formatTime = (isoString) => {
    if (!isoString) return ''
    try {
      const d = new Date(isoString)
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ''
    }
  }

  // If not logged in, prompt user to sign in
  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center animate-fadeIn">
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 sm:p-12 shadow-2xl max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center text-3xl mx-auto mb-5">
            💬
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Live Cinema Chat
          </h2>
          <p className="text-sm text-gray-400 mt-2 mb-6 leading-relaxed">
            Connect and chat live in real-time with other moviegoers! Discuss upcoming releases, recommend films, and coordinate movie plans.
          </p>
          <button
            type="button"
            onClick={() => openAuthModal('login')}
            className="w-full py-3 px-6 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-600/30 transition hover:scale-105"
          >
            Sign In to Start Chatting
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <span>Live Chat</span>
            <span
              className={`w-3 h-3 rounded-full ${
                socketConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
              title={socketConnected ? 'Connected live' : 'Connecting...'}
            />
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Real-time direct messaging between CineBook users.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="px-2.5 py-1 rounded-lg bg-gray-900 border border-gray-800">
            Logged in as <strong className="text-white">{user?.name}</strong>
          </span>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px] max-h-[720px]">
        {/* Left Column: Registered Users List (4 cols) */}
        <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-gray-800 flex flex-col bg-gray-950/60">
          {/* Search box */}
          <div className="p-3.5 border-b border-gray-800">
            <div className="relative">
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-9 pr-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-xs focus:outline-none focus:border-red-500"
              />
              <svg
                className="w-4 h-4 text-gray-400 absolute left-3 top-2.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Users List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {loadingUsers && (
              <div className="p-4 text-center text-xs text-gray-400 animate-pulse">
                Loading users...
              </div>
            )}

            {!loadingUsers && filteredUsers.length === 0 && (
              <div className="p-6 text-center text-xs text-gray-400">
                No other users found. Invite a friend or create a second test user to start chatting!
              </div>
            )}

            {filteredUsers.map((u) => {
              const uId = u._id || u.id
              const isSelected = selectedUser && (selectedUser._id || selectedUser.id) === uId

              return (
                <button
                  key={uId}
                  type="button"
                  onClick={() => setSelectedUser(u)}
                  className={`w-full p-3 rounded-2xl flex items-center gap-3 text-left transition ${
                    isSelected
                      ? 'bg-red-600/15 border border-red-500/30 text-white shadow'
                      : 'hover:bg-gray-800/60 text-gray-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-800 border border-gray-700 text-red-400 font-bold flex items-center justify-center shrink-0">
                    {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold truncate text-white">
                        {u.name}
                      </p>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    </div>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {u.email}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right Column: Chat Conversation (8 cols) */}
        <div className="md:col-span-8 flex flex-col justify-between bg-gray-900/90">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 bg-gray-950/80 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 text-white font-bold flex items-center justify-center shadow">
                    {selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {selectedUser.name}
                    </h3>
                    <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Active Live Chat
                    </p>
                  </div>
                </div>

                <div className="text-xs text-gray-400">
                  {isOtherTyping && (
                    <span className="text-red-400 font-medium italic animate-pulse">
                      typing...
                    </span>
                  )}
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-12 text-gray-400 text-xs">
                    <p className="text-2xl mb-2">👋</p>
                    <p className="font-semibold text-gray-300">
                      Start a conversation with {selectedUser.name}!
                    </p>
                    <p className="mt-1">
                      Say hello or share your thoughts on the latest movies.
                    </p>
                  </div>
                )}

                {messages.map((msg, index) => {
                  const senderId = msg.sender?._id || msg.sender
                  const isMe = String(senderId) === String(user?.id)

                  return (
                    <div
                      key={msg._id || index}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-end gap-2 max-w-[80%]">
                        {!isMe && (
                          <div className="w-6 h-6 rounded-lg bg-gray-800 text-gray-300 font-bold text-[10px] flex items-center justify-center shrink-0 mb-1">
                            {msg.senderName ? msg.senderName.charAt(0).toUpperCase() : 'U'}
                          </div>
                        )}

                        <div
                          className={`rounded-2xl px-4 py-2.5 text-sm shadow leading-relaxed ${
                            isMe
                              ? 'bg-red-600 text-white rounded-br-xs'
                              : 'bg-gray-800 text-gray-100 rounded-bl-xs border border-gray-700/80'
                          }`}
                        >
                          {!isMe && (
                            <p className="text-[10px] font-bold text-red-400 mb-0.5">
                              {msg.senderName || selectedUser.name}
                            </p>
                          )}
                          <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                          <span
                            className={`block text-[9px] mt-1 text-right ${
                              isMe ? 'text-red-200' : 'text-gray-400'
                            }`}
                          >
                            {formatTime(msg.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {/* Typing dots */}
                {isOtherTyping && (
                  <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-800/60 w-fit px-3 py-1.5 rounded-full border border-gray-700 animate-pulse">
                    <span>{selectedUser.name} is typing</span>
                    <span className="flex gap-0.5">
                      <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" />
                      <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce delay-100" />
                      <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce delay-200" />
                    </span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Emojis & Input Form */}
              <div className="p-3 bg-gray-950/90 border-t border-gray-800 space-y-2">
                {/* Emoji bar */}
                <div className="flex items-center gap-1.5 px-2">
                  <span className="text-[10px] uppercase font-bold text-gray-500 mr-1">
                    Quick:
                  </span>
                  {['🍿', '🎬', '🎟️', '🔥', '👍', '❤️'].map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => handleAddEmoji(em)}
                      className="text-base hover:scale-125 transition p-1"
                    >
                      {em}
                    </button>
                  ))}
                </div>

                {/* Input form */}
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={handleInputChange}
                    placeholder={`Message ${selectedUser.name}...`}
                    className="flex-1 px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-2xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-red-500"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim()}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-bold text-sm rounded-2xl shadow-lg shadow-red-600/30 transition flex items-center gap-1.5"
                  >
                    <span>Send</span>
                    <svg
                      className="w-4 h-4 rotate-90"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
              <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center text-2xl mb-4">
                💬
              </div>
              <h3 className="text-lg font-bold text-white">
                Select a user to chat
              </h3>
              <p className="text-xs text-gray-400 max-w-sm mt-1">
                Choose someone from the list on the left to start exchanging live messages in real-time.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LiveChat
