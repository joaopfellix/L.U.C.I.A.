import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  Database,
  Cpu,
  RefreshCw,
  GitBranch,
  Server,
  Cloud,
  Layers,
  Save,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, addAuditLog } = useApp();

  const [formSettings, setFormSettings] = useState(settings);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [healthStatus, setHealthStatus] = useState<{
    loading: boolean;
    data?: any;
    error?: string;
  }>({ loading: false });

  useEffect(() => {
    setFormSettings(settings);
  }, [settings]);

  const fetchHealthCheck = async () => {
    setHealthStatus({ loading: true });
    try {
      const res = await fetch('/api/health');
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      setHealthStatus({ loading: false, data });
    } catch (err: unknown) {
      setHealthStatus({
        loading: false,
        error: err instanceof Error ? err.message : 'Falha na checagem',
      });
    }
  };

  useEffect(() => {
    fetchHealthCheck();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formSettings);
    addAuditLog('settings_updated', 'Configurações do sistema L.U.C.I.A. foram salvas.');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[#F2F2F2] tracking-tight">
            Configurações
          </h1>
          <p className="text-xs text-[#A1A1AA] mt-1">
            Preferências do sistema, diretrizes operacionais e infraestrutura.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-[#F2F2F2] hover:bg-white text-[#0B0B0D] transition-all cursor-pointer"
        >
          {saveSuccess ? (
            <>
              <Check className="w-4 h-4 text-[#0B0B0D]" />
              <span>Salvo com Sucesso!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Salvar Preferências</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): System Preferences */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Identity & User Card */}
            <div className="rounded-2xl border border-[#303036] bg-[#141416] p-5 space-y-4">
              <h2 className="text-sm font-semibold text-[#F2F2F2] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#D4D4D8]" />
                Operador e Organização
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[#A1A1AA] font-medium mb-1">Nome do Operador</label>
                  <input
                    type="text"
                    value={formSettings.userName}
                    onChange={(e) =>
                      setFormSettings({ ...formSettings, userName: e.target.value })
                    }
                    className="w-full rounded-xl bg-[#19191C] border border-[#303036] p-2.5 text-[#F2F2F2] focus:outline-none focus:border-[#D4D4D8]/50"
                  />
                </div>

                <div>
                  <label className="block text-[#A1A1AA] font-medium mb-1">
                    Organização / Empresa
                  </label>
                  <input
                    type="text"
                    value={formSettings.organizationName}
                    onChange={(e) =>
                      setFormSettings({ ...formSettings, organizationName: e.target.value })
                    }
                    className="w-full rounded-xl bg-[#19191C] border border-[#303036] p-2.5 text-[#F2F2F2] focus:outline-none focus:border-[#D4D4D8]/50"
                  />
                </div>
              </div>
            </div>

            {/* AI Engine & Security Rules */}
            <div className="rounded-2xl border border-[#303036] bg-[#141416] p-5 space-y-4">
              <h2 className="text-sm font-semibold text-[#F2F2F2] flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#D4D4D8]" />
                Políticas Operacionais
              </h2>

              <div className="space-y-3 text-xs">
                {/* Auto memory toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#19191C] border border-[#303036]">
                  <div className="space-y-0.5">
                    <span className="font-medium text-[#F2F2F2] block">
                      Injeção Automática de Memória
                    </span>
                    <span className="text-[#A1A1AA] text-[11px]">
                      Considera as diretrizes cadastradas em todas as consultas da L.U.C.I.A.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formSettings.autoMemoryInjection}
                    onChange={(e) =>
                      setFormSettings({
                        ...formSettings,
                        autoMemoryInjection: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-[#303036] text-[#F2F2F2] focus:ring-0 cursor-pointer"
                  />
                </div>

                {/* Require approval toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#19191C] border border-[#303036]">
                  <div className="space-y-0.5">
                    <span className="font-medium text-[#F2F2F2] block">
                      Barreira de Autorização Humana
                    </span>
                    <span className="text-[#A1A1AA] text-[11px]">
                      Ações sensíveis ou alterações críticas exigem confirmação explícita.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formSettings.requireApprovalForActions}
                    onChange={(e) =>
                      setFormSettings({
                        ...formSettings,
                        requireApprovalForActions: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-[#303036] text-[#F2F2F2] focus:ring-0 cursor-pointer"
                  />
                </div>

                {/* Assistant default mode */}
                <div className="p-3 rounded-xl bg-[#19191C] border border-[#303036] space-y-1.5">
                  <label className="font-medium text-[#F2F2F2] block">
                    Modo Padrão da Assistente
                  </label>
                  <select
                    value={formSettings.assistantMode}
                    onChange={(e) =>
                      setFormSettings({
                        ...formSettings,
                        assistantMode: e.target.value as any,
                      })
                    }
                    className="w-full rounded-xl bg-[#141416] border border-[#303036] p-2 text-[#F2F2F2] focus:outline-none focus:border-[#D4D4D8]/50 cursor-pointer"
                  >
                    <option value="default">Resolução</option>
                    <option value="planner">Planejamento Estratégico</option>
                    <option value="automation">Automação</option>
                    <option value="technical">Análise Técnica</option>
                  </select>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column (1 span): Diagnostics & Architecture */}
        <div className="space-y-6">
          {/* Health Diagnostics */}
          <div className="rounded-2xl border border-[#303036] bg-[#141416] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#F2F2F2] flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#D4D4D8]" />
                Diagnóstico
              </h2>
              <button
                type="button"
                onClick={fetchHealthCheck}
                className="text-[#A1A1AA] hover:text-[#F2F2F2] cursor-pointer"
                title="Verificar status"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${healthStatus.loading ? 'animate-spin' : ''}`}
                />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#19191C] border border-[#303036] text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[#A1A1AA]">Serviço:</span>
                <span className="text-[#F2F2F2] font-medium">
                  {healthStatus.data?.service || 'L.U.C.I.A. Core'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#A1A1AA]">Status:</span>
                <span className="text-[#D4D4D8] font-medium">
                  Operacional
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#A1A1AA]">Ambiente:</span>
                <span className="text-[#A1A1AA]">Full-Stack (Porta 3000)</span>
              </div>
            </div>
          </div>

          {/* Architecture Roadmap */}
          <div className="rounded-2xl border border-[#303036] bg-[#141416] p-5 space-y-3">
            <h2 className="text-sm font-semibold text-[#F2F2F2]">
              Arquitetura Modular
            </h2>
            <p className="text-[11px] text-[#A1A1AA]">
              Preparada para expansão contínua com serviços de infraestrutura:
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[#19191C] border border-[#303036] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="w-3.5 h-3.5 text-[#D4D4D8]" />
                  <span className="text-[#F2F2F2]">Node.js + Express + React</span>
                </div>
                <span className="text-[10px] text-[#D4D4D8] font-medium">
                  Ativo
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#19191C] border border-[#303036] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 text-[#A1A1AA]" />
                  <span className="text-[#F2F2F2]">Supabase (PostgreSQL & Auth)</span>
                </div>
                <span className="text-[10px] text-[#A1A1AA]">
                  Compatível
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#19191C] border border-[#303036] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GitBranch className="w-3.5 h-3.5 text-[#A1A1AA]" />
                  <span className="text-[#F2F2F2]">GitHub (Versionamento)</span>
                </div>
                <span className="text-[10px] text-[#A1A1AA]">
                  Compatível
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#19191C] border border-[#303036] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cloud className="w-3.5 h-3.5 text-[#A1A1AA]" />
                  <span className="text-[#F2F2F2]">Vercel / Cloud Run</span>
                </div>
                <span className="text-[10px] text-[#A1A1AA]">
                  Compatível
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
