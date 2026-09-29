import { Aluno, Equipe, Aula, Cronograma, Presenca, Pagamento, CriterioNivelamento, NivelamentoSessao, Evento, Aviso, User } from '../types';

export const mockUsers: User[] = [
  {
    id: 'usr_admin',
    nome: 'Mariana Sol (Professora & Coordenação)',
    email: 'mariana.sol@4andar.com.br',
    tipo_usuario: 'Equipe',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    equipe_id: 'eq_1',
  },
  {
    id: 'usr_aluno_1',
    nome: 'Carlos Eduardo Oliveira',
    email: 'carlos.oliveira@email.com',
    tipo_usuario: 'Aluno',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    aluno_id: 'al_1',
  },
  {
    id: 'usr_aluno_2',
    nome: 'Camila Santos Rocha',
    email: 'camila.rocha@email.com',
    tipo_usuario: 'Aluno',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    aluno_id: 'al_2',
  }
];

export const mockEquipe: Equipe[] = [
  {
    id: 'eq_1',
    user_id: 'usr_admin',
    nome: 'Mariana Sol',
    email: 'mariana.sol@4andar.com.br',
    telefone: '(11) 98765-4321',
    papel_equipe: 'Professor',
    especialidades: ['Forró Universitário', 'Conexão & Abraço', 'Nivelamento'],
    google_calendar_conectado: true,
    ativo: true,
    foto_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'eq_2',
    user_id: 'usr_prof_2',
    nome: 'Mestre Gonzaga Silva',
    email: 'gonzaga.silva@4andar.com.br',
    telefone: '(11) 97654-3210',
    papel_equipe: 'Professor',
    especialidades: ['Pé de Serra', 'Baião & Arrasta-pé', 'Ritmo e Raiz'],
    google_calendar_conectado: true,
    ativo: true,
    foto_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'eq_3',
    user_id: 'usr_prof_3',
    nome: 'Tiago Baião',
    email: 'tiago.baiao@4andar.com.br',
    telefone: '(11) 96543-2109',
    papel_equipe: 'Instrutor',
    especialidades: ['Forró Estilo Roots', 'Giro & Sacadas', 'Musicalidade'],
    google_calendar_conectado: false,
    ativo: true,
    foto_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
  }
];

export const mockAlunos: Aluno[] = [
  {
    id: 'al_1',
    user_id: 'usr_aluno_1',
    nome: 'Carlos Eduardo Oliveira',
    telefone: '(11) 99123-4567',
    email: 'carlos.oliveira@email.com',
    nivel_atual: 'B1',
    papel: 'Condutor',
    mensalidade_valor: 190.0,
    dia_vencimento: 5,
    data_matricula: '2026-06-10',
    data_inicio_nivel: '2026-06-10',
    status: 'ativo',
    foto_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    observacoes: 'Excelente pontualidade e dedicação nas aulas de Terça.'
  },
  {
    id: 'al_2',
    user_id: 'usr_aluno_2',
    nome: 'Camila Santos Rocha',
    telefone: '(11) 98234-5678',
    email: 'camila.rocha@email.com',
    nivel_atual: 'B2',
    papel: 'Conduzido',
    mensalidade_valor: 190.0,
    dia_vencimento: 10,
    data_matricula: '2026-02-15',
    data_inicio_nivel: '2026-05-20',
    status: 'ativo',
    foto_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    observacoes: 'Pretende fazer nivelamento para I1 no próximo mês.'
  },
  {
    id: 'al_3',
    user_id: 'usr_aluno_3',
    nome: 'Rodrigo Alencar Lima',
    telefone: '(11) 97345-6789',
    email: 'rodrigo.alencar@email.com',
    nivel_atual: 'I1',
    papel: 'Condutor',
    mensalidade_valor: 220.0,
    dia_vencimento: 15,
    data_matricula: '2025-08-01',
    data_inicio_nivel: '2026-03-12',
    status: 'ativo',
    foto_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    observacoes: 'Participa ativamente dos workshops e eventos.'
  },
  {
    id: 'al_4',
    user_id: 'usr_aluno_4',
    nome: 'Juliana Mendes Ferraz',
    telefone: '(11) 96456-7890',
    email: 'juliana.ferraz@email.com',
    nivel_atual: 'I2',
    papel: 'Ambos',
    mensalidade_valor: 220.0,
    dia_vencimento: 5,
    data_matricula: '2025-01-10',
    data_inicio_nivel: '2026-01-20',
    status: 'ativo',
    foto_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    observacoes: 'Bailarina experiente, domina condução e resposta.'
  },
  {
    id: 'al_5',
    user_id: 'usr_aluno_5',
    nome: 'Felipe Santana Barbosa',
    telefone: '(11) 95567-8901',
    email: 'felipe.santana@email.com',
    nivel_atual: 'B1',
    papel: 'Condutor',
    mensalidade_valor: 190.0,
    dia_vencimento: 5,
    data_matricula: '2026-08-01',
    data_inicio_nivel: '2026-08-01',
    status: 'ativo',
    foto_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    observacoes: 'Atenção ao tempo básico do xote.'
  },
  {
    id: 'al_6',
    user_id: 'usr_aluno_6',
    nome: 'Beatriz Martins Nunes',
    telefone: '(11) 94678-9012',
    email: 'beatriz.nunes@email.com',
    nivel_atual: 'B2',
    papel: 'Conduzido',
    mensalidade_valor: 190.0,
    dia_vencimento: 10,
    data_matricula: '2026-03-05',
    data_inicio_nivel: '2026-07-15',
    status: 'ativo',
    foto_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    observacoes: 'Muito comunicativa e pontual.'
  }
];

