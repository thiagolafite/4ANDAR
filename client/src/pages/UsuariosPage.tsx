import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { User, UserRole, PermissoesUsuario } from '../types';
import {
  ShieldCheck,
  Crown,
  UserCheck,
  UserX,
  Clock,
  CheckCircle,
  XCircle,
  Sliders,
  Search,
  AlertTriangle,
  Trash2,
  Lock,
  Mail,
  Phone,
  Sparkles,
  Calendar,
  X,
  FileSpreadsheet,
  Upload,
  Camera
} from 'lucide-react';
import { UserAvatar } from '../components/common/UserAvatar';

export const UsuariosPage: React.FC = () => {
  const {
    currentUser,
    usuariosList,
    alunos,
    fetchUsuarios,
    updateUserStatus,
    updateUserPermissions,
    vincularAlunoUsuario,
    deleteUser,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'pendentes' | 'ativos' | 'bloqueados'>('pendentes');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State for Approving / Editing Permissions
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalMode, setModalMode] = useState<'approve' | 'edit'>('approve');
  const [editRole, setEditRole] = useState<UserRole>('aluno');
  const [editCargo, setEditCargo] = useState('Aluno');
  const [editPerms, setEditPerms] = useState<PermissoesUsuario>({});
  const [rejectModalUser, setRejectModalUser] = useState<User | null>(null);
  const [motivoRecusa, setMotivoRecusa] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const pendentes = usuariosList.filter((u) => u.status === 'pendente');
  const ativos = usuariosList.filter((u) => u.status === 'aprovado');
  const bloqueados = usuariosList.filter((u) => u.status === 'rejeitado' || u.status === 'bloqueado');

  // Filtered by search
  const filterList = (list: User[]) => {
    if (!searchTerm.trim()) return list;
    const term = searchTerm.toLowerCase();
    return list.filter(
      (u) =>
        u.nome.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        (u.telefone && u.telefone.includes(term)) ||
        (u.cargo_pretendido && u.cargo_pretendido.toLowerCase().includes(term))
    );
  };

  // Helper to open permissions modal
  const openModal = (user: User, mode: 'approve' | 'edit') => {
    setSelectedUser(user);
    setModalMode(mode);
    setEditRole(user.role || 'aluno');
    setEditCargo(user.cargo_pretendido || 'Aluno');
    setEditPerms(user.permissoes ? JSON.parse(JSON.stringify(user.permissoes)) : {});
  };

  // Quick Preset Helper
  const applyPreset = (preset: 'aluno' | 'professor' | 'admin' | 'full') => {
    if (preset === 'aluno') {
      setEditRole('aluno');
      setEditCargo('Aluno');
      setEditPerms({
        all: false,
        dashboard: { view: true },
        alunos: { view: false, create: false, edit: false, delete: false },
        cronograma: { view: false, edit: false, import_excel: false },
        presenca: { view: false, checkin: true, manage: false },
        pagamentos: { view: false, manage: false, export: false },
        nivelamento: { view: false, evaluate: false, schedule: true, view_own: true },
        aulas: { view: false, manage: false, view_own: true },
        eventos: { view: true, manage: false },
        avisos: { view: false, manage: false },
        equipe: { view: false, manage: false },
        usuarios: { view: false, manage: false, approve: false }
      });
      showToast('Predefinição de Aluno aplicada (Acesso exclusivo a aulas, presença, nivelamento e eventos)', 'info');
    } else if (preset === 'professor') {
      setEditRole('professor');
      setEditCargo('Professor / Instrutor');
      setEditPerms({
        all: false,
        dashboard: { view: true },
        alunos: { view: true, create: true, edit: true, delete: false },
        cronograma: { view: true, edit: true, import_excel: false },
        presenca: { view: true, checkin: true, manage: true },
        pagamentos: { view: false, manage: false, export: false },
        nivelamento: { view: true, evaluate: true, schedule: true },
        aulas: { view: true, manage: true },
        eventos: { view: true, manage: false },
        avisos: { view: true, manage: true },
        equipe: { view: true, manage: false },
        usuarios: { view: false, manage: false, approve: false }
      });
      showToast('Predefinição de Professor aplicada!', 'info');
    } else if (preset === 'admin') {
      setEditRole('admin');
      setEditCargo('Administrativo / Secretaria');
      setEditPerms({
        all: false,
        dashboard: { view: true },
        alunos: { view: true, create: true, edit: true, delete: false },
        cronograma: { view: true, edit: true, import_excel: true },
        presenca: { view: true, checkin: true, manage: true },
        pagamentos: { view: true, manage: true, export: true },
        nivelamento: { view: true, evaluate: true, schedule: true },
        aulas: { view: true, manage: true },
        eventos: { view: true, manage: true },
        avisos: { view: true, manage: true },
        equipe: { view: true, manage: false },
        usuarios: { view: false, manage: false, approve: false }
      });
      showToast('Predefinição de Administrativo aplicada!', 'info');
    } else if (preset === 'full') {
      setEditRole('admin');
      setEditCargo('Coordenador Geral');
      setEditPerms({
        all: true,
        dashboard: { view: true },
        alunos: { view: true, create: true, edit: true, delete: true },
        cronograma: { view: true, edit: true, import_excel: true },
        presenca: { view: true, checkin: true, manage: true },
        pagamentos: { view: true, manage: true, export: true },
        nivelamento: { view: true, evaluate: true, schedule: true },
        aulas: { view: true, manage: true },
        eventos: { view: true, manage: true },
        avisos: { view: true, manage: true },
        equipe: { view: true, manage: true },
        usuarios: { view: true, manage: true, approve: true }
      });
      showToast('Acesso Total configurado!', 'info');
    }
  };

  const handleToggleModulePerm = (module: keyof PermissoesUsuario, action: string) => {
    setEditPerms((prev) => {
      const copy = { ...prev };
      const mod = { ...((copy as any)[module] || {}) };
      mod[action] = !mod[action];
      (copy as any)[module] = mod;
      copy.all = false;
      return copy;
    });
  };

  const handleSaveModal = async () => {
    if (!selectedUser) return;
    setProcessing(true);

    if (modalMode === 'approve') {
      const ok = await updateUserStatus(selectedUser.id, 'aprovado', {
        role: editRole,
        permissoes: editPerms,
        aprovado_por: currentUser.nome
      });
      if (ok) setSelectedUser(null);
    } else {
      const ok = await updateUserPermissions(selectedUser.id, editPerms, editRole, editCargo);
      if (ok) setSelectedUser(null);
    }

    setProcessing(false);
  };

  const handleConfirmReject = async () => {
    if (!rejectModalUser) return;
    setProcessing(true);
    const ok = await updateUserStatus(rejectModalUser.id, 'rejeitado', {
      motivo_recusa: motivoRecusa.trim() || 'Cadastro não aprovado pela administração.'
    });
    setProcessing(false);
    if (ok) {
      setRejectModalUser(null);
      setMotivoRecusa('');
    }
  };

  const isMasterUser = (u: User) => u.is_master || u.role === 'master';

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 select-none">
      {/* Top Golden Header */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#9a3412] via-[#ea580c] to-[#f97316] text-white p-6 sm:p-8 shadow-xl overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-6 pointer-events-none">
          <Crown className="h-64 w-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-amber-100 text-xs font-bold uppercase tracking-wider mb-2">
              <Crown className="h-4 w-4 text-amber-300" />
              <span>Área Exclusiva do Administrador Master</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Gestão de Usuários & Controle de Permissões
            </h1>
            <p className="text-sm text-orange-100 mt-1 max-w-2xl leading-relaxed">
              Você tem controle total sobre quem acessa o sistema. Aprove novos cadastros, defina exatamente quais módulos cada usuário pode ver e editar, ou bloqueie acessos quando necessário.
            </p>
          </div>

          {/* Master Badge */}
          <div className="shrink-0 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-amber-300 font-extrabold text-sm">
              <Crown className="h-5 w-5" />
              <span>{currentUser.nome}</span>
            </div>
            <p className="text-[11px] text-white/80 font-medium mt-0.5">Administrador Master</p>
            <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-emerald-500/80 text-white text-[10px] font-bold">
              Acesso Irrestrito
            </span>
          </div>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card Pendentes */}
        <div
          onClick={() => setActiveTab('pendentes')}
          className={`cursor-pointer rounded-2xl p-5 border transition-all ${
            activeTab === 'pendentes'
              ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400 shadow-md'
              : 'bg-white border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Aguardando Aprovação
                </p>
                <h3 className="text-2xl font-black text-slate-800">{pendentes.length}</h3>
              </div>
            </div>
            {pendentes.length > 0 && (
              <span className="h-3 w-3 rounded-full bg-amber-500 animate-ping" />
            )}
          </div>
        </div>

        {/* Card Ativos */}
        <div
          onClick={() => setActiveTab('ativos')}
          className={`cursor-pointer rounded-2xl p-5 border transition-all ${
            activeTab === 'ativos'
              ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-400 shadow-md'
              : 'bg-white border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Usuários Aprovados
              </p>
              <h3 className="text-2xl font-black text-slate-800">{ativos.length}</h3>
            </div>
          </div>
        </div>

        {/* Card Bloqueados */}
        <div
          onClick={() => setActiveTab('bloqueados')}
          className={`cursor-pointer rounded-2xl p-5 border transition-all ${
            activeTab === 'bloqueados'
              ? 'bg-rose-50/80 border-rose-300 ring-2 ring-rose-400 shadow-md'
              : 'bg-white border-slate-200 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <UserX className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Bloqueados / Recusados
              </p>
              <h3 className="text-2xl font-black text-slate-800">{bloqueados.length}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Search Filter */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          {/* Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('pendentes')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'pendentes'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Clock className="h-4 w-4" />
              <span>Pendentes de Aprovação</span>
              {pendentes.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-white text-amber-700 text-[10px] font-black">
                  {pendentes.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('ativos')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'ativos'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <UserCheck className="h-4 w-4" />
              <span>Usuários Ativos ({ativos.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('bloqueados')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'bloqueados'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <UserX className="h-4 w-4" />
              <span>Bloqueados / Recusados ({bloqueados.length})</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, e-mail ou cargo..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Content of Active Tab */}
        {activeTab === 'pendentes' && (
          <div className="space-y-4">
            {filterList(pendentes).length === 0 ? (
              <div className="py-12 text-center">
                <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-2 opacity-80" />
                <h4 className="text-base font-bold text-slate-700">Tudo em dia!</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Não há novos cadastros pendentes aguardando aprovação no momento.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filterList(pendentes).map((user) => (
                  <div
                    key={user.id}
                    className="p-5 rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50/50 to-white shadow-xs space-y-4 relative"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          name={user.nome}
                          fotoUrl={user.avatar_url}
                          size="lg"
                          className="ring-2 ring-amber-300"
                        />
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">{user.nome}</h4>
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                            Interesse: {user.cargo_pretendido || 'Aluno'}
                          </span>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Pendente</span>
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 bg-white/70 rounded-xl p-3 border border-amber-100">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        <span className="font-medium text-slate-700">{user.email}</span>
                      </div>
                      {user.telefone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          <span>{user.telefone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                        <Calendar className="h-3 w-3" />
                        <span>Solicitado em: {user.data_cadastro}</span>
                      </div>
                    </div>

                    {/* Master Action Buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => openModal(user, 'approve')}
                        className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Aprovar & Definir Acessos</span>
                      </button>

                      <button
                        onClick={() => setRejectModalUser(user)}
                        className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 transition-colors cursor-pointer"
                      >
                        Recusar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Ativos */}
        {activeTab === 'ativos' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Usuário</th>
                  <th className="py-3 px-3">Cargo / Perfil</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Permissões Habilitadas</th>
                  <th className="py-3 px-3 text-right">Ações do Master</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filterList(ativos).map((user) => {
                  const master = isMasterUser(user);
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            name={user.nome}
                            fotoUrl={user.avatar_url}
                            size="sm"
                            isMaster={master}
                            className={master ? 'ring-2 ring-amber-400' : 'ring-1 ring-slate-200'}
                          />
                          <div>
                            <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
                              <span>{user.nome}</span>
                              {master && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black border border-amber-300">
                                  <Crown className="h-3 w-3 text-amber-600" />
                                  <span>MASTER</span>
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500">{user.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-semibold text-slate-700">
                          {user.cargo_pretendido || (user.role === 'master' ? 'Administrador Master' : user.role)}
                        </span>
                        {/* Status da Ficha no Sistema */}
                        {user.role === 'aluno' && (
                          <div className="mt-1">
                            {user.aluno_id || alunos.some(a => a.user_id === user.id || a.email.toLowerCase() === user.email.toLowerCase()) ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                🎓 Ficha de Aluno Ativa
                              </span>
                            ) : (
                              <button
                                onClick={() => vincularAlunoUsuario(user.id)}
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded border border-amber-300 transition-colors cursor-pointer"
                                title="Criar ficha de aluno e matricular no sistema"
                              >
                                ⚡ Associar como Aluno
                              </button>
                            )}
                          </div>
                        )}
                        {user.role === 'professor' && (
                          <div className="mt-1">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              👨‍🏫 Membro da Equipe
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                          <CheckCircle className="h-3 w-3" />
                          <span>Ativo</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        {master ? (
                          <span className="text-amber-700 font-bold flex items-center gap-1">
                            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                            <span>Acesso Total (Irrestrito)</span>
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {user.permissoes?.all ? (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                                Todos os Módulos
                              </span>
                            ) : (
                              Object.entries(user.permissoes || {})
                                .filter(([_, v]) => (typeof v === 'boolean' ? v : v?.view || v?.manage))
                                .slice(0, 4)
                                .map(([k]) => (
                                  <span
                                    key={k}
                                    className="px-1.5 py-0.5 rounded bg-orange-50 text-brand-700 border border-orange-200 text-[10px] capitalize font-medium"
                                  >
                                    {k}
                                  </span>
                                ))
                            )}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        {master ? (
                          <span className="text-[11px] text-slate-400 font-medium italic">
                            Protegido
                          </span>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openModal(user, 'edit')}
                              className="p-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-brand-700 transition-colors"
                              title="Configurar Permissões"
                            >
                              <Sliders className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() => updateUserStatus(user.id, 'bloqueado')}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500 transition-colors"
                              title="Suspender / Bloquear Acesso"
                            >
                              <Lock className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() => {
                                if (window.confirm(`Excluir permanentemente o usuário ${user.nome}?`)) {
                                  deleteUser(user.id);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 hover:text-rose-700 text-slate-400 transition-colors"
                              title="Excluir Usuário"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab Bloqueados / Recusados */}
        {activeTab === 'bloqueados' && (
          <div className="space-y-3">
            {filterList(bloqueados).length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Nenhum usuário bloqueado ou recusado.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                {filterList(bloqueados).map((user) => (
                  <div key={user.id} className="p-4 flex items-center justify-between gap-4 bg-white">
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        name={user.nome}
                        fotoUrl={user.avatar_url}
                        size="sm"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-800">{user.nome}</h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              user.status === 'bloqueado'
                                ? 'bg-slate-200 text-slate-700'
                                : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {user.status === 'bloqueado' ? 'Bloqueado' : 'Recusado'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{user.email}</p>
                        {user.motivo_recusa && (
                          <p className="text-[11px] text-rose-600 mt-0.5">
                            Motivo: {user.motivo_recusa}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openModal(user, 'approve')}
                        className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer"
                      >
                        Reativar & Configurar Acesso
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Excluir permanentemente ${user.nome}?`)) {
                            deleteUser(user.id);
                          }
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Excluir Definitivamente"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal: Configurar Permissões / Aprovar Cadastro */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-orange-100 animate-fadeIn">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-orange-100 text-brand-600 flex items-center justify-center">
                  <Sliders className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    {modalMode === 'approve' ? 'Aprovar Cadastro & Definir Permissões' : 'Editar Permissões de Acesso'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Usuário: <strong>{selectedUser.nome}</strong> ({selectedUser.email})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Presets Rápidos */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  1. Predefinições Rápidas de Acesso
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => applyPreset('aluno')}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-brand-500 hover:bg-orange-50/50 text-left text-xs font-semibold text-slate-700 transition-all cursor-pointer"
                  >
                    <div className="text-brand-600 font-bold mb-0.5">Aluno</div>
                    <div className="text-[10px] text-slate-400 font-normal">Minhas Aulas, Presença & Pagamentos</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset('professor')}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-brand-500 hover:bg-orange-50/50 text-left text-xs font-semibold text-slate-700 transition-all cursor-pointer"
                  >
                    <div className="text-brand-600 font-bold mb-0.5">Professor</div>
                    <div className="text-[10px] text-slate-400 font-normal">Chamada, Cronograma & Nivelamento</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset('admin')}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-brand-500 hover:bg-orange-50/50 text-left text-xs font-semibold text-slate-700 transition-all cursor-pointer"
                  >
                    <div className="text-brand-600 font-bold mb-0.5">Secretaria</div>
                    <div className="text-[10px] text-slate-400 font-normal">Alunos, Pagamentos & Grade</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset('full')}
                    className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/40 hover:bg-amber-100/50 text-left text-xs font-semibold text-amber-900 transition-all cursor-pointer"
                  >
                    <div className="text-amber-700 font-bold mb-0.5 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      <span>Total</span>
                    </div>
                    <div className="text-[10px] text-amber-700/80 font-normal">Acesso completo aos módulos</div>
                  </button>
                </div>
              </div>

              {/* Cargo / Perfil */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Cargo / Identificação
                  </label>
                  <input
                    type="text"
                    value={editCargo}
                    onChange={(e) => setEditCargo(e.target.value)}
                    placeholder="Ex: Aluno, Professor de Xote, Secretaria..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Tipo de Perfil Base
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="aluno">Aluno</option>
                    <option value="professor">Professor / Equipe</option>
                    <option value="admin">Administrador / Coordenação</option>
                  </select>
                </div>
              </div>

              {/* Informação de Sincronização Automática */}
              {editRole === 'aluno' && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2.5">
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold">Sincronização Automática de Aluno:</span>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      Ao salvar este usuário como Aluno, o sistema criará/vinculará automaticamente sua ficha de aluno no menu <strong>Alunos</strong> (com matrícula ativa e nível inicial B1).
                    </p>
                  </div>
                </div>
              )}

              {editRole === 'professor' && (
                <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-xs text-blue-800 flex items-center gap-2.5">
                  <CheckCircle className="h-4 w-4 text-blue-600 shrink-0" />
                  <div>
                    <span className="font-bold">Sincronização Automática de Professor:</span>
                    <p className="text-[11px] text-blue-700 mt-0.5">
                      Ao salvar este usuário como Professor, ele será automaticamente vinculado como membro da equipe e estará disponível na seleção de professores do Cronograma e Turmas.
                    </p>
                  </div>
                </div>
              )}

              {/* Permissões Granulares por Módulo */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  2. Permissões Granulares por Módulo
                </label>
                <div className="border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden text-xs">
                  {/* Alunos */}
                  <div className="p-3 flex items-center justify-between bg-slate-50/50">
                    <div>
                      <span className="font-bold text-slate-800">Alunos</span>
                      <p className="text-[11px] text-slate-400">Cadastro e listagem geral de alunos</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(editPerms.alunos?.view)}
                          onChange={() => handleToggleModulePerm('alunos', 'view')}
                          className="rounded text-brand-600 focus:ring-brand-500"
                        />
                        <span>Ver</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(editPerms.alunos?.create)}
                          onChange={() => handleToggleModulePerm('alunos', 'create')}
                          className="rounded text-brand-600 focus:ring-brand-500"
                        />
                        <span>Criar</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(editPerms.alunos?.edit)}
                          onChange={() => handleToggleModulePerm('alunos', 'edit')}
                          className="rounded text-brand-600 focus:ring-brand-500"
                        />
                        <span>Editar</span>
                      </label>
                    </div>
                  </div>

                  {/* Cronograma / Planejamento */}
                  <div className="p-3 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">Planejamento Semanal (Cronograma)</span>
                      <p className="text-[11px] text-slate-400">Temas das aulas da grade anual</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(editPerms.cronograma?.view)}
                          onChange={() => handleToggleModulePerm('cronograma', 'view')}
                          className="rounded text-brand-600 focus:ring-brand-500"
                        />
                        <span>Ver</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(editPerms.cronograma?.edit)}
                          onChange={() => handleToggleModulePerm('cronograma', 'edit')}
                          className="rounded text-brand-600 focus:ring-brand-500"
                        />
                        <span>Editar</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(editPerms.cronograma?.import_excel)}
                          onChange={() => handleToggleModulePerm('cronograma', 'import_excel')}
                          className="rounded text-brand-600 focus:ring-brand-500"
                        />
                        <span>Importar Excel</span>
                      </label>
                    </div>
                  </div>

                  {/* Presença / Chamadas */}
                  <div className="p-3 flex items-center justify-between bg-slate-50/50">
                    <div>
                      <span className="font-bold text-slate-800">Presença & Chamada</span>
                      <p className="text-[11px] text-slate-400">Check-in de alunos e chamada da turma</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(editPerms.presenca?.view)}
                          onChange={() => handleToggleModulePerm('presenca', 'view')}
                          className="rounded text-brand-600 focus:ring-brand-500"
                        />
                        <span>Ver</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(editPerms.presenca?.manage)}
                          onChange={() => handleToggleModulePerm('presenca', 'manage')}
                          className="rounded text-brand-600 focus:ring-brand-500"
                        />
                        <span>Fazer Chamada</span>
                      </label>
                    </div>
                  </div>

                  {/* Pagamentos / Financeiro */}
                  <div className="p-3 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">Pagamentos & Mensalidades</span>
                      <p className="text-[11px] text-slate-400">Controle financeiro da escola</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(editPerms.pagamentos?.view)}
                          onChange={() => handleToggleModulePerm('pagamentos', 'view')}
                          className="rounded text-brand-600 focus:ring-brand-500"
                        />
                        <span>Ver Painel</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(editPerms.pagamentos?.manage)}
                          onChange={() => handleToggleModulePerm('pagamentos', 'manage')}
                          className="rounded text-brand-600 focus:ring-brand-500"
                        />
                        <span>Dar Baixa / Registrar</span>
                      </label>
                    </div>
                  </div>

                  {/* Nivelamento Técnico */}
                  <div className="p-3 flex items-center justify-between bg-slate-50/50">
                    <div>
                      <span className="font-bold text-slate-800">Nivelamento Técnico</span>
                      <p className="text-[11px] text-slate-400">Avaliações e fichas de nivelamento</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(editPerms.nivelamento?.view)}
                          onChange={() => handleToggleModulePerm('nivelamento', 'view')}
                          className="rounded text-brand-600 focus:ring-brand-500"
                        />
                        <span>Ver</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(editPerms.nivelamento?.evaluate)}
                          onChange={() => handleToggleModulePerm('nivelamento', 'evaluate')}
                          className="rounded text-brand-600 focus:ring-brand-500"
                        />
                        <span>Avaliar</span>
                      </label>
                    </div>
                  </div>

                  {/* Aulas, Eventos, Avisos */}
                  <div className="p-3 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">Turmas, Eventos & Avisos</span>
                      <p className="text-[11px] text-slate-400">Grade de salas, mural e eventos</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(editPerms.aulas?.manage)}
                          onChange={() => handleToggleModulePerm('aulas', 'manage')}
                          className="rounded text-brand-600 focus:ring-brand-500"
                        />
                        <span>Gerenciar Turmas</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(editPerms.eventos?.manage)}
                          onChange={() => handleToggleModulePerm('eventos', 'manage')}
                          className="rounded text-brand-600 focus:ring-brand-500"
                        />
                        <span>Criar Eventos</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(editPerms.avisos?.manage)}
                          onChange={() => handleToggleModulePerm('avisos', 'manage')}
                          className="rounded text-brand-600 focus:ring-brand-500"
                        />
                        <span>Publicar Avisos</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="sticky bottom-0 bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 rounded-b-3xl">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={processing}
                onClick={handleSaveModal}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-brand-600 hover:from-orange-700 hover:to-brand-700 text-white text-xs font-bold shadow-md shadow-orange-600/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {processing ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    <span>{modalMode === 'approve' ? 'Confirmar Aprovação & Liberar Acesso' : 'Salvar Permissões'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Recusar Cadastro */}
      {rejectModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-rose-100 space-y-4 animate-fadeIn">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Recusar Cadastro</h3>
                <p className="text-xs text-slate-500">Usuário: {rejectModalUser.nome}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              O usuário não conseguirá acessar o sistema enquanto estiver com status de recusado. Você pode informar o motivo abaixo:
            </p>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Motivo da Recusa (opcional)
              </label>
              <textarea
                value={motivoRecusa}
                onChange={(e) => setMotivoRecusa(e.target.value)}
                placeholder="Ex: Não localizado na lista de matrículas ativas..."
                rows={3}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalUser(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Voltar
              </button>
              <button
                type="button"
                disabled={processing}
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Confirmar Recusa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
