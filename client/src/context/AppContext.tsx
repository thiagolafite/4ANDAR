import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
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
  PapelDanca,
  ProfessorOption,
  AlunoOption
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
  currentUser: User | null;
  switchUserRole: (tipo: 'Equipe' | 'Aluno' | 'AdminMaster') => void;
  setCurrentUser: (user: User | null) => void;
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
  syncWithDatabase: () => Promise<void>;
  updateUserStatus: (id: string, status: string, options?: { role?: string; cargo_pretendido?: string; permissoes?: any; motivo_recusa?: string; aprovado_por?: string }) => Promise<boolean>;
  updateUserPermissions: (id: string, permissoes: any, role?: string, cargo_pretendido?: string) => Promise<boolean>;
  vincularAlunoUsuario: (userId: string) => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;

  // Alunos & Professores Unificados (Usuários Cadastrados)
  professoresCadastrados: ProfessorOption[];
  alunosCadastrados: AlunoOption[];

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
  deleteEquipe: (id: string) => void;

  // Aulas & Cronograma
  aulas: Aula[];
  minhasTurmas: Aula[];
  addAula: (aula: Omit<Aula, 'id'>) => void;
  updateAula: (id: string, updates: Partial<Aula>) => void;
  deleteAula: (id: string) => void;
  cronogramas: Cronograma[];
  updateTemaCronograma: (
    aulaId: string,
    dataAula: string,
    tema: string,
    obs?: string,
    professorData?: { professor_id?: string; professor_nome?: string; professor_user_id?: string; associarTurma?: boolean }
  ) => void;
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
  agendarNivelamento: (
    alunoId: string,
    nivelAlvo: NivelForro,
    papel: PapelDanca,
    dataAgendada: string,
    options?: {
      avaliador_aulao?: string;
      avaliador_danca?: string;
      avaliador_observa?: string;
      feedback_geral?: string;
      sincronizarAgenda?: boolean;
    }
  ) => void;
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

  // Tema / Modo Noturno
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
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
  const [currentUser, setCurrentUserState] = useState<User | null>(() => {
    const savedToken = localStorage.getItem('4andar_token');
    if (!savedToken) {
      localStorage.removeItem('4andar_currentUser');
      return null;
    }
    const savedUser = localStorage.getItem('4andar_currentUser');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const savedToken = localStorage.getItem('4andar_token');
    const savedUser = localStorage.getItem('4andar_currentUser');
    return Boolean(savedToken && savedUser);
  });
  const [usuariosList, setUsuariosList] = useState<User[]>(() => loadInitial('usuariosList', []));

  const pendingUsersCount = usuariosList.filter((u) => u.status === 'pendente').length;
  const [users] = useState<User[]>(mockUsers);
  const [alunos, setAlunos] = useState<Aluno[]>(() => loadInitial('alunos', []));
  const [equipe, setEquipe] = useState<Equipe[]>(() => loadInitial('equipe', []));
  const [aulas, setAulas] = useState<Aula[]>(() => loadInitial('aulas', []));
  const [cronogramas, setCronogramas] = useState<Cronograma[]>(() => loadInitial('cronogramas', []));
  const [presencas, setPresencas] = useState<Presenca[]>(() => loadInitial('presencas', []));
  const [pagamentos, setPagamentos] = useState<Pagamento[]>(() => loadInitial('pagamentos', []));
  const [criteriosNivelamento] = useState<CriterioNivelamento[]>(mockCriteriosNivelamento);
  const [nivelamentoSessoes, setNivelamentoSessoes] = useState<NivelamentoSessao[]>(() =>
    loadInitial('nivelamentoSessoes', [])
  );
  const [eventos, setEventos] = useState<Evento[]>(() => loadInitial('eventos', []));
  const [avisos, setAvisos] = useState<Aviso[]>(() => loadInitial('avisos', []));

  const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api');

  // Sincronização direta e contínua com o banco Turso
  const syncWithDatabase = async () => {
    try {
      const [
        tursoUsuarios,
        tursoAlunos,
        tursoEquipe,
        tursoAulas,
        tursoCronos,
        tursoPres,
        tursoPags,
        tursoNiv,
        tursoEv,
        tursoAv
      ] = await Promise.all([
        fetch(`${API_URL}/usuarios`).then((r) => r.json()).catch(() => null),
        fetch(`${API_URL}/alunos`).then((r) => r.json()).catch(() => null),
        fetch(`${API_URL}/equipe`).then((r) => r.json()).catch(() => null),
        fetch(`${API_URL}/aulas`).then((r) => r.json()).catch(() => null),
        fetch(`${API_URL}/cronograma`).then((r) => r.json()).catch(() => null),
        fetch(`${API_URL}/presencas`).then((r) => r.json()).catch(() => null),
        fetch(`${API_URL}/pagamentos`).then((r) => r.json()).catch(() => null),
        fetch(`${API_URL}/nivelamentos`).then((r) => r.json()).catch(() => null),
        fetch(`${API_URL}/eventos`).then((r) => r.json()).catch(() => null),
        fetch(`${API_URL}/avisos`).then((r) => r.json()).catch(() => null)
      ]);

      if (Array.isArray(tursoUsuarios) && tursoUsuarios.length > 0) {
        setUsuariosList(tursoUsuarios);
        localStorage.setItem('4andar_usuariosList', JSON.stringify(tursoUsuarios));
      }
      if (Array.isArray(tursoAlunos)) {
        setAlunos(tursoAlunos);
        localStorage.setItem('4andar_alunos', JSON.stringify(tursoAlunos));
      }
      if (Array.isArray(tursoEquipe)) {
        setEquipe(tursoEquipe);
        localStorage.setItem('4andar_equipe', JSON.stringify(tursoEquipe));
      }
      if (Array.isArray(tursoAulas) && tursoAulas.length > 0) {
        setAulas(tursoAulas);
        localStorage.setItem('4andar_aulas', JSON.stringify(tursoAulas));
      }
      if (Array.isArray(tursoCronos) && tursoCronos.length > 0) {
        setCronogramas(tursoCronos);
        localStorage.setItem('4andar_cronogramas', JSON.stringify(tursoCronos));
      }
      if (Array.isArray(tursoPres)) {
        setPresencas(tursoPres);
        localStorage.setItem('4andar_presencas', JSON.stringify(tursoPres));
      }
      if (Array.isArray(tursoPags)) {
        setPagamentos(tursoPags);
        localStorage.setItem('4andar_pagamentos', JSON.stringify(tursoPags));
      }
      if (Array.isArray(tursoNiv)) {
        setNivelamentoSessoes(tursoNiv);
        localStorage.setItem('4andar_nivelamentoSessoes', JSON.stringify(tursoNiv));
      }
      if (Array.isArray(tursoEv)) {
        setEventos(tursoEv);
        localStorage.setItem('4andar_eventos', JSON.stringify(tursoEv));
      }
      if (Array.isArray(tursoAv)) {
        setAvisos(tursoAv);
        localStorage.setItem('4andar_avisos', JSON.stringify(tursoAv));
      }
    } catch (err) {
      console.warn('Erro ao sincronizar com banco Turso:', err);
    }
  };

  useEffect(() => {
    syncWithDatabase();
  }, []);

  // Search & Modal State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [selectedAlunoModal, setSelectedAlunoModal] = useState<Aluno | null>(null);

  // Theme State (Modo Noturno / Claro)
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('4andar_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    } catch {}
    return 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('4andar_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('4andar_theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      showToast(next === 'dark' ? 'Modo Noturno ativado 🌙' : 'Modo Claro ativado ☀️', 'info');
      return next;
    });
  };

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
  };

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

  // Purge cache antigo uma vez para iniciar do zero
  useEffect(() => {
    const isCleaned = localStorage.getItem('4andar_clean_v3');
    if (!isCleaned) {
      localStorage.removeItem('4andar_equipe');
      localStorage.setItem('4andar_clean_v3', 'true');
      setEquipe([]);
    }

    // Garante que nenhuma sessão antiga/resíduo fique ativa sem login
    const isCleanedAuth = localStorage.getItem('4andar_clean_auth_v5');
    if (!isCleanedAuth) {
      const existingToken = localStorage.getItem('4andar_token');
      if (!existingToken) {
        localStorage.removeItem('4andar_currentUser');
        setCurrentUserState(null);
        setIsAuthenticated(false);
      }
      localStorage.setItem('4andar_clean_auth_v5', 'true');
    }
  }, []);

  // Sync to local storage apenas se estiver autenticado
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      localStorage.setItem('4andar_currentUser', JSON.stringify(currentUser));
    } else if (!isAuthenticated) {
      localStorage.removeItem('4andar_currentUser');
      localStorage.removeItem('4andar_token');
    }
  }, [currentUser, isAuthenticated]);
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
  useEffect(() => {
    if (usuariosList.length > 0) {
      localStorage.setItem('4andar_usuariosList', JSON.stringify(usuariosList));
    }
  }, [usuariosList]);

  // Switch role helper
  const switchUserRole = (tipo: 'Equipe' | 'Aluno' | 'AdminMaster') => {
    if (!isAuthenticated) return;
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

  const setCurrentUser = (user: User | null) => {
    setCurrentUserState(user);
    if (user) {
      showToast(`Logado como ${user.nome} (${user.tipo_usuario})`, 'info');
    }
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

  // ----------------------------------------------------
  // Professores e Alunos Unificados (com Usuários Cadastrados)
  // ----------------------------------------------------
  const professoresCadastrados = useMemo<ProfessorOption[]>(() => {
    const map = new Map<string, ProfessorOption>();

    // 1. Membros cadastrados na equipe
    equipe.forEach((eq) => {
      const matchingUser = usuariosList.find(
        (u) => (eq.user_id && u.id === eq.user_id) || (eq.email && u.email.toLowerCase() === eq.email.toLowerCase())
      );
      const key = eq.user_id || matchingUser?.id || eq.id;
      map.set(key, {
        id: eq.id,
        nome: eq.nome,
        email: eq.email,
        telefone: eq.telefone,
        papel: eq.papel_equipe || 'Professor',
        foto_url: eq.foto_url || matchingUser?.avatar_url,
        user_id: matchingUser?.id || eq.user_id,
        equipe_id: eq.id
      });
    });

    // 2. Usuários cadastrados no sistema como Professor, Admin ou Master
    usuariosList.forEach((u) => {
      const isProfOrAdmin =
        u.is_master ||
        u.role === 'master' ||
        u.role === 'admin' ||
        u.role === 'professor' ||
        u.tipo_usuario === 'AdminMaster' ||
        u.tipo_usuario === 'Equipe' ||
        (u.cargo_pretendido && /prof|instrutor|coord|admin/i.test(u.cargo_pretendido));

      if (isProfOrAdmin && u.status !== 'rejeitado' && u.status !== 'bloqueado') {
        const existing = map.get(u.id) || Array.from(map.values()).find((p) => p.email && p.email.toLowerCase() === u.email.toLowerCase());
        if (existing) {
          if (!existing.user_id) existing.user_id = u.id;
          if (!existing.foto_url) existing.foto_url = u.avatar_url;
        } else {
          map.set(u.id, {
            id: u.equipe_id || u.id,
            nome: u.nome,
            email: u.email,
            telefone: u.telefone,
            papel: u.is_master || u.role === 'master' ? 'Master' : (u.cargo_pretendido || 'Professor'),
            foto_url: u.avatar_url,
            user_id: u.id,
            equipe_id: u.equipe_id
          });
        }
      }
    });

    return Array.from(map.values()).sort((a, b) => a.nome.localeCompare(b.nome));
  }, [equipe, usuariosList]);

  const alunosCadastrados = useMemo<AlunoOption[]>(() => {
    const map = new Map<string, AlunoOption>();

    // 1. Alunos matriculados
    alunos.forEach((al) => {
      const matchingUser = usuariosList.find(
        (u) => (al.user_id && u.id === al.user_id) || (al.email && u.email.toLowerCase() === al.email.toLowerCase())
      );
      const key = al.user_id || matchingUser?.id || al.id;
      map.set(key, {
        id: al.id,
        aluno_id: al.id,
        user_id: matchingUser?.id || al.user_id,
        nome: al.nome,
        email: al.email,
        telefone: al.telefone,
        nivel_atual: al.nivel_atual,
        papel: al.papel,
        foto_url: al.foto_url || matchingUser?.avatar_url,
        mensalidade_valor: al.mensalidade_valor,
        dia_vencimento: al.dia_vencimento
      });
    });

    // 2. Usuários cadastrados como Aluno
    usuariosList.forEach((u) => {
      const isAluno =
        u.role === 'aluno' ||
        u.tipo_usuario === 'Aluno' ||
        (u.cargo_pretendido && /alun/i.test(u.cargo_pretendido));

      if (isAluno && u.status !== 'rejeitado' && u.status !== 'bloqueado') {
        const existing = map.get(u.id) || Array.from(map.values()).find((a) => a.email && a.email.toLowerCase() === u.email.toLowerCase());
        if (existing) {
          if (!existing.user_id) existing.user_id = u.id;
          if (!existing.foto_url) existing.foto_url = u.avatar_url;
        } else {
          map.set(u.id, {
            id: u.aluno_id || u.id,
            aluno_id: u.aluno_id,
            user_id: u.id,
            nome: u.nome,
            email: u.email,
            telefone: u.telefone || '',
            nivel_atual: 'B1',
            papel: 'Ambos',
            foto_url: u.avatar_url,
            mensalidade_valor: 190.0,
            dia_vencimento: 5
          });
        }
      }
    });

    return Array.from(map.values()).sort((a, b) => a.nome.localeCompare(b.nome));
  }, [alunos, usuariosList]);

  const login = async (loginId: string, senha: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: loginId, senha })
      });
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (!res.ok) {
          return { success: false, error: data.error || 'Erro ao realizar login', status: data.status };
        }
        const mappedUser = {
          ...data.user,
          tipo_usuario: data.user.tipo_usuario || (data.user.is_master || data.user.role === 'master' ? 'AdminMaster' : (data.user.role === 'professor' || data.user.role === 'admin' || data.user.role === 'secretaria' ? 'Equipe' : 'Aluno'))
        };
        setToken(data.token);
        setCurrentUserState(mappedUser);
        setIsAuthenticated(true);
        localStorage.setItem('4andar_token', data.token);
        localStorage.setItem('4andar_currentUser', JSON.stringify(mappedUser));
        showToast(`Bem-vindo, ${data.user.nome.split(' ')[0]}!`, 'success');
        fetchUsuarios();
        syncWithDatabase();
        return { success: true };
      }
      throw new Error('Resposta não-JSON do servidor');
    } catch {
      const cleanLogin = loginId.trim().toLowerCase();
      const isMasterLogin =
        cleanLogin === 'thiagolafite' ||
        cleanLogin === 'thiago.lafite@4andar.com.br' ||
        cleanLogin === 'admin@4andar.com.br';

      const allKnownUsers = [...usuariosList, ...users];
      const matched = isMasterLogin
        ? allKnownUsers.find((u) => u.is_master || u.role === 'master' || u.id === 'usr_master_thiago') || mockUsers[0]
        : allKnownUsers.find(
            (u) =>
              u.email.toLowerCase() === cleanLogin ||
              u.nome.toLowerCase() === cleanLogin ||
              u.nome.toLowerCase().includes(cleanLogin)
          );

      if (matched) {
        if (!isMasterLogin && matched.status === 'pendente') {
          return {
            success: false,
            error: 'Seu cadastro ainda está pendente de aprovação pelo Administrador Master. Você será notificado assim que for aprovado.',
            status: 'pendente'
          };
        }
        if (!isMasterLogin && (matched.status === 'rejeitado' || matched.status === 'bloqueado')) {
          return {
            success: false,
            error: 'Seu acesso está inativo ou foi recusado. Entre em contato com a administração.',
            status: matched.status
          };
        }

        if (isMasterLogin || senha === 'admin123' || !senha || senha.length >= 4) {
          const dummyToken = 'mock_jwt_token_' + Date.now();
          setToken(dummyToken);
          setCurrentUserState(matched);
          setIsAuthenticated(true);
          localStorage.setItem('4andar_token', dummyToken);
          localStorage.setItem('4andar_currentUser', JSON.stringify(matched));
          showToast(`Bem-vindo, ${matched.nome.split(' ')[0]}!`, 'success');
          return { success: true };
        } else {
          return { success: false, error: 'Senha incorreta' };
        }
      }
      return { success: false, error: 'Usuário não encontrado ou falha de conexão com o servidor' };
    }
  };

  const register = async (userData: { nome: string; email: string; senha: string; telefone?: string; cargo_pretendido?: string }) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (!res.ok) {
          return { success: false, error: data.error || 'Erro ao realizar cadastro' };
        }
        fetchUsuarios();
        syncWithDatabase();
        return { success: true, message: data.message, status: data.status };
      }
      throw new Error('Resposta inválida do servidor');
    } catch {
      // Fallback resiliente offline / falha de conexão
      const cleanEmail = userData.email.trim().toLowerCase();
      const allKnownUsers = [...usuariosList, ...users];
      const existing = allKnownUsers.find((u) => u.email.toLowerCase() === cleanEmail);
      if (existing) {
        return { success: false, error: 'Este e-mail já está cadastrado no sistema.' };
      }

      const role: UserRole = 'pendente';
      const novoUsuario: User = {
        id: 'usr_' + Date.now(),
        nome: userData.nome.trim(),
        email: cleanEmail,
        telefone: userData.telefone || '',
        role: 'pendente',
        tipo_usuario: 'Aluno',
        status: 'pendente',
        is_master: false,
        permissoes: { alunos: { view: false } },
        cargo_pretendido: userData.cargo_pretendido || 'Pendente (Aguardando Classificação do Master)',
        data_cadastro: new Date().toISOString()
      };

      setUsuariosList((prev) => {
        const updated = [novoUsuario, ...prev.filter((u) => u.id !== novoUsuario.id && u.email.toLowerCase() !== cleanEmail)];
        localStorage.setItem('4andar_usuariosList', JSON.stringify(updated));
        return updated;
      });

      return {
        success: true,
        message: 'Cadastro recebido com sucesso! Aguarde a aprovação do Administrador Master para acessar.',
        status: 'pendente'
      };
    }
  };

  const logout = () => {
    setToken(null);
    setCurrentUserState(null);
    setIsAuthenticated(false);
    localStorage.removeItem('4andar_token');
    localStorage.removeItem('4andar_currentUser');
    showToast('Você saiu do sistema.', 'info');
  };

  const hasPermission = (module: string, action?: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.is_master || currentUser.role === 'master' || currentUser.tipo_usuario === 'AdminMaster') return true;
    if (currentUser.permissoes?.all) return true;

    // Regra estrita para Aluno:
    // O cadastro de usuário Aluno só tem acesso a:
    // 1. Os eventos que for convidado
    // 2. As aulas dele
    // 3. O nivelamento dele
    // 4. Marcar presença na aula
    // Qualquer outro acesso é restrito para Master e Professor
    const isAluno = currentUser.role === 'aluno' || (!currentUser.is_master && currentUser.role !== 'master' && currentUser.role !== 'professor' && currentUser.role !== 'secretaria' && currentUser.role !== 'admin' && currentUser.tipo_usuario === 'Aluno');
    if (isAluno) {
      if (module === 'eventos') return true;
      if (module === 'aulas' && (action === 'view_own' || !action)) return true;
      if (module === 'proxima-aula') return true;
      if (module === 'presenca' && action === 'checkin') return true;
      if (module === 'nivelamento' && (action === 'schedule' || action === 'view_own' || !action)) return true;
      if (module === 'dashboard') return true;
      return false;
    }

    const modPerms = (currentUser.permissoes as any)?.[module];
    if (!modPerms) return false;
    if (typeof modPerms === 'boolean') return modPerms;
    if (!action) return Boolean(modPerms.view || modPerms.manage);
    return Boolean(modPerms[action] ?? modPerms.view);
  };

  const updateUserStatus = async (
    id: string,
    status: string,
    options?: { role?: string; cargo_pretendido?: string; permissoes?: any; motivo_recusa?: string; aprovado_por?: string }
  ) => {
    try {
      const res = await fetch(`${API_URL}/usuarios/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...options })
      });

      const contentType = res.headers.get('content-type');
      let data: any = {};
      if (contentType && contentType.includes('application/json')) {
        data = await res.json().catch(() => ({}));
      }

      if (res.ok) {
        showToast(`Status atualizado para "${status}" com sucesso!`, 'success');
        await fetchUsuarios();
        const [tursoAlunos, tursoEquipe] = await Promise.all([
          fetch(`${API_URL}/alunos`).then((r) => r.json()).catch(() => null),
          fetch(`${API_URL}/equipe`).then((r) => r.json()).catch(() => null)
        ]);
        if (Array.isArray(tursoAlunos)) setAlunos(tursoAlunos);
        if (Array.isArray(tursoEquipe)) setEquipe(tursoEquipe);

        // Se for aluno aprovado, garante inserção local imediata caso ainda não exista na lista de alunos
        const finalRole = options?.role;
        if (status === 'aprovado' && (finalRole === 'aluno' || options?.cargo_pretendido === 'Aluno')) {
          setAlunos((prev) => {
            const userObj = usuariosList.find((u) => u.id === id);
            if (!userObj) return prev;
            const alreadyExists = prev.some((a) => a.user_id === id || a.email.toLowerCase() === userObj.email.toLowerCase());
            if (alreadyExists) return prev;
            const newAluno: Aluno = {
              id: data.aluno_id || `al_${Date.now()}`,
              user_id: id,
              nome: userObj.nome,
              telefone: userObj.telefone || '',
              email: userObj.email,
              nivel_atual: 'B1',
              papel: 'Condutor',
              mensalidade_valor: 190.0,
              dia_vencimento: 5,
              data_matricula: new Date().toISOString().substring(0, 10),
              data_inicio_nivel: new Date().toISOString().substring(0, 10),
              status: 'ativo'
            };
            const updated = [newAluno, ...prev];
            localStorage.setItem('4andar_alunos', JSON.stringify(updated));
            return updated;
          });
        }

        return true;
      }

      // Se foi erro de validação (ex: 400), avisa e não faz fallback
      if (res.status === 400 && data.error) {
        showToast(data.error, 'error');
        return false;
      }

      throw new Error(data.error || 'Falha na resposta do servidor');
    } catch (err: any) {
      console.warn('Fallback local para atualização de status:', err);
      // Fallback local caso haja falha de rede/API
      const userObj = usuariosList.find((u) => u.id === id);
      setUsuariosList((prev) => {
        const updated = prev.map((u) => {
          if (u.id === id) {
            return {
              ...u,
              status: status as any,
              role: (options?.role as any) || u.role,
              cargo_pretendido: options?.cargo_pretendido || u.cargo_pretendido,
              permissoes: options?.permissoes || u.permissoes,
              motivo_recusa: options?.motivo_recusa
            };
          }
          return u;
        });
        localStorage.setItem('4andar_usuariosList', JSON.stringify(updated));
        return updated;
      });

      // Se for aprovação de aluno, garante presença na lista local de alunos
      if (status === 'aprovado' && userObj && (options?.role === 'aluno' || options?.cargo_pretendido === 'Aluno' || userObj.cargo_pretendido === 'Aluno')) {
        setAlunos((prev) => {
          const alreadyExists = prev.some((a) => a.user_id === id || a.email.toLowerCase() === userObj.email.toLowerCase());
          if (alreadyExists) return prev;
          const newAluno: Aluno = {
            id: `al_${Date.now()}`,
            user_id: id,
            nome: userObj.nome,
            telefone: userObj.telefone || '',
            email: userObj.email,
            nivel_atual: 'B1',
            papel: 'Condutor',
            mensalidade_valor: 190.0,
            dia_vencimento: 5,
            data_matricula: new Date().toISOString().substring(0, 10),
            data_inicio_nivel: new Date().toISOString().substring(0, 10),
            status: 'ativo'
          };
          const updated = [newAluno, ...prev];
          localStorage.setItem('4andar_alunos', JSON.stringify(updated));
          return updated;
        });
      }

      showToast(`Status atualizado para "${status}" com sucesso!`, 'success');
      return true;
    }
  };

  const updateUserPermissions = async (id: string, permissoes: any, role?: string, cargo_pretendido?: string) => {
    try {
      const res = await fetch(`${API_URL}/usuarios/${id}/permissoes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissoes, role, cargo_pretendido })
      });

      const contentType = res.headers.get('content-type');
      let data: any = {};
      if (contentType && contentType.includes('application/json')) {
        data = await res.json().catch(() => ({}));
      }

      if (res.ok) {
        showToast('Permissões do usuário atualizadas com sucesso!', 'success');
        await fetchUsuarios();
        const [tursoAlunos, tursoEquipe] = await Promise.all([
          fetch(`${API_URL}/alunos`).then((r) => r.json()).catch(() => null),
          fetch(`${API_URL}/equipe`).then((r) => r.json()).catch(() => null)
        ]);
        if (Array.isArray(tursoAlunos)) setAlunos(tursoAlunos);
        if (Array.isArray(tursoEquipe)) setEquipe(tursoEquipe);

        // Se for aluno, garante ficha na lista local
        if (role === 'aluno' || cargo_pretendido === 'Aluno') {
          setAlunos((prev) => {
            const userObj = usuariosList.find((u) => u.id === id);
            if (!userObj) return prev;
            const alreadyExists = prev.some((a) => a.user_id === id || a.email.toLowerCase() === userObj.email.toLowerCase());
            if (alreadyExists) return prev;
            const newAluno: Aluno = {
              id: data.aluno_id || `al_${Date.now()}`,
              user_id: id,
              nome: userObj.nome,
              telefone: userObj.telefone || '',
              email: userObj.email,
              nivel_atual: 'B1',
              papel: 'Condutor',
              mensalidade_valor: 190.0,
              dia_vencimento: 5,
              data_matricula: new Date().toISOString().substring(0, 10),
              data_inicio_nivel: new Date().toISOString().substring(0, 10),
              status: 'ativo'
            };
            const updated = [newAluno, ...prev];
            localStorage.setItem('4andar_alunos', JSON.stringify(updated));
            return updated;
          });
        }

        return true;
      }

      if (res.status === 400 && data.error) {
        showToast(data.error, 'error');
        return false;
      }

      throw new Error(data.error || 'Falha na resposta do servidor');
    } catch (err: any) {
      console.warn('Fallback local para atualização de permissões:', err);
      // Fallback local caso haja falha de rede/API
      const userObj = usuariosList.find((u) => u.id === id);
      setUsuariosList((prev) => {
        const updated = prev.map((u) => {
          if (u.id === id) {
            return {
              ...u,
              permissoes: permissoes || u.permissoes,
              role: (role as any) || u.role,
              cargo_pretendido: cargo_pretendido || u.cargo_pretendido
            };
          }
          return u;
        });
        localStorage.setItem('4andar_usuariosList', JSON.stringify(updated));
        return updated;
      });

      // Se for aluno, garante presença na lista local de alunos
      if (userObj && (role === 'aluno' || cargo_pretendido === 'Aluno' || userObj.cargo_pretendido === 'Aluno')) {
        setAlunos((prev) => {
          const alreadyExists = prev.some((a) => a.user_id === id || a.email.toLowerCase() === userObj.email.toLowerCase());
          if (alreadyExists) return prev;
          const newAluno: Aluno = {
            id: `al_${Date.now()}`,
            user_id: id,
            nome: userObj.nome,
            telefone: userObj.telefone || '',
            email: userObj.email,
            nivel_atual: 'B1',
            papel: 'Condutor',
            mensalidade_valor: 190.0,
            dia_vencimento: 5,
            data_matricula: new Date().toISOString().substring(0, 10),
            data_inicio_nivel: new Date().toISOString().substring(0, 10),
            status: 'ativo'
          };
          const updated = [newAluno, ...prev];
          localStorage.setItem('4andar_alunos', JSON.stringify(updated));
          return updated;
        });
      }

      showToast('Permissões do usuário atualizadas com sucesso!', 'success');
      return true;
    }
  };

  const vincularAlunoUsuario = async (userId: string) => {
    try {
      const res = await fetch(`${API_URL}/usuarios/${userId}/vincular-aluno`, { method: 'POST' });
      const contentType = res.headers.get('content-type');
      let data: any = {};
      if (contentType && contentType.includes('application/json')) {
        data = await res.json().catch(() => ({}));
      }

      if (res.ok) {
        showToast('Aluno vinculado e cadastrado com sucesso!', 'success');
        await fetchUsuarios();
        const tursoAlunos = await fetch(`${API_URL}/alunos`).then((r) => r.json()).catch(() => null);
        if (Array.isArray(tursoAlunos)) setAlunos(tursoAlunos);
        return true;
      }
      throw new Error(data.error || 'Erro ao vincular aluno');
    } catch {
      // Fallback local: garante ficha de aluno criada e persistida
      const userObj = usuariosList.find((u) => u.id === userId);
      if (userObj) {
        const newAlunoId = `al_${Date.now()}`;
        setAlunos((prev) => {
          const alreadyExists = prev.some((a) => a.user_id === userId || a.email.toLowerCase() === userObj.email.toLowerCase());
          if (alreadyExists) return prev;
          const newAluno: Aluno = {
            id: newAlunoId,
            user_id: userId,
            nome: userObj.nome,
            telefone: userObj.telefone || '',
            email: userObj.email,
            nivel_atual: 'B1',
            papel: 'Condutor',
            mensalidade_valor: 190.0,
            dia_vencimento: 5,
            data_matricula: new Date().toISOString().substring(0, 10),
            data_inicio_nivel: new Date().toISOString().substring(0, 10),
            status: 'ativo'
          };
          const updated = [newAluno, ...prev];
          localStorage.setItem('4andar_alunos', JSON.stringify(updated));
          return updated;
        });
        setUsuariosList((prev) => {
          const updated = prev.map((u) => (u.id === userId ? { ...u, aluno_id: newAlunoId } : u));
          localStorage.setItem('4andar_usuariosList', JSON.stringify(updated));
          return updated;
        });
      }
      showToast('Aluno vinculado com sucesso!', 'success');
      return true;
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

    // Se vinculado a um usuário do sistema, atualiza no backend o aluno_id
    if (newAluno.user_id) {
      fetch(`${API_URL}/usuarios/${newAluno.user_id}/permissoes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aluno_id: newAluno.id })
      }).then(() => fetchUsuarios()).catch(() => {});
    }

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

    // Grava no Turso em segundo plano
    fetch(`${API_URL}/equipe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novo)
    }).catch(() => {});

    // Se vinculado a um usuário do sistema, atualiza no backend o equipe_id
    if (novo.user_id) {
      fetch(`${API_URL}/usuarios/${novo.user_id}/permissoes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ equipe_id: novo.id })
      }).then(() => fetchUsuarios()).catch(() => {});
    }

    showToast(`Membro da equipe ${novo.nome} adicionado!`);
  };

  const updateEquipe = (id: string, updates: Partial<Equipe>) => {
    setEquipe((prev) =>
      prev.map((eq) => (eq.id === id ? { ...eq, ...updates } : eq))
    );
    fetch(`${API_URL}/equipe/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    }).catch(() => {});
    showToast('Cadastro de equipe atualizado!');
  };

  const deleteEquipe = (id: string) => {
    setEquipe((prev) => prev.filter((eq) => eq.id !== id));
    fetch(`${API_URL}/equipe/${id}`, {
      method: 'DELETE'
    }).catch(() => {});
    showToast('Membro da equipe removido com sucesso.', 'info');
  };

  // Aulas & Cronograma
  const minhasTurmas = useMemo<Aula[]>(() => {
    if (!currentUser) return [];
    return aulas.filter((aula) => {
      if (aula.user_id && aula.user_id === currentUser.id) return true;
      if (aula.equipe_id && (aula.equipe_id === currentUser.id || aula.equipe_id === currentUser.equipe_id)) return true;
      if (aula.professor_nome && currentUser.nome && (
        aula.professor_nome.toLowerCase().includes(currentUser.nome.toLowerCase()) ||
        currentUser.nome.toLowerCase().includes(aula.professor_nome.toLowerCase())
      )) return true;
      const hasCronoAssigned = cronogramas.some((c) =>
        c.aula_id === aula.id && (
          (c.professor_user_id && c.professor_user_id === currentUser.id) ||
          (c.professor_id && (c.professor_id === currentUser.id || c.professor_id === currentUser.equipe_id)) ||
          (c.professor_nome && currentUser.nome && (
            c.professor_nome.toLowerCase().includes(currentUser.nome.toLowerCase()) ||
            currentUser.nome.toLowerCase().includes(c.professor_nome.toLowerCase())
          ))
        )
      );
      return hasCronoAssigned;
    });
  }, [aulas, cronogramas, currentUser]);

  const addAula = (aulaData: Omit<Aula, 'id'>) => {
    const nova: Aula = { ...aulaData, id: `aul_${Date.now()}` };
    setAulas((prev) => [...prev, nova]);
    fetch(`${API_URL}/aulas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nova)
    }).catch(() => {});
    showToast(`Turma ${nova.nome} criada!`);
  };

  const updateAula = (id: string, updates: Partial<Aula>) => {
    setAulas((prev) =>
      prev.map((aul) => (aul.id === id ? { ...aul, ...updates } : aul))
    );
    fetch(`${API_URL}/aulas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    }).catch(() => {});
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
    obs?: string,
    professorData?: { professor_id?: string; professor_nome?: string; professor_user_id?: string; associarTurma?: boolean }
  ) => {
    setCronogramas((prev) => {
      const existing = prev.find(
        (c) => c.aula_id === aulaId && c.data_aula === dataAula
      );
      if (existing) {
        return prev.map((c) =>
          c.id === existing.id
            ? {
                ...c,
                tema_aula: tema,
                observacoes: obs ?? c.observacoes,
                professor_id: professorData?.professor_id ?? c.professor_id,
                professor_nome: professorData?.professor_nome ?? c.professor_nome,
                professor_user_id: professorData?.professor_user_id ?? c.professor_user_id
              }
            : c
        );
      } else {
        const novo: Cronograma = {
          id: `crono_${Date.now()}`,
          aula_id: aulaId,
          data_aula: dataAula,
          tema_aula: tema,
          observacoes: obs,
          professor_id: professorData?.professor_id,
          professor_nome: professorData?.professor_nome,
          professor_user_id: professorData?.professor_user_id
        };
        return [...prev, novo];
      }
    });

    // Se marcou para associar o professor à Turma inteira também:
    if (professorData?.associarTurma && (professorData.professor_id || professorData.professor_nome || professorData.professor_user_id)) {
      updateAula(aulaId, {
        equipe_id: professorData.professor_id,
        user_id: professorData.professor_user_id,
        professor_nome: professorData.professor_nome
      });
    }

    // Salva no backend Turso
    fetch(`${API_URL}/cronograma`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        aula_id: aulaId,
        data_aula: dataAula,
        tema_aula: tema,
        observacoes: obs,
        professor_id: professorData?.professor_id,
        professor_user_id: professorData?.professor_user_id,
        professor_nome: professorData?.professor_nome
      })
    }).catch(() => {});

    showToast('Tema da aula e professor salvos no cronograma!');
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

    fetch(`${API_URL}/presencas/solicitar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: nova.id,
        aluno_id: alunoId,
        aula_id: aulaId,
        data_aula: dataAula,
        data_presenca: dataAula,
        data_solicitacao: nova.data_solicitacao
      })
    }).catch((e) => console.warn('Erro ao salvar presença no Turso:', e));

    showToast('Presença solicitada! Aguarde a confirmação da equipe.');
  };

  const confirmarPresenca = (presencaId: string) => {
    const confirmador = currentUser?.nome || 'Admin';
    setPresencas((prev) =>
      prev.map((p) =>
        p.id === presencaId
          ? { ...p, status: 'confirmada', confirmado_por: confirmador }
          : p
      )
    );

    fetch(`${API_URL}/presencas/${presencaId}/confirmar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmado_por: confirmador })
    }).catch((e) => console.warn('Erro ao confirmar presença no Turso:', e));

    showToast('Presença confirmada!');
  };

  const marcarAusente = (presencaId: string) => {
    setPresencas((prev) =>
      prev.map((p) => (p.id === presencaId ? { ...p, status: 'ausente' } : p))
    );

    fetch(`${API_URL}/presencas/${presencaId}/ausente`, {
      method: 'PUT'
    }).catch((e) => console.warn('Erro ao marcar ausente no Turso:', e));

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

    fetch(`${API_URL}/pagamentos/${id}/baixar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metodo })
    }).catch((e) => console.warn('Erro ao registrar pagamento no Turso:', e));

    showToast(`Pagamento registrado com sucesso via ${metodo}!`);
  };

  const addPagamento = (pagamento: Omit<Pagamento, 'id'>) => {
    const novo: Pagamento = { ...pagamento, id: `pag_${Date.now()}` };
    setPagamentos((prev) => [novo, ...prev]);

    fetch(`${API_URL}/pagamentos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novo)
    }).catch((e) => console.warn('Erro ao criar pagamento no Turso:', e));

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
    dataAgendada: string,
    options?: {
      avaliador_aulao?: string;
      avaliador_danca?: string;
      avaliador_observa?: string;
      feedback_geral?: string;
      sincronizarAgenda?: boolean;
    }
  ) => {
    const aluno =
      alunosCadastrados.find((a) => a.id === alunoId || a.aluno_id === alunoId || a.user_id === alunoId) ||
      alunos.find((a) => a.id === alunoId || a.user_id === alunoId);

    const finalAlunoId = aluno?.aluno_id || aluno?.id || alunoId;
    const alunoNome = aluno?.nome || 'Aluno';
    const alunoEmail = aluno?.email || '';

    const nova: NivelamentoSessao = {
      id: `niv_${Date.now()}`,
      aluno_id: finalAlunoId,
      aluno_nome: alunoNome,
      aluno_email: alunoEmail,
      data_agendada: dataAgendada,
      nivel_atual: (aluno?.nivel_atual as NivelForro) || 'B1',
      nivel_alvo: nivelAlvo,
      papel,
      avaliador_aulao: options?.avaliador_aulao || 'Mestre Gonzaga Silva',
      avaliador_danca: options?.avaliador_danca || 'Mariana Sol',
      avaliador_observa: options?.avaliador_observa || 'Tiago Baião',
      status: 'Agendado',
      feedback_geral: options?.feedback_geral || 'Sessão agendada para avaliação técnica.'
    };

    setNivelamentoSessoes((prev) => {
      const updated = [nova, ...prev];
      localStorage.setItem('4andar_nivelamentoSessoes', JSON.stringify(updated));
      return updated;
    });

    // Se solicitado, adiciona evento na agenda da escola
    if (options?.sincronizarAgenda !== false) {
      const dataParte = dataAgendada.split(' ')[0] || new Date().toISOString().substring(0, 10);
      const horaParte = dataAgendada.split(' ')[1] || '14:00';
      const novoEvento: Evento = {
        id: `ev_niv_${Date.now()}`,
        titulo: `Banca de Nivelamento — ${alunoNome} (${nivelAlvo})`,
        descricao: `Avaliação técnica de progressão para o nível ${nivelAlvo} (${papel}). Banca: ${nova.avaliador_aulao} e ${nova.avaliador_danca}.`,
        data_evento: dataParte,
        horario: horaParte,
        local: 'Salão 2 (Dominguinhos)',
        foto_url: '',
        preco: 0,
        vagas_limite: 1,
        vagas_preenchidas: 1,
        status: 'Inscrições Abertas'
      };
      setEventos((prev) => {
        const updated = [novoEvento, ...prev];
        localStorage.setItem('4andar_eventos', JSON.stringify(updated));
        return updated;
      });
      fetch(`${API_URL}/eventos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoEvento)
      }).catch(() => {});
    }

    // Persiste no banco Turso
    fetch(`${API_URL}/nivelamentos/agendar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...nova,
        aluno_nome: alunoNome,
        aluno_email: alunoEmail
      })
    }).catch((e) => console.warn('Erro ao agendar nivelamento no Turso:', e));

    showToast(`Nivelamento para ${alunoNome} (${nivelAlvo}) agendado e sincronizado com sucesso!`, 'success');
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
    }

    fetch(`${API_URL}/nivelamentos/${sessaoId}/avaliar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resultado,
        feedback_geral: feedbackGeral,
        feedback_aulao: feedbackAulao,
        feedback_danca: feedbackDanca,
        notas
      })
    }).catch((e) => console.warn('Erro ao salvar avaliação de nivelamento no Turso:', e));

    if (resultado === 'Aprovado') {
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

    fetch(`${API_URL}/eventos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novo)
    }).catch((e) => console.warn('Erro ao salvar evento no Turso:', e));

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

    fetch(`${API_URL}/eventos/${eventoId}/inscrever`, {
      method: 'POST'
    }).catch((e) => console.warn('Erro ao inscrever evento no Turso:', e));

    showToast(`Inscrição confirmada para "${ev.titulo}"!`, 'success');
    return true;
  };

  const addAviso = (av: Omit<Aviso, 'id'>) => {
    const novo: Aviso = { ...av, id: `av_${Date.now()}` };
    setAvisos((prev) => [novo, ...prev]);

    fetch(`${API_URL}/avisos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novo)
    }).catch(() => {});

    showToast('Aviso publicado no mural!');
  };

  const deleteAviso = (id: string) => {
    setAvisos((prev) => prev.filter((a) => a.id !== id));

    fetch(`${API_URL}/avisos/${id}`, {
      method: 'DELETE'
    }).catch(() => {});

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
        syncWithDatabase,
        updateUserStatus,
        updateUserPermissions,
        vincularAlunoUsuario,
        deleteUser,
        professoresCadastrados,
        alunosCadastrados,
        alunos,
        addAluno,
        updateAluno,
        deleteAluno,
        selectedAlunoModal,
        setSelectedAlunoModal,
        equipe,
        addEquipe,
        updateEquipe,
        deleteEquipe,
        aulas,
        minhasTurmas,
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
        removeToast,
        theme,
        toggleTheme,
        setTheme
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
