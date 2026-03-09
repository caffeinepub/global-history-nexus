import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { HistoricalEvent } from "@/hooks/useQueries";
import { formatYear } from "@/utils/categoryColors";
import { BookOpen, Bot, ChevronDown, Send, User, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

interface AIHistorianPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  contextEvent: HistoricalEvent | null;
}

function generateAIResponse(
  message: string,
  event: HistoricalEvent | null,
): string {
  const lower = message.toLowerCase();

  if (event) {
    const year = Number(event.year);
    const yearStr = formatYear(year);

    if (/why|cause|reason|led to|what caused/.test(lower)) {
      const causes =
        event.causes.length > 0
          ? event.causes.slice(0, 2).join("; ")
          : "a complex interplay of social, political, and economic factors";
      return `The ${event.title} (${yearStr}) arose from ${causes}. From a traditional perspective, historians emphasize the political pressures of the time, while revisionist scholars point to deeper socioeconomic tensions. A third interpretation — popular among cultural historians — focuses on the role of ideas and belief systems in precipitating this transformation. Each lens reveals a different facet of this pivotal moment.`;
    }

    if (/consequence|effect|result|impact|aftermath/.test(lower)) {
      const consequences =
        event.consequences.length > 0
          ? event.consequences.slice(0, 2).join("; ")
          : "significant long-term transformations across multiple societies";
      return `The consequences of the ${event.title} were profound: ${consequences}. In the short term, contemporaries experienced immediate upheaval. Over the following decades, its legacy reshaped ${event.region}'s political and cultural landscape. Historians debate whether these effects were inevitable products of historical forces, or whether different choices at critical junctures could have produced alternative trajectories.`;
    }

    if (/who|person|figure|leader|people/.test(lower)) {
      if (event.keyFigures.length > 0) {
        const figures = event.keyFigures
          .slice(0, 3)
          .map((f) => `${f.name} (${f.role})`)
          .join(", ");
        return `The key figures in the ${event.title} included ${figures}. These individuals operated within and shaped the structures of their time. Biographical historians emphasize their agency and personal decisions, while structural historians see them as embodiments of larger social forces. Understanding their motivations requires reading both the historical evidence and the silences in the archive.`;
      }
      return `The ${event.title} involved numerous historical actors whose roles are still debated by scholars. Identifying "key figures" itself reflects a historiographical choice — different schools of thought prioritize elites, mass movements, or institutional actors.`;
    }

    if (
      /debate|interpret|perspective|historian|controversy|school/.test(lower)
    ) {
      return `Historians hold multiple interpretations of the ${event.title}:\n\n**Traditional/Whig History**: Views this event as part of a progressive march toward modernity and civilizational advancement.\n\n**Revisionist School**: Challenges triumphalist narratives, highlighting the costs borne by marginalized groups and questioning who benefited from these changes.\n\n**World-Systems Analysis**: Situates the event within broader global economic networks, examining how core and periphery dynamics shaped outcomes.\n\nWhich perspective do you find most compelling, and why?`;
    }

    if (/compare|connection|relation|link|similar/.test(lower)) {
      return `The ${event.title} connects to broader historical patterns in ${event.region} and beyond. Contemporary events in other regions often shared underlying causes — trade disruptions, climatic shifts, or the spread of new ideas. Comparative history reveals that no event is truly isolated; the chains of causation extend far across time and space. What specific connection would you like to explore?`;
    }

    return `The ${event.title} of ${yearStr} represents a fascinating intersection of ${event.category} forces in ${event.civilization}. It unfolded in ${event.locationName} against a backdrop of complex regional dynamics. To truly understand this moment, we must consider the perspectives of all groups involved — not merely the victors who wrote the dominant historical accounts. What aspect of this event would you like to explore further: its causes, consequences, key figures, or historiographical debates?`;
  }

  // 1453 / Constantinople / Ottoman / Byzantine specific knowledge
  if (/1453|constantinople|ottoman|byzantine|mehmed/.test(lower)) {
    return `The year 1453 CE stands as one of history's most consequential turning points, with two landmark events reshaping civilization:

**Fall of Constantinople (May 29, 1453)**
Ottoman Sultan Mehmed II captured Constantinople after a 53-day siege, ending the Byzantine Empire. Key effects:
• Ottoman control of East-West trade routes, pressuring Europe to find sea routes to Asia
• Mass migration of Byzantine scholars to Italy, carrying Greek manuscripts westward
• Those scholars and their texts directly fed into the Italian Renaissance

**Gutenberg Printing Revolution (c. 1453-1455)**
In Mainz, Germany, Johannes Gutenberg's movable-type press was producing the Gutenberg Bible. Key effects:
• Dramatic cost reduction in book production
• The scholarly manuscripts brought west by Byzantine refugees were now amplifiable at scale
• Foundation for the Protestant Reformation and Scientific Revolution

**Their Connection**
The fall of Constantinople accelerated the westward flow of classical Greek knowledge. Gutenberg's press then became the engine that multiplied and distributed that knowledge across Europe. Together, 1453 represents a hinge moment: the medieval world closing, and the modern world beginning to open.`;
  }

  // Gutenberg / printing press specific knowledge
  if (/gutenberg|printing press|movable type|print revolution/.test(lower)) {
    return `Johannes Gutenberg's printing press (c. 1450-1455) was one of history's most transformative inventions:

**The Technology**
Gutenberg developed movable metal type and oil-based printing ink at his workshop in Mainz, Germany. The Gutenberg Bible (completed ~1455) was the first major European book printed with this system.

**Why It Mattered**
Before printing, a single book required months of manual copying. Gutenberg's press could produce hundreds of copies rapidly, collapsing the cost of books by over 90%.

**Connection to Constantinople**
In 1453 — the same year as the Fall of Constantinople — Byzantine scholars were fleeing westward with Greek manuscripts. Gutenberg's press became the mechanism that took this classical knowledge and distributed it across Europe at mass scale. This combination directly fueled the Renaissance.

**Long-Term Impact**
• Protestant Reformation: Luther's Ninety-Five Theses (1517) spread across Europe in weeks via print
• Scientific Revolution: Research findings could be shared and verified internationally
• Rise of literacy and vernacular literature across European languages`;
  }

  // General questions without event context
  if (/roman empire|rome|fall of rome/.test(lower)) {
    return `The fall of the Western Roman Empire (476 CE) is one of history's most debated questions:\n\n**Political Instability**: Frequent civil wars and weak central authority undermined governance.\n\n**Economic Decline**: Currency debasement, trade disruption, and heavy taxation eroded the economic base.\n\n**Military Pressure**: External pressures from Huns, Goths, and Vandals strained imperial defenses.\n\n**Environmental Theory**: Recent scholarship highlights climate change and pandemic (Antonine Plague) as contributing factors.\n\nEdward Gibbon blamed Christianity; Peter Heather emphasizes barbarian invasions; Bryan Ward-Perkins stresses material collapse. The truth likely encompasses all these factors.`;
  }

  if (/cold war/.test(lower)) {
    return "The Cold War (1947\u20131991) was a global ideological, political, and technological contest between the United States and Soviet Union. Orthodox historians blame Soviet aggression; revisionist scholars point to American provocations; post-revisionist synthesis recognizes mutual responsibility. Its legacy shapes our geopolitical order to this day. What specific aspect \u2014 nuclear arms race, proxy wars, or ideological competition \u2014 interests you most?";
  }

  if (/renaissance|reformation/.test(lower)) {
    return "These transformative movements reshaped European civilization. The Renaissance (14th\u201317th c.) revived classical learning and humanist values; the Reformation (16th c.) fractured Western Christianity. Scholars debate their relationship \u2014 were they complementary or contradictory? Some see the Reformation as a conservative reaction to Renaissance humanism; others view both as facets of a single modernizing impulse. The printing press, developed in 1440, was crucial to both movements.";
  }

  return "Welcome to the AI Historian! I can help you explore historical events, explain causes and consequences, present multiple historiographical perspectives, and facilitate critical thinking about the past. You can ask me about:\n\n\u2022 Specific historical events or periods\n\u2022 Causes and consequences of turning points\n\u2022 Debates between different historians\n\u2022 Connections between seemingly unrelated events\n\u2022 The key figures who shaped history\n\nWhat would you like to explore today?";
}

