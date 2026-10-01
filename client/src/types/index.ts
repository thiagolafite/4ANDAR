export type NivelForro = 'B1' | 'B2' | 'I1' | 'I2';

export type PapelDanca = 'Condutor' | 'Conduzido' | 'Ambos';

export type TipoUsuario = 'Equipe' | 'Aluno' | 'AdminMaster';

export type UserRole = 'master' | 'admin' | 'professor' | 'aluno';

export type UserStatus = 'pendente' | 'aprovado' | 'rejeitado' | 'bloqueado';

export interface PermissaoModulo {
  view?: boolean;
  create?: boolean;
  edit?: boolean;
  delete?: boolean;
  manage?: boolean;
  checkin?: boolean;
  export?: boolean;
  evaluate?: boolean;
  schedule?: boolean;
  import_excel?: boolean;
  approve?: boolean;
}

export interface PermissoesUsuario {
  all?: boolean;
  dashboard?: PermissaoModulo;
  alunos?: PermissaoModulo;
  cronograma?: PermissaoModulo;
  presenca?: PermissaoModulo;
  pagamentos?: PermissaoModulo;
  nivelamento?: PermissaoModulo;
  aulas?: PermissaoModulo;
  eventos?: PermissaoModulo;
  avisos?: PermissaoModulo;
  equipe?: PermissaoModulo;
  usuarios?: PermissaoModulo;
}

export interface User {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  cargo_pretendido?: string;
  tipo_usuario: TipoUsuario;
  role: UserRole;
  status: UserStatus;
  is_master: boolean;
  permissoes: PermissoesUsuario;
  avatar_url?: string;
  aluno_id?: string;
  equipe_id?: string;
  motivo_recusa?: string;
  aprovado_por?: string;
  data_cadastro?: string;
  data_aprovacao?: string;
  ultimo_acesso?: string;
}

export interface Aluno {
  id: string;
  user_id?: string;
  nome: string;
  telefone: string;
  email: string;
  nivel_atual: NivelForro;
  papel: PapelDanca;
  mensalidade_valor: number;
  dia_vencimento: number;
  data_matricula: string;
  data_inicio_nivel: string;
  status: 'ativo' | 'inativo' | 'trancado';
  foto_url?: string;
  observacoes?: string;
}

export interface Equipe {
  id: string;
  user_id?: string;
  nome: string;
  email: string;
  telefone: string;
  papel_equipe: 'Professor' | 'Admin' | 'Instrutor';
  especialidades: string[];
  google_calendar_conectado: boolean;
  ativo: boolean;
  foto_url?: string;
}

export interface ProfessorOption {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  papel: string;
  foto_url?: string;
  user_id?: string;
  equipe_id?: string;
}

export interface AlunoOption {
  id: string;
  aluno_id?: string;
  user_id?: string;
  nome: string;
  email: string;
  telefone: string;
  nivel_atual: NivelForro;
  papel: PapelDanca;
  foto_url?: string;
  mensalidade_valor?: number;
  dia_vencimento?: number;
}

export interface Aula {
  id: string;
  nome: string;
  nivel: NivelForro;
  turno: 'Manhã' | 'Tarde' | 'Noite';
  dia_semana: 'Segunda' | 'Terça' | 'Quarta' | 'Quinta' | 'Sexta' | 'Sábado';
  horario_inicio: string;
  horario_fim: string;
  sala: string;
  equipe_id?: string; // Professor (equipe_id ou id de professor)
  user_id?: string; // ID do usuário cadastrado no sistema
  professor_nome?: string;
  capacidade_maxima: number;
}

export interface Cronograma {
  id: string;
  aula_id: string;
  data_aula: string; // YYYY-MM-DD
  tema_aula: string;
  observacoes?: string;
  professor_id?: string;
  professor_user_id?: string;
  professor_nome?: string;
}

export interface Presenca {
  id: string;
  aluno_id: string;
  aula_id: string;
  data_presenca?: string; // YYYY-MM-DD
  data_aula?: string; // YYYY-MM-DD
  status: StatusPresenca;
  data_solicitacao: string;
  confirmado_por?: string;
}

export interface Pagamento {
  id: string;
  aluno_id: string;
  valor: number;
  data_pagamento: string | null;
  data_vencimento: string; // YYYY-MM-DD
  metodo: MetodoPagamento;
  tipo: 'Mensalidade' | 'Aula Avulsa' | 'Evento';
  status: StatusPagamento;
  referencia_mes: string;
  comprovante_url?: string;
}

export interface CriterioNivelamento {
  id: string;
  nivel: NivelForro;
  secao: 'Aulão' | 'Dança a dois';
  criterio: string;
  descricao: string;
  peso: number;
}

export interface NivelamentoSessao {
  id: string;
  aluno_id: string;
  data_agendada: string; // YYYY-MM-DD HH:mm
  nivel_atual: NivelForro;
  nivel_alvo: NivelForro;
  papel: PapelDanca;
  avaliador_aulao: string;
  avaliador_danca: string;
  avaliador_observa: string;
  status: StatusNivelamento;
  resultado?: ResultadoNivelamento;
  feedback_aulao?: string;
  feedback_danca?: string;
  feedback_geral?: string;
  notas?: Record<string, number>; // criterio_id -> nota 1 a 5
}

export interface Evento {
  id: string;
  titulo: string;
  descricao: string;
  data_evento: string; // YYYY-MM-DD
  horario: string;
  local: string;
  foto_url: string;
  preco: number;
  vagas_limite: number;
  vagas_preenchidas: number;
  status: 'Inscrições Abertas' | 'Esgotado' | 'Encerrado';
}

export type DestinatarioAviso = 'todos' | 'aluno' | 'professor' | 'admin';
export type PrioridadeAviso = 'normal' | 'importante' | 'urgente';

export interface Aviso {
  id: string;
  titulo: string;
  conteudo: string;
  data_publicacao: string; // YYYY-MM-DD
  link_url?: string;
  link_texto?: string;
  fixado: boolean;
  autor: string;
  destinatario_tipo?: DestinatarioAviso;
  mostrar_popup?: boolean;
  prioridade?: PrioridadeAviso;
}
