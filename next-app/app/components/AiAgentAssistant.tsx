"use client";

import { usePathname } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { trackSiteEvent } from "./analytics";
import { buildAiAgentLeadFormData, submitFormspree } from "./formspree";

const AGENT_OPTIONS = [
  "Customer support",
  "Sales & marketing",
  "Internal knowledge / QA",
  "DevOps & automation",
  "Data & analytics",
  "Quantum-inspired",
  "Something else",
] as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Once dismissed (or the request is submitted), don't re-open the assistant on
// later pages for the rest of the browser session.
const SESSION_DISMISS_KEY = "yl:ai-assistant-dismissed";

type ChatMessage = {
  id: number;
  role: "assistant" | "user";
  text: string;
};

type Answers = {
  agentType: string;
  challenge: string;
  name: string;
  email: string;
  company: string;
};

let hasTrackedImpression = false;

export default function AiAgentAssistant() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typing, setTyping] = useState(false);
  const [awaitingOptions, setAwaitingOptions] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const answersRef = useRef<Answers>({
    agentType: "",
    challenge: "",
    name: "",
    email: "",
    company: "",
  });
  const idRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dismissedRef = useRef(false);

  // Remember a dismissal from earlier in this session (e.g. previous page).
  useEffect(() => {
    try {
      dismissedRef.current = window.sessionStorage.getItem(SESSION_DISMISS_KEY) === "1";
    } catch {
      dismissedRef.current = false;
    }
  }, []);

  // Open the widget shortly after the visitor lands.
  useEffect(() => {
    if (pathname === "/ai-agents") {
      setVisible(false);
      return;
    }

    const timer = window.setTimeout(() => {
      if (dismissedRef.current) return;
      setVisible(true);
      if (!hasTrackedImpression) {
        trackSiteEvent("ai_agents_widget_impression", { pathname });
        hasTrackedImpression = true;
      }
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  const nextId = () => ++idRef.current;

  const pushMessage = (role: ChatMessage["role"], text: string) => {
    setMessages((prev) => [...prev, { id: nextId(), role, text }]);
  };

  // Append an assistant message after a short "thinking" delay.
  const assistantSays = (text: string, afterMs: number, options?: boolean) => {
    setTyping(true);
    window.setTimeout(() => {
      setTyping(false);
      pushMessage("assistant", text);
      setAwaitingOptions(Boolean(options));
    }, afterMs);
  };

  // Kick off the conversation once the widget is visible.
  useEffect(() => {
    if (!visible || messages.length > 0) return;
    assistantSays(
      "Hi there! 👋 I'm the Yabloko Labs AI assistant.\n\nI'll ask you a few quick questions about the AI agent you're looking for — our team will review it and get back to you within 24 hours.\n\nFirst up: what kind of AI agent are you looking for?",
      700,
      true,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // Keep the newest message in view.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  // Focus the text input whenever it becomes the active input mode.
  useEffect(() => {
    if (visible && !typing && !awaitingOptions && !submitted) {
      inputRef.current?.focus();
    }
  }, [visible, typing, awaitingOptions, submitted, step]);

  const advance = (userText: string, agentType?: string) => {
    pushMessage("user", userText);
    setInputValue("");
    setAwaitingOptions(false);
    setStep((s) => s + 1);

    const answers = answersRef.current;
    switch (step) {
      case 0:
        answers.agentType = agentType ?? userText;
        assistantSays(
          `Great choice — ${answers.agentType}.\n\nIn a sentence or two, what should the agent actually do for you? For example: "Answer customer questions on our pricing page."`,
          900,
        );
        break;
      case 1:
        answers.challenge = userText.trim();
        assistantSays("Got it — that sounds like a great use case. What's your name?", 800);
        break;
      case 2:
        answers.name = userText.trim();
        assistantSays(`Nice to meet you, ${answers.name}! What email should we use to reach you?`, 800);
        break;
      case 3:
        answers.email = userText.trim();
        assistantSays("Last one — which company are you with? (Optional — type “skip” to move on.)", 800);
        break;
      case 4:
        answers.company = userText.trim().toLowerCase() === "skip" ? "" : userText.trim();
        assistantSays(
          `Perfect — here's a quick summary of your request:\n\n• Agent type: ${answers.agentType}\n• What it should do: ${answers.challenge}\n• Name: ${answers.name}\n• Email: ${answers.email}${answers.company ? `\n• Company: ${answers.company}` : ""}\n\nSend this over and our team will get back to you within 24 hours. 🚀`,
          1000,
        );
        break;
      default:
        break;
    }
  };

  const handleChip = (option: string) => advance(option, option);

  const handleInputSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = inputValue.trim();
    if (!value || typing || awaitingOptions || submitted) return;

    if (step === 3 && !EMAIL_PATTERN.test(value)) {
      setErrorMessage("That email doesn't look right — mind double-checking it?");
      return;
    }
    setErrorMessage("");
    advance(value);
  };

  const handleDismiss = () => {
    trackSiteEvent("ai_agents_widget_dismiss", { pathname });
    dismissedRef.current = true;
    try {
      window.sessionStorage.setItem(SESSION_DISMISS_KEY, "1");
    } catch {
      // Storage unavailable (private mode etc.) — just don't re-show this page.
    }
    setVisible(false);
  };

  const handleSubmit = async () => {
    const answers = answersRef.current;
    trackSiteEvent("ai_agents_consultation_request", {
      agentType: answers.agentType,
      hasCompany: Boolean(answers.company),
    });

    setSubmitting(true);
    setErrorMessage("");

    try {
      await submitFormspree(buildAiAgentLeadFormData(answers));

      trackSiteEvent("ai_agents_consultation_success", {
        agentType: answers.agentType,
      });

      // The request is in — don't re-open the assistant on the next page.
      dismissedRef.current = true;
      try {
        window.sessionStorage.setItem(SESSION_DISMISS_KEY, "1");
      } catch {
        // Storage unavailable — fine.
      }

      setSubmitting(false);
      setSubmitted(true);
      pushMessage(
        "assistant",
        "🎉 Request sent!\n\nOur team will review it and get back to you within 24 hours. If anything's urgent, reach us any time at support@yablokolabs.com.",
      );
    } catch (error) {
      console.error(error);
      trackSiteEvent("ai_agents_consultation_error", { agentType: answers.agentType });
      setSubmitting(false);
      setErrorMessage("Something went wrong sending your request. Please try again, or email support@yablokolabs.com.");
    }
  };

  if (pathname === "/ai-agents") return null;

  return (
    <aside
      className={`assistant-widget${visible ? " show" : ""}`}
      role="dialog"
      aria-label="AI agent assistant — tell us what you need"
    >
      <div className="assistant-widget-header">
        <div className="assistant-widget-heading">
          <span className="assistant-widget-badge">Yabloko Labs Assistant</span>
          <span className="assistant-widget-status">
            <span className="assistant-widget-dot" aria-hidden="true" />
            Replies within 24h
          </span>
        </div>
        <button
          type="button"
          className="assistant-widget-close"
          onClick={handleDismiss}
          aria-label="Close assistant"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="assistant-widget-messages" ref={scrollRef}>
        {messages.map((message) => (
          <div key={message.id} className={`assistant-msg assistant-msg-${message.role}`}>
            <span className="assistant-msg-text">{message.text}</span>
          </div>
        ))}
        {typing && (
          <div className="assistant-msg assistant-msg-assistant">
            <span className="assistant-typing" aria-label="Assistant is typing">
              <span />
              <span />
              <span />
            </span>
          </div>
        )}
      </div>

      {submitted ? (
        <div className="assistant-widget-footer">
          <button type="button" className="btn btn-primary assistant-widget-send" onClick={handleDismiss}>
            Close
          </button>
        </div>
      ) : (
        <div className="assistant-widget-footer">
          {awaitingOptions ? (
            <div className="assistant-options">
              {AGENT_OPTIONS.map((option) => (
                <button key={option} type="button" className="assistant-chip" onClick={() => handleChip(option)}>
                  {option}
                </button>
              ))}
            </div>
          ) : step >= 5 ? (
            <button
              type="button"
              className="btn btn-primary assistant-widget-send"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Sending..." : "Send my request"}
            </button>
          ) : (
            <form className="assistant-input-row" onSubmit={handleInputSubmit} noValidate>
              <input
                ref={inputRef}
                type={step === 3 ? "email" : "text"}
                className="assistant-input"
                placeholder={step === 3 ? "you@company.com" : step === 4 ? "Company name (or type skip)" : "Type your answer..."}
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                autoComplete={step === 2 ? "name" : step === 3 ? "email" : step === 4 ? "organization" : "off"}
                aria-label={step === 3 ? "Your email" : "Your answer"}
              />
              <button type="submit" className="assistant-send" aria-label="Send message" disabled={!inputValue.trim() || typing}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13" />
                  <path d="M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            </form>
          )}
          {errorMessage && (
            <p className="assistant-error" role="alert">
              {errorMessage}
            </p>
          )}
        </div>
      )}
    </aside>
  );
}