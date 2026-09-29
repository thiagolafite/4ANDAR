import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, X, Phone, Mail, Award, ArrowRight, User } from 'lucide-react';
import { Aluno } from '../../types';

export const GlobalSearchModal: React.FC = () => {
  const {
    searchModalOpen,
    setSearchModalOpen,
    alunos,
    setSelectedAlunoModal
  } = useApp();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSearchModalOpen]);

  useEffect(() => {
    if (searchModalOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
    }
  }, [searchModalOpen]);

  if (!searchModalOpen) return null;

  const filteredAlunos = alunos.filter((aluno) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      aluno.nome.toLowerCase().includes(q) ||
      aluno.telefone.replace(/\D/g, '').includes(q.replace(/\D/g, '')) ||
      aluno.email.toLowerCase().includes(q) ||
      aluno.nivel_atual.toLowerCase().includes(q)
    );
  });

  const handleSelectStudent = (aluno: Aluno) => {
    setSelectedAlunoModal(aluno);
    setSearchModalOpen(false);
  };

  const getNivelBadgeColor = (nivel: string) => {
    switch (nivel) {
      case 'B1':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'B2':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'I1':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'I2':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
      <div
        className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Search Box */}
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5 bg-slate-50/50">
          <Search className="h-5 w-5 text-brand-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Digite o nome, telefone ou nível do aluno..."
            className="flex-1 bg-transparent text-slate-900 placeholder:text-slate-400 text-base outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 rounded p-1"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => setSearchModalOpen(false)}
            className="rounded-lg bg-slate-200/80 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-300"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <div className="px-2 py-1 flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <span>Resultados ({filteredAlunos.length})</span>
            <span>Clique para abrir ficha completa</span>
          </div>

          {filteredAlunos.length === 0 ? (
            <div className="text-center py-12 px-4">
              <User className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">Nenhum aluno encontrado</p>
              <p className="text-xs text-slate-400 mt-1">
                Tente buscar pelo nome completo, primeiro nome ou número de telefone.
              </p>
            </div>
          ) : (
            filteredAlunos.map((aluno) => (
              <div
                key={aluno.id}
                onClick={() => handleSelectStudent(aluno)}
                className="group flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-brand-300 hover:bg-brand-50/40 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={
                      aluno.foto_url ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                    }
                    alt={aluno.nome}
                    className="h-11 w-11 rounded-full object-cover ring-2 ring-slate-100 group-hover:ring-brand-400"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm text-slate-900 group-hover:text-brand-700">
                        {aluno.nome}
                      </h4>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getNivelBadgeColor(
                          aluno.nivel_atual
                        )}`}
                      >
                        {aluno.nivel_atual}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        ({aluno.papel})
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-slate-400" />
                        {aluno.telefone}
                      </span>
                      <span className="flex items-center gap-1 hidden sm:flex">
                        <Mail className="h-3 w-3 text-slate-400" />
                        {aluno.email}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <span className="text-xs font-semibold text-slate-700">
                      R$ {aluno.mensalidade_valor.toFixed(2)}
                    </span>
                    <p className="text-[10px] text-slate-400">
                      Vence dia {aluno.dia_vencimento}
                    </p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-4 py-2.5 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Busca global integrada ao 4ANDAR</span>
          <span className="font-medium text-brand-600">Enter para selecionar</span>
        </div>
      </div>
    </div>
  );
};
