import React, { useState } from 'react';
import {
  Cpu,
  Plus,
  Play,
  Pause,
  Trash2,
  Zap,
  ArrowRight,
  X,
  Workflow,
  MessageSquare,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AutomationTrigger } from '../../types';

export const AutomationsPage: React.FC = () => {
  const { automations, toggleAutomationStatus, addAutomation, deleteAutomation, setActivePage, addMessage } =
    useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [trigger, setTrigger] = useState<AutomationTrigger>('webhook');
  const [triggerDetails, setTriggerDetails] = useState('');
  const [actionsText, setActionsText] = useState('');
  const [requiresAuth, setRequiresAuth] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const actionList = actionsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    addAutomation({
      name: name.trim(),
      description: description.trim(),
      trigger,
      triggerDetails: triggerDetails.trim() || 'Gatilho configurado via sistema',
      actions: actionList.length > 0 ? actionList : ['Processamento e análise L.U.C.I.A.'],
      status: 'active',
      requiresAuthorization: requiresAuth,
      lastRun: 'Aguardando primeiro evento',
    });

    setName('');
    setDescription('');
    setTriggerDetails('');
    setActionsText('');
    setIsModalOpen(false);
  };

  const handleAskLuciaForAutomation = () => {
    addMessage({
      role: 'user',
      content:
        'Por favor, sugira um fluxo de automação inteligente para nossa empresa que elimine trabalho manual repetitivo.',
    });
    setActivePage('assistant');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[#F2F2F2] tracking-tight">
            Automações
          </h1>
          <p className="text-xs text-[#A1A1AA] mt-1">
            Workflows e fluxos inteligentes com gatilhos e etapas de ação.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAskLuciaForAutomation}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-[#19191C] border border-[#303036] text-[#A1A1AA] hover:text-[#F2F2F2] hover:bg-[#202024] transition-all cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Sugerir no Chat</span>
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-[#F2F2F2] hover:bg-white text-[#0B0B0D] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Fluxo</span>
          </button>
        </div>
      </div>

      {/* Automation Cards */}
      <div className="space-y-4">
        {automations.map((auto) => (
          <div
            key={auto.id}
            className="rounded-2xl border border-[#303036] bg-[#141416] p-5 hover:border-[#D4D4D8]/30 transition-all space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#19191C] border border-[#303036] flex items-center justify-center text-[#D4D4D8]">
                  <Workflow className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[#F2F2F2] flex items-center gap-2">
                    {auto.name}
                    {auto.requiresAuthorization && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#19191C] border border-[#303036] text-[#D4D4D8]">
                        Requer Aprovação
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-[#A1A1AA]">{auto.description}</p>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleAutomationStatus(auto.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#19191C] border border-[#303036] text-[#D4D4D8] hover:text-[#F2F2F2] hover:bg-[#202024] transition-all cursor-pointer"
                >
                  {auto.status === 'active' ? (
                    <>
                      <Pause className="w-3.5 h-3.5" /> Pausar
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" /> Ativar
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => deleteAutomation(auto.id)}
                  className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-[#F2F2F2] hover:bg-[#19191C] transition-colors cursor-pointer"
                  title="Excluir fluxo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Workflow Pipeline Display */}
            <div className="p-3.5 rounded-xl bg-[#19191C] border border-[#303036] text-xs flex flex-col md:flex-row md:items-center gap-3">
              {/* Trigger */}
              <div className="flex-1 space-y-1">
                <div className="text-[10px] uppercase font-medium text-[#A1A1AA] flex items-center gap-1">
                  <Zap className="w-3 h-3 text-[#D4D4D8]" />
                  Gatilho
                </div>
                <div className="text-[#F2F2F2] font-medium">{auto.triggerDetails}</div>
              </div>

              <div className="hidden md:flex text-[#52525B]">
                <ArrowRight className="w-4 h-4" />
              </div>

              {/* Actions */}
              <div className="flex-2 space-y-1">
                <div className="text-[10px] uppercase font-medium text-[#A1A1AA] flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-[#D4D4D8]" />
                  Ações
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {auto.actions.map((act, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] px-2 py-0.5 rounded bg-[#141416] border border-[#303036] text-[#D4D4D8]"
                    >
                      {idx + 1}. {act}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="flex md:flex-col items-center md:items-end justify-between gap-1 text-[11px] text-[#A1A1AA] pt-2 md:pt-0 border-t md:border-t-0 border-[#303036]">
                <span>{auto.lastRun}</span>
                <span className="font-medium text-[#F2F2F2]">
                  {auto.runsCount} disparos
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: New Automation */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#303036] bg-[#141416] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#303036] bg-[#19191C]">
              <h3 className="text-sm font-semibold text-[#F2F2F2]">Novo Fluxo</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#A1A1AA] hover:text-[#F2F2F2]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-[#A1A1AA] mb-1">
                  Nome do Fluxo
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Notificação de Incidentes..."
                  className="w-full rounded-xl bg-[#19191C] border border-[#303036] p-2.5 text-[#F2F2F2] focus:outline-none focus:border-[#D4D4D8]/50"
                />
              </div>

              <div>
                <label className="block font-medium text-[#A1A1AA] mb-1">
                  Descrição
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Objetivo da automação..."
                  className="w-full rounded-xl bg-[#19191C] border border-[#303036] p-2.5 text-[#F2F2F2] focus:outline-none focus:border-[#D4D4D8]/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#A1A1AA] mb-1">
                    Gatilho
                  </label>
                  <select
                    value={trigger}
                    onChange={(e) => setTrigger(e.target.value as AutomationTrigger)}
                    className="w-full rounded-xl bg-[#19191C] border border-[#303036] p-2.5 text-[#F2F2F2] focus:outline-none focus:border-[#D4D4D8]/50 cursor-pointer"
                  >
                    <option value="webhook">Webhook HTTP</option>
                    <option value="schedule">Agendamento (Cron)</option>
                    <option value="task_event">Evento de Tarefa</option>
                    <option value="email_alert">Alerta de E-mail</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-[#A1A1AA] mb-1">
                    Detalhe do Gatilho
                  </label>
                  <input
                    type="text"
                    value={triggerDetails}
                    onChange={(e) => setTriggerDetails(e.target.value)}
                    placeholder="Ex: POST /hooks/alert"
                    className="w-full rounded-xl bg-[#19191C] border border-[#303036] p-2.5 text-[#F2F2F2] focus:outline-none focus:border-[#D4D4D8]/50"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#A1A1AA] mb-1">
                  Ações (uma por linha)
                </label>
                <textarea
                  rows={3}
                  value={actionsText}
                  onChange={(e) => setActionsText(e.target.value)}
                  placeholder="1. Analisar com L.U.C.I.A.&#10;2. Gerar checklist&#10;3. Enviar notificação"
                  className="w-full rounded-xl bg-[#19191C] border border-[#303036] p-2.5 text-[#F2F2F2] focus:outline-none focus:border-[#D4D4D8]/50"
                />
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-[#19191C] border border-[#303036]">
                <input
                  type="checkbox"
                  id="authCheck"
                  checked={requiresAuth}
                  onChange={(e) => setRequiresAuth(e.target.checked)}
                  className="rounded border-[#303036] text-[#F2F2F2] focus:ring-0"
                />
                <label htmlFor="authCheck" className="text-[#A1A1AA] text-xs cursor-pointer">
                  Exigir autorização humana antes de disparar
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#303036]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg text-[#A1A1AA] hover:text-[#F2F2F2]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl font-medium bg-[#F2F2F2] hover:bg-white text-[#0B0B0D] cursor-pointer"
                >
                  Salvar Fluxo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
