import React, { useState } from 'react';
import {
  Database,
  Plus,
  Search,
  Trash2,
  Edit2,
  ToggleLeft,
  ToggleRight,
  Shield,
  Briefcase,
  Sliders,
  Code2,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MemoryItem, MemoryCategory } from '../../types';

const CATEGORY_MAP: Record<
  MemoryCategory,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  rules: { label: 'Diretrizes & Regras', icon: Shield },
  business: { label: 'Contexto de Negócio', icon: Briefcase },
  preferences: { label: 'Preferências', icon: Sliders },
  technical: { label: 'Diretrizes Técnicas', icon: Code2 },
  security: { label: 'Segurança & Auditoria', icon: Shield },
};

export const MemoryPage: React.FC = () => {
  const { memories, addMemory, updateMemory, deleteMemory } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<MemoryCategory>('rules');
  const [content, setContent] = useState('');

  const filteredMemories = memories.filter((m) => {
    const matchesCat = selectedCategory === 'all' || m.category === selectedCategory;
    const matchesSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.content.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleOpenCreate = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setCategory('rules');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (mem: MemoryItem) => {
    setEditingId(mem.id);
    setTitle(mem.title);
    setContent(mem.content);
    setCategory(mem.category);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    if (editingId) {
      updateMemory(editingId, {
        title: title.trim(),
        content: content.trim(),
        category,
      });
    } else {
      addMemory({
        title: title.trim(),
        content: content.trim(),
        category,
        isActive: true,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[#F2F2F2] tracking-tight">
            Memória Contextual
          </h1>
          <p className="text-xs text-[#A1A1AA] mt-1">
            Diretrizes e regras que a L.U.C.I.A. considera durante as respostas.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-[#F2F2F2] hover:bg-white text-[#0B0B0D] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Memória</span>
        </button>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl border border-[#303036] bg-[#141416]">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#A1A1AA] absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar nas memórias gravadas..."
            className="w-full text-xs rounded-xl bg-[#19191C] border border-[#303036] pl-9 pr-3 py-2 text-[#F2F2F2] placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#D4D4D8]/50"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#303036] border-[#D4D4D8]/40 text-[#F2F2F2] font-medium'
                : 'bg-[#19191C] border-[#303036] text-[#A1A1AA] hover:text-[#F2F2F2]'
            }`}
          >
            Todas
          </button>
          {Object.entries(CATEGORY_MAP).map(([key, item]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedCategory(key)}
              className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === key
                  ? 'bg-[#303036] border-[#D4D4D8]/40 text-[#F2F2F2] font-medium'
                  : 'bg-[#19191C] border-[#303036] text-[#A1A1AA] hover:text-[#F2F2F2]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Memory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMemories.length === 0 ? (
          <div className="col-span-2 p-12 text-center rounded-2xl border border-[#303036] bg-[#141416] text-[#A1A1AA] text-xs">
            Nenhuma memória encontrada.
          </div>
        ) : (
          filteredMemories.map((mem) => {
            const catInfo = CATEGORY_MAP[mem.category] || CATEGORY_MAP.rules;
            const CatIcon = catInfo.icon;

            return (
              <div
                key={mem.id}
                className="p-4 rounded-xl border border-[#303036] bg-[#141416] hover:border-[#D4D4D8]/30 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-md font-medium flex items-center gap-1 bg-[#19191C] border border-[#303036] text-[#D4D4D8]">
                        <CatIcon className="w-3 h-3" />
                        {catInfo.label}
                      </span>
                      {mem.isActive && (
                        <span className="text-[10px] text-[#A1A1AA] font-normal">
                          Ativa
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => updateMemory(mem.id, { isActive: !mem.isActive })}
                      className="text-[#A1A1AA] hover:text-[#F2F2F2] transition-colors cursor-pointer"
                      title={mem.isActive ? 'Desativar da sessão' : 'Ativar no contexto'}
                    >
                      {mem.isActive ? (
                        <ToggleRight className="w-5 h-5 text-[#F2F2F2]" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-[#52525B]" />
                      )}
                    </button>
                  </div>

                  <h3 className="text-sm font-medium text-[#F2F2F2]">{mem.title}</h3>
                  <p className="text-xs text-[#A1A1AA] leading-relaxed whitespace-pre-wrap">
                    {mem.content}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#303036]/60 text-[11px] text-[#A1A1AA]">
                  <span>Atualizado: {new Date(mem.updatedAt).toLocaleDateString('pt-BR')}</span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(mem)}
                      className="p-1 rounded text-[#A1A1AA] hover:text-[#F2F2F2] hover:bg-[#19191C] cursor-pointer"
                      title="Editar memória"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteMemory(mem.id)}
                      className="p-1 rounded text-[#A1A1AA] hover:text-[#F2F2F2] hover:bg-[#19191C] cursor-pointer"
                      title="Excluir memória"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Add/Edit Memory */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#303036] bg-[#141416] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#303036] bg-[#19191C]">
              <h3 className="text-sm font-semibold text-[#F2F2F2]">
                {editingId ? 'Editar Memória' : 'Registrar Memória'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#A1A1AA] hover:text-[#F2F2F2]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-[#A1A1AA] mb-1">
                  Título / Rótulo
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Política de Atendimento..."
                  className="w-full rounded-xl bg-[#19191C] border border-[#303036] p-2.5 text-[#F2F2F2] focus:outline-none focus:border-[#D4D4D8]/50"
                />
              </div>

              <div>
                <label className="block font-medium text-[#A1A1AA] mb-1">
                  Categoria
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as MemoryCategory)}
                  className="w-full rounded-xl bg-[#19191C] border border-[#303036] p-2.5 text-[#F2F2F2] focus:outline-none focus:border-[#D4D4D8]/50 cursor-pointer"
                >
                  <option value="rules">Diretrizes & Regras</option>
                  <option value="business">Contexto de Negócio</option>
                  <option value="preferences">Preferências</option>
                  <option value="technical">Diretrizes Técnicas</option>
                  <option value="security">Segurança & Conformidade</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-[#A1A1AA] mb-1">
                  Conteúdo da Memória
                </label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Descreva as instruções ou contexto que a IA deve considerar..."
                  className="w-full rounded-xl bg-[#19191C] border border-[#303036] p-2.5 text-[#F2F2F2] focus:outline-none focus:border-[#D4D4D8]/50"
                />
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
                  {editingId ? 'Salvar' : 'Gravar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
