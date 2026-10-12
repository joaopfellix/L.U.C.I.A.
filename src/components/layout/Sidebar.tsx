import React from 'react';
import {
  Plus,
  LayoutDashboard,
  CheckSquare,
  Database,
  Cpu,
  History,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PageId } from '../../types';
import luciaFaceSrc from '../../assets/images/lucia_character_official.jpg';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { activePage, setActivePage, clearMessages, settings } = useApp();

  const handleNewChat = () => {
    setActivePage('assistant');
    clearMessages();
    onCloseMobile();
  };

  const handleNavigate = (page: PageId) => {
    setActivePage(page);
    onCloseMobile();
  };

  const navItems: Array<{
    id: PageId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tarefas', icon: CheckSquare },
    { id: 'memory', label: 'Memória', icon: Database },
    { id: 'automations', label: 'Automações', icon: Cpu },
    { id: 'history', label: 'Histórico', icon: History },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-xs md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-[#101217] border-r border-[#292F3B] flex flex-col justify-between transition-all duration-200 ease-in-out md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        } ${isCollapsed ? 'md:w-18' : 'md:w-64'}`}
      >
        {/* Top Header */}
        <div className="h-16 px-4 border-b border-[#292F3B] flex items-center justify-between">
          {!isCollapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full overflow-hidden border border-[#DCE5F2]/50 shadow-xs relative shrink-0 bg-[#08090C]">
                <img
                  src={luciaFaceSrc}
                  alt="L.U.C.I.A."
                  className="w-full h-full object-cover scale-135 object-top"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="font-semibold text-base tracking-wider text-[#F5F7FA]">
                L.U.C.I.A.
              </span>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <div className="w-6 h-6 rounded-full overflow-hidden border border-[#DCE5F2]/50 shadow-xs relative shrink-0 bg-[#08090C]">
                <img
                  src={luciaFaceSrc}
                  alt="L.U.C.I.A."
                  className="w-full h-full object-cover scale-135 object-top"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          )}

          {/* Controls: Collapse desktop button / Close mobile button */}
          <div className="flex items-center">
            {/* Desktop collapse toggle */}
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden md:flex p-1.5 rounded-lg text-[#A7AFBD] hover:text-[#F5F7FA] hover:bg-[#151922] transition-colors cursor-pointer"
              title={isCollapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
              aria-label={isCollapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>

            {/* Mobile close button */}
            <button
              type="button"
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-[#A7AFBD] hover:text-[#F5F7FA] md:hidden cursor-pointer"
              aria-label="Fechar menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation List */}
        <div className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {/* 1. Nova Conversa */}
          <button
            type="button"
            onClick={handleNewChat}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              activePage === 'assistant'
                ? 'bg-[#151922] text-[#F5F7FA] border border-[#292F3B]'
                : 'text-[#A7AFBD] hover:text-[#F5F7FA] hover:bg-[#151922]/60 border border-transparent'
            } ${isCollapsed ? 'justify-center px-0' : ''}`}
            title="Nova conversa"
          >
            <Plus className="w-4 h-4 shrink-0 text-[#DCE5F2]" />
            {!isCollapsed && <span>Nova conversa</span>}
          </button>

          <div className="my-2 border-t border-[#292F3B]/60" />

          {/* Rest of Nav Items */}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#151922] text-[#F5F7FA] border border-[#292F3B]'
                    : 'text-[#A7AFBD] hover:text-[#F5F7FA] hover:bg-[#151922]/60 border border-transparent'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                title={item.label}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-[#F5F7FA]' : 'text-[#A7AFBD]'
                  }`}
                />
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </div>

        {/* User Profile / Footer */}
        <div className="p-3 border-t border-[#292F3B] bg-[#101217]">
          <div
            className={`flex items-center gap-2.5 p-2 rounded-xl text-xs text-[#A7AFBD] ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <div className="w-7 h-7 rounded-full bg-[#151922] border border-[#292F3B] flex items-center justify-center text-[11px] font-semibold text-[#DCE5F2] shrink-0">
              {settings.userName.slice(0, 2).toUpperCase()}
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <span className="block text-xs font-medium text-[#F5F7FA] truncate">
                  {settings.userName}
                </span>
                <span className="block text-[10px] text-[#A7AFBD] truncate">
                  {settings.organizationName}
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