export const mockAulas: Aula[] = [
  {
    id: 'aul_b1_noite',
    nome: 'Básico 1 — Terça & Quinta (Noite)',
    nivel: 'B1',
    turno: 'Noite',
    dia_semana: 'Terça',
    horario_inicio: '19:30',
    horario_fim: '20:45',
    sala: 'Salão Principal (Gonzagão)',
    equipe_id: 'eq_2',
    capacidade_maxima: 24
  },
  {
    id: 'aul_b1_sabado',
    nome: 'Básico 1 — Sábado (Manhã)',
    nivel: 'B1',
    turno: 'Manhã',
    dia_semana: 'Sábado',
    horario_inicio: '10:00',
    horario_fim: '11:30',
    sala: 'Salão 2 (Dominguinhos)',
    equipe_id: 'eq_3',
    capacidade_maxima: 20
  },
  {
    id: 'aul_b2_noite',
    nome: 'Básico 2 — Segunda & Quarta (Noite)',
    nivel: 'B2',
    turno: 'Noite',
    dia_semana: 'Quarta',
    horario_inicio: '20:00',
    horario_fim: '21:15',
    sala: 'Salão Principal (Gonzagão)',
    equipe_id: 'eq_1',
    capacidade_maxima: 22
  },
  {
    id: 'aul_i1_noite',
    nome: 'Intermediário 1 — Terça & Quinta (Noite)',
    nivel: 'I1',
    turno: 'Noite',
    dia_semana: 'Quinta',
    horario_inicio: '20:45',
    horario_fim: '22:00',
    sala: 'Salão Principal (Gonzagão)',
    equipe_id: 'eq_1',
    capacidade_maxima: 20
  },
  {
    id: 'aul_i2_sabado',
    nome: 'Intermediário 2 — Sábado (Tarde Especial)',
    nivel: 'I2',
    turno: 'Tarde',
    dia_semana: 'Sábado',
    horario_inicio: '15:00',
    horario_fim: '17:00',
    sala: 'Salão Principal (Gonzagão)',
    equipe_id: 'eq_2',
    capacidade_maxima: 18
  }
];

