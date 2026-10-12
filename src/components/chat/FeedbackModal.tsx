import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, X, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ChatMessage, FeedbackData } from '../../types';
import { useApp } from '../../context/AppContext';

interface FeedbackModalProps {
  message: ChatMessage;
  initialRating: 'positive' | 'negative';
  onClose: () => void;
}

const POSITIVE_TAGS = [
  'Alta Precisão',
  'Resposta Clara & Objetiva',
  'Solução Prática',
  'Excelente Estruturação',
  'Economizou Tempo',
];

const NEGATIVE_TAGS = [
  'Inexatidão Técnica',
  'Faltou Detalhamento Prático',
  'Muito Genérica',
  'Sugestão Inaplicável',
  'Não Seguiu Diretriz',
  'Outro Erro',
];

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  message,
  initialRating,
  onClose,
}) => {
  const { submitFeedback } = useApp();
  const [rating, setRating] = useState<'positive' | 'negative'>(initialRating);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successStatus, setSuccessStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const payload: FeedbackData = {
      messageId: message.id,
      userMessage: 'Última interação da sessão',
      assistantResponse: message.content.slice(0, 300),
      rating,
      tags: selectedTags,
      comment: comment.trim(),
      timestamp: new Date().toISOString(),
    };

    const res = await submitFeedback(payload);
    setIsSubmitting(false);

    if (res.success) {
      setSuccessStatus('Avaliação registrada com sucesso.');
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setErrorMessage(res.message || 'Falha ao enviar avaliação.');
    }
  };

  const availableTags = rating === 'positive' ? POSITIVE_TAGS : NEGATIVE_TAGS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl border border-[#292F3B] bg-[#101217] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#292F3B] bg-[#151922]">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[#F5F7FA]">
              Avaliação da Resposta
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#A7AFBD] hover:text-[#F5F7FA] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {successStatus ? (
            <div className="py-8 flex flex-col items-center text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#151922] border border-[#292F3B] flex items-center justify-center text-[#F5F7FA]">
                <CheckCircle2 className="w-5 h-5 text-[#8B5CF6]" />
              </div>
              <p className="text-sm font-medium text-[#F5F7FA]">{successStatus}</p>
              <p className="text-xs text-[#A7AFBD]">
                Seu feedback ajuda a melhorar a precisão da L.U.C.I.A.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Rating Type Switcher */}
              <div>
                <label className="block text-xs font-medium text-[#A7AFBD] mb-2">
                  Classificação
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRating('positive');
                      setSelectedTags([]);
                    }}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      rating === 'positive'
                        ? 'border-[#8B5CF6] bg-[#151922] text-[#F5F7FA]'
                        : 'border-[#292F3B] bg-[#101217] text-[#A7AFBD] hover:text-[#F5F7FA]'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    Útil e Precisa
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRating('negative');
                      setSelectedTags([]);
                    }}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      rating === 'negative'
                        ? 'border-[#8B5CF6] bg-[#151922] text-[#F5F7FA]'
                        : 'border-[#292F3B] bg-[#101217] text-[#A7AFBD] hover:text-[#F5F7FA]'
                    }`}
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    Necessita Ajustes
                  </button>
                </div>
              </div>

              {/* Tag selector */}
              <div>
                <label className="block text-xs font-medium text-[#A7AFBD] mb-2">
                  Tags rápidas
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {availableTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#F5F7FA] text-[#08090C] border-[#F5F7FA] font-medium'
                            : 'bg-[#151922] border-[#292F3B] text-[#A7AFBD] hover:text-[#F5F7FA]'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Comment / Error details */}
              <div>
                <label className="block text-xs font-medium text-[#A7AFBD] mb-1.5">
                  Comentários ou sugestão (opcional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Explique o que pode ser aprimorado..."
                  rows={3}
                  className="w-full text-xs rounded-xl bg-[#101217] border border-[#292F3B] p-2.5 text-[#F5F7FA] placeholder:text-[#A7AFBD]/60 focus:outline-none focus:border-[#8B5CF6]/50"
                />
              </div>

              {/* Error banner if any */}
              {errorMessage && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#151922] border border-[#292F3B] text-xs text-[#F5F7FA]">
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#8B5CF6]" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#292F3B]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-[#A7AFBD] hover:text-[#F5F7FA] transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-medium bg-[#F5F7FA] hover:bg-white text-[#08090C] transition-all disabled:opacity-40 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
