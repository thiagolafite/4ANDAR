import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Aluno,
  Equipe,
  Aula,
  Cronograma,
  Presenca,
  Pagamento,
  CriterioNivelamento,
  NivelamentoSessao,
  Evento,
  Aviso,
  User,
  NivelForro,
  PapelDanca
} from '../types';
import {
  mockUsers,
  mockEquipe,
  mockAlunos,
  mockAulas,
  mockCronogramas,
  mockPresencas,
  mockPagamentos,
  mockCriteriosNivelamento,
  mockNivelamentoSessoes,
  mockEventos,
  mockAvisos
} from '../data/mockData';
import { ExcelParseResult } from '../utils/excelImport';

interface ToastInfo {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  currentUser: User;
  switchUserRole: (tipo: 'Equipe' | 'Aluno' | 'AdminMaster') => void;
  setCurrentUser: (user: User) => void;
  users: User[];

  // Autenticação & Sessão
  isAuthenticated: boolean;
  token: string | null;
  login: (login: string, senha: string) => Promise<{ success: boolean; error?: string; status?: string }>;
  register: (data: { nome: string; email: string; senha: string; telefone?: string; cargo_pretendido?: string }) => Promise<{ success: boolean; error?: string; status?: string; message?: string }>;
  logout: () => void;
  hasPermission: (module: string, action?: string) => boolean;

  // Gestão de Usuários (Admin Master)
  usuariosList: User[];
  pendingUsersCount: number;
  fetchUsuarios: () => Promise<void>;
  updateUserStatus: (id: string, status: string, options?: { role?: string; permissoes?: any; motivo_recusa?: string }) => Promise<boolean>;
  updateUserPermissions: (id: string, permissoes: any, role?: string, cargo_pretendido?: string) => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;

  // Alunos
  alunos: Aluno[];
  addAluno: (aluno: Omit<Aluno, 'id'>) => Aluno;
  updateAluno: (id: string, updates: Partial<Aluno>) => void;
  deleteAluno: (id: string) => void;
  selectedAlunoModal: Aluno | null;
  setSelectedAlunoModal: (aluno: Aluno | null) => void;

  // Equipe
  equipe: Equipe[];
  addEquipe: (membro: Omit<Equipe, 'id'>) => void;
  updateEquipe: (id: string, updates: Partial<Equipe>) => void;

  // Aulas & Cronograma
  aulas: Aula[];
  addAula: (aula: Omit<Aula, 'id'>) => void;
  updateAula: (id: string, updates: Partial<Aula>) => void;
  deleteAula: (id: string) => void;
  cronogramas: Cronograma[];
  updateTemaCronograma: (aulaId: string, dataAula: string, tema: string, obs?: string) => void;
  deleteCronogramaCell: (aulaId: string, dataAula: string) => void;
  deleteCronogramaRow: (dataAula: string) => void;
  importCronogramaExcel: (parsed: ExcelParseResult) => Promise<number>;

  // Presenças
  presencas: Presenca[];
  solicitarPresenca: (alunoId: string, aulaId: string, dataAula: string) => void;
  confirmarPresenca: (presencaId: string) => void;
  marcarAusente: (presencaId: string) => void;

  // Pagamentos
  pagamentos: Pagamento[];
  registrarPagamento: (id: string, metodo: 'PIX' | 'Dinheiro' | 'Cartão') => void;
  addPagamento: (pagamento: Omit<Pagamento, 'id'>) => void;
  dispararLembretesMensalidade: () => { totalEnviados: number; destinatarios: string[] };

  // Nivelamento
  criteriosNivelamento: CriterioNivelamento[];
  nivelamentoSessoes: NivelamentoSessao[];
  agendarNivelamento: (alunoId: string, nivelAlvo: NivelForro, papel: PapelDanca, dataAgendada: string) => void;
  avaliarNivelamento: (
    sessaoId: string,
    resultado: 'Aprovado' | 'Reprovado',
    feedbackGeral: string,
    feedbackAulao: string,
    feedbackDanca: string,
    notas?: Record<string, number>
  ) => void;

  // Eventos & Avisos
  eventos: Evento[];
  addEvento: (evento: Omit<Evento, 'id'>) => void;
  inscreverEvento: (eventoId: string) => boolean;
  avisos: Aviso[];
  addAviso: (aviso: Omit<Aviso, 'id'>) => void;
  deleteAviso: (id: string) => void;