export const mockCronogramas: Cronograma[] = [
  {
    id: 'crono_1',
    aula_id: 'aul_b1_noite',
    data_aula: '2026-09-29',
    tema_aula: 'Giro simples e caminhadas no tempo 1 do Xote',
    observacoes: 'Trazer foco no abraço e relaxamento dos ombros.'
  },
  {
    id: 'crono_2',
    aula_id: 'aul_b2_noite',
    data_aula: '2026-09-30',
    tema_aula: 'Giro invertido com saída em travessia',
    observacoes: 'Trabalho de tônus de braço na condução.'
  },
  {
    id: 'crono_3',
    aula_id: 'aul_i1_noite',
    data_aula: '2026-10-01',
    tema_aula: 'Sacadas de perna e variação de velocidade no Baião',
    observacoes: 'Uso do contratempo musical.'
  },
  {
    id: 'crono_4',
    aula_id: 'aul_b1_sabado',
    data_aula: '2026-10-03',
    tema_aula: 'Conexão corporal e postura no abraço fechado',
    observacoes: 'Exercício com troca constante de par.'
  },
  {
    id: 'crono_5',
    aula_id: 'aul_i2_sabado',
    data_aula: '2026-10-03',
    tema_aula: 'Interpretação de instrumentos: Triângulo vs Zabumba no salão',
    observacoes: 'Prática de improvisação e dinâmica contínua.'
  },
  {
    id: 'crono_6',
    aula_id: 'aul_b1_noite',
    data_aula: '2026-10-06',
    tema_aula: 'Transição suave entre passos de base e giro da conduzida',
    observacoes: 'Revisão dos pontos de apoio.'
  }
];

export const mockPresencas: Presenca[] = [
  {
    id: 'pre_1',
    aluno_id: 'al_1',
    aula_id: 'aul_b1_noite',
    data_aula: '2026-09-29',
    status: 'confirmada',
    data_solicitacao: '2026-09-28 14:20',
    confirmado_por: 'Mariana Sol'
  },
  {
    id: 'pre_2',
    aluno_id: 'al_5',
    aula_id: 'aul_b1_noite',
    data_aula: '2026-09-29',
    status: 'pendente',
    data_solicitacao: '2026-09-29 09:15'
  },
  {
    id: 'pre_3',
    aluno_id: 'al_2',
    aula_id: 'aul_b2_noite',
    data_aula: '2026-09-30',
    status: 'confirmada',
    data_solicitacao: '2026-09-28 18:00',
    confirmado_por: 'Mariana Sol'
  },
  {
    id: 'pre_4',
    aluno_id: 'al_6',
    aula_id: 'aul_b2_noite',
    data_aula: '2026-09-30',
    status: 'pendente',
    data_solicitacao: '2026-09-29 11:40'
  },
  {
    id: 'pre_5',
    aluno_id: 'al_3',
    aula_id: 'aul_i1_noite',
    data_aula: '2026-10-01',
    status: 'confirmada',
    data_solicitacao: '2026-09-27 10:30',
    confirmado_por: 'Mariana Sol'
  }
];

export const mockPagamentos: Pagamento[] = [
  {
    id: 'pag_1',
    aluno_id: 'al_1',
    valor: 190.0,
    data_pagamento: '2026-09-04',
    data_vencimento: '2026-09-05',
    metodo: 'PIX',
    tipo: 'Mensalidade',
    status: 'Pago',
    referencia_mes: 'Setembro/2026'
  },
  {
    id: 'pag_2',
    aluno_id: 'al_1',
    valor: 190.0,
    data_pagamento: null,
    data_vencimento: '2026-10-05',
    metodo: 'PIX',
    tipo: 'Mensalidade',
    status: 'Pendente',
    referencia_mes: 'Outubro/2026'
  },
  {
    id: 'pag_3',
    aluno_id: 'al_2',
    valor: 190.0,
    data_pagamento: '2026-09-09',
    data_vencimento: '2026-09-10',
    metodo: 'Cartão',
    tipo: 'Mensalidade',
    status: 'Pago',
    referencia_mes: 'Setembro/2026'
  },
  {
    id: 'pag_4',
    aluno_id: 'al_5',
    valor: 190.0,
    data_pagamento: null,
    data_vencimento: '2026-09-05',
    metodo: 'PIX',
    tipo: 'Mensalidade',
    status: 'Atrasado',
    referencia_mes: 'Setembro/2026'
  },
  {
    id: 'pag_5',
    aluno_id: 'al_3',
    valor: 220.0,
    data_pagamento: '2026-09-15',
    data_vencimento: '2026-09-15',
    metodo: 'PIX',
    tipo: 'Mensalidade',
    status: 'Pago',
    referencia_mes: 'Setembro/2026'
  },
  {
    id: 'pag_6',
    aluno_id: 'al_4',
    valor: 220.0,
    data_pagamento: '2026-09-03',
    data_vencimento: '2026-09-05',
    metodo: 'Dinheiro',
    tipo: 'Mensalidade',
    status: 'Pago',
    referencia_mes: 'Setembro/2026'
  }
];

