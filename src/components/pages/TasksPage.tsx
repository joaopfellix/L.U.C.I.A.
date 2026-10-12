import React, { useState } from 'react';
import {
  CheckSquare,
  Clock,
  Plus,
  Search,
  Filter,
  Trash2,
  Check,
  X,
  MessageSquare,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TaskItem, TaskPriority } from '../../types';

export const TasksPage: React.FC = () => {
  const { tasks, addTask, updateTaskStatus, deleteTask, setActivePage, addMessage } = useApp();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10)
  );
  const [requiresAuth, setRequiresAuth] = useState(false);

  // Editing result modal/drawer
  const [editingResultTaskId, setEditingResultTaskId] = useState<string | null>(null);
  const [resultText, setResultText] = useState('');

  const filteredTasks = tasks.filter((t) => {
    const matchesFilter = filterStatus === 'all' || t.status === filterStatus;
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask({
      title: title.trim(),
      description: description.trim(),
      status: requiresAuth ? 'needs_auth' : 'pending',
      priority,
      dueDate,
      authorized: !requiresAuth,
    });

    setTitle('');
    setDescription('');
    setIsModalOpen(false);
  };

  const handlePlanWithLucia = (task: TaskItem) => {
    addMessage({
      role: 'user',
      content: `Por favor, analise a seguinte tarefa e estruture um plano de execução passo a passo com prazos e entregáveis:\n\n**Título**: ${task.title}\n**Descrição**: ${task.description}\n**Prioridade**: ${task.priority}\n**Prazo Estimado**: ${task.dueDate}`,
    });
    setActivePage('assistant');
  };

  const handleSaveResult = (taskId: string) => {
    updateTaskStatus(taskId, 'completed', resultText.trim());
    setEditingResultTaskId(null);
    setResultText('');
  };

  const handleAuthorize = (task: TaskItem) => {
    updateTaskStatus(task.id, 'in_progress');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[#F2F2F2] tracking-tight">
            Tarefas
          </h1>
          <p className="text-xs text-[#A1A1AA] mt-1">
            Planejamento, acompanhamento de execução e registro de resultados.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-[#F2F2F2] hover:bg-white text-[#0B0B0D] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Tarefa</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl border border-[#303036] bg-[#141416]">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#A1A1AA] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por título ou descrição..."
            className="w-full text-xs rounded-xl bg-[#19191C] border border-[#303036] pl-9 pr-3 py-2 text-[#F2F2F2] placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#D4D4D8]/50"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-[#A1A1AA] mr-1" />
          {[
            { id: 'all', label: 'Todas' },
            { id: 'pending', label: 'Pendentes' },
            { id: 'in_progress', label: 'Em Execução' },
            { id: 'completed', label: 'Concluídas' },
            { id: 'needs_auth', label: 'Requer Autorização' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterStatus(tab.id)}
              className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === tab.id
                  ? 'bg-[#303036] border-[#D4D4D8]/40 text-[#F2F2F2] font-medium'
                  : 'bg-[#19191C] border-[#303036] text-[#A1A1AA] hover:text-[#F2F2F2]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-[#303036] bg-[#141416] text-[#A1A1AA] text-xs">
            Nenhuma tarefa encontrada com os filtros selecionados.
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className="p-4 rounded-xl border border-[#303036] bg-[#141416] hover:border-[#D4D4D8]/30 transition-all space-y-3"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-[#F2F2F2]">{task.title}</span>

                    {/* Status Badge */}
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

                    {/* Priority Badge */}
                    <span className="text-[10px] px-1.5 py-0.5 rounded uppercase font-medium bg-[#19191C] text-[#A1A1AA] border border-[#303036]">
                      {task.priority}
                    </span>
                  </div>

                  <p className="text-xs text-[#A1A1AA] leading-relaxed">{task.description}</p>

                  {/* Registered deliverable result */}
                  {task.result && (
                    <div className="mt-2 p-2.5 rounded-lg bg-[#19191C] border border-[#303036] text-xs text-[#D4D4D8] space-y-1">
                      <div className="font-medium text-[11px] text-[#F2F2F2] flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Resultado Registrado:
                      </div>
                      <p className="text-[#A1A1AA] text-xs">{task.result}</p>
                    </div>
                  )}
                </div>

                {/* Right Actions & Meta */}
                <div className="flex md:flex-col items-center md:items-end justify-between gap-2 shrink-0 text-xs">
                  <div className="text-[11px] text-[#A1A1AA] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#A1A1AA]" />
                    <span>{task.dueDate}</span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Authorize action if needs auth */}
                    {task.status === 'needs_auth' && (
                      <button
                        type="button"
                        onClick={() => handleAuthorize(task)}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#F2F2F2] text-[#0B0B0D] hover:bg-white transition-colors cursor-pointer"
                      >
                        Autorizar
                      </button>
                    )}

                    {/* Complete & add result */}
                    {task.status !== 'completed' && task.status !== 'needs_auth' && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingResultTaskId(task.id);
                          setResultText(task.result || '');
                        }}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#19191C] border border-[#303036] text-[#D4D4D8] hover:text-[#F2F2F2] hover:bg-[#202024] transition-colors cursor-pointer"
                      >
                        Concluir
                      </button>
                    )}

                    {/* Ask Lucia */}
                    <button
                      type="button"
                      onClick={() => handlePlanWithLucia(task)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#19191C] border border-[#303036] text-[#D4D4D8] hover:text-[#F2F2F2] hover:bg-[#202024] transition-colors cursor-pointer"
                      title="Analisar no chat com L.U.C.I.A."
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Analisar</span>
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => deleteTask(task.id)}
                      className="p-1 rounded-lg text-[#A1A1AA] hover:text-[#F2F2F2] hover:bg-[#19191C] transition-colors cursor-pointer"
                      title="Excluir tarefa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* In-place deliverable result editor */}
              {editingResultTaskId === task.id && (
                <div className="mt-3 p-3 rounded-lg border border-[#303036] bg-[#19191C] space-y-2">
                  <div className="text-xs font-medium text-[#F2F2F2]">
                    Registrar Resultado da Tarefa:
                  </div>
                  <textarea
                    value={resultText}
                    onChange={(e) => setResultText(e.target.value)}
                    placeholder="Descreva a conclusão e entregáveis..."
                    rows={2}
                    className="w-full text-xs rounded-xl bg-[#141416] border border-[#303036] p-2 text-[#F2F2F2] focus:outline-none focus:border-[#D4D4D8]/50"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingResultTaskId(null)}
                      className="px-2.5 py-1 text-xs text-[#A1A1AA] hover:text-[#F2F2F2]"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveResult(task.id)}
                      className="px-3 py-1 rounded-xl text-xs font-medium bg-[#F2F2F2] text-[#0B0B0D] hover:bg-white cursor-pointer"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal: New Task */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#303036] bg-[#141416] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#303036] bg-[#19191C]">
              <h3 className="text-sm font-semibold text-[#F2F2F2]">Criar Nova Tarefa</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#A1A1AA] hover:text-[#F2F2F2]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-[#A1A1AA] mb-1">
                  Título da Tarefa
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Mapear rotas de webhook..."
                  className="w-full rounded-xl bg-[#19191C] border border-[#303036] p-2.5 text-[#F2F2F2] focus:outline-none focus:border-[#D4D4D8]/50"
                />
              </div>

              <div>
                <label className="block font-medium text-[#A1A1AA] mb-1">
                  Descrição
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalhes dos requisitos e critérios..."
                  className="w-full rounded-xl bg-[#19191C] border border-[#303036] p-2.5 text-[#F2F2F2] focus:outline-none focus:border-[#D4D4D8]/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#A1A1AA] mb-1">
                    Prioridade
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full rounded-xl bg-[#19191C] border border-[#303036] p-2.5 text-[#F2F2F2] focus:outline-none focus:border-[#D4D4D8]/50 cursor-pointer"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-[#A1A1AA] mb-1">
                    Data Limite
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full rounded-xl bg-[#19191C] border border-[#303036] p-2.5 text-[#F2F2F2] focus:outline-none focus:border-[#D4D4D8]/50"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-[#19191C] border border-[#303036]">
                <input
                  type="checkbox"
                  id="reqAuth"
                  checked={requiresAuth}
                  onChange={(e) => setRequiresAuth(e.target.checked)}
                  className="rounded border-[#303036] text-[#F2F2F2] focus:ring-0"
                />
                <label htmlFor="reqAuth" className="text-[#A1A1AA] text-xs cursor-pointer">
                  Exigir autorização humana antes de iniciar a execução
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
                  Criar Tarefa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
