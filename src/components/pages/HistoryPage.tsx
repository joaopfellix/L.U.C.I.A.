import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  Shield,
  MessageSquare,
  CheckSquare,
  Database,
  Cpu,
  ThumbsUp,
  FileText,
  Clock,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AuditLogItem } from '../../types';

export const HistoryPage: React.FC = () => {
  const { auditLogs } = useApp();
  const [filterType, setFilterType] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const filteredLogs = auditLogs.filter((log) => {
    const matchesFilter = filterType === 'all' || log.type.includes(filterType);
    const matchesSearch =
      log.summary.toLowerCase().includes(search.toLowerCase()) ||
      log.type.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(auditLogs, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lucia-historico-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLogIcon = (type: string) => {
    if (type.includes('chat') || type.includes('assistant')) {
      return <MessageSquare className="w-3.5 h-3.5 text-[#D4D4D8]" />;
    }
    if (type.includes('task')) {
      return <CheckSquare className="w-3.5 h-3.5 text-[#D4D4D8]" />;
    }
    if (type.includes('memory')) {
      return <Database className="w-3.5 h-3.5 text-[#D4D4D8]" />;
    }
    if (type.includes('automation')) {
      return <Cpu className="w-3.5 h-3.5 text-[#D4D4D8]" />;
    }
    if (type.includes('feedback')) {
      return <ThumbsUp className="w-3.5 h-3.5 text-[#D4D4D8]" />;
    }
    return <Shield className="w-3.5 h-3.5 text-[#A1A1AA]" />;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[#F2F2F2] tracking-tight">
            Histórico & Atividades
          </h1>
          <p className="text-xs text-[#A1A1AA] mt-1">
            Registro cronológico das consultas, execuções e ações realizadas.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportJson}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-[#19191C] border border-[#303036] text-[#F2F2F2] hover:bg-[#202024] transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Exportar (JSON)</span>
        </button>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl border border-[#303036] bg-[#141416]">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#A1A1AA] absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por termo..."
            className="w-full text-xs rounded-xl bg-[#19191C] border border-[#303036] pl-9 pr-3 py-2 text-[#F2F2F2] placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#D4D4D8]/50"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-[#A1A1AA] mr-1" />
          {[
            { id: 'all', label: 'Todos' },
            { id: 'chat', label: 'Consultas' },
            { id: 'task', label: 'Tarefas' },
            { id: 'memory', label: 'Memória' },
            { id: 'automation', label: 'Automações' },
            { id: 'feedback', label: 'Feedback' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterType(tab.id)}
              className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                filterType === tab.id
                  ? 'bg-[#303036] border-[#D4D4D8]/40 text-[#F2F2F2] font-medium'
                  : 'bg-[#19191C] border-[#303036] text-[#A1A1AA] hover:text-[#F2F2F2]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline List */}
      <div className="rounded-2xl border border-[#303036] bg-[#141416] divide-y divide-[#303036]/60 overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#A1A1AA]">
            Nenhum evento registrado.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              onClick={() => setSelectedLog(log)}
              className="p-4 flex items-center justify-between gap-4 hover:bg-[#19191C]/60 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#19191C] border border-[#303036] flex items-center justify-center shrink-0">
                  {getLogIcon(log.type)}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase text-[#A1A1AA] bg-[#19191C] px-1.5 py-0.5 rounded border border-[#303036]">
                      {log.type}
                    </span>
                    <span className="text-xs font-medium text-[#F2F2F2] group-hover:text-white transition-colors">
                      {log.summary}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#A1A1AA] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(log.timestamp).toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              </div>

              {log.details && (
                <div className="text-[11px] text-[#A1A1AA] font-mono hidden md:block">
                  [Detalhes]
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-[#303036] bg-[#141416] shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#303036]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#D4D4D8]" />
                <h3 className="text-sm font-semibold text-[#F2F2F2]">Detalhe do Evento</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="text-[#A1A1AA] hover:text-[#F2F2F2]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[#A1A1AA] uppercase tracking-wider text-[10px] block">
                  Identificador
                </span>
                <span className="font-mono text-[#D4D4D8]">{selectedLog.id}</span>
              </div>
              <div>
                <span className="text-[#A1A1AA] uppercase tracking-wider text-[10px] block">
                  Tipo
                </span>
                <span className="font-mono text-[#F2F2F2]">{selectedLog.type}</span>
              </div>
              <div>
                <span className="text-[#A1A1AA] uppercase tracking-wider text-[10px] block">
                  Resumo
                </span>
                <p className="text-[#F2F2F2]">{selectedLog.summary}</p>
              </div>
              <div>
                <span className="text-[#A1A1AA] uppercase tracking-wider text-[10px] block">
                  Carimbo de Data/Hora
                </span>
                <span className="text-[#A1A1AA]">
                  {new Date(selectedLog.timestamp).toISOString()}
                </span>
              </div>

              {selectedLog.details && (
                <div>
                  <span className="text-[#A1A1AA] uppercase tracking-wider text-[10px] block mb-1">
                    Payload
                  </span>
                  <pre className="p-3 rounded-xl bg-[#101012] border border-[#303036] text-[11px] text-[#D4D4D8] overflow-x-auto">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-[#303036]">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 rounded-xl text-xs bg-[#19191C] border border-[#303036] text-[#F2F2F2] hover:bg-[#202024]"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
