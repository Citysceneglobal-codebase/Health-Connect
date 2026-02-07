import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Paperclip,
  Smile,
  Mic,
  Send,
  Search,
  Check,
  CheckCheck,
  Phone,
  Video,
  MoreVertical,
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Message } from "@shared/schema";

// WhatsApp-like chat for Doctors
// - Left: chats list (patients)
// - Right: conversation with bubbles, statuses, typing indicator, composer

export default function DoctorMessages() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activePeerId, setActivePeerId] = useState<string>("");
  const [filter, setFilter] = useState("");
  const [composeText, setComposeText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeout = useRef<number | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auth user (doctor)
  const { data: authUser } = useQuery<any>({ queryKey: ["/api/auth/user"] });
  // Doctor's patients list (for left panel)
  const { data: patients } = useQuery<any[]>({ queryKey: ["/api/doctor/patients"] });
  // All messages for this doctor - refetch every 3 seconds for real-time feel
  const { data: messages, isLoading } = useQuery<Message[]>({ 
    queryKey: ["/api/doctor/messages"],
    refetchInterval: 3000,
  });

  // Build peers list from existing messages
  const peers = useMemo(() => {
    const set = new Map<string, { id: string; name: string; lastMsgAt?: number; unread: number }>();
    const msgs = messages || [];

    msgs.forEach((m) => {
      const peerId = m.senderId === authUser?.id ? m.receiverId : m.senderId;
      const existing = set.get(peerId) || { id: peerId, name: peerId, lastMsgAt: 0, unread: 0 };
      const lastMsgAt = Math.max(existing.lastMsgAt || 0, new Date(m.createdAt as any).getTime());
      const unread = existing.unread + (!m.isRead && m.senderId === peerId ? 1 : 0);
      set.set(peerId, { ...existing, lastMsgAt, unread });
    });

    // Augment with patients for easy discovery
    (patients || []).forEach((p) => {
      const id = p.id || p.userId;
      if (!set.has(id)) {
        set.set(id, { id, name: p.name || `${p.firstName || ""} ${p.lastName || ""}`.trim(), unread: 0 });
      } else {
        const entry = set.get(id)!;
        set.set(id, { ...entry, name: p.name || `${p.firstName || ""} ${p.lastName || ""}`.trim() });
      }
    });

    const arr = Array.from(set.values());
    return arr
      .filter((p) => p.name.toLowerCase().includes(filter.toLowerCase()) || p.id.toLowerCase().includes(filter.toLowerCase()))
      .sort((a, b) => (b.lastMsgAt || 0) - (a.lastMsgAt || 0));
  }, [messages, patients, filter, authUser?.id]);

  const threadMessages = useMemo(() => {
    if (!activePeerId || !messages || !authUser) return [] as Message[];
    return (messages || [])
      .filter(
        (m) =>
          (m.senderId === activePeerId && m.receiverId === authUser.id) ||
          (m.receiverId === activePeerId && m.senderId === authUser.id)
      )
      .sort((a, b) => new Date(a.createdAt as any).getTime() - new Date(b.createdAt as any).getTime());
  }, [activePeerId, messages, authUser]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [threadMessages.length, activePeerId]);

  // Mark as read for incoming messages from peer
  const queryKey = ["/api/doctor/messages"] as const;
  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => apiRequest("PATCH", `/api/messages/${id}/read`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });
  useEffect(() => {
    if (!activePeerId) return;
    threadMessages.filter((m) => !m.isRead && m.senderId === activePeerId).forEach((m) => markAsReadMutation.mutate(m.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePeerId, threadMessages.length]);

  const sendMessageMutation = useMutation({
    mutationFn: (data: { receiverId: string; content: string; subject?: string; priority?: "low" | "medium" | "high" }) =>
      apiRequest("POST", "/api/messages", data),
    onSuccess: async () => {
      setComposeText("");
      await queryClient.invalidateQueries({ queryKey });
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      toast({ title: "Message sent", description: "Your message has been delivered", duration: 2000 });
    },
    onError: (error: any) => {
      toast({ title: "Failed to send message", description: error?.message || "Error", variant: "destructive" });
    },
  });

  const handleSendMessage = () => {
    if (!activePeerId || !composeText.trim()) return;
    sendMessageMutation.mutate({ 
      receiverId: activePeerId, 
      content: composeText.trim(), 
      subject: "", 
      priority: "medium" 
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const onType = (val: string) => {
    setComposeText(val);
    setIsTyping(true);
    if (typingTimeout.current) window.clearTimeout(typingTimeout.current);
    typingTimeout.current = window.setTimeout(() => setIsTyping(false), 1500);
  };

  const activePeerName = useMemo(() => {
    if (!activePeerId) return "";
    const patient = (patients || []).find((p) => (p.id || p.userId) === activePeerId);
    if (patient) return patient.name || `${patient.firstName || ""} ${patient.lastName || ""}`.trim();
    const peerFromList = peers.find((p) => p.id === activePeerId);
    return peerFromList?.name || activePeerId;
  }, [activePeerId, patients, peers]);

  const getPeerInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="h-[calc(100vh-80px)] max-w-6xl mx-auto px-4 py-4">
      <Card className="h-full overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 h-full">
          {/* Left: Chats list */}
          <div className="border-r md:col-span-1 flex flex-col">
            <div className="p-3">
              <div className="text-lg font-semibold">Chats</div>
              <div className="mt-2 flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search patients" value={filter} onChange={(e) => setFilter(e.target.value)} />
              </div>
            </div>
            <Separator />
            <ScrollArea className="flex-1">
              <div className="py-2">
                {peers.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setActivePeerId(p.id)}
                    className={`w-full px-3 py-3 flex items-center gap-3 hover:bg-accent/50 transition ${activePeerId === p.id ? "bg-accent/50" : ""}`}
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>{getPeerInitials(p.name || "P")}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="font-medium truncate">{p.name || p.id}</div>
                        {p.lastMsgAt ? (
                          <div className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                            {format(p.lastMsgAt, "MMM d")}
                          </div>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2">
                        {p.unread > 0 ? (
                          <Badge variant="destructive" className="h-5 px-2 text-[10px]">{p.unread}</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">No unread</span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
                {peers.length === 0 && (
                  <div className="text-sm text-muted-foreground px-4 py-8">No chats. Select a patient to start.</div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Right: Conversation */}
          <div className="md:col-span-2 flex flex-col h-full">
            {/* Header */}
            <div className="px-4 py-3 border-b flex items-center gap-3">
              {activePeerId ? (
                <>
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{getPeerInitials(activePeerName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{activePeerName}</div>
                    <div className="text-xs text-muted-foreground">{isTyping ? "typing…" : "online"}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" title="Voice call"><Phone className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon" title="Video call"><Video className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon" title="More"><MoreVertical className="h-5 w-5" /></Button>
                  </div>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">Select a patient to start messaging</div>
              )}
            </div>

            {/* Timeline */}
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-full">
                <div className="px-4 py-3 space-y-2">
                  {activePeerId && threadMessages.map((m) => {
                    const mine = m.senderId === authUser?.id;
                    return (
                      <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm border ${mine ? "bg-green-50 dark:bg-green-950/20" : "bg-card"}`}>
                          <div className="whitespace-pre-wrap break-words">{m.content}</div>
                          <div className="flex items-center gap-1 justify-end text-[10px] text-muted-foreground mt-1">
                            <span>{m.createdAt && format(new Date(m.createdAt), "h:mm a")}</span>
                            {mine ? (
                              m.isRead ? <CheckCheck className="h-3 w-3 text-blue-500" /> : <Check className="h-3 w-3" />
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {activePeerId && threadMessages.length === 0 && (
                    <div className="text-center text-xs text-muted-foreground py-6">No messages yet. Say hello!</div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </CardContent>

            {/* Composer */}
            <div className="px-3 py-2 border-t">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" title="Emoji"><Smile className="h-5 w-5" /></Button>
                <Button variant="ghost" size="icon" title="Attach"><Paperclip className="h-5 w-5" /></Button>
                <Input
                  placeholder={activePeerId ? "Type a message" : "Select a patient to start"}
                  value={composeText}
                  onChange={(e) => onType(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={!activePeerId}
                  className="flex-1"
                />
                <Button variant="ghost" size="icon" disabled={!activePeerId}><Mic className="h-5 w-5" /></Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={!activePeerId || !composeText.trim() || sendMessageMutation.isPending}
                >
                  {sendMessageMutation.isPending ? "Sending…" : <><Send className="h-4 w-4 mr-2" /> Send</>}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