export const mockCriteriosNivelamento: CriterioNivelamento[] = [
  // Nível B2
  {
    id: 'crit_b2_1',
    nivel: 'B2',
    secao: 'Aulão',
    criterio: 'Pulso e tempo no Xote & Baião',
    descricao: 'Mantém a marcação constante dos tempos fortes e fracos sem oscilar.',
    peso: 2
  },
  {
    id: 'crit_b2_2',
    nivel: 'B2',
    secao: 'Aulão',
    criterio: 'Postura e Abraço',
    descricao: 'Encaixe confortável, tônus firme sem rigidez no abraço fechado e aberto.',
    peso: 2
  },
  {
    id: 'crit_b2_3',
    nivel: 'B2',
    secao: 'Dança a dois',
    criterio: 'Clareza de Condução / Resposta',
    descricao: 'Giro simples, travessia e caminhas executadas com sinalização nítida.',
    peso: 3
  },
  {
    id: 'crit_b2_4',
    nivel: 'B2',
    secao: 'Dança a dois',
    criterio: 'Navegação e Linha de Dança',
    descricao: 'Respeita o espaço dos outros casais no salão sem colisões.',
    peso: 3
  },
  // Nível I1
  {
    id: 'crit_i1_1',
    nivel: 'I1',
    secao: 'Aulão',
    criterio: 'Variação rítmica (Xote, Baião, Arrasta-pé)',
    descricao: 'Capacidade de transição técnica entre andamentos rápidos e lentos.',
    peso: 2
  },
  {
    id: 'crit_i1_2',
    nivel: 'I1',
    secao: 'Dança a dois',
    criterio: 'Sacadas e Dinâmica de Eixo',
    descricao: 'Entradas de perna limpas e equilíbrio nos giros consecutivos.',
    peso: 4
  },
  {
    id: 'crit_i1_3',
    nivel: 'I1',
    secao: 'Dança a dois',
    criterio: 'Escuta Musical e Fluidez',
    descricao: 'Dança sem trancos e conexão harmoniosa em movimentos contínuos.',
    peso: 4
  },
  // Nível I2
  {
    id: 'crit_i2_1',
    nivel: 'I2',
    secao: 'Aulão',
    criterio: 'Síncopes, cortes e pausas',
    descricao: 'Interpretação musical precisa das quebras e convenções do forró.',
    peso: 3
  },
  {
    id: 'crit_i2_2',
    nivel: 'I2',
    secao: 'Dança a dois',
    criterio: 'Micro-condução e Liberdade do Par',
    descricao: 'Condução refinada permitindo adornos e expressão da conduzida.',
    peso: 4
  },
  {
    id: 'crit_i2_3',
    nivel: 'I2',
    secao: 'Dança a dois',
    criterio: 'Improvisação Avançada de Salão',
    descricao: 'Criação no momento com variedade e sensibilidade rítmica.',
    peso: 3
  }
];

