import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  PageId,
  ChatMessage,
  TaskItem,
  MemoryItem,
  AutomationItem,
  AuditLogItem,
  SystemSettings,
  FeedbackData,
} from '../types';

interface AppContextType {
  activePage: PageId;
  setActivePage: (page: PageId) => void;
  // Messages & Chat
  messages: ChatMessage[];
  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => ChatMessage;
  updateMessageRating: (messageId: string, rating: 'positive' | 'negative') => void;
  markFeedbackSubmitted: (messageId: string) => void;
  clearMessages: () => void;
  // Tasks
  tasks: TaskItem[];
  addTask: (task: Omit<TaskItem, 'id' | 'createdAt'>) => void;
  updateTaskStatus: (taskId: string, status: TaskItem['status'], result?: string) => void;
  deleteTask: (taskId: string) => void;
  // Memories
  memories: MemoryItem[];
  addMemory: (mem: Omit<MemoryItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMemory: (id: string, updates: Partial<MemoryItem>) => void;
  deleteMemory: (id: string) => void;
  // Automations
  automations: AutomationItem[];
  toggleAutomationStatus: (id: string) => void;
  addAutomation: (auto: Omit<AutomationItem, 'id' | 'runsCount'>) => void;
  deleteAutomation: (id: string) => void;
  // Audit Logs
  auditLogs: AuditLogItem[];
  addAuditLog: (type: string, summary: string, details?: Record<string, unknown>) => void;
  // Settings
  settings: SystemSettings;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  // Feedback action
  submitFeedback: (feedback: FeedbackData) => Promise<{ success: boolean; message: string }>;
  // Helpers
  isSendingMessage: boolean;
  setIsSendingMessage: (val: boolean) => void;
}

const defaultSettings: SystemSettings = {
  autoMemoryInjection: true,
  assistantMode: 'default',
  requireApprovalForActions: true,
  streamingEffect: true,
  maxMemoryItems: 10,
  userName: 'Gestor de Operações',
  organizationName: 'L.U.C.I.A. Enterprise',
};

const initialMemories: MemoryItem[] = [
  {
    id: 'mem-1',
    title: 'Diretriz de Identidade Corporativa',
    category: 'rules',
    content:
      'A L.U.C.I.A. deve manter comunicação executiva, pragmática e em português brasileiro, fornecendo passos acionáveis e sem inventar resultados fictícios.',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    isActive: true,
  },
  {
    id: 'mem-2',
    title: 'Stack e Arquitetura do Sistema',
    category: 'technical',
    content:
      'Arquitetura planejada: React no frontend, Node.js/Express com @google/genai no backend proxy, preparando para conexão futura com Supabase e hospedagem Vercel.',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    isActive: true,
  },
  {
    id: 'mem-3',
    title: 'Política de Segurança e Acesso',
    category: 'security',
    content:
      'Nenhuma ação sensível ou comando de infraestrutura externa pode ser executado sem autorização explícita prévia do usuário administrador.',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    isActive: true,
  },
];

const initialTasks: TaskItem[] = [
  {
    id: 'task-1',
    title: 'Conectar chat interativo da L.U.C.I.A. ao Gemini 3.8 Flash',
    description: 'Estabelecer comunicação server-side segura sem expor credenciais no cliente.',
    status: 'completed',
    priority: 'high',
    dueDate: '2026-10-12',
    result: 'Integrado com sucesso via rota /api/lucia/chat utilizando @google/genai.',
    authorized: true,
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    tags: ['IA', 'Arquitetura', 'Segurança'],
  },
  {
    id: 'task-2',
    title: 'Mapear fluxos de automação de suporte técnico',
    description: 'Identificar gargalos operacionais e desenhar gatilhos de triagem inteligente.',
    status: 'in_progress',
    priority: 'medium',
    dueDate: '2026-10-15',
    authorized: true,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    tags: ['Automação', 'Processos'],
  },
  {
    id: 'task-3',
    title: 'Execução de exportação em lote de dados históricos',
    description: 'Tarefa de alta criticidade aguardando autorização do operador humano.',
    status: 'needs_auth',
    priority: 'urgent',
    dueDate: '2026-10-14',
    authorized: false,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    tags: ['Dados', 'Segurança'],
  },
  {
    id: 'task-4',
    title: 'Consolidar feedback dos operadores para calibração de prompts',
    description: 'Analisar avaliações positivas e negativas recebidas nas sessões de chat.',
    status: 'pending',
    priority: 'low',
    dueDate: '2026-10-18',
    authorized: true,
    createdAt: new Date().toISOString(),
    tags: ['Feedback', 'Melhoria Contínua'],
  },
];

const initialAutomations: AutomationItem[] = [
  {
    id: 'auto-1',
    name: 'Triagem e Priorização de Demandas',
    description: 'Analisa novas solicitações e classifica criticidade com base nas diretrizes de negócio.',
    trigger: 'webhook',
    triggerDetails: 'Webhook de entrada de novos chamados',
    actions: ['Avaliar criticidade com L.U.C.I.A.', 'Criar tarefa estruturada', 'Notificar equipe'],
    status: 'active',
    runsCount: 42,
    lastRun: 'Há 18 minutos',
    requiresAuthorization: false,
  },
  {
    id: 'auto-2',
    name: 'Relatório Diário de Produtividade & Gargalos',
    description: 'Gera resumo operacional diário às 18:00 com indicadores de tempo e erros.',
    trigger: 'schedule',
    triggerDetails: 'Cron diário às 18:00 (Seg-Sex)',
    actions: ['Consolidar tarefas concluídas', 'Gerar síntese analítica', 'Disponibilizar no Dashboard'],
    status: 'active',
    runsCount: 15,
    lastRun: 'Ontem às 18:00',
    requiresAuthorization: false,
  },
  {
    id: 'auto-3',
    name: 'Bloqueio Preventivo de Comandos Sensíveis',
    description: 'Intercepta qualquer solicitação de alteração crítica e exige confirmação humana formal.',
    trigger: 'task_event',
    triggerDetails: 'Evento de solicitação classificada como "needs_auth"',
    actions: ['Congelar execução', 'Enviar solicitação de aprovação', 'Registrar no Histórico'],
    status: 'active',
    runsCount: 8,
    lastRun: 'Há 2 horas',
    requiresAuthorization: true,
  },
];

const initialAuditLogs: AuditLogItem[] = [
  {
    id: 'log-1',
    type: 'system_init',
    summary: 'Inicialização da unidade L.U.C.I.A. (Logic Unit for Computing & Intelligent Automation).',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    details: { environment: 'Cloud Run Dev Container', model: 'gemini-3.8-flash' },
  },
  {
    id: 'log-2',
    type: 'security_policy',
    summary: 'Políticas de isolamento de chaves e execução autorizada validadas.',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
];

const initialWelcomeMessage: ChatMessage = {
  id: 'msg-welcome',
  role: 'assistant',
  content: `Olá! Sou **L.U.C.I.A.** (*Logic Unit for Computing & Intelligent Automation*).

Estou pronta para ajudar você e sua equipe a resolver problemas complexos, estruturar tarefas, planejar automações e analisar processos com foco em resultados práticos.

Como posso colaborar com suas operações hoje? Você pode me solicitar:
- Análise de um gargalo ou problema operacional.
- Criação estruturada de um plano de ação ou tarefa.
- Planejamento de um fluxo de automação inteligente.
- Esclarecimentos sobre minhas diretrizes e capacidades.`,
  timestamp: new Date().toISOString(),
  modelUsed: 'gemini-3.8-flash',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePage, setActivePage] = useState<PageId>('assistant');
  const [isSendingMessage, setIsSendingMessage] = useState<boolean>(false);

  // Settings
  const [settings, setSettings] = useState<SystemSettings>(() => {
    try {
      const saved = localStorage.getItem('lucia_settings');
      return saved ? JSON.parse(saved) : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  // Messages
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('lucia_messages');
      if (saved) {
        const parsed = JSON.parse(saved);
        // If it only had the old msg-welcome, start clean
        if (Array.isArray(parsed) && parsed.length === 1 && parsed[0].id === 'msg-welcome') {
          return [];
        }
        return Array.isArray(parsed) ? parsed : [];
      }
      return [];
    } catch {
      return [];
    }
  });

  // Tasks
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      const saved = localStorage.getItem('lucia_tasks');
      return saved ? JSON.parse(saved) : initialTasks;
    } catch {
      return initialTasks;
    }
  });

  // Memories
  const [memories, setMemories] = useState<MemoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('lucia_memories');
      return saved ? JSON.parse(saved) : initialMemories;
    } catch {
      return initialMemories;
    }
  });

  // Automations
  const [automations, setAutomations] = useState<AutomationItem[]>(() => {
    try {
      const saved = localStorage.getItem('lucia_automations');
      return saved ? JSON.parse(saved) : initialAutomations;
    } catch {
      return initialAutomations;
    }
  });

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(() => {
    try {
      const saved = localStorage.getItem('lucia_audit');
      return saved ? JSON.parse(saved) : initialAuditLogs;
    } catch {
      return initialAuditLogs;
    }
  });

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('lucia_settings', JSON.stringify(settings));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem('lucia_messages', JSON.stringify(messages));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem('lucia_tasks', JSON.stringify(tasks));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem('lucia_memories', JSON.stringify(memories));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [memories]);

  useEffect(() => {
    try {
      localStorage.setItem('lucia_automations', JSON.stringify(automations));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [automations]);

  useEffect(() => {
    try {
      localStorage.setItem('lucia_audit', JSON.stringify(auditLogs));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [auditLogs]);

  // Message helpers
  const addMessage = (msg: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage => {
    const newMessage: ChatMessage = {
      ...msg,
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  };

  const updateMessageRating = (messageId: string, rating: 'positive' | 'negative') => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, rating } : m))
    );
  };

  const markFeedbackSubmitted = (messageId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, ratingFeedbackSubmitted: true } : m))
    );
  };

  const clearMessages = () => {
    setMessages([]);
    addAuditLog('chat_cleared', 'Histórico de chat da sessão foi reiniciado pelo usuário.');
  };

  // Task helpers
  const addTask = (taskData: Omit<TaskItem, 'id' | 'createdAt'>) => {
    const newTask: TaskItem = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    addAuditLog('task_created', `Nova tarefa criada: "${newTask.title}"`);
  };

  const updateTaskStatus = (taskId: string, status: TaskItem['status'], result?: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status, result: result || t.result } : t))
    );
    addAuditLog('task_updated', `Status da tarefa #${taskId} atualizado para [${status}].`);
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    addAuditLog('task_deleted', `Tarefa #${taskId} removida.`);
  };

  // Memory helpers
  const addMemory = (memData: Omit<MemoryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newMem: MemoryItem = {
      ...memData,
      id: `mem-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    setMemories((prev) => [newMem, ...prev]);
    addAuditLog('memory_created', `Novo registro de memória persistente: "${newMem.title}"`);
  };

  const updateMemory = (id: string, updates: Partial<MemoryItem>) => {
    setMemories((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m
      )
    );
    addAuditLog('memory_updated', `Registro de memória #${id} modificado.`);
  };

  const deleteMemory = (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
    addAuditLog('memory_deleted', `Registro de memória #${id} removido.`);
  };

  // Automation helpers
  const toggleAutomationStatus = (id: string) => {
    setAutomations((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const nextStatus = a.status === 'active' ? 'paused' : 'active';
          addAuditLog('automation_status', `Automação "${a.name}" alterada para ${nextStatus}.`);
          return { ...a, status: nextStatus };
        }
        return a;
      })
    );
  };

  const addAutomation = (autoData: Omit<AutomationItem, 'id' | 'runsCount'>) => {
    const newAuto: AutomationItem = {
      ...autoData,
      id: `auto-${Date.now()}`,
      runsCount: 0,
    };
    setAutomations((prev) => [newAuto, ...prev]);
    addAuditLog('automation_created', `Novo fluxo de automação configurado: "${newAuto.name}"`);
  };

  const deleteAutomation = (id: string) => {
    setAutomations((prev) => prev.filter((a) => a.id !== id));
    addAuditLog('automation_deleted', `Automação #${id} excluída.`);
  };

  // Audit Log helper
  const addAuditLog = (type: string, summary: string, details?: Record<string, unknown>) => {
    const logItem: AuditLogItem = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      summary,
      timestamp: new Date().toISOString(),
      details,
    };
    setAuditLogs((prev) => [logItem, ...prev.slice(0, 99)]);
  };

  // Settings helper
  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Submit Feedback to server
  const submitFeedback = async (feedback: FeedbackData): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch('/api/lucia/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback),
      });

      if (!response.ok) {
        throw new Error('Falha na resposta do servidor.');
      }

      markFeedbackSubmitted(feedback.messageId);
      addAuditLog(
        'feedback_submitted',
        `Avaliação enviada para a resposta (${feedback.rating}): ${feedback.comment ? `"${feedback.comment}"` : 'Sem comentário adicional'}`
      );
      return { success: true, message: 'Feedback enviado com sucesso.' };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro ao enviar feedback';
      return { success: false, message: msg };
    }
  };

  return (
    <AppContext.Provider
      value={{
        activePage,
        setActivePage,
        messages,
        addMessage,
        updateMessageRating,
        markFeedbackSubmitted,
        clearMessages,
        tasks,
        addTask,
        updateTaskStatus,
        deleteTask: (taskId: string) => {
          setTasks((prev) => prev.filter((t) => t.id !== taskId));
          addAuditLog('task_deleted', `Tarefa #${taskId} removida.`);
        },
        memories,
        addMemory,
        updateMemory,
        deleteMemory: (id: string) => {
          setMemories((prev) => prev.filter((m) => m.id !== id));
          addAuditLog('memory_deleted', `Registro de memória #${id} removido.`);
        },
        automations,
        toggleAutomationStatus,
        addAutomation,
        deleteAutomation,
        auditLogs,
        addAuditLog,
        settings,
        updateSettings,
        submitFeedback,
        isSendingMessage,
        setIsSendingMessage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
