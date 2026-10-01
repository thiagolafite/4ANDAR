import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  UserCheck,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  Plus,
  X,
  Sparkles,
  BookOpen,
  Trash2
} from 'lucide-react';
import { Equipe } from '../types';

export const EquipePage: React.FC = () => {
  const { equipe, aulas, addEquipe, deleteEquipe, usuariosList } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [novoMembro, setNovoMembro] = useState<Omit<Equipe, 'id'>>({
    nome: '',
    email: '',
    telefone: '',
    papel_equipe: 'Professor',
    especialidades: ['Forró Tradicional'],
    google_calendar_conectado: false,
    ativo: true,
    foto_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  });

  const [especialidadesInput, setEspecialidadesInput] = useState('Pé de Serra, Xote, Conexão');

  const candidatosEquipe = usuariosList.filter(
    (u) =>
      u.is_master ||
      u.role === 'master' ||
      u.role === 'admin' ||
      u.role === 'professor' ||
      u.tipo_usuario === 'Equipe' ||
      u.tipo_usuario === 'AdminMaster' ||
      (u.cargo_pretendido && /prof|instrutor|coord|admin/i.test(u.cargo_pretendido))
  );

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    const u = usuariosList.find((usr) => usr.id === userId);
    if (u) {
      setNovoMembro({
        ...novoMembro,
        user_id: u.id,
        nome: u.nome,
        email: u.email,
        telefone: u.telefone || novoMembro.telefone,
        foto_url: u.avatar_url || novoMembro.foto_url,
        papel_equipe: u.role === 'admin' ? 'Admin' : 'Professor'
      });
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const espList = especialidadesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    addEquipe({
      ...novoMembro,
      especialidades: espList
    });
    setIsModalOpen(false);
    setSelectedUserId('');
    setNovoMembro({
      nome: '',
      email: '',
      telefone: '',
      papel_equipe: 'Professor',
      especialidades: ['Forró Tradicional'],
      google_calendar_conectado: false,
      ativo: true,
      foto_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <UserCheck className="h-6 w-6 text-brand-600" />
            Equipe Pedagógica & Professores
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Professores, instrutores e coordenação vinculados às turmas e sessões de nivelamento.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold px-4 py-2.5 text-xs shadow-md shadow-brand-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>+ Cadastrar Professor / Membro</span>
        </button>
      </div>

      {/* Grid of Team Members */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {equipe.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs">
            <UserCheck className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">Nenhum professor cadastrado</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Você pode cadastrar novos professores vinculando diretamente os usuários do sistema ou preenchendo os dados.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold px-4 py-2.5 text-xs shadow-md shadow-brand-500/20 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Cadastrar Professor / Membro</span>
            </button>
          </div>
        ) : (
          equipe.map((membro) => {
            const turmasDoProfessor = aulas.filter((a) => a.equipe_id === membro.id);

            return (
              <div
                key={membro.id}
                className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm hover:border-brand-400 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <img
                        src={membro.foto_url}
                        alt={membro.nome}
                        className="h-16 w-16 rounded-full object-cover ring-4 ring-orange-100"
                      />
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 leading-tight">
                          {membro.nome}
                        </h3>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-brand-800">
                            {membro.papel_equipe}
                          </span>
                          {Boolean(membro.user_id || usuariosList.some((u) => u.email.toLowerCase() === membro.email.toLowerCase())) && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Conta Vinculada
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (window.confirm(`Deseja remover "${membro.nome}" da equipe?`)) {
                          deleteEquipe(membro.id);
                        }
                      }}
                      className="text-slate-300 hover:text-rose-600 p-2 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Remover da equipe"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                <div className="mt-4 space-y-1.5 text-xs text-slate-600 pt-3 border-t border-slate-100">
                  <p className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span>{membro.telefone}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <span>{membro.email}</span>
                  </p>
                </div>

                {/* Specialties */}
                <div className="mt-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Especialidades & Estilos:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {membro.especialidades.map((esp, i) => (
                      <span
                        key={i}
                        className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700"
                      >
                        {esp}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Assigned classes count */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5 font-medium">
                  <BookOpen className="h-3.5 w-3.5 text-brand-600" />
                  {turmasDoProfessor.length} turma(s) sob responsabilidade
                </span>
              </div>
            </div>
          );
        }))}
      </div>

      {/* Modal Novo Membro */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                Cadastrar Membro da Equipe
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div className="p-3 bg-orange-50/80 border border-orange-200 rounded-xl space-y-1.5">
                <label className="block text-xs font-bold text-brand-900 uppercase tracking-wider flex items-center justify-between">
                  <span>Selecionar Usuário já Cadastrado (Professor / Equipe)</span>
                  <span className="text-[10px] font-semibold text-brand-600">Preenchimento automático</span>
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => handleSelectUser(e.target.value)}
                  className="w-full rounded-lg border border-orange-300 bg-white p-2 text-xs font-medium text-slate-800 outline-none focus:border-brand-500"
                >
                  <option value="">-- Selecionar usuário do sistema (ou preencher manual abaixo) --</option>
                  {candidatosEquipe.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nome} ({u.email}) — Papel: {u.is_master ? 'Master' : (u.cargo_pretendido || u.role)} [{u.status}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={novoMembro.nome}
                  onChange={(e) =>
                    setNovoMembro({ ...novoMembro, nome: e.target.value })
                  }
                  placeholder="Ex.: Mestre Gonzagão"
                  className="w-full rounded-xl border border-slate-300 p-2 text-sm outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Telefone
                  </label>
                  <input
                    type="text"
                    required
                    value={novoMembro.telefone}
                    onChange={(e) =>
                      setNovoMembro({ ...novoMembro, telefone: e.target.value })
                    }
                    placeholder="(11) 99999-9999"
                    className="w-full rounded-xl border border-slate-300 p-2 text-sm outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Papel
                  </label>
                  <select
                    value={novoMembro.papel_equipe}
                    onChange={(e) =>
                      setNovoMembro({
                        ...novoMembro,
                        papel_equipe: e.target.value as any
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 p-2 text-sm bg-white outline-none focus:border-brand-500"
                  >
                    <option value="Professor">Professor</option>
                    <option value="Admin">Admin</option>
                    <option value="Instrutor">Instrutor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  required
                  value={novoMembro.email}
                  onChange={(e) =>
                    setNovoMembro({ ...novoMembro, email: e.target.value })
                  }
                  placeholder="professor@4andar.com.br"
                  className="w-full rounded-xl border border-slate-300 p-2 text-sm outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Especialidades (separadas por vírgula)
                </label>
                <input
                  type="text"
                  value={especialidadesInput}
                  onChange={(e) => setEspecialidadesInput(e.target.value)}
                  placeholder="Ex.: Pé de Serra, Sacadas, Musicalidade"
                  className="w-full rounded-xl border border-slate-300 p-2 text-sm outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
                >
                  Salvar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
