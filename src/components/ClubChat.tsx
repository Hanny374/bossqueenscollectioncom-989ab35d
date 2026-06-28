import { useEffect, useRef, useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import { Loader2, Send, MessageCircle, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type ClubMessage = {
  id: string;
  user_id: string;
  display_name: string;
  body: string;
  created_at: string;
};

const formatTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export const ClubChat = () => {
  const { user, profile, isLoading: authLoading } = useAuth();
  const [messages, setMessages] = useState<ClubMessage[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;

    (async () => {
      const { data, error } = await supabase
        .from("club_messages")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(200);
      if (!active) return;
      if (error) {
        toast.error("Couldn't load chat");
      } else {
        setMessages(data ?? []);
      }
      setLoading(false);
    })();

    const channel = supabase
      .channel("club_messages_feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "club_messages" },
        (payload) => {
          setMessages((prev) => {
            const next = payload.new as ClubMessage;
            if (prev.some((m) => m.id === next.id)) return prev;
            return [...prev, next];
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "club_messages" },
        (payload) => {
          const old = payload.old as { id: string };
          setMessages((prev) => prev.filter((m) => m.id !== old.id));
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !body.trim() || sending) return;
    setSending(true);
    const displayName =
      profile?.display_name?.trim() ||
      user.email?.split("@")[0] ||
      "Queen";
    const text = body.trim().slice(0, 1000);
    setBody("");
    const { error } = await supabase.from("club_messages").insert({
      user_id: user.id,
      display_name: displayName,
      body: text,
    });
    if (error) {
      toast.error("Couldn't send message");
      setBody(text);
    }
    setSending(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("club_messages").delete().eq("id", id);
    if (error) toast.error("Couldn't delete message");
  };

  return (
    <section className="container px-4 md:px-8 py-16 max-w-3xl">
      <div className="text-center mb-8">
        <span className="text-xs uppercase tracking-[0.3em] text-primary font-semibold">
          Members Only
        </span>
        <h2 className="font-display text-3xl md:text-4xl font-bold mt-3">
          VIP Community Chat
        </h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto">
          Connect with fellow Queens — share styling tips, hair routines, and outfit inspiration.
        </p>
      </div>

      <div className="rounded-3xl border border-primary/20 bg-card shadow-elevated overflow-hidden flex flex-col h-[520px]">
        {/* Chat header */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-border/60 bg-gradient-champagne">
          <MessageCircle className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Club Lounge</span>
          <span className="ml-auto text-[11px] text-muted-foreground">
            {messages.length} message{messages.length === 1 ? "" : "s"}
          </span>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-background/40">
          {authLoading || (user && loading) ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : !user ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-3 px-4">
              <MessageCircle className="w-8 h-8 text-primary/60" />
              <p className="text-sm text-muted-foreground max-w-xs">
                Sign in with your Boss Queens account to join the conversation.
              </p>
              <Button asChild size="sm" className="bg-gradient-gold text-[hsl(25_40%_18%)] font-semibold">
                <Link to="/auth">Sign in to chat</Link>
              </Button>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground text-center px-4">
              Be the first to say hi 👑
            </div>
          ) : (
            messages.map((m) => {
              const mine = m.user_id === user.id;
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${mine ? "items-end" : "items-start"}`}
                >
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-[11px] font-semibold text-primary">
                      {m.display_name}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatTime(m.created_at)}
                    </span>
                  </div>
                  <div
                    className={`group max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap break-words flex items-start gap-2 ${
                      mine
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-secondary text-secondary-foreground rounded-bl-md"
                    }`}
                  >
                    <span>{m.body}</span>
                    {mine && (
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="opacity-0 group-hover:opacity-70 hover:opacity-100 transition-opacity shrink-0 -mr-1"
                        aria-label="Delete message"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Composer */}
        {user && (
          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 border-t border-border/60 bg-card px-3 py-2"
          >
            <input
              type="text"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={1000}
              placeholder="Say something to the Club…"
              className="flex-1 bg-background/70 border border-border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <button
              type="submit"
              disabled={!body.trim() || sending}
              className="w-10 h-10 rounded-full bg-gradient-gold text-[hsl(25_40%_18%)] flex items-center justify-center shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Send"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default ClubChat;