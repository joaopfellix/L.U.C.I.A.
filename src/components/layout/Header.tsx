import React from 'react';
import { Menu, PanelLeftOpen } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PageId } from '../../types';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
  isSidebarCollapsed: boolean;
  onExpandSidebar: () => void;
}

const PAGE_METAS: Record<PageId, { title: string; subtitle: string }> = {
  assistant: {
    title: 'L.U.C.I.A.',
    subtitle: 'Inteligência em movimento. Resultados em ação.',
  },
  dashboard: {
    title: 'Dashboard',
    subtitle: 'Resumo de tarefas, automações e atividades recentes',
  },
  tasks: {
    title: 'Tarefas',
    subtitle: 'Lista de tarefas, status, datas e resultados',
  },
  memory: {
    title: 'Memória',
    subtitle: 'Área para gerenciar informações contextuais e preferências',
  },
  automations: {
    title: 'Automações',
    subtitle: 'Gerenciamento de fluxos de trabalho e integrações',
  },
  history: {
    title: 'Histórico',
    subtitle: 'Registro das solicitações e ações realizadas',
  },
  settings: {
    title: 'Configurações',
    subtitle: 'Preferências e integrações do sistema',
  },
};

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileSidebar,
  isSidebarCollapsed,
  onExpandSidebar,
}) => {
  const { activePage } = useApp();
  const currentMeta = PAGE_METAS[activePage] || PAGE_METAS.assistant;

  return (
    <header className="h-16 border-b border-[#292F3B] bg-[#08090C]/90 backdrop-blur-md sticky top-0 z-30 px-5 md:px-8 flex items-center justify-between">
      {/* Left: Mobile menu toggle / Desktop expand button when collapsed */}
      <div className="flex items-center gap-3">
        {/* Mobile toggle */}
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="p-1.5 -ml-1.5 rounded-lg text-[#A7AFBD] hover:text-[#F5F7FA] hover:bg-[#151922] md:hidden transition-colors cursor-pointer"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop expand if collapsed */}
        {isSidebarCollapsed && (
          <button
            type="button"
            onClick={onExpandSidebar}
            className="hidden md:flex p-1.5 -ml-1 rounded-lg text-[#A7AFBD] hover:text-[#F5F7FA] hover:bg-[#151922] transition-colors cursor-pointer"
            title="Expandir barra lateral"
            aria-label="Expandir barra lateral"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        )}

        <div className="space-y-0.5">
          <h1 className="text-sm md:text-base font-semibold text-[#F5F7FA] tracking-tight">
            {currentMeta.title}
          </h1>
          <p className="text-xs text-[#A7AFBD] font-normal">
            {currentMeta.subtitle}
          </p>
        </div>
      </div>
    </header>
  );
};
