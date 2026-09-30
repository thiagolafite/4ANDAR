import { Aula, Cronograma, NivelForro } from '../types';

// Turmas presentes na planilha oficial do 4ANDAR
export const turmasOficiais: Array<Omit<Aula, 'id'>> = [
  {
    nome: 'I2 Manhã',
    nivel: 'I2',
    turno: 'Manhã',
    dia_semana: 'Sábado',
    horario_inicio: '10:00',
    horario_fim: '11:30',
    sala: 'Salão Principal (Gonzagão)',
    equipe_id: 'eq_2',
    capacidade_maxima: 20
  },
  {
    nome: 'I1 Tarde',
    nivel: 'I1',
    turno: 'Tarde',
    dia_semana: 'Sábado',
    horario_inicio: '14:00',
    horario_fim: '15:30',
    sala: 'Salão 2 (Dominguinhos)',
    equipe_id: 'eq_1',
    capacidade_maxima: 22
  },
  {
    nome: 'B1 Manhã',
    nivel: 'B1',
    turno: 'Manhã',
    dia_semana: 'Sábado',
    horario_inicio: '10:00',
    horario_fim: '11:30',
    sala: 'Salão 2 (Dominguinhos)',
    equipe_id: 'eq_2',
    capacidade_maxima: 24
  },
  {
    nome: 'B2 Manhã',
    nivel: 'B2',
    turno: 'Manhã',
    dia_semana: 'Sábado',
    horario_inicio: '11:30',
    horario_fim: '13:00',
    sala: 'Salão Principal (Gonzagão)',
    equipe_id: 'eq_1',
    capacidade_maxima: 22
  },
  {
    nome: 'B2 Tarde',
    nivel: 'B2',
    turno: 'Tarde',
    dia_semana: 'Sábado',
    horario_inicio: '15:30',
    horario_fim: '17:00',
    sala: 'Salão Principal (Gonzagão)',
    equipe_id: 'eq_1',
    capacidade_maxima: 22
  },
  {
    nome: 'I1 Manhã',
    nivel: 'I1',
    turno: 'Manhã',
    dia_semana: 'Sábado',
    horario_inicio: '11:30',
    horario_fim: '13:00',
    sala: 'Salão 2 (Dominguinhos)',
    equipe_id: 'eq_2',
    capacidade_maxima: 20
  },
  {
    nome: 'B1 Tarde',
    nivel: 'B1',
    turno: 'Tarde',
    dia_semana: 'Sábado',
    horario_inicio: '14:00',
    horario_fim: '15:30',
    sala: 'Salão Principal (Gonzagão)',
    equipe_id: 'eq_2',
    capacidade_maxima: 24
  }
];

export interface ScheduleRowData {
  data: string; // YYYY-MM-DD
  label: string; // sábado, 04/01
  temas: {
    'I2 Manhã': string;
    'I1 Tarde': string;
    'B1 Manhã': string;
    'B2 Manhã': string;
    'B2 Tarde': string;
    'I1 Manhã': string;
    'B1 Tarde': string;
  };
}