export const AIHistorianPanel: React.FC<AIHistorianPanelProps> = ({
  isOpen,
  onToggle,
  contextEvent,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "ai",
      content:
        "Greetings! I am the AI Historian. Ask me anything about historical events, their causes, consequences, or competing interpretations. Select an event from the timeline for contextual discussion.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messageCounter = useRef(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on message/typing changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: `msg-${++messageCounter.current}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    const currentInput = input.trim();
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    const delay = 1000 + Math.random() * 800;
    setTimeout(() => {
      const aiResponse: Message = {
        id: `msg-${++messageCounter.current}`,
        role: "ai",
        content: generateAIResponse(currentInput, contextEvent),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, delay);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.button
        data-ocid="ai_historian.toggle.button"
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center"
        style={{
          background: isOpen
            ? "oklch(0.16 0.04 258)"
            : "linear-gradient(145deg, oklch(0.76 0.19 48) 0%, oklch(0.68 0.21 38) 100%)",
          border: isOpen
            ? "1px solid oklch(0.32 0.06 258)"
            : "1px solid oklch(0.82 0.14 52)",
          boxShadow: isOpen
            ? "0 4px 24px oklch(0 0 0 / 0.5)"
            : "0 6px 28px oklch(0 0 0 / 0.45), 0 0 32px oklch(0.72 0.18 45 / 0.25), inset 0 1px 0 oklch(1 0 0 / 0.2)",
        }}
        whileHover={{ scale: 1.07, transition: { duration: 0.15 } }}
        whileTap={{ scale: 0.93 }}
        title="AI Historian"
      >
        {/* Context event beacon ring */}
        {contextEvent && !isOpen && (
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ border: "2px solid oklch(0.72 0.18 45 / 0.6)" }}
            animate={{ scale: [1, 1.35, 1], opacity: [0.8, 0, 0.8] }}
            transition={{
              duration: 2.2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        )}
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <ChevronDown
                className="w-5 h-5"
                style={{ color: "oklch(0.7 0.06 258)" }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <BookOpen
                className="w-5 h-5"
                style={{ color: "oklch(0.12 0.02 260)" }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            data-ocid="ai_historian.panel"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: "spring", damping: 28, stiffness: 340 }}
            className="fixed bottom-24 right-6 z-50 w-[390px] max-w-[calc(100vw-3rem)] rounded-2xl overflow-hidden"
            style={{
              background: "oklch(0.09 0.018 262)",
              border: "1px solid oklch(0.22 0.04 258 / 0.8)",
              boxShadow:
                "0 24px 64px oklch(0 0 0 / 0.65), 0 0 0 1px oklch(0.3 0.05 258 / 0.2), 0 0 60px oklch(0.72 0.18 45 / 0.04)",
              maxHeight: "calc(100vh - 8rem)",
            }}
          >
            {/* Premium Header — gradient with historian icon */}
            <div
              className="relative flex items-center justify-between px-4 py-3 overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.16 0.05 258) 0%, oklch(0.13 0.04 265) 50%, oklch(0.12 0.03 260) 100%)",
                borderBottom: "1px solid oklch(0.22 0.04 258 / 0.6)",
              }}
            >
              {/* Decorative top highlight */}
              <div
                className="absolute inset-x-0 top-0 h-px pointer-events-none"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, oklch(1 0 0 / 0.1) 30%, oklch(1 0 0 / 0.07) 70%, transparent)",
                }}
              />
              {/* Subtle radial glow behind icon */}
              <div
                className="absolute left-0 top-0 bottom-0 w-24 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse at 20% 50%, oklch(0.6 0.15 255 / 0.08) 0%, transparent 70%)",
                }}
              />

              <div className="flex items-center gap-3 relative">
                {/* Icon container — multi-ring treatment */}
                <div className="relative">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: "oklch(0.55 0.18 255 / 0.12)",
                      transform: "scale(1.4)",
                    }}
                  />
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center relative"
                    style={{
                      background:
                        "linear-gradient(145deg, oklch(0.28 0.08 255) 0%, oklch(0.18 0.06 260) 100%)",
                      border: "1px solid oklch(0.38 0.1 255 / 0.5)",
                      boxShadow:
                        "0 0 16px oklch(0.55 0.18 255 / 0.2), inset 0 1px 0 oklch(1 0 0 / 0.1)",
                    }}
                  >
                    <Bot
                      className="w-4 h-4"
                      style={{ color: "oklch(0.75 0.15 255)" }}
                    />
                  </div>
                </div>

                <div>
                  <div
                    className="text-sm font-display font-bold tracking-wide"
                    style={{ color: "oklch(0.92 0.02 85)" }}
                  >
                    AI Historian
                  </div>
                  {contextEvent ? (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{
                          background: "oklch(0.72 0.18 45)",
                          boxShadow: "0 0 4px oklch(0.72 0.18 45 / 0.8)",
                        }}
                      />
                      <span
                        className="text-[10px] font-mono truncate max-w-[200px]"
                        style={{ color: "oklch(0.72 0.18 45 / 0.9)" }}
                      >
                        {contextEvent.title.slice(0, 28)}
                        {contextEvent.title.length > 28 ? "…" : ""}
                      </span>
                    </div>
                  ) : (
                    <div
                      className="text-[10px] font-mono mt-0.5"
                      style={{ color: "oklch(0.42 0.04 258)" }}
                    >
                      Historical analysis & debate
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={onToggle}
                className="relative w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                style={{ color: "oklch(0.45 0.03 258)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "oklch(0.7 0.02 85)";
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "oklch(0.2 0.03 258)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "oklch(0.45 0.03 258)";
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "transparent";
                }}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="overflow-y-auto px-3 py-3 space-y-3"
              style={{
                maxHeight: "320px",
                background: "oklch(0.09 0.015 262)",
              }}
            >
              {messages.map((msg, i) => (
                <div
                  data-ocid={`ai_historian.message.item.${i + 1}`}
                  key={msg.id}
                  className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar */}
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={
                      msg.role === "ai"
                        ? {
                            background:
                              "linear-gradient(145deg, oklch(0.28 0.08 255), oklch(0.18 0.05 260))",
                            border: "1px solid oklch(0.35 0.08 255 / 0.4)",
                          }
                        : {
                            background:
                              "linear-gradient(145deg, oklch(0.28 0.1 45), oklch(0.2 0.08 40))",
                            border: "1px solid oklch(0.4 0.12 48 / 0.4)",
                          }
                    }
                  >
                    {msg.role === "ai" ? (
                      <Bot
                        className="w-3 h-3"
                        style={{ color: "oklch(0.7 0.15 255)" }}
                      />
                    ) : (
                      <User
                        className="w-3 h-3"
                        style={{ color: "oklch(0.75 0.15 48)" }}
                      />
                    )}
                  </div>

                  {/* Bubble */}
                  <div
                    className="relative max-w-[82%] text-xs leading-relaxed whitespace-pre-line"
                    style={
                      msg.role === "ai"
                        ? {
                            // AI: glass with left rail accent
                            background: "oklch(0.13 0.025 260 / 0.9)",
                            border: "1px solid oklch(0.22 0.03 258 / 0.7)",
                            borderLeft: "2px solid oklch(0.55 0.18 255 / 0.5)",
                            borderRadius: "0 10px 10px 10px",
                            padding: "8px 12px",
                            color: "oklch(0.85 0.018 85)",
                            boxShadow: "0 2px 12px oklch(0 0 0 / 0.2)",
                          }
                        : {
                            // User: warm amber glass
                            background: "oklch(0.18 0.07 45 / 0.5)",
                            border: "1px solid oklch(0.32 0.1 48 / 0.5)",
                            borderRadius: "10px 0 10px 10px",
                            padding: "8px 12px",
                            color: "oklch(0.9 0.025 85)",
                            boxShadow: "0 2px 12px oklch(0 0 0 / 0.2)",
                          }
                    }
                  >
                    {/* Top highlight for depth */}
                    <div
                      className="absolute inset-x-0 top-0 h-px pointer-events-none rounded-t"
                      style={{ background: "oklch(1 0 0 / 0.05)" }}
                    />
                    {msg.content}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex gap-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background:
                        "linear-gradient(145deg, oklch(0.28 0.08 255), oklch(0.18 0.05 260))",
                      border: "1px solid oklch(0.35 0.08 255 / 0.4)",
                    }}
                  >
                    <Bot
                      className="w-3 h-3"
                      style={{ color: "oklch(0.7 0.15 255)" }}
                    />
                  </div>
                  <div
                    className="px-3 py-2.5 rounded-xl flex items-center gap-1.5"
                    style={{
                      background: "oklch(0.13 0.025 260 / 0.9)",
                      border: "1px solid oklch(0.22 0.03 258 / 0.6)",
                      borderLeft: "2px solid oklch(0.55 0.18 255 / 0.4)",
                      borderRadius: "0 10px 10px 10px",
                    }}
                  >
                    {[0, 1, 2].map((dotIdx) => (
                      <div
                        key={dotIdx}
                        className="w-1.5 h-1.5 rounded-full typing-dot"
                        style={{
                          background: "oklch(0.72 0.18 45)",
                          boxShadow: "0 0 4px oklch(0.72 0.18 45 / 0.6)",
                          animationDelay: `${dotIdx * 0.2}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input area */}
            <div
              className="px-3 py-3"
              style={{
                background: "oklch(0.11 0.02 262)",
                borderTop: "1px solid oklch(0.2 0.03 258 / 0.6)",
              }}
            >
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  data-ocid="ai_historian.input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about an event, era, or debate…"
                  className="flex-1 text-xs h-9 rounded-lg"
                  style={{
                    background: "oklch(0.14 0.025 260)",
                    border: "1px solid oklch(0.24 0.035 258 / 0.8)",
                    color: "oklch(0.88 0.02 85)",
                  }}
                  disabled={isTyping}
                />
                <Button
                  data-ocid="ai_historian.send.button"
                  onClick={sendMessage}
                  disabled={!input.trim() || isTyping}
                  size="icon"
                  className="h-9 w-9 flex-shrink-0 rounded-lg transition-all"
                  style={{
                    background:
                      input.trim() && !isTyping
                        ? "linear-gradient(145deg, oklch(0.76 0.19 48), oklch(0.68 0.21 38))"
                        : "oklch(0.16 0.025 258)",
                    border:
                      input.trim() && !isTyping
                        ? "1px solid oklch(0.82 0.14 52)"
                        : "1px solid oklch(0.24 0.03 258)",
                    color:
                      input.trim() && !isTyping
                        ? "oklch(0.1 0.02 260)"
                        : "oklch(0.35 0.03 258)",
                    boxShadow:
                      input.trim() && !isTyping
                        ? "0 0 12px oklch(0.72 0.18 45 / 0.25)"
                        : "none",
                  }}
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIHistorianPanel;
