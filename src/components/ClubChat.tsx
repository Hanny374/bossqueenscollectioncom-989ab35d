import { useEffect, useMemo, useRef, useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  Loader2,
  Send,
  MessageCircle,
  Trash2,
  Users,
  Sparkles,
  Shield,
  Heart,
  Crown,
  Scissors,
  Camera,
} from "lucide-react";
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
    <ClubChatLayout
      messageCount={messages.length}
      activeQueens={activeQueens}
    >
      <div className="rounded-3xl border border-primary/20 bg-card shadow-elevated overflow-hidden flex flex-col h-[560px]">
        {/* Chat header */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-border/60 bg-gradient-champagne">
          <div className="w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center">
            <Crown className="w-4 h-4" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-foreground">Club Lounge</div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              Live · {activeQueens} Queen{activeQueens === 1 ? "" : "s"} active
            </div>
          </div>
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
    </ClubChatLayout>
  );
};

export default ClubChat;

const guidelines = [
  {
    icon: Heart,
    title: "Lift each other up",
    desc: "Compliments, encouragement, and good vibes only — this is a safe space for every Queen.",
  },
  {
    icon: Shield,
    title: "Keep it private",
    desc: "What's shared in the Lounge stays in the Lounge. No screenshots, no outside drama.",
  },
  {
    icon: Sparkles,
    title: "Share the wins",
    desc: "Drop your install pics, styling routines, and outfit-of-the-day moments — we want to see it.",
  },
];

const conversationStarters = [
  { icon: Scissors, label: "Styling tips & install routines" },
  { icon: Camera, label: "Show off your latest look" },
  { icon: Sparkles, label: "Texture & color recommendations" },
  { icon: Crown, label: "Boss moves & business wins" },
];

const ClubChatLayout = ({
  children,
  messageCount,
  activeQueens,
}: {
  children: React.ReactNode;
  messageCount: number;
  activeQueens: number;
}) => (
  <section className="container px-4 md:px-8 py-20 max-w-6xl">
    <div className="text-center mb-10">
      <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-primary font-semibold">
        <Crown className="w-3.5 h-3.5" /> Members Only · Live Lounge
      </span>
      <h2 className="font-display text-3xl md:text-5xl font-bold mt-3">
        The VIP <span className="bg-gradient-gold bg-clip-text text-transparent">Community Chat</span>
      </h2>
      <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
        A private, real-time lounge for Boss Queens VIP members. Trade styling secrets,
        share install reveals, and connect with women who get it — 24/7, from anywhere in the world.
      </p>

      {/* Live stats */}
      <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-2">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/25 bg-primary/5 text-xs text-foreground">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <strong className="font-semibold">{activeQueens}</strong> Queens online
        </span>
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/60 bg-card text-xs text-foreground">
          <MessageCircle className="w-3.5 h-3.5 text-primary" />
          <strong className="font-semibold">{messageCount}</strong> message{messageCount === 1 ? "" : "s"} shared
        </span>
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/60 bg-card text-xs text-foreground">
          <Users className="w-3.5 h-3.5 text-primary" />
          End-to-end member-verified
        </span>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 lg:gap-8 items-start">
      {/* Chat */}
      <div>{children}</div>

      {/* Side panel */}
      <aside className="space-y-5">
        <div className="rounded-2xl border border-primary/20 bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2 text-primary mb-3">
            <Shield className="w-4 h-4" />
            <h3 className="font-display text-base font-semibold text-foreground">House Rules</h3>
          </div>
          <ul className="space-y-3">
            {guidelines.map((g) => (
              <li key={g.title} className="flex gap-3">
                <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <g.icon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground leading-tight">{g.title}</div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{g.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border/60 bg-gradient-champagne p-5">
          <div className="flex items-center gap-2 text-primary mb-3">
            <Sparkles className="w-4 h-4" />
            <h3 className="font-display text-base font-semibold text-foreground">What to share</h3>
          </div>
          <ul className="space-y-2">
            {conversationStarters.map((s) => (
              <li key={s.label} className="flex items-center gap-2.5 text-sm text-foreground">
                <s.icon className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>{s.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-5 text-center">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Not a member yet? Unlock the Lounge plus monthly bundles and 10% off everything.
          </p>
          <Button asChild size="sm" className="mt-3 bg-gradient-gold text-[hsl(25_40%_18%)] font-semibold w-full">
            <Link to="/hair-club#benefits">Join the VIP Club</Link>
          </Button>
        </div>
      </aside>
    </div>
  </section>
);