import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowUp,
  SlidersHorizontal,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
  Download,
  Trash2,
  Wrench,
  Zap,
  BarChart2,
  FolderKanban,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ChatMessage } from '../../types';
import { MarkdownContent } from '../chat/MarkdownContent';
import { FeedbackModal } from '../chat/FeedbackModal';
import { LuciaPresence } from '../presence/LuciaPresence';
import luciaFaceSrc from '../../assets/images/lucia_character_official.jpg';

const INITIAL_SUGGESTIONS = [
  {
    title: 'Resolver um problema',
    icon: Wrench,
    prompt:
      'Gostaria de resolver um problema operacional na minha rotina. Como a L.U.C.I.A. pode me ajudar com um diagnóstico e plano de ação prático?',
  },
  {
    title: 'Planejar uma tarefa',
    icon: FolderKanban,
    prompt:
      'Preciso estruturar o planejamento de uma tarefa importante, definindo etapas, marcos, prazos e contingências.',
  },
  {
    title: 'Criar uma automação',
    icon: Zap,
    prompt:
      'Quero criar uma automação para otimizar um fluxo de trabalho repetitivo. Quais são as melhores abordagens e gatilhos recomendados?',
  },
  {
    title: 'Analisar um processo',
    icon: BarChart2,
    prompt:
      'Gostaria de analisar um processo operacional existente para identificar gargalos, desperdícios e oportunidades de melhoria.',
  },
];

const MODE_LABELS: Record<string, string> = {
  default: 'Resolução',
  planner: 'Planejamento Estratégico',
  automation: 'Automação',
  technical: 'Análise Técnica',
};

export const AssistantPage: React.FC = () => {
  const {
    messages,
    addMessage,
    updateMessageRating,
    clearMessages,
    memories,
    settings,
    updateSettings,
    isSendingMessage,
    setIsSendingMessage,
    addAuditLog,
  } = useApp();

  const [input, setInput] = useState('');
  const [feedbackTargetMessage, setFeedbackTargetMessage] = useState<{
    message: ChatMessage;
    rating: 'positive' | 'negative';
  } | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);

  // Holographic Presence and dissolve state
  const [showPresence, setShowPresence] = useState<boolean>(() => messages.length === 0);
  const [isDissolving, setIsDissolving] = useState<boolean>(false);
  const [hasPresented, setHasPresented] = useState<boolean>(() => messages.length > 0);

  const handleDissolveComplete = useCallback(() => {
    setShowPresence(false);
  }, []);

  const handlePresentationComplete = useCallback(() => {
    setHasPresented(true);
  }, []);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modeMenuRef = useRef<HTMLDivElement>(null);

  // Sync showPresence if messages get cleared (New chat)
  useEffect(() => {
    if (messages.length === 0) {
      setShowPresence(true);
      setIsDissolving(false);
    }
  }, [messages.length]);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (!showPresence) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isSendingMessage, showPresence]);

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Close mode menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modeMenuRef.current &&
        !modeMenuRef.current.contains(event.target as Node)
      ) {
        setIsModeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const content = (textToSend || input).trim();
    if (!content || isSendingMessage) return;

    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Trigger dissolve animation of L.U.C.I.A.'s presence if on initial screen
    if (showPresence) {
      setIsDissolving(true);
      setTimeout(() => {
        setShowPresence(false);
      }, 700);
    }

    addMessage({
      role: 'user',
      content,
      mode: settings.assistantMode,
    });

    setIsSendingMessage(true);

    try {
      const activeMemories = settings.autoMemoryInjection
        ? memories.filter((m) => m.isActive)
        : [];

      const historyPayload = messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        text: m.content,
      }));

      const res = await fetch('/api/lucia/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          history: historyPayload,
          memories: activeMemories,
          mode: settings.assistantMode,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.details || errorData.error || `Erro de resposta (${res.status})`
        );
      }

      const data = await res.json();

      addMessage({
        role: 'assistant',
        content: data.text,
        modelUsed: data.model || 'gemini-3.8-flash',
        mode: data.mode,
      });

      addAuditLog(
        'assistant_query',
        `Consulta processada com sucesso pelo modo ${settings.assistantMode}.`
      );
    } catch (err: unknown) {
      console.error('Falha na comunicação com a L.U.C.I.A.:', err);
      const errMsg =
        err instanceof Error ? err.message : 'Falha ao conectar com o serviço de IA.';

      addMessage({
        role: 'assistant',
        content: `Não foi possível concluir o processamento da sua solicitação no momento: \`${errMsg}\`\n\nPor favor, tente novamente em instantes.`,
        modelUsed: 'gemini-3.8-flash (error-handler)',
      });
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
  };

  const handleCopyMessage = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleRate = (message: ChatMessage, rating: 'positive' | 'negative') => {
    updateMessageRating(message.id, rating);
    setFeedbackTargetMessage({ message, rating });
  };

  const handleExportChat = () => {
    if (messages.length === 0) return;
    const textData = messages
      .map(
        (m) =>
          `[${new Date(m.timestamp).toLocaleString('pt-BR')}] ${
            m.role === 'user' ? 'USUÁRIO' : 'L.U.C.I.A.'
          }:\n${m.content}\n`
      )
      .join('\n----------------------------------------\n\n');

    const blob = new Blob([textData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lucia-conversa-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const currentModeLabel = MODE_LABELS[settings.assistantMode] || 'Resolução';

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto px-4 md:px-6 relative">
      {/* Discreet Secondary Top Actions (When in chat conversation) */}
      {!showPresence && messages.length > 0 && (
        <div className="flex items-center justify-between gap-2 pt-3 pb-1 text-xs">
          <button
            type="button"
            onClick={() => {
              setShowPresence(true);
              setIsDissolving(false);
            }}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[#A7AFBD] hover:text-[#F5F7FA] hover:bg-[#151922] transition-colors cursor-pointer border border-transparent hover:border-[#292F3B]"
            title="Ver presença holográfica L.U.C.I.A."
          >
            <div className="w-4 h-4 rounded-full overflow-hidden border border-[#DCE5F2]/50 inline-flex items-center justify-center bg-[#08090C] shrink-0">
              <img
                src={luciaFaceSrc}
                alt="L.U.C.I.A."
                className="w-full h-full object-cover scale-125 object-top"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="font-medium text-[11px] tracking-wide">Presença L.U.C.I.A.</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportChat}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[#A7AFBD] hover:text-[#F5F7FA] hover:bg-[#151922] transition-colors cursor-pointer"
              title="Exportar transcrição da conversa"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar</span>
            </button>
            <button
              type="button"
              onClick={clearMessages}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[#A7AFBD] hover:text-[#F5F7FA] hover:bg-[#151922] transition-colors cursor-pointer"
              title="Nova conversa e limpar histórico"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Nova Conversa</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Conversation / Presence Showcase Canvas */}
      <div className="flex-1 overflow-y-auto px-1 py-2 flex flex-col justify-between">
        {showPresence ? (
          /* CINEMATIC HOLOGRAPHIC PRESENCE HERO STATE */
          <div className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto w-full text-center py-2 animate-in fade-in duration-300">
            {/* Boundless Living Presence of L.U.C.I.A. */}
            <div className="my-1 sm:my-2 relative flex items-center justify-center w-full">
              <LuciaPresence
                isDissolving={isDissolving}
                onDissolveComplete={handleDissolveComplete}
                onPresentationComplete={handlePresentationComplete}
              />
            </div>

            {/* Elegant Identity & Mission Statement (revealed smoothly in awakening step 7) */}
            <div
              className={`space-y-1.5 mb-6 sm:mb-8 max-w-md transition-all duration-1000 ease-out ${
                hasPresented
                  ? 'opacity-100 translate-y-0 filter-none'
                  : 'opacity-0 translate-y-3 blur-[2px]'
              }`}
            >
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-wider text-[#F5F7FA]">
                L.U.C.I.A.
              </h2>
              <p className="text-xs sm:text-sm text-[#A7AFBD] font-normal tracking-wide">
                Inteligência em movimento. Resultados em ação.
              </p>
            </div>

            {/* 4 Compact Discreet Suggestion Cards */}
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-xl px-2 transition-all duration-1000 delay-200 ease-out ${
                hasPresented
                  ? 'opacity-100 translate-y-0 filter-none'
                  : 'opacity-0 translate-y-3 blur-[2px]'
              }`}
            >
              {INITIAL_SUGGESTIONS.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(item.prompt)}
                    className="flex items-center gap-3 p-3 rounded-xl border border-[#292F3B] bg-[#151922]/80 hover:bg-[#151922] hover:border-[#8B5CF6]/50 text-left transition-all duration-200 cursor-pointer group shadow-xs backdrop-blur-xs"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#101217] border border-[#292F3B] flex items-center justify-center text-[#A7AFBD] group-hover:text-[#F5F7FA] group-hover:border-[#8B5CF6]/40 transition-colors shrink-0">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-[#DCE5F2] group-hover:text-[#F5F7FA] transition-colors">
                      {item.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* ACTIVE CHAT MESSAGE STREAM */
          <div className="space-y-6 max-w-3xl mx-auto w-full pb-4 pt-2">
            {messages.map((msg) => {
              const isAssistant = msg.role === 'assistant';

              return (
                <div
                  key={msg.id}
                  className={`flex ${
                    isAssistant ? 'justify-start' : 'justify-end'
                  }`}
                >
                  {/* Message Bubble Container */}
                  <div
                    className={`rounded-2xl px-5 py-4 text-sm leading-relaxed transition-all ${
                      isAssistant
                        ? 'bg-[#101217] border border-[#292F3B] text-[#F5F7FA] max-w-[92%] md:max-w-[85%] shadow-sm'
                        : 'bg-[#151922] border border-[#292F3B] text-[#F5F7FA] max-w-[85%] md:max-w-[80%]'
                    }`}
                  >
                    {/* Header: Name, Avatar and Discreet Timestamp */}
                    <div className="flex items-center justify-between gap-3 mb-2.5 text-xs">
                      <div className="flex items-center gap-2">
                        {isAssistant && (
                          <div className="w-5 h-5 rounded-full overflow-hidden border border-[#DCE5F2]/50 shadow-xs relative shrink-0 bg-[#08090C]">
                            <img
                              src={luciaFaceSrc}
                              alt="L.U.C.I.A."
                              className="w-full h-full object-cover scale-135 object-top"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}
                        <span className="font-medium text-[#DCE5F2] tracking-wide">
                          {isAssistant ? 'L.U.C.I.A.' : 'Você'}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#A7AFBD] font-normal">
                        {new Date(msg.timestamp).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* Content */}
                    {isAssistant ? (
                      <MarkdownContent content={msg.content} />
                    ) : (
                      <p className="whitespace-pre-wrap leading-relaxed text-[#F5F7FA]">
                        {msg.content}
                      </p>
                    )}

                    {/* Assistant Footer: Discreet Copy and Feedback */}
                    {isAssistant && (
                      <div className="mt-3.5 pt-2.5 border-t border-[#292F3B]/60 flex items-center justify-between text-xs text-[#A7AFBD]">
                        {/* Rating Buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleRate(msg, 'positive')}
                            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                              msg.rating === 'positive'
                                ? 'text-[#F5F7FA] bg-[#292F3B]'
                                : 'text-[#A7AFBD] hover:text-[#F5F7FA] hover:bg-[#151922]'
                            }`}
                            title="Útil e precisa"
                            aria-label="Avaliar como útil"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRate(msg, 'negative')}
                            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                              msg.rating === 'negative'
                                ? 'text-[#F5F7FA] bg-[#292F3B]'
                                : 'text-[#A7AFBD] hover:text-[#F5F7FA] hover:bg-[#151922]'
                            }`}
                            title="Necessita melhorias"
                            aria-label="Avaliar como necessitando melhorias"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>

                          {msg.ratingFeedbackSubmitted && (
                            <span className="flex items-center gap-1 text-[11px] text-[#DCE5F2] ml-1.5">
                              <CheckCircle2 className="w-3 h-3 text-[#8B5CF6]" />
                              Feedback registrado
                            </span>
                          )}
                        </div>

                        {/* Copy button */}
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(msg.content, msg.id)}
                          className="flex items-center gap-1 text-[11px] text-[#A7AFBD] hover:text-[#F5F7FA] transition-colors cursor-pointer"
                          title="Copiar resposta"
                        >
                          {copiedMessageId === msg.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-[#F5F7FA]" />
                              <span className="text-[#F5F7FA] font-medium">Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Discreet Loading Indicator */}
            {isSendingMessage && (
              <div className="flex justify-start items-center">
                <div className="rounded-2xl px-4 py-3 bg-[#101217] border border-[#292F3B] text-xs text-[#A7AFBD] flex items-center gap-2.5">
                  <span className="inline-flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#DCE5F2] animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6475FF] animate-bounce [animation-delay:0.4s]"></span>
                  </span>
                  <span className="text-[#F5F7FA] font-normal">
                    L.U.C.I.A. está formulando a resposta...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Modern Dark Minimalist Input Area */}
      <div className="w-full max-w-3xl mx-auto pb-4 pt-2">
        <div className="rounded-2xl border border-[#292F3B] bg-[#101217] focus-within:border-[#8B5CF6]/50 focus-within:ring-1 focus-within:ring-[#8B5CF6]/20 transition-all p-3 shadow-lg">
          {/* Adaptable Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Pergunte qualquer coisa à L.U.C.I.A..."
            rows={1}
            disabled={isSendingMessage}
            className="w-full bg-transparent px-2 text-sm text-[#F5F7FA] placeholder:text-[#A7AFBD]/70 focus:outline-none resize-none leading-relaxed min-h-[44px] max-h-[180px]"
          />

          {/* Bottom Bar: Compact Mode Selector & Send Button */}
          <div className="flex items-center justify-between pt-2 px-1 border-t border-[#292F3B]/60 mt-1">
            {/* Left: Compact Mode Menu */}
            <div ref={modeMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setIsModeMenuOpen(!isModeMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-[#A7AFBD] hover:text-[#F5F7FA] bg-[#151922] border border-[#292F3B] hover:border-[#8B5CF6]/30 transition-colors cursor-pointer"
                title="Alterar modo operacional"
              >
                <SlidersHorizontal className="w-3 h-3 text-[#DCE5F2]" />
                <span>{currentModeLabel}</span>
              </button>

              {/* Dropdown Menu */}
              {isModeMenuOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-52 rounded-xl bg-[#151922] border border-[#292F3B] shadow-xl py-1 z-50 text-xs animate-in fade-in duration-150">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-semibold text-[#A7AFBD] tracking-wider border-b border-[#292F3B]/80">
                    Modo Operacional
                  </div>
                  {Object.entries(MODE_LABELS).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        updateSettings({ assistantMode: key as any });
                        setIsModeMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between transition-colors cursor-pointer ${
                        settings.assistantMode === key
                          ? 'bg-[#292F3B] text-[#F5F7FA] font-medium'
                          : 'text-[#A7AFBD] hover:bg-[#101217] hover:text-[#F5F7FA]'
                      }`}
                    >
                      <span>{label}</span>
                      {settings.assistantMode === key && (
                        <Check className="w-3.5 h-3.5 text-[#8B5CF6]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Send Button */}
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || isSendingMessage}
              className="w-8 h-8 rounded-xl bg-[#F5F7FA] hover:bg-white text-[#08090C] flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm cursor-pointer"
              title="Enviar mensagem (Enter)"
              aria-label="Enviar mensagem"
            >
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {feedbackTargetMessage && (
        <FeedbackModal
          message={feedbackTargetMessage.message}
          initialRating={feedbackTargetMessage.rating}
          onClose={() => setFeedbackTargetMessage(null)}
        />
      )}
    </div>
  );
};
