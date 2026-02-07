"use client"

import { useState, useRef, useEffect } from "react"
import { AppShell } from "@/components/app-shell"
import {
  Send,
  Phone,
  Video,
  Users,
  Hash,
  Search,
  Paperclip,
  MapPin,
  Circle,
  MessageSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"

// --- Channels ---
interface Channel {
  id: string
  name: string
  type: "team" | "region" | "command"
  unread: number
  members: number
  lastMessage: string
  lastMessageTime: string
}

const channels: Channel[] = [
  { id: "ch-1", name: "Command Center", type: "command", unread: 3, members: 12, lastMessage: "Resource deployment confirmed for Sector 7", lastMessageTime: "2m" },
  { id: "ch-2", name: "Field Operations", type: "team", unread: 8, members: 45, lastMessage: "Team Alpha reached Rishikesh base camp", lastMessageTime: "5m" },
  { id: "ch-3", name: "Medical Response", type: "team", unread: 0, members: 20, lastMessage: "Medical supplies dispatched from Delhi", lastMessageTime: "15m" },
  { id: "ch-4", name: "Uttarakhand Ops", type: "region", unread: 12, members: 30, lastMessage: "Bridge at NH-7 partially damaged", lastMessageTime: "8m" },
  { id: "ch-5", name: "Tamil Nadu Ops", type: "region", unread: 5, members: 25, lastMessage: "Cyclone shelter setup at 12 locations", lastMessageTime: "20m" },
  { id: "ch-6", name: "Logistics Hub", type: "team", unread: 2, members: 15, lastMessage: "Truck fleet ETA update: 4 hours", lastMessageTime: "30m" },
  { id: "ch-7", name: "Assam Ops", type: "region", unread: 7, members: 28, lastMessage: "Boat rescue teams deployed in Jorhat", lastMessageTime: "12m" },
]

// --- Messages ---
interface Message {
  id: string
  sender: string
  role: string
  content: string
  timestamp: string
  isSystem?: boolean
  location?: string
}

const sampleMessages: Record<string, Message[]> = {
  "ch-1": [
    { id: "m1", sender: "System", role: "AI", content: "ML Model Update: Flood risk for Rishikesh sector increased to 87%. Recommend immediate resource reallocation.", timestamp: "10:15 AM", isSystem: true },
    { id: "m2", sender: "Cmdr. Sharma", role: "Incident Commander", content: "All teams, this is Command. We are escalating Rishikesh to Level 4. All available medical teams report to base camp.", timestamp: "10:18 AM" },
    { id: "m3", sender: "Dr. Aisha Patel", role: "Medical Lead", content: "Copy that, Commander. Medical Team Bravo en route. ETA 45 minutes. Requesting additional blood supply units.", timestamp: "10:20 AM" },
    { id: "m4", sender: "Lt. Rajesh Kumar", role: "Field Officer", content: "Command, Field Team Alpha reporting. Sector 5 evacuation complete. 340 civilians relocated to Tapovan shelter.", timestamp: "10:25 AM", location: "Rishikesh, Sector 5" },
    { id: "m5", sender: "System", role: "AI", content: "Resource Optimization: Based on current demand, recommend diverting 3 supply trucks from Delhi Warehouse to Rishikesh (Route NH-58). ETA: 4h 30m.", timestamp: "10:28 AM", isSystem: true },
    { id: "m6", sender: "Cmdr. Sharma", role: "Incident Commander", content: "Approved. Logistics team, execute the diversion. Also, coordinate with NDRF for additional helicopter support.", timestamp: "10:30 AM" },
    { id: "m7", sender: "Capt. Singh", role: "NDRF", content: "Roger that. Two helicopters dispatched from Dehradun base. Will be on station within 90 minutes.", timestamp: "10:35 AM" },
  ],
  "ch-2": [
    { id: "f1", sender: "Lt. Rajesh Kumar", role: "Team Lead", content: "Team Alpha checking in. We have established forward base at Tapovan. Conditions deteriorating rapidly.", timestamp: "10:00 AM", location: "Tapovan, Rishikesh" },
    { id: "f2", sender: "Sgt. Meena", role: "Rescue Ops", content: "Team Bravo reports 15 stranded civilians on rooftop at Laxman Jhula area. Requesting boat support.", timestamp: "10:10 AM" },
    { id: "f3", sender: "System", role: "AI", content: "Weather Update: Rainfall intensity increasing. Next 6 hours critical. Advise all field teams to maintain elevated positions.", timestamp: "10:15 AM", isSystem: true },
  ],
}

const channelTypeIcons: Record<string, typeof Hash> = {
  team: Users,
  region: MapPin,
  command: Hash,
}

export default function CommunicationPage() {
  const [activeChannel, setActiveChannel] = useState("ch-1")
  const [searchQuery, setSearchQuery] = useState("")
  const [newMessage, setNewMessage] = useState("")
  const [messages, setMessages] = useState(sampleMessages)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const activeChannelData = channels.find((ch) => ch.id === activeChannel)
  const activeMessages = messages[activeChannel] || []

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [activeMessages])

  const handleSend = () => {
    if (!newMessage.trim()) return

    const msg: Message = {
      id: `msg-${Date.now()}`,
      sender: "You",
      role: "Operator",
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages((prev) => ({
      ...prev,
      [activeChannel]: [...(prev[activeChannel] || []), msg],
    }))
    setNewMessage("")
  }

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm">
        {/* Channel List */}
        <div className="flex w-72 shrink-0 flex-col border-r border-border/50">
          <div className="border-b border-border/50 p-3">
            <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-secondary/50 px-3 py-2">
              <Search className="h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search channels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-emerald-50 placeholder:text-slate-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {["command", "team", "region"].map((type) => {
              const filtered = channels.filter(
                (ch) => ch.type === type && ch.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              if (filtered.length === 0) return null
              const TypeIcon = channelTypeIcons[type]
              return (
                <div key={type} className="px-2 py-2">
                  <p className="px-2 py-1 text-[10px] font-medium uppercase tracking-widest text-slate-500">
                    {type === "command" ? "Command" : type === "team" ? "Teams" : "Regional"}
                  </p>
                  {filtered.map((channel) => (
                    <button
                      key={channel.id}
                      type="button"
                      onClick={() => setActiveChannel(channel.id)}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors",
                        activeChannel === channel.id
                          ? "bg-emerald-600/15 text-emerald-400"
                          : "text-slate-400 hover:bg-slate-800/50"
                      )}
                    >
                      <TypeIcon className="h-4 w-4 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="truncate text-sm font-medium">{channel.name}</span>
                          {channel.unread > 0 && (
                            <span className="ml-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-emerald-50">
                              {channel.unread}
                            </span>
                          )}
                        </div>
                        <p className="truncate text-[11px] text-slate-500">{channel.lastMessage}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )
            })}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex flex-1 flex-col">
          {/* Chat Header */}
          <div className="flex items-center justify-between border-b border-border/50 px-5 py-3">
            <div className="flex items-center gap-2.5">
              {activeChannelData && (
                <>
                  {(() => {
                    const Icon = channelTypeIcons[activeChannelData.type]
                    return <Icon className="h-4 w-4 text-emerald-400" />
                  })()}
                  <div>
                    <h3 className="text-sm font-bold text-emerald-50">{activeChannelData.name}</h3>
                    <p className="text-[11px] text-slate-500">{activeChannelData.members} members online</p>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button type="button" className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-800/50 hover:text-slate-300">
                <Phone className="h-4 w-4" />
                <span className="sr-only">Audio call</span>
              </button>
              <button type="button" className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-800/50 hover:text-slate-300">
                <Video className="h-4 w-4" />
                <span className="sr-only">Video call</span>
              </button>
              <button type="button" className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-800/50 hover:text-slate-300">
                <Users className="h-4 w-4" />
                <span className="sr-only">Members</span>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <div className="space-y-4">
              {activeMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-3",
                    msg.sender === "You" && "flex-row-reverse"
                  )}
                >
                  <div className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    msg.isSystem
                      ? "bg-emerald-600/20 text-emerald-400"
                      : msg.sender === "You"
                        ? "bg-blue-600/20 text-blue-400"
                        : "bg-slate-700 text-slate-300"
                  )}>
                    {msg.isSystem ? "AI" : msg.sender.charAt(0)}
                  </div>
                  <div className={cn("max-w-[70%]", msg.sender === "You" && "text-right")}>
                    <div className={cn("flex items-center gap-2", msg.sender === "You" && "justify-end")}>
                      <span className={cn("text-xs font-medium", msg.isSystem ? "text-emerald-400" : "text-slate-300")}>
                        {msg.sender}
                      </span>
                      <span className="text-[10px] text-slate-600">{msg.role}</span>
                      <span className="text-[10px] text-slate-600">{msg.timestamp}</span>
                    </div>
                    <div className={cn(
                      "mt-1 rounded-lg px-3.5 py-2.5 text-sm leading-relaxed",
                      msg.isSystem
                        ? "border border-emerald-500/20 bg-emerald-950/40 text-emerald-200"
                        : msg.sender === "You"
                          ? "bg-emerald-600/20 text-emerald-50"
                          : "bg-slate-800/50 text-slate-300"
                    )}>
                      {msg.content}
                    </div>
                    {msg.location && (
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-500">
                        <MapPin className="h-3 w-3" />
                        {msg.location}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Message Input */}
          <div className="border-t border-border/50 px-5 py-3">
            <div className="flex items-center gap-3">
              <button type="button" className="shrink-0 rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-800/50 hover:text-slate-300">
                <Paperclip className="h-4 w-4" />
                <span className="sr-only">Attach file</span>
              </button>
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 rounded-lg border border-border/50 bg-secondary/50 px-4 py-2.5 text-sm text-emerald-50 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!newMessage.trim()}
                className="flex shrink-0 items-center justify-center rounded-lg bg-emerald-600 p-2.5 text-emerald-50 transition-colors hover:bg-emerald-700 disabled:bg-slate-800 disabled:text-slate-500"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Send message</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
