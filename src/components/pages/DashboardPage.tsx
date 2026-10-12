import React from 'react';
import {
  CheckSquare,
  Clock,
  Cpu,
  Database,
  ArrowRight,
  Shield,
  Plus,
  MessageSquare,
  Activity,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DashboardPage: React.FC = () => {
  const {
    tasks,
    automations,
    memories,
    auditLogs,
    setActivePage,
    messages,
  } = useApp();

  const activeAutomationsCount = automations.filter((a) => a.status === 'active').length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const pendingTasks = tasks.filter((t) => t.status === 'pending' || t.status === 'in_progress').length;
  const needsAuthTasks = tasks.filter((t) => t.status === 'needs_auth').length;

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 space-y-6">
      {/* Hero Welcome Banner */}
      <div className="rounded-2xl border border-[#292F3B] bg-[#101217] p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <h1 className="text-xl font-semibold text-[#F5F7FA] tracking-tight">
              Visão Geral
            </h1>
            <p className="text-xs text-[#A7AFBD] leading-relaxed">
              Resumo operacional das tarefas, automações configuradas e histórico de atividades.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActivePage('assistant')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-[#F5F7FA] hover:bg-white text-[#08090C] transition-all cursor-pointer shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Abrir Chat</span>
            </button>
            <button
              type="button"
              onClick={() => setActivePage('tasks')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-[#151922] border border-[#292F3B] text-[#F5F7FA] hover:bg-[#1C202B] transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova Tarefa</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="rounded-xl border border-[#292F3B] bg-[#101217] p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-[#A7AFBD] font-normal">Tarefas Ativas</div>
            <div className="text-2xl font-semibold text-[#F5F7FA] mt-1">{pendingTasks}</div>
            <div className="text-[11px] text-[#A7AFBD] mt-0.5">
              {completedTasks} finalizadas
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#151922] border border-[#292F3B] flex items-center justify-center text-[#DCE5F2]">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="rounded-xl border border-[#292F3B] bg-[#101217] p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-[#A7AFBD] font-normal">Automações Ativas</div>
            <div className="text-2xl font-semibold text-[#F5F7FA] mt-1">{activeAutomationsCount}</div>
            <div className="text-[11px] text-[#A7AFBD] mt-0.5">
              {automations.reduce((acc, curr) => acc + curr.runsCount, 0)} execuções
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#151922] border border-[#292F3B] flex items-center justify-center text-[#DCE5F2]">
            <Cpu className="w-4 h-4" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="rounded-xl border border-[#292F3B] bg-[#101217] p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-[#A7AFBD] font-normal">Memória Contextual</div>
            <div className="text-2xl font-semibold text-[#F5F7FA] mt-1">{memories.length}</div>
            <div className="text-[11px] text-[#A7AFBD] mt-0.5">
              Diretrizes registradas
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#151922] border border-[#292F3B] flex items-center justify-center text-[#DCE5F2]">
            <Database className="w-4 h-4" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="rounded-xl border border-[#292F3B] bg-[#101217] p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-[#A7AFBD] font-normal">Controle de Segurança</div>
            <div className="text-2xl font-semibold text-[#F5F7FA] mt-1">
              {needsAuthTasks > 0 ? `${needsAuthTasks} Pendente` : 'Protegido'}
            </div>
            <div className="text-[11px] text-[#A7AFBD] mt-0.5">
              Autorização humana exigida
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#151922] border border-[#292F3B] flex items-center justify-center text-[#8B5CF6]">
            <Shield className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Active Tasks & Automations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Tasks Widget */}
          <div className="rounded-2xl border border-[#303036] bg-[#141416] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#303036]">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-[#D4D4D8]" />
                <h2 className="text-sm font-semibold text-[#F2F2F2]">Tarefas Recentes</h2>
              </div>
              <button
                type="button"
                onClick={() => setActivePage('tasks')}
                className="text-xs text-[#A1A1AA] hover:text-[#F2F2F2] font-medium flex items-center gap-1 cursor-pointer transition-colors"
              >
                Ver Todas <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-[#303036]/60">
              {tasks.slice(0, 4).map((task) => (
                <div key={task.id} className="p-4 hover:bg-[#19191C]/50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-[#F2F2F2]">
                          {task.title}
                        </span>
                        {task.status === 'completed' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#19191C] text-[#D4D4D8] border border-[#303036]">
                            Concluída
                          </span>
                        )}
                        {task.status === 'in_progress' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#19191C] text-[#F2F2F2] border border-[#303036]">
                            Em Execução
                          </span>
                        )}
                        {task.status === 'needs_auth' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#19191C] text-[#D4D4D8] border border-[#303036]">
                            Requer Autorização
                          </span>
                        )}
                        {task.status === 'pending' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#19191C] text-[#A1A1AA] border border-[#303036]">
                            Pendente
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#A1A1AA] line-clamp-1">{task.description}</p>
                    </div>
                    <div className="text-[11px] text-[#A1A1AA] whitespace-nowrap">
                      {task.dueDate}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Workflow Automation Highlights */}
          <div className="rounded-2xl border border-[#303036] bg-[#141416] p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#D4D4D8]" />
                <h2 className="text-sm font-semibold text-[#F2F2F2]">Automações</h2>
              </div>
              <button
                type="button"
                onClick={() => setActivePage('automations')}
                className="text-xs text-[#A1A1AA] hover:text-[#F2F2F2] font-medium flex items-center gap-1 cursor-pointer transition-colors"
              >
                Gerenciar <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {automations.map((auto) => (
                <div
                  key={auto.id}
                  className="p-3.5 rounded-xl border border-[#303036] bg-[#19191C] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[#F2F2F2]">{auto.name}</span>
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        auto.status === 'active' ? 'bg-[#D4D4D8]' : 'bg-[#52525B]'
                      }`}
                    />
                  </div>
                  <p className="text-[11px] text-[#A1A1AA] line-clamp-2">{auto.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 span): Recent Chat Snapshot & Audit Activity */}
        <div className="space-y-6">
          {/* Quick Assistant Access */}
          <div className="rounded-2xl border border-[#303036] bg-[#141416] p-5">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-[#D4D4D8]" />
              <h2 className="text-sm font-semibold text-[#F2F2F2]">Conversa com L.U.C.I.A.</h2>
            </div>

            {messages.length > 0 ? (
              <div className="space-y-2 mb-4">
                <div className="p-3 rounded-xl bg-[#19191C] border border-[#303036] text-xs text-[#A1A1AA]">
                  <span className="font-medium text-[#D4D4D8] text-[10px] uppercase block mb-1">
                    {messages[messages.length - 1].role === 'assistant' ? 'L.U.C.I.A.' : 'Você'}
                  </span>
                  <p className="line-clamp-3 text-[#F2F2F2]">
                    {messages[messages.length - 1].content}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#A1A1AA] mb-4">
                Inicie uma consulta direta com a inteligência artificial.
              </p>
            )}

            <button
              type="button"
              onClick={() => setActivePage('assistant')}
              className="w-full py-2 px-3 rounded-xl text-xs font-medium bg-[#F2F2F2] hover:bg-white text-[#0B0B0D] transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{messages.length > 0 ? 'Continuar Conversa' : 'Iniciar Conversa'}</span>
            </button>
          </div>

          {/* Activity Feed */}
          <div className="rounded-2xl border border-[#303036] bg-[#141416] p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#D4D4D8]" />
                <h2 className="text-sm font-semibold text-[#F2F2F2]">Atividades</h2>
              </div>
              <button
                type="button"
                onClick={() => setActivePage('history')}
                className="text-[11px] text-[#A1A1AA] hover:text-[#F2F2F2] cursor-pointer"
              >
                Ver todas
              </button>
            </div>

            <div className="space-y-3">
              {auditLogs.slice(0, 4).map((log) => (
                <div key={log.id} className="text-xs space-y-0.5 border-l border-[#303036] pl-3 py-0.5">
                  <div className="text-[10px] text-[#A1A1AA]">
                    {new Date(log.timestamp).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  <div className="text-[#F2F2F2] text-[11px] leading-snug">{log.summary}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