export const mockNivelamentoSessoes: NivelamentoSessao[] = [
  {
    id: 'niv_1',
    aluno_id: 'al_2',
    data_agendada: '2026-10-10 14:00',
    nivel_atual: 'B2',
    nivel_alvo: 'I1',
    papel: 'Conduzido',
    avaliador_aulao: 'Mestre Gonzaga Silva',
    avaliador_danca: 'Mariana Sol',
    avaliador_observa: 'Tiago Baião',
    status: 'Agendado',
    feedback_geral: 'Aguardando sessão no sábado.'
  },
  {
    id: 'niv_2',
    aluno_id: 'al_1',
    data_agendada: '2026-10-10 14:30',
    nivel_atual: 'B1',
    nivel_alvo: 'B2',
    papel: 'Condutor',
    avaliador_aulao: 'Mariana Sol',
    avaliador_danca: 'Mestre Gonzaga Silva',
    avaliador_observa: 'Tiago Baião',
    status: 'Agendado',
    feedback_geral: 'Primeiro nivelamento de Carlos.'
  },
  {
    id: 'niv_3',
    aluno_id: 'al_3',
    data_agendada: '2026-03-12 15:00',
    nivel_atual: 'B2',
    nivel_alvo: 'I1',
    papel: 'Condutor',
    avaliador_aulao: 'Mestre Gonzaga Silva',
    avaliador_danca: 'Mariana Sol',
    avaliador_observa: 'Mariana Sol',
    status: 'Concluído',
    resultado: 'Aprovado',
    feedback_aulao: 'Ótimo tempo de resposta no ritmo.',
    feedback_danca: 'Boa postura e condução segura nas curvas e giros.',
    feedback_geral: 'Aprovado para a turma I1 com mérito!'
  }
];

export const mockEventos: Evento[] = [
  {
    id: 'ev_1',
    titulo: 'Grande Forró do 4ANDAR com Trio Pé de Serra',
    descricao: 'Uma noite inesquecível de forró autêntico, xote manhoso e arrasta-pé acelerado com o Trio Zabumba Dourada. DJs convidados no intervalo.',
    data_evento: '2026-10-17',
    horario: '21:00 às 03:00',
    local: 'Salão Nobre do 4ANDAR',
    foto_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80',
    preco: 35.0,
    vagas_limite: 150,
    vagas_preenchidas: 98,
    status: 'Inscrições Abertas'
  },
  {
    id: 'ev_2',
    titulo: 'Workshop Intensivo: Sacadas & Dinâmica no Baião',
    descricao: 'Aprofunde suas técnicas de salão com foco em conexão, entradas dinâmicas e condução fluida. Aberto para níveis B2, I1 e I2.',
    data_evento: '2026-10-24',
    horario: '14:30 às 17:30',
    local: 'Salão Gonzagão',
    foto_url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    preco: 70.0,
    vagas_limite: 30,
    vagas_preenchidas: 22,
    status: 'Inscrições Abertas'
  },
  {
    id: 'ev_3',
    titulo: 'Baile da Primavera & Dança dos Alunos',
    descricao: 'Apresentação de turmas, comidas típicas nordestinas e pista aberta a noite toda para confraternização geral da escola.',
    data_evento: '2026-11-07',
    horario: '19:00 às 01:00',
    local: 'Espaço Cultural 4ANDAR',
    foto_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80',
    preco: 25.0,
    vagas_limite: 200,
    vagas_preenchidas: 45,
    status: 'Inscrições Abertas'
  }
];

export const mockAvisos: Aviso[] = [
  {
    id: 'av_1',
    titulo: '📢 Grupo Oficial de Alunos no WhatsApp',
    conteudo: 'Entre no canal oficial de comunicação para receber materiais de estudo, playlists selecionadas pelos professores e caronas para os bailes.',
    data_publicacao: '2026-09-25',
    link_url: 'https://chat.whatsapp.com/exemplo-4andar',
    link_texto: 'Entrar no Grupo do WhatsApp',
    fixado: true,
    autor: 'Mariana Sol'
  },
  {
    id: 'av_2',
    titulo: '📅 Sessão de Nivelamento do Mês de Outubro',
    conteudo: 'As inscrições para a banca de nivelamento de Outubro estão abertas. Alunos com pelo menos 3 meses no nível atual podem se inscrever.',
    data_publicacao: '2026-09-28',
    link_url: '/agendamento-nivelamento',
    link_texto: 'Agendar Nivelamento',
    fixado: true,
    autor: 'Coordenação Pedagógica'
  },
  {
    id: 'av_3',
    titulo: '👞 Dica de Calçado para Aula de Salão',
    conteudo: 'Lembramos a todos os alunos que sapatos com sola de camurça ou couro facilitam giros e evitam sobrecarga nos joelhos.',
    data_publicacao: '2026-09-20',
    fixado: false,
    autor: 'Mestre Gonzaga Silva'
  }
];