  // Global Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchModalOpen: boolean;
  setSearchModalOpen: (open: boolean) => void;

  // Toast
  toasts: ToastInfo[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load or initialize state from localStorage
  const loadInitial = <T,>(key: string, fallback: T): T => {
    try {
      const saved = localStorage.getItem(`4andar_${key}`);
      return saved ? JSON.parse(saved) : fallback;
    } catch {
      return fallback;
    }
  };

  const [token, setToken] = useState<string | null>(() => localStorage.getItem('4andar_token'));
  const [currentUser, setCurrentUserState] = useState<User>(() =>
    loadInitial('currentUser', mockUsers[0])
  );
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const savedToken = localStorage.getItem('4andar_token');
    const savedUser = localStorage.getItem('4andar_currentUser');
    return Boolean(savedToken || savedUser);
  });
  const [usuariosList, setUsuariosList] = useState<User[]>([]);

  const pendingUsersCount = usuariosList.filter((u) => u.status === 'pendente').length;
  const [users] = useState<User[]>(mockUsers);
  const [alunos, setAlunos] = useState<Aluno[]>(() => loadInitial('alunos', mockAlunos));
  const [equipe, setEquipe] = useState<Equipe[]>(() => loadInitial('equipe', mockEquipe));
  const [aulas, setAulas] = useState<Aula[]>(() => {
    const local = loadInitial('aulas', mockAulas);
    if (Array.isArray(local) && local.length < mockAulas.length) {
      return mockAulas;
    }
    return local;
  });
  const [cronogramas, setCronogramas] = useState<Cronograma[]>(() => {
    const local = loadInitial('cronogramas', mockCronogramas);
    if (Array.isArray(local) && local.length <= 10 && mockCronogramas.length > local.length) {
      return mockCronogramas;
    }
    return local;
  });
  const [presencas, setPresencas] = useState<Presenca[]>(() =>
    loadInitial('presencas', mockPresencas)
  );
  const [pagamentos, setPagamentos] = useState<Pagamento[]>(() =>
    loadInitial('pagamentos', mockPagamentos)
  );
  const [criteriosNivelamento] = useState<CriterioNivelamento[]>(mockCriteriosNivelamento);
  const [nivelamentoSessoes, setNivelamentoSessoes] = useState<NivelamentoSessao[]>(() =>
    loadInitial('nivelamentoSessoes', mockNivelamentoSessoes)
  );
  const [eventos, setEventos] = useState<Evento[]>(() => loadInitial('eventos', mockEventos));
  const [avisos, setAvisos] = useState<Aviso[]>(() => loadInitial('avisos', mockAvisos));

  const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api');

  // Sincronização inicial com o backend Turso
  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((r) => r.json())
      .then(() => {
        Promise.all([
          fetch(`${API_URL}/alunos`).then((r) => r.json()).catch(() => null),
          fetch(`${API_URL}/equipe`).then((r) => r.json()).catch(() => null),
          fetch(`${API_URL}/aulas`).then((r) => r.json()).catch(() => null),
          fetch(`${API_URL}/cronograma`).then((r) => r.json()).catch(() => null),
          fetch(`${API_URL}/presencas`).then((r) => r.json()).catch(() => null),
          fetch(`${API_URL}/pagamentos`).then((r) => r.json()).catch(() => null),
          fetch(`${API_URL}/nivelamentos`).then((r) => r.json()).catch(() => null),
          fetch(`${API_URL}/eventos`).then((r) => r.json()).catch(() => null),
          fetch(`${API_URL}/avisos`).then((r) => r.json()).catch(() => null)
        ]).then(([tursoAlunos, tursoEquipe, tursoAulas, tursoCronos, tursoPres, tursoPags, tursoNiv, tursoEv, tursoAv]) => {
          if (tursoAlunos?.length) setAlunos(tursoAlunos);
          if (tursoEquipe?.length) setEquipe(tursoEquipe);
          if (tursoAulas?.length) setAulas(tursoAulas);
          if (tursoCronos?.length) setCronogramas(tursoCronos);
          if (tursoPres?.length) setPresencas(tursoPres);
          if (tursoPags?.length) setPagamentos(tursoPags);
          if (tursoNiv?.length) setNivelamentoSessoes(tursoNiv);
          if (tursoEv?.length) setEventos(tursoEv);
          if (tursoAv?.length) setAvisos(tursoAv);
        });
      })
      .catch(() => {
        // Modo offline / servidor não iniciado, mantém localStorage
      });
  }, []);

  // Search & Modal State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [selectedAlunoModal, setSelectedAlunoModal] = useState<Aluno | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('4andar_currentUser', JSON.stringify(currentUser));
  }, [currentUser]);
  useEffect(() => {
    localStorage.setItem('4andar_alunos', JSON.stringify(alunos));
  }, [alunos]);
  useEffect(() => {
    localStorage.setItem('4andar_cronogramas', JSON.stringify(cronogramas));
  }, [cronogramas]);
  useEffect(() => {
    localStorage.setItem('4andar_presencas', JSON.stringify(presencas));
  }, [presencas]);
  useEffect(() => {
    localStorage.setItem('4andar_pagamentos', JSON.stringify(pagamentos));
  }, [pagamentos]);
  useEffect(() => {
    localStorage.setItem('4andar_nivelamentoSessoes', JSON.stringify(nivelamentoSessoes));
  }, [nivelamentoSessoes]);
  useEffect(() => {
    localStorage.setItem('4andar_eventos', JSON.stringify(eventos));
  }, [eventos]);
  useEffect(() => {
    localStorage.setItem('4andar_avisos', JSON.stringify(avisos));
  }, [avisos]);

  // Switch role helper
  const switchUserRole = (tipo: 'Equipe' | 'Aluno' | 'AdminMaster') => {
    if (tipo === 'AdminMaster') {
      const masterUser = mockUsers[0];
      setCurrentUserState(masterUser);
      localStorage.setItem('4andar_currentUser', JSON.stringify(masterUser));
      showToast('Perfil alternado para Administrador Master (Thiago Lafite)', 'info');
      return;
    }
    const found = mockUsers.find((u) => u.tipo_usuario === tipo);
    if (found) {
      setCurrentUserState(found);
      localStorage.setItem('4andar_currentUser', JSON.stringify(found));
      showToast(`Perfil alterado para ${tipo}`, 'info');
    }
  };

  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
    showToast(`Logado como ${user.nome} (${user.tipo_usuario})`, 'info');
  };

  // Auth & Permissions Handlers
  const fetchUsuarios = async () => {
    try {
      const res = await fetch(`${API_URL}/usuarios`);
      if (res.ok) {
        const data = await res.json();
        setUsuariosList(data);
      }
    } catch (err) {
      console.warn('Erro ao carregar usuários:', err);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const login = async (loginId: string, senha: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: loginId, senha })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Erro ao realizar login', status: data.status };
      }
      setToken(data.token);
      setCurrentUserState(data.user);
      setIsAuthenticated(true);
      localStorage.setItem('4andar_token', data.token);
      localStorage.setItem('4andar_currentUser', JSON.stringify(data.user));
      showToast(`Bem-vindo, ${data.user.nome.split(' ')[0]}!`, 'success');
      fetchUsuarios();
      return { success: true };
    } catch {
      return { success: false, error: 'Falha de conexão com o servidor' };
    }
  };

  const register = async (userData: { nome: string; email: string; senha: string; telefone?: string; cargo_pretendido?: string }) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Erro ao realizar cadastro' };
      }
      fetchUsuarios();
      return { success: true, message: data.message, status: data.status };
    } catch {
      return { success: false, error: 'Falha de conexão com o servidor' };
    }
  };

  const logout = () => {
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('4andar_token');
    showToast('Você saiu do sistema.', 'info');
  };

  const hasPermission = (module: string, action?: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.is_master || currentUser.role === 'master' || currentUser.tipo_usuario === 'AdminMaster') return true;
    if (currentUser.permissoes?.all) return true;

    const modPerms = (currentUser.permissoes as any)?.[module];
    if (!modPerms) return false;
    if (typeof modPerms === 'boolean') return modPerms;
    if (!action) return Boolean(modPerms.view || modPerms.manage);
    return Boolean(modPerms[action] ?? modPerms.view);
  };

  const updateUserStatus = async (id: string, status: string, options?: { role?: string; permissoes?: any; motivo_recusa?: string }) => {
    try {
      const res = await fetch(`${API_URL}/usuarios/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...options })
      });
      if (res.ok) {
        showToast(`Status atualizado para "${status}" com sucesso!`, 'success');
        await fetchUsuarios();
        return true;
      }
      const data = await res.json();
      showToast(data.error || 'Erro ao atualizar status', 'error');
      return false;
    } catch {
      showToast('Falha na comunicação com o servidor', 'error');
      return false;
    }
  };

  const updateUserPermissions = async (id: string, permissoes: any, role?: string, cargo_pretendido?: string) => {
    try {
      const res = await fetch(`${API_URL}/usuarios/${id}/permissoes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissoes, role, cargo_pretendido })
      });
      if (res.ok) {
        showToast('Permissões do usuário atualizadas com sucesso!', 'success');
        await fetchUsuarios();
        return true;
      }
      const data = await res.json();
      showToast(data.error || 'Erro ao salvar permissões', 'error');
      return false;
    } catch {
      showToast('Falha na comunicação com o servidor', 'error');
      return false;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/usuarios/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Usuário excluído com sucesso!', 'success');
        await fetchUsuarios();
        return true;
      }
      const data = await res.json();
      showToast(data.error || 'Erro ao excluir usuário', 'error');
      return false;
    } catch {
      showToast('Falha na comunicação com o servidor', 'error');
      return false;
    }
  };

  // Alunos handlers
  const addAluno = (alunoData: Omit<Aluno, 'id'>): Aluno => {
    const newAluno: Aluno = {
      ...alunoData,
      id: `al_${Date.now()}`
    };
    setAlunos((prev) => [newAluno, ...prev]);

    // Grava no Turso em segundo plano
    fetch(`${API_URL}/alunos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAluno)
    }).catch(() => {});

    showToast(`Aluno(a) ${newAluno.nome} cadastrado(a) com sucesso!`);
    return newAluno;
  };

  const updateAluno = (id: string, updates: Partial<Aluno>) => {
    setAlunos((prev) =>
      prev.map((al) => (al.id === id ? { ...al, ...updates } : al))
    );

    // Atualiza no Turso em segundo plano
    fetch(`${API_URL}/alunos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    }).catch(() => {});

    showToast('Dados do aluno atualizados!');
  };

  const deleteAluno = (id: string) => {
    setAlunos((prev) => prev.filter((al) => al.id !== id));

    // Remove do Turso em segundo plano
    fetch(`${API_URL}/alunos/${id}`, {
      method: 'DELETE'
    }).catch(() => {});

    showToast('Aluno removido com sucesso.', 'info');
  };

  // Equipe handlers
  const addEquipe = (membro: Omit<Equipe, 'id'>) => {
    const novo: Equipe = { ...membro, id: `eq_${Date.now()}` };
    setEquipe((prev) => [...prev, novo]);
    showToast(`Membro da equipe ${novo.nome} adicionado!`);
  };

  const updateEquipe = (id: string, updates: Partial<Equipe>) => {
    setEquipe((prev) =>
      prev.map((eq) => (eq.id === id ? { ...eq, ...updates } : eq))
    );
    showToast('Cadastro de equipe atualizado!');
  };

  // Aulas & Cronograma
  const addAula = (aulaData: Omit<Aula, 'id'>) => {
    const nova: Aula = { ...aulaData, id: `aul_${Date.now()}` };
    setAulas((prev) => [...prev, nova]);
    showToast(`Turma ${nova.nome} criada!`);
  };

  const updateAula = (id: string, updates: Partial<Aula>) => {
    setAulas((prev) =>
      prev.map((aul) => (aul.id === id ? { ...aul, ...updates } : aul))
    );
    showToast('Turma atualizada com sucesso!');
  };

  const deleteAula = (id: string) => {
    setAulas((prev) => prev.filter((a) => a.id !== id));
    setCronogramas((prev) => prev.filter((c) => c.aula_id !== id));
    setPresencas((prev) => prev.filter((p) => p.aula_id !== id));
    fetch(`${API_URL}/aulas/${id}`, { method: 'DELETE' }).catch(() => {});
    showToast('Turma excluída com sucesso!');
  };

  const updateTemaCronograma = (
    aulaId: string,
    dataAula: string,
    tema: string,
    obs?: string
  ) => {
    setCronogramas((prev) => {
      const existing = prev.find(
        (c) => c.aula_id === aulaId && c.data_aula === dataAula
      );
      if (existing) {
        return prev.map((c) =>
          c.id === existing.id
            ? { ...c, tema_aula: tema, observacoes: obs ?? c.observacoes }
            : c
        );
      } else {
        const novo: Cronograma = {
          id: `crono_${Date.now()}`,
          aula_id: aulaId,
          data_aula: dataAula,
          tema_aula: tema,
          observacoes: obs
        };
        return [...prev, novo];
      }
    });

    // Salva no backend Turso
    fetch(`${API_URL}/cronograma`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        aula_id: aulaId,
        data_aula: dataAula,
        tema_aula: tema,
        observacoes: obs
      })
    }).catch(() => {});

    showToast('Tema da aula salvo no cronograma!');
  };

  const deleteCronogramaCell = (aulaId: string, dataAula: string) => {
    setCronogramas((prev) =>
      prev.filter((c) => !(c.aula_id === aulaId && c.data_aula === dataAula))
    );
    fetch(`${API_URL}/cronograma/cell?aula_id=${aulaId}&data_aula=${dataAula}`, {
      method: 'DELETE'
    }).catch(() => {});
    showToast('Aula removida do planejamento desta data.', 'info');
  };

  const deleteCronogramaRow = (dataAula: string) => {
    setCronogramas((prev) => prev.filter((c) => c.data_aula !== dataAula));
    fetch(`${API_URL}/cronograma/data/${dataAula}`, {
      method: 'DELETE'
    }).catch(() => {});
    showToast(`Planejamento de ${dataAula} excluído com sucesso.`, 'info');
  };

  const importCronogramaExcel = async (parsed: ExcelParseResult): Promise<number> => {
    // 1. Cria turmas que não existirem
    const currentAulas = [...aulas];
    const newAulasToCreate: Aula[] = [];

    parsed.turmas.forEach((pt) => {
      const exists = currentAulas.find(
        (a) => a.nome.trim().toLowerCase() === pt.nome.trim().toLowerCase()
      );
      if (!exists) {
        const newAula: Aula = {
          id: `aul_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          nome: pt.nome,
          nivel: pt.nivel,
          turno: pt.turno,
          dia_semana: 'Sábado',
          horario_inicio: pt.turno === 'Manhã' ? '10:00' : pt.turno === 'Tarde' ? '14:00' : '19:30',
          horario_fim: pt.turno === 'Manhã' ? '11:30' : pt.turno === 'Tarde' ? '15:30' : '21:00',
          sala: 'Salão Principal',
          equipe_id: 'eq_1',
          capacidade_maxima: 22
        };
        currentAulas.push(newAula);
        newAulasToCreate.push(newAula);
      }
    });

    if (newAulasToCreate.length > 0) {
      setAulas(currentAulas);
    }

    // 2. Mapeia e atualiza/insere os temas das aulas
    const updatedCronos = [...cronogramas];
    const bulkItemsForBackend: Array<{
      id: string;
      aula_id: string;
      data_aula: string;
      tema_aula: string;
      observacoes?: string;
    }> = [];

    parsed.entries.forEach((entry) => {
      const targetAula = currentAulas.find(
        (a) => a.nome.trim().toLowerCase() === entry.turma_nome.trim().toLowerCase()
      );
      if (!targetAula) return;

      const existingIndex = updatedCronos.findIndex(
        (c) => c.aula_id === targetAula.id && c.data_aula === entry.data_aula
      );

      if (existingIndex >= 0) {
        updatedCronos[existingIndex] = {
          ...updatedCronos[existingIndex],
          tema_aula: entry.tema_aula,
          observacoes: entry.observacoes ?? updatedCronos[existingIndex].observacoes
        };
        bulkItemsForBackend.push({
          id: updatedCronos[existingIndex].id,
          aula_id: targetAula.id,
          data_aula: entry.data_aula,
          tema_aula: entry.tema_aula,
          observacoes: entry.observacoes
        });
      } else {
        const newCrono: Cronograma = {
          id: `crono_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          aula_id: targetAula.id,
          data_aula: entry.data_aula,
          tema_aula: entry.tema_aula,
          observacoes: entry.observacoes
        };
        updatedCronos.push(newCrono);
        bulkItemsForBackend.push(newCrono);
      }
    });

    setCronogramas(updatedCronos);

    // 3. Persiste no backend Turso
    try {
      await fetch(`${API_URL}/cronograma/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: bulkItemsForBackend,
          turmasNovas: newAulasToCreate
        })
      });
    } catch (e) {
      console.warn('Erro ao sincronizar com backend Turso:', e);
    }

    showToast(
      `Planilha importada! ${bulkItemsForBackend.length} aulas sincronizadas para ${parsed.turmas.length} turmas.`,
      'success'
    );
    return bulkItemsForBackend.length;
  };

  // Presenças
  const solicitarPresenca = (alunoId: string, aulaId: string, dataAula: string) => {
    const existing = presencas.find(
      (p) => p.aluno_id === alunoId && p.aula_id === aulaId && p.data_aula === dataAula
    );
    if (existing) {
      showToast('Você já solicitou ou confirmou presença para esta aula.', 'info');
      return;
    }
    const nova: Presenca = {
      id: `pre_${Date.now()}`,
      aluno_id: alunoId,
      aula_id: aulaId,
      data_aula: dataAula,
      status: 'pendente',
      data_solicitacao: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setPresencas((prev) => [nova, ...prev]);
    showToast('Presença solicitada! Aguarde a confirmação da equipe.');
  };

  const confirmarPresenca = (presencaId: string) => {
    setPresencas((prev) =>
      prev.map((p) =>
        p.id === presencaId
          ? { ...p, status: 'confirmada', confirmado_por: currentUser.nome }
          : p
      )
    );
    showToast('Presença confirmada!');
  };

  const marcarAusente = (presencaId: string) => {
    setPresencas((prev) =>
      prev.map((p) => (p.id === presencaId ? { ...p, status: 'ausente' } : p))
    );
    showToast('Presença marcada como ausente.', 'info');
  };

  // Pagamentos
  const registrarPagamento = (id: string, metodo: 'PIX' | 'Dinheiro' | 'Cartão') => {
    const dataHoje = new Date().toISOString().substring(0, 10);
    setPagamentos((prev) =>
      prev.map((pag) =>
        pag.id === id
          ? { ...pag, status: 'Pago', data_pagamento: dataHoje, metodo }
          : pag
      )
    );
    showToast(`Pagamento registrado com sucesso via ${metodo}!`);
  };

  const addPagamento = (pagamento: Omit<Pagamento, 'id'>) => {
    const novo: Pagamento = { ...pagamento, id: `pag_${Date.now()}` };
    setPagamentos((prev) => [novo, ...prev]);
    showToast('Cobrança / mensalidade gerada!');
  };

  const dispararLembretesMensalidade = () => {
    // Logic from requirements: (vencimento <= 3 dias ou atrasado)
    const hoje = new Date('2026-09-29');
    const tresDias = new Date(hoje);
    tresDias.setDate(hoje.getDate() + 3);

    const pendentes = pagamentos.filter((p) => {
      if (p.status === 'Pago') return false;
      const v = new Date(p.data_vencimento);
      return v <= tresDias || p.status === 'Atrasado';
    });

    const destinatarios = pendentes
      .map((p) => alunos.find((a) => a.id === p.aluno_id)?.email)
      .filter((email): email is string => Boolean(email));

    showToast(
      `Workflow acionado: Lembretes automáticos enviados para ${destinatarios.length} alunos!`,
      'info'
    );
    return {
      totalEnviados: destinatarios.length,
      destinatarios
    };
  };

  // Nivelamento
  const agendarNivelamento = (
    alunoId: string,
    nivelAlvo: NivelForro,
    papel: PapelDanca,
    dataAgendada: string
  ) => {
    const aluno = alunos.find((a) => a.id === alunoId);
    if (!aluno) return;

    const nova: NivelamentoSessao = {
      id: `niv_${Date.now()}`,
      aluno_id: alunoId,
      data_agendada: dataAgendada,
      nivel_atual: aluno.nivel_atual,
      nivel_alvo: nivelAlvo,
      papel,
      avaliador_aulao: 'Mestre Gonzaga Silva',
      avaliador_danca: 'Mariana Sol',
      avaliador_observa: 'Tiago Baião',
      status: 'Agendado',
      feedback_geral: 'Sessão agendada pelo aluno.'
    };

    setNivelamentoSessoes((prev) => [nova, ...prev]);
    showToast(`Sessão de nivelamento para o nível ${nivelAlvo} agendada com sucesso!`);
  };

  const avaliarNivelamento = (
    sessaoId: string,
    resultado: 'Aprovado' | 'Reprovado',
    feedbackGeral: string,
    feedbackAulao: string,
    feedbackDanca: string,
    notas?: Record<string, number>
  ) => {
    const sessao = nivelamentoSessoes.find((s) => s.id === sessaoId);
    if (!sessao) return;

    setNivelamentoSessoes((prev) =>
      prev.map((s) =>
        s.id === sessaoId
          ? {
              ...s,
              status: 'Concluído',
              resultado,
              feedback_geral: feedbackGeral,
              feedback_aulao: feedbackAulao,
              feedback_danca: feedbackDanca,
              notas
            }
          : s
      )
    );

    // Business requirement: If Aprovado, automatically promote aluno.nivel_atual and set data_inicio_nivel
    if (resultado === 'Aprovado') {
      const hoje = new Date().toISOString().substring(0, 10);
      setAlunos((prev) =>
        prev.map((al) =>
          al.id === sessao.aluno_id
            ? {
                ...al,
                nivel_atual: sessao.nivel_alvo,
                data_inicio_nivel: hoje
              }
            : al
        )
      );
      showToast(
        `Avaliação concluída: Aluno(a) APROVADO(A) e promovido(a) para ${sessao.nivel_alvo}! 🏆🎉`,
        'success'
      );
    } else {
      showToast('Avaliação concluída: Resultado Reprovado com feedbacks registrados.', 'info');
    }
  };

  // Eventos & Avisos
  const addEvento = (ev: Omit<Evento, 'id'>) => {
    const novo: Evento = { ...ev, id: `ev_${Date.now()}` };
    setEventos((prev) => [novo, ...prev]);
    showToast(`Evento "${novo.titulo}" cadastrado!`);
  };

  const inscreverEvento = (eventoId: string): boolean => {
    const ev = eventos.find((e) => e.id === eventoId);
    if (!ev) return false;
    if (ev.vagas_preenchidas >= ev.vagas_limite) {
      showToast('Desculpe, as vagas para este evento já estão esgotadas.', 'error');
      return false;
    }
    setEventos((prev) =>
      prev.map((e) =>
        e.id === eventoId
          ? {
              ...e,
              vagas_preenchidas: e.vagas_preenchidas + 1,
              status:
                e.vagas_preenchidas + 1 >= e.vagas_limite ? 'Esgotado' : e.status
            }
          : e
      )
    );
    showToast(`Inscrição confirmada para "${ev.titulo}"!`, 'success');
    return true;
  };

  const addAviso = (av: Omit<Aviso, 'id'>) => {
    const novo: Aviso = { ...av, id: `av_${Date.now()}` };
    setAvisos((prev) => [novo, ...prev]);
    showToast('Aviso publicado no mural!');
  };

  const deleteAviso = (id: string) => {
    setAvisos((prev) => prev.filter((a) => a.id !== id));
    showToast('Aviso removido.');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        switchUserRole,
        setCurrentUser,
        users,
        isAuthenticated,
        token,
        login,
        register,
        logout,
        hasPermission,
        usuariosList,
        pendingUsersCount,
        fetchUsuarios,
        updateUserStatus,
        updateUserPermissions,
        deleteUser,
        alunos,
        addAluno,
        updateAluno,
        deleteAluno,
        selectedAlunoModal,
        setSelectedAlunoModal,
        equipe,
        addEquipe,
        updateEquipe,
        aulas,
        addAula,
        updateAula,
        deleteAula,
        cronogramas,
        updateTemaCronograma,
        deleteCronogramaCell,
        deleteCronogramaRow,
        importCronogramaExcel,
        presencas,
        solicitarPresenca,
        confirmarPresenca,
        marcarAusente,
        pagamentos,
        registrarPagamento,
        addPagamento,
        dispararLembretesMensalidade,
        criteriosNivelamento,
        nivelamentoSessoes,
        agendarNivelamento,
        avaliarNivelamento,
        eventos,
        addEvento,
        inscreverEvento,
        avisos,
        addAviso,
        deleteAviso,
        searchQuery,
        setSearchQuery,
        searchModalOpen,
        setSearchModalOpen,
        toasts,
        showToast,
        removeToast
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