// Todas as 52 semanas/sábados de 2026 fiéis aos 4 anexos da planilha oficial
export const annualScheduleRows: ScheduleRowData[] = [
  // JANEIRO
  {
    data: '2026-01-04',
    label: 'sábado, 04/01',
    temas: {
      'I2 Manhã': 'Ano Novo - SEM AULA',
      'I1 Tarde': 'Ano Novo - SEM AULA',
      'B1 Manhã': 'Ano Novo - SEM AULA',
      'B2 Manhã': 'Ano Novo - SEM AULA',
      'B2 Tarde': 'Ano Novo - SEM AULA',
      'I1 Manhã': 'Ano Novo - SEM AULA',
      'B1 Tarde': 'Ano Novo - SEM AULA'
    }
  },
  {
    data: '2026-01-11',
    label: 'sábado, 11/01',
    temas: {
      'I2 Manhã': 'Esmeril Quebrado',
      'I1 Tarde': 'Revisão de Contratempo',
      'B1 Manhã': 'Passo Básico',
      'B2 Manhã': 'Ritmo',
      'B2 Tarde': 'Ritmo',
      'I1 Manhã': 'Revisão de Contratempo',
      'B1 Tarde': 'Passo Básico'
    }
  },
  {
    data: '2026-01-18',
    label: 'sábado, 18/01',
    temas: {
      'I2 Manhã': 'Esmeril Invertido',
      'I1 Tarde': 'Banana c contra',
      'B1 Manhã': 'Xaxadinho',
      'B2 Manhã': 'Musicalidade',
      'B2 Tarde': 'Musicalidade',
      'I1 Manhã': 'Banana c contra',
      'B1 Tarde': 'Xaxadinho'
    }
  },
  {
    data: '2026-01-25',
    label: 'sábado, 25/01',
    temas: {
      'I2 Manhã': 'Miudinho',
      'I1 Tarde': 'Chuveirinho c Contra',
      'B1 Manhã': 'Deslocamento 1',
      'B2 Manhã': 'Breques',
      'B2 Tarde': 'Breques',
      'I1 Manhã': 'Chuveirinho c Contra',
      'B1 Tarde': 'Deslocamento 1'
    }
  },

  // FEVEREIRO
  {
    data: '2026-02-01',
    label: 'sábado, 01/02',
    temas: {
      'I2 Manhã': 'Sacada com Pescada',
      'I1 Tarde': 'Sinistro',
      'B1 Manhã': 'Deslocamento 2',
      'B2 Manhã': 'Revisão Meio Giro',
      'B2 Tarde': 'Revisão Meio Giro',
      'I1 Manhã': 'Sinistro',
      'B1 Tarde': 'Deslocamento 2'
    }
  },
  {
    data: '2026-02-08',
    label: 'sábado, 08/02',
    temas: {
      'I2 Manhã': 'Sacada com arrasto',
      'I1 Tarde': 'Avião c contra',
      'B1 Manhã': 'Ritmos',
      'B2 Manhã': 'Pega-Pega',
      'B2 Tarde': 'Pega-Pega',
      'I1 Manhã': 'Avião c contra',
      'B1 Tarde': 'Ritmos'
    }
  },
  {
    data: '2026-02-15',
    label: 'sábado, 15/02',
    temas: {
      'I2 Manhã': 'Leque',
      'I1 Tarde': 'Contratempo DE 7 TEMPOS',
      'B1 Manhã': 'Giro Completo',
      'B2 Manhã': 'Giro Giro',
      'B2 Tarde': 'Giro Giro',
      'I1 Manhã': 'Contratempo DE 7 TEMPOS',
      'B1 Tarde': 'Giro Completo'
    }
  },
  {
    data: '2026-02-22',
    label: 'sábado, 22/02',
    temas: {
      'I2 Manhã': 'Push and Pull',
      'I1 Tarde': 'Basquete com Contra',
      'B1 Manhã': 'Giro Simples',
      'B2 Manhã': 'Caracol',
      'B2 Tarde': 'Caracol',
      'I1 Manhã': 'Basquete com Contra',
      'B1 Tarde': 'Giro Simples'
    }
  },

  // MARÇO
  {
    data: '2026-03-01',
    label: 'sábado, 01/03',
    temas: {
      'I2 Manhã': 'Carnaval - SEM AULA',
      'I1 Tarde': 'Carnaval - SEM AULA',
      'B1 Manhã': 'Carnaval - SEM AULA',
      'B2 Manhã': 'Carnaval - SEM AULA',
      'B2 Tarde': 'Carnaval - SEM AULA',
      'I1 Manhã': 'Carnaval - SEM AULA',
      'B1 Tarde': 'Carnaval - SEM AULA'
    }
  },
  {
    data: '2026-03-08',
    label: 'sábado, 08/03',
    temas: {
      'I2 Manhã': 'Paulista Titanic',
      'I1 Tarde': 'Esmeril aberto',
      'B1 Manhã': 'Giro do Condutor',
      'B2 Manhã': 'Avião',
      'B2 Tarde': 'Avião',
      'I1 Manhã': 'Esmeril aberto',
      'B1 Tarde': 'Giro do Condutor'
    }
  },
  {
    data: '2026-03-15',
    label: 'sábado, 15/03',
    temas: {
      'I2 Manhã': 'Contra 9 tempos',
      'I1 Tarde': 'Esmeril unilateral',
      'B1 Manhã': 'Variações Giro do Condutor',
      'B2 Manhã': 'Assalto',
      'B2 Tarde': 'Assalto',
      'I1 Manhã': 'Esmeril unilateral',
      'B1 Tarde': 'Variações Giro do Condutor'
    }
  },
  {
    data: '2026-03-22',
    label: 'sábado, 22/03',
    temas: {
      'I2 Manhã': 'Banana 9 tempos',
      'I1 Tarde': 'Firula',
      'B1 Manhã': 'Chuveirinho',
      'B2 Manhã': 'Banana Banana',
      'B2 Tarde': 'Banana Banana',
      'I1 Manhã': 'Firula',
      'B1 Tarde': 'Chuveirinho'
    }
  },
  {
    data: '2026-03-29',
    label: 'sábado, 29/03',
    temas: {
      'I2 Manhã': 'Chuveirinho 9 tempos',
      'I1 Tarde': 'Musicalidade',
      'B1 Manhã': 'Manivela',
      'B2 Manhã': 'Combinações de Passos',
      'B2 Tarde': 'Combinações de Passos',
      'I1 Manhã': 'Musicalidade',
      'B1 Tarde': 'Manivela'
    }
  },

  // ABRIL
  {
    data: '2026-04-05',
    label: 'sábado, 05/04',
    temas: {
      'I2 Manhã': 'Sinistro 9 e 11',
      'I1 Tarde': 'Sacada e Pendulo',
      'B1 Manhã': 'Caracol',
      'B2 Manhã': 'Cintura',
      'B2 Tarde': 'Cintura',
      'I1 Manhã': 'Sacada e Pendulo',
      'B1 Tarde': 'Caracol'
    }
  },
  {
    data: '2026-04-12',
    label: 'sábado, 12/04',
    temas: {
      'I2 Manhã': 'Avião Invertido',
      'I1 Tarde': 'Sacada Meia Lua',
      'B1 Manhã': 'Revisão',
      'B2 Manhã': 'Volta ao Mundo',
      'B2 Tarde': 'Volta ao Mundo',
      'I1 Manhã': 'Sacada Meia Lua',
      'B1 Tarde': 'Revisão'
    }
  },
  {
    data: '2026-04-19',
    label: 'sábado, 19/04',
    temas: {
      'I2 Manhã': 'Beyblade 9',
      'I1 Tarde': 'Caminhada e travada',
      'B1 Manhã': 'Nivelamento',
      'B2 Manhã': 'Combinação de Cintura',
      'B2 Tarde': 'Combinação de Cintura',
      'I1 Manhã': 'Caminhada e travada',
      'B1 Tarde': 'Nivelamento'
    }
  },
  {
    data: '2026-04-26',
    label: 'sábado, 26/04',
    temas: {
      'I2 Manhã': 'Giro Simples 9 e 11',
      'I1 Tarde': 'Paulista',
      'B1 Manhã': 'Passo Básico',
      'B2 Manhã': 'Esmeril Fechado',
      'B2 Tarde': 'Esmeril Fechado',
      'I1 Manhã': 'Paulista',
      'B1 Tarde': 'Passo Básico'
    }
  },

  // MAIO
  {
    data: '2026-05-03',
    label: 'sábado, 03/05',
    temas: {
      'I2 Manhã': 'Basquete 11',
      'I1 Tarde': 'Combinação de Paulista',
      'B1 Manhã': 'Xaxadinho',
      'B2 Manhã': 'Práticas dançantes',
      'B2 Tarde': 'Práticas dançantes',
      'I1 Manhã': 'Combinação de Paulista',
      'B1 Tarde': 'Xaxadinho'
    }
  },
  {
    data: '2026-05-10',
    label: 'sábado, 10/05',
    temas: {
      'I2 Manhã': 'Esmeril Quebrado',
      'I1 Tarde': 'Pião',
      'B1 Manhã': 'Deslocamento 1',
      'B2 Manhã': 'Introdução Contratempo',
      'B2 Tarde': 'Introdução Contratempo',
      'I1 Manhã': 'Pião',
      'B1 Tarde': 'Deslocamento 1'
    }
  },
  {
    data: '2026-05-17',
    label: 'sábado, 17/05',
    temas: {
      'I2 Manhã': 'Esmeril Invertido',
      'I1 Tarde': 'Revisão',
      'B1 Manhã': 'Deslocamento 2',
      'B2 Manhã': 'Caracol c Contra',
      'B2 Tarde': 'Caracol c Contra',
      'I1 Manhã': 'Revisão',
      'B1 Tarde': 'Deslocamento 2'
    }
  },
  {
    data: '2026-05-24',
    label: 'sábado, 24/05',
    temas: {
      'I2 Manhã': 'Miudinho',
      'I1 Tarde': 'Nivelamento',
      'B1 Manhã': 'Ritmos',
      'B2 Manhã': 'Conduções de Contra',
      'B2 Tarde': 'Conduções de Contra',
      'I1 Manhã': 'Nivelamento',
      'B1 Tarde': 'Ritmos'
    }
  },
  {
    data: '2026-05-31',
    label: 'sábado, 31/05',
    temas: {
      'I2 Manhã': 'Sacada com Pescada',
      'I1 Tarde': 'Revisão de Contratempo',
      'B1 Manhã': 'Giro Completo',
      'B2 Manhã': 'Contra do Passo Básico',
      'B2 Tarde': 'Contra do Passo Básico',
      'I1 Manhã': 'Revisão de Contratempo',
      'B1 Tarde': 'Giro Completo'
    }
  },

  // JUNHO
  {
    data: '2026-06-07',
    label: 'sábado, 07/06',
    temas: {
      'I2 Manhã': 'Sacada com arrasto',
      'I1 Tarde': 'Banana c contra',
      'B1 Manhã': 'Giro Simples',
      'B2 Manhã': 'Combinações de Contra',
      'B2 Tarde': 'Combinações de Contra',
      'I1 Manhã': 'Banana c contra',
      'B1 Tarde': 'Giro Simples'
    }
  },
  {
    data: '2026-06-14',
    label: 'sábado, 14/06',
    temas: {
      'I2 Manhã': 'Leque',
      'I1 Tarde': 'Chuveirinho c Contra',
      'B1 Manhã': 'Giro do Condutor',
      'B2 Manhã': 'Revisão',
      'B2 Tarde': 'Revisão',
      'I1 Manhã': 'Chuveirinho c Contra',
      'B1 Tarde': 'Giro do Condutor'
    }
  },
  {
    data: '2026-06-21',
    label: 'sábado, 21/06',
    temas: {
      'I2 Manhã': 'São João - SEM AULA',
      'I1 Tarde': 'São João - SEM AULA',
      'B1 Manhã': 'São João - SEM AULA',
      'B2 Manhã': 'São João - SEM AULA',
      'B2 Tarde': 'São João - SEM AULA',
      'I1 Manhã': 'São João - SEM AULA',
      'B1 Tarde': 'São João - SEM AULA'
    }
  },
  {
    data: '2026-06-28',
    label: 'sábado, 28/06',
    temas: {
      'I2 Manhã': 'Push and Pull',
      'I1 Tarde': 'Sinistro',
      'B1 Manhã': 'Variações Giro do Condutor',
      'B2 Manhã': 'Nivelamento',
      'B2 Tarde': 'Nivelamento',
      'I1 Manhã': 'Sinistro',
      'B1 Tarde': 'Variações Giro do Condutor'
    }
  },

  // JULHO
  {
    data: '2026-07-05',
    label: 'sábado, 05/07',
    temas: {
      'I2 Manhã': 'Paulista Titanic',
      'I1 Tarde': 'Avião c contra',
      'B1 Manhã': 'Chuveirinho',
      'B2 Manhã': 'Ritmo',
      'B2 Tarde': 'Ritmo',
      'I1 Manhã': 'Avião c contra',
      'B1 Tarde': 'Chuveirinho'
    }
  },
  {
    data: '2026-07-12',
    label: 'sábado, 12/07',
    temas: {
      'I2 Manhã': 'Contra 9 tempos',
      'I1 Tarde': 'Contratempo DE 7 TEMPOS',
      'B1 Manhã': 'Manivela',
      'B2 Manhã': 'Musicalidade',
      'B2 Tarde': 'Musicalidade',
      'I1 Manhã': 'Contratempo DE 7 TEMPOS',
      'B1 Tarde': 'Manivela'
    }
  },
  {
    data: '2026-07-19',
    label: 'sábado, 19/07',
    temas: {
      'I2 Manhã': 'Banana 9 tempos',
      'I1 Tarde': 'Basquete com Contra',
      'B1 Manhã': 'Caracol',
      'B2 Manhã': 'Breques',
      'B2 Tarde': 'Breques',
      'I1 Manhã': 'Basquete com Contra',
      'B1 Tarde': 'Caracol'
    }
  },
  {
    data: '2026-07-26',
    label: 'sábado, 26/07',
    temas: {
      'I2 Manhã': 'Chuveirinho 9 tempos',
      'I1 Tarde': 'Esmeril aberto',
      'B1 Manhã': 'Revisão',
      'B2 Manhã': 'Revisão Meio Giro',
      'B2 Tarde': 'Revisão Meio Giro',
      'I1 Manhã': 'Esmeril aberto',
      'B1 Tarde': 'Revisão'
    }
  },

  // AGOSTO
  {
    data: '2026-08-02',
    label: 'sábado, 02/08',
    temas: {
      'I2 Manhã': 'Sinistro 9 e 11',
      'I1 Tarde': 'Esmeril unilateral',
      'B1 Manhã': 'Nivelamento',
      'B2 Manhã': 'Pega-Pega',
      'B2 Tarde': 'Pega-Pega',
      'I1 Manhã': 'Esmeril unilateral',
      'B1 Tarde': 'Nivelamento'
    }
  },
  {
    data: '2026-08-09',
    label: 'sábado, 09/08',
    temas: {
      'I2 Manhã': 'Avião Invertido',
      'I1 Tarde': 'Firula',
      'B1 Manhã': 'Passo Básico',
      'B2 Manhã': 'Giro Giro',
      'B2 Tarde': 'Giro Giro',
      'I1 Manhã': 'Firula',
      'B1 Tarde': 'Passo Básico'
    }
  },
  {
    data: '2026-08-16',
    label: 'sábado, 16/08',
    temas: {
      'I2 Manhã': 'Beyblade 9',
      'I1 Tarde': 'Musicalidade',
      'B1 Manhã': 'Xaxadinho',
      'B2 Manhã': 'Caracol',
      'B2 Tarde': 'Caracol',
      'I1 Manhã': 'Musicalidade',
      'B1 Tarde': 'Xaxadinho'
    }
  },
  {
    data: '2026-08-23',
    label: 'sábado, 23/08',
    temas: {
      'I2 Manhã': 'Giro Simples 9 e 11',
      'I1 Tarde': 'Sacada e Pendulo',
      'B1 Manhã': 'Deslocamento 1',
      'B2 Manhã': 'Avião',
      'B2 Tarde': 'Avião',
      'I1 Manhã': 'Sacada e Pendulo',
      'B1 Tarde': 'Deslocamento 1'
    }
  },
  {
    data: '2026-08-30',
    label: 'sábado, 30/08',
    temas: {
      'I2 Manhã': 'Basquete 11',
      'I1 Tarde': 'Sacada Meia Lua',
      'B1 Manhã': 'Deslocamento 2',
      'B2 Manhã': 'Assalto',
      'B2 Tarde': 'Assalto',
      'I1 Manhã': 'Sacada Meia Lua',
      'B1 Tarde': 'Deslocamento 2'
    }
  },

  // SETEMBRO
  {
    data: '2026-09-06',
    label: 'sábado, 06/09',
    temas: {
      'I2 Manhã': 'Esmeril Quebrado',
      'I1 Tarde': 'Caminhada e travada',
      'B1 Manhã': 'Ritmos',
      'B2 Manhã': 'Banana Banana',
      'B2 Tarde': 'Banana Banana',
      'I1 Manhã': 'Caminhada e travada',
      'B1 Tarde': 'Ritmos'
    }
  },
  {
    data: '2026-09-13',
    label: 'sábado, 13/09',
    temas: {
      'I2 Manhã': 'Esmeril Invertido',
      'I1 Tarde': 'Paulista',
      'B1 Manhã': 'Giro Completo',
      'B2 Manhã': 'Combinações de Passos',
      'B2 Tarde': 'Combinações de Passos',
      'I1 Manhã': 'Paulista',
      'B1 Tarde': 'Giro Completo'
    }
  },
  {
    data: '2026-09-20',
    label: 'sábado, 20/09',
    temas: {
      'I2 Manhã': 'Miudinho',
      'I1 Tarde': 'Combinação de Paulista',
      'B1 Manhã': 'Giro Simples',
      'B2 Manhã': 'Cintura',
      'B2 Tarde': 'Cintura',
      'I1 Manhã': 'Combinação de Paulista',
      'B1 Tarde': 'Giro Simples'
    }
  },
  {
    data: '2026-09-27',
    label: 'sábado, 27/09',
    temas: {
      'I2 Manhã': 'Sacada com Pescada',
      'I1 Tarde': 'Pião',
      'B1 Manhã': 'Giro do Condutor',
      'B2 Manhã': 'Volta ao Mundo',
      'B2 Tarde': 'Volta ao Mundo',
      'I1 Manhã': 'Pião',
      'B1 Tarde': 'Giro do Condutor'
    }
  },

  // OUTUBRO
  {
    data: '2026-10-04',
    label: 'sábado, 04/10',
    temas: {
      'I2 Manhã': 'Sacada com arrasto',
      'I1 Tarde': 'Revisão',
      'B1 Manhã': 'Variações Giro do Condutor',
      'B2 Manhã': 'Combinação de Cintura',
      'B2 Tarde': 'Combinação de Cintura',
      'I1 Manhã': 'Revisão',
      'B1 Tarde': 'Variações Giro do Condutor'
    }
  },
  {
    data: '2026-10-11',
    label: 'sábado, 11/10',
    temas: {
      'I2 Manhã': 'Leque',
      'I1 Tarde': 'Nivelamento',
      'B1 Manhã': 'Chuveirinho',
      'B2 Manhã': 'Esmeril Fechado',
      'B2 Tarde': 'Esmeril Fechado',
      'I1 Manhã': 'Nivelamento',
      'B1 Tarde': 'Chuveirinho'
    }
  },
  {
    data: '2026-10-18',
    label: 'sábado, 18/10',
    temas: {
      'I2 Manhã': 'Push and Pull',
      'I1 Tarde': 'Revisão de Contratempo',
      'B1 Manhã': 'Manivela',
      'B2 Manhã': 'Práticas dançantes',
      'B2 Tarde': 'Práticas dançantes',
      'I1 Manhã': 'Revisão de Contratempo',
      'B1 Tarde': 'Manivela'
    }
  },
  {
    data: '2026-10-25',
    label: 'sábado, 25/10',
    temas: {
      'I2 Manhã': 'Halloween - AULA ESPECIAL',
      'I1 Tarde': 'Halloween - AULA ESPECIAL',
      'B1 Manhã': 'Halloween - AULA ESPECIAL',
      'B2 Manhã': 'Halloween - AULA ESPECIAL',
      'B2 Tarde': 'Halloween - AULA ESPECIAL',
      'I1 Manhã': 'Halloween - AULA ESPECIAL',
      'B1 Tarde': 'Halloween - AULA ESPECIAL'
    }
  },

  // NOVEMBRO
  {
    data: '2026-11-01',
    label: 'sábado, 01/11',
    temas: {
      'I2 Manhã': 'Paulista Titanic',
      'I1 Tarde': 'Banana c contra',
      'B1 Manhã': 'Caracol',
      'B2 Manhã': 'Introdução Contratempo',
      'B2 Tarde': 'Introdução Contratempo',
      'I1 Manhã': 'Banana c contra',
      'B1 Tarde': 'Caracol'
    }
  },
  {
    data: '2026-11-08',
    label: 'sábado, 08/11',
    temas: {
      'I2 Manhã': 'Contra 9 tempos',
      'I1 Tarde': 'Chuveirinho c Contra',
      'B1 Manhã': 'Revisão',
      'B2 Manhã': 'Caracol c Contra',
      'B2 Tarde': 'Caracol c Contra',
      'I1 Manhã': 'Chuveirinho c Contra',
      'B1 Tarde': 'Revisão'
    }
  },
  {
    data: '2026-11-15',
    label: 'sábado, 15/11',
    temas: {
      'I2 Manhã': 'Banana 9 tempos',
      'I1 Tarde': 'Sinistro',
      'B1 Manhã': 'Nivelamento',
      'B2 Manhã': 'Conduções de Contra',
      'B2 Tarde': 'Conduções de Contra',
      'I1 Manhã': 'Sinistro',
      'B1 Tarde': 'Nivelamento'
    }
  },
  {
    data: '2026-11-22',
    label: 'sábado, 22/11',
    temas: {
      'I2 Manhã': 'Chuveirinho 9 tempos',
      'I1 Tarde': 'Avião c contra',
      'B1 Manhã': 'Passo Básico',
      'B2 Manhã': 'Contra do Passo Básico',
      'B2 Tarde': 'Contra do Passo Básico',
      'I1 Manhã': 'Avião c contra',
      'B1 Tarde': 'Passo Básico'
    }
  },
  {
    data: '2026-11-29',
    label: 'sábado, 29/11',
    temas: {
      'I2 Manhã': 'Sinistro 9 e 11',
      'I1 Tarde': 'Contratempo DE 7 TEMPOS',
      'B1 Manhã': 'Xaxadinho',
      'B2 Manhã': 'Combinações de Contra',
      'B2 Tarde': 'Combinações de Contra',
      'I1 Manhã': 'Contratempo DE 7 TEMPOS',
      'B1 Tarde': 'Xaxadinho'
    }
  },

  // DEZEMBRO
  {
    data: '2026-12-06',
    label: 'sábado, 06/12',
    temas: {
      'I2 Manhã': 'Avião Invertido',
      'I1 Tarde': 'Basquete com Contra',
      'B1 Manhã': 'Deslocamento 1',
      'B2 Manhã': 'Revisão',
      'B2 Tarde': 'Revisão',
      'I1 Manhã': 'Basquete com Contra',
      'B1 Tarde': 'Deslocamento 1'
    }
  },
  {
    data: '2026-12-13',
    label: 'sábado, 13/12',
    temas: {
      'I2 Manhã': 'Beyblade 9',
      'I1 Tarde': 'Esmeril aberto',
      'B1 Manhã': 'Deslocamento 2',
      'B2 Manhã': 'Nivelamento',
      'B2 Tarde': 'Nivelamento',
      'I1 Manhã': 'Esmeril aberto',
      'B1 Tarde': 'Deslocamento 2'
    }
  },
  {
    data: '2026-12-20',
    label: 'sábado, 20/12',
    temas: {
      'I2 Manhã': 'Giro Simples 9 e 11',
      'I1 Tarde': 'Esmeril unilateral',
      'B1 Manhã': 'Ritmos',
      'B2 Manhã': 'Ritmo',
      'B2 Tarde': 'Ritmo',
      'I1 Manhã': 'Esmeril unilateral',
      'B1 Tarde': 'Ritmos'
    }
  },
  {
    data: '2026-12-27',
    label: 'sábado, 27/12',
    temas: {
      'I2 Manhã': 'NATAL - Sem aula',
      'I1 Tarde': 'NATAL - Sem aula',
      'B1 Manhã': 'NATAL - Sem aula',
      'B2 Manhã': 'NATAL - Sem aula',
      'B2 Tarde': 'NATAL - Sem aula',
      'I1 Manhã': 'NATAL - Sem aula',
      'B1 Tarde': 'NATAL - Sem aula'
    }
  }
];

// Gera os registros de Cronograma vinculando com as aulas do sistema
export const buildInitialCronogramas = (aulasList: Aula[]): Cronograma[] => {
  const cronos: Cronograma[] = [];

  annualScheduleRows.forEach((row, rowIndex) => {
    Object.entries(row.temas).forEach(([turmaNome, tema]) => {
      const foundAula = aulasList.find((a) => a.nome === turmaNome);
      if (foundAula) {
        cronos.push({
          id: `crono_init_${rowIndex}_${foundAula.id}`,
          aula_id: foundAula.id,
          data_aula: row.data,
          tema_aula: tema
        });
      }
    });
  });

  return cronos;
};
