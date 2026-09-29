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

interface ToastInfo {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  currentUser: User;
  switchUserRole: (tipo: 'Equipe' | 'Aluno') => void;
  setCurrentUser: (user: User) => void;
  users: User[];

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
  cronogramas: Cronograma[];
  updateTemaCronograma: (aulaId: string, dataAula: string, tema: string, obs?: string) => void;

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

  const [currentUser, setCurrentUserState] = useState<User>(() =>
    loadInitial('currentUser', mockUsers[0])
  );
  const [users] = useState<User[]>(mockUsers);
  const [alunos, setAlunos] = useState<Aluno[]>(() => loadInitial('alunos', mockAlunos));
  const [equipe, setEquipe] = useState<Equipe[]>(() => loadInitial('equipe', mockEquipe));
  const [aulas, setAulas] = useState<Aula[]>(() => loadInitial('aulas', mockAulas));
  const [cronogramas, setCronogramas] = useState<Cronograma[]>(() =>
    loadInitial('cronogramas', mockCronogramas)
  );
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
  const switchUserRole = (tipo: 'Equipe' | 'Aluno') => {
    if (tipo === 'Equipe') {
      setCurrentUserState(mockUsers[0]); // Mariana Sol
      showToast('Perfil alterado para Equipe (Admin/Professor)', 'info');
    } else {
      setCurrentUserState(mockUsers[1]); // Carlos Eduardo
      showToast('Perfil alterado para Aluno (Carlos Eduardo - B1)', 'info');
    }
  };

  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
    showToast(`Logado como ${user.nome} (${user.tipo_usuario})`, 'info');
  };

  // Alunos handlers
  const addAluno = (alunoData: Omit<Aluno, 'id'>): Aluno => {
    const newAluno: Aluno = {
      ...alunoData,
      id: `al_${Date.now()}`
    };
    setAlunos((prev) => [newAluno, ...prev]);
    showToast(`Aluno(a) ${newAluno.nome} cadastrado(a) com sucesso!`);
    return newAluno;
  };

  const updateAluno = (id: string, updates: Partial<Aluno>) => {
    setAlunos((prev) =>
      prev.map((al) => (al.id === id ? { ...al, ...updates } : al))
    );
    showToast('Dados do aluno atualizados!');
  };

  const deleteAluno = (id: string) => {
    setAlunos((prev) => prev.filter((al) => al.id !== id));
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
    showToast('Tema da aula salvo no cronograma!');
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
        cronogramas,
        updateTemaCronograma,
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
