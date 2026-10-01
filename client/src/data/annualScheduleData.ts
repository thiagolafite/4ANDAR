import { Aula, Cronograma, NivelForro } from '../types';

// Turmas presentes na planilha pedagógica oficial do 4ANDAR
export const turmasOficiais: Array<Omit<Aula, 'id'>> = [
  {
    nome: 'B1 Manhã',
    nivel: 'B1',
    turno: 'Manhã',
    dia_semana: 'Sábado',
    horario_inicio: '10:00',
    horario_fim: '11:30',
    sala: 'Salão 2 (Dominguinhos)',
    equipe_id: 'eq_bia',
    capacidade_maxima: 24
  },
  {
    nome: 'I2 Manhã',
    nivel: 'I2',
    turno: 'Manhã',
    dia_semana: 'Sábado',
    horario_inicio: '10:00',
    horario_fim: '11:30',
    sala: 'Salão Principal (Gonzagão)',
    equipe_id: 'eq_davidson',
    capacidade_maxima: 20
  },
  {
    nome: 'B2 Manhã',
    nivel: 'B2',
    turno: 'Manhã',
    dia_semana: 'Sábado',
    horario_inicio: '11:30',
    horario_fim: '13:00',
    sala: 'Salão Principal (Gonzagão)',
    equipe_id: 'eq_tony',
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
    equipe_id: 'eq_gao',
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
    equipe_id: 'eq_messias',
    capacidade_maxima: 24
  },
  {
    nome: 'I1 Tarde',
    nivel: 'I1',
    turno: 'Tarde',
    dia_semana: 'Sábado',
    horario_inicio: '14:00',
    horario_fim: '15:30',
    sala: 'Salão 2 (Dominguinhos)',
    equipe_id: 'eq_gao',
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
    equipe_id: 'eq_taz',
    capacidade_maxima: 22
  },
  {
    nome: 'I2 Tarde',
    nivel: 'I2',
    turno: 'Tarde',
    dia_semana: 'Sábado',
    horario_inicio: '15:30',
    horario_fim: '17:00',
    sala: 'Salão 2 (Dominguinhos)',
    equipe_id: 'eq_davidson',
    capacidade_maxima: 20
  }
];

export interface ScheduleRowData {
  data: string; // YYYY-MM-DD
  label: string; // sábado, 04/01
  temas: Record<string, string>;
  professores?: Record<string, string>;
}


// Todas as 52 semanas/sábados de 2026 fiéis à estrutura da planilha oficial da escola F4A
export const annualScheduleRows: ScheduleRowData[] = [
  {
    "data": "2026-01-03",
    "label": "sábado, 03/01",
    "temas": {
      "B1 Manhã": "SEM AULA - RECESSO",
      "B2 Manhã": "SEM AULA - RECESSO",
      "I1 Manhã": "SEM AULA - RECESSO",
      "I2 Manhã": "SEM AULA - RECESSO",
      "B1 Tarde": "SEM AULA - RECESSO",
      "B2 Tarde": "SEM AULA - RECESSO",
      "I1 Tarde": "SEM AULA - RECESSO",
      "I2 Tarde": "SEM AULA - RECESSO"
    },
    "professores": {}
  },
  {
    "data": "2026-01-10",
    "label": "sábado, 10/01",
    "temas": {
      "B1 Manhã": "SEM AULA - RECESSO",
      "B2 Manhã": "SEM AULA - RECESSO",
      "I1 Manhã": "SEM AULA - RECESSO",
      "I2 Manhã": "SEM AULA - RECESSO",
      "B1 Tarde": "SEM AULA - RECESSO",
      "B2 Tarde": "SEM AULA - RECESSO",
      "I1 Tarde": "SEM AULA - RECESSO",
      "I2 Tarde": "SEM AULA - RECESSO"
    },
    "professores": {}
  },
  {
    "data": "2026-01-17",
    "label": "sábado, 17/01",
    "temas": {
      "B1 Manhã": "Passo Básico",
      "B2 Manhã": "Início Módulo - Musicalidade",
      "I1 Manhã": "Sacada/Meia-lua",
      "I2 Manhã": "Turma junta",
      "B1 Tarde": "Passo Básico",
      "B2 Tarde": "Passo de Cintura (+Variações sem Contratempo)",
      "I1 Tarde": "Avião (+Variações com Contratempo)",
      "I2 Tarde": "Trocadilho"
    },
    "professores": {
      "B1 Manhã": "BIA",
      "B2 Manhã": "TONY",
      "I1 Manhã": "DAVIDSON",
      "I2 Manhã": "DAVIDSON",
      "B1 Tarde": "MESSIAS",
      "B2 Tarde": "TAZ",
      "I1 Tarde": "GÃO",
      "I2 Tarde": "DAVIDSON"
    }
  },
  {
    "data": "2026-01-24",
    "label": "sábado, 24/01",
    "temas": {
      "B1 Manhã": "Soltinho",
      "B2 Manhã": "Especial",
      "I1 Manhã": "Sinistro",
      "I2 Manhã": "Passo de perna",
      "B1 Tarde": "Meio Giro Trás/Frente (Aulão/Junto)",
      "B2 Tarde": "Passo de Cintura (+Variações sem Contratempo)",
      "I1 Tarde": "Avião (+Variações com Contratempo)",
      "I2 Tarde": "Trocadilho inverso"
    },
    "professores": {
      "B1 Manhã": "BIA",
      "B2 Manhã": "TONY E JULY",
      "I1 Manhã": "GÃO",
      "I2 Manhã": "DAVIDSON",
      "B1 Tarde": "MESSIAS",
      "B2 Tarde": "TAZ",
      "I1 Tarde": "GÃO",
      "I2 Tarde": "DAVIDSON"
    }
  },
  {
    "data": "2026-01-31",
    "label": "sábado, 31/01",
    "temas": {
      "B1 Manhã": "Giro Completo Trás/Frente (Aulão)",
      "B2 Manhã": "Giro-Giro (+Variações sem Contratempo)",
      "I1 Manhã": "Sequência de caracol com avião",
      "I2 Manhã": "Sequência de passo de perna + paulista",
      "B1 Tarde": "Revisão passo simples, soltinho e meio giro",
      "B2 Tarde": "Revisão passo cintura e início esmeril",
      "I1 Tarde": "Avião (+Variações com Contratempo)",
      "I2 Tarde": "Passo de perna"
    },
    "professores": {
      "B1 Manhã": "BIA",
      "B2 Manhã": "TONY E JULY",
      "I1 Manhã": "GÃO",
      "I2 Manhã": "DAVIDSON",
      "B1 Tarde": "MESSIAS",
      "B2 Tarde": "TAZ",
      "I1 Tarde": "GÃO",
      "I2 Tarde": "DAVIDSON"
    }
  },
  {
    "data": "2026-02-07",
    "label": "sábado, 07/02",
    "temas": {
      "B1 Manhã": "Abertura soltinho e giro simples",
      "B2 Manhã": "Giro-giro",
      "I1 Manhã": "Avião com contratempos",
      "I2 Manhã": "Avião invertido + contratempo",
      "B1 Tarde": "Meio giro",
      "B2 Tarde": "Esmeril junto",
      "I1 Tarde": "Avião (+Variações com Contratempo)",
      "I2 Tarde": "Condução do Paulista"
    },
    "professores": {
      "B1 Manhã": "BIA",
      "B2 Manhã": "GÃO",
      "I1 Manhã": "GÃO",
      "I2 Manhã": "DAVIDSON",
      "B1 Tarde": "MESSIAS",
      "B2 Tarde": "TAZ",
      "I1 Tarde": "GÃO",
      "I2 Tarde": "DAVIDSON"
    }
  },
  {
    "data": "2026-02-14",
    "label": "sábado, 14/02",
    "temas": {
      "B1 Manhã": "SEM AULA - CARNAVAL",
      "B2 Manhã": "SEM AULA - CARNAVAL",
      "I1 Manhã": "SEM AULA - CARNAVAL",
      "I2 Manhã": "SEM AULA - CARNAVAL",
      "B1 Tarde": "SEM AULA - CARNAVAL",
      "B2 Tarde": "SEM AULA - CARNAVAL",
      "I1 Tarde": "SEM AULA - CARNAVAL",
      "I2 Tarde": "SEM AULA - CARNAVAL"
    },
    "professores": {}
  },
  {
    "data": "2026-02-21",
    "label": "sábado, 21/02",
    "temas": {
      "B1 Manhã": "Troca de peso e passo básico",
      "B2 Manhã": "Banana banana",
      "I1 Manhã": "Avião + contratempo",
      "I2 Manhã": "Sequência das últimas aulas",
      "B1 Tarde": "Passo básico e meio-giros",
      "B2 Tarde": "Esmeril junto",
      "I1 Tarde": "Giro-giro com contratempo",
      "I2 Tarde": "Movimentações do paulista (saída do pião/meio giro trás e do meio invertido trás)"
    },
    "professores": {
      "B1 Manhã": "BIA",
      "B2 Manhã": "TONY",
      "I1 Manhã": "TAZ E BIA",
      "I2 Manhã": "DAVIDSON",
      "B1 Tarde": "BIA",
      "B2 Tarde": "TAZ E JULY",
      "I1 Tarde": "TAZ E BIA",
      "I2 Tarde": "DAVIDSON"
    }
  },
  {
    "data": "2026-02-28",
    "label": "sábado, 28/02",
    "temas": {
      "B1 Manhã": "Postura e Ritmo",
      "B2 Manhã": "Giro-Giro (+Variações sem Contratempo)",
      "I1 Manhã": "Giro completo trás/frente (junto)",
      "I2 Manhã": "Pião invertido a partir do giro simples",
      "B1 Tarde": "Postura e Ritmo",
      "B2 Tarde": "Giro-Giro (+Variações sem Contratempo)",
      "I1 Tarde": "Giro completo trás/frente (junto)",
      "I2 Tarde": "Pião invertido a partir do giro simples"
    },
    "professores": {
      "B1 Manhã": "BIA",
      "B2 Manhã": "TONY E JULY",
      "I1 Manhã": "GÃO",
      "I2 Manhã": "DAVIDSON",
      "B1 Tarde": "MESSIAS",
      "B2 Tarde": "TAZ",
      "I1 Tarde": "GÃO",
      "I2 Tarde": "DAVIDSON"
    }
  },
  {
    "data": "2026-03-07",
    "label": "sábado, 07/03",
    "temas": {
      "B1 Manhã": "Giro da dama e giro cavalheiro",
      "B2 Manhã": "banana-banana",
      "I1 Manhã": "turma junta",
      "I2 Manhã": "Pião invertido a partir do passo de cintura com contratempo 2",
      "B1 Tarde": "básico e meio-giro",
      "B2 Tarde": "Início contratempo",
      "I1 Tarde": "chuveirinho com contratempo + banana com contratempo",
      "I2 Tarde": "Pião invertido a partir do passo de cintura com contratempo 2"
    },
    "professores": {
      "B1 Manhã": "JULY",
      "B2 Manhã": "DAVIDSON",
      "I1 Manhã": "DAVIDSON",
      "I2 Manhã": "DAVIDSON",
      "B1 Tarde": "JULY",
      "B2 Tarde": "TAZ",
      "I1 Tarde": "TAZ",
      "I2 Tarde": "DAVIDSON"
    }
  },
  {
    "data": "2026-03-14",
    "label": "sábado, 14/03",
    "temas": {
      "B1 Manhã": "GIRO SIMPLES",
      "B2 Manhã": "Avião",
      "I1 Manhã": "giro-giro com contratempo",
      "I2 Manhã": "Sequencia com contratempo de 7",
      "B1 Tarde": "Postura + passos iniciais",
      "B2 Tarde": "CONTRATEMPO condução",
      "I1 Tarde": "contratempo de 5 tempos + 7 tempos",
      "I2 Tarde": "Variação de Avião"
    },
    "professores": {
      "B1 Manhã": "BIA",
      "B2 Manhã": "TONY",
      "I1 Manhã": "GÃO",
      "I2 Manhã": "DAVIDSON",
      "B1 Tarde": "MESSIAS",
      "B2 Tarde": "TAZ E JULY",
      "I1 Tarde": "GÃO",
      "I2 Tarde": "DAVIDSON"
    }
  },
  {
    "data": "2026-03-21",
    "label": "sábado, 21/03",
    "temas": {
      "B1 Manhã": "xaxadinho; chuveirinho",
      "B2 Manhã": "Revisão",
      "I1 Manhã": "Passo de Cintura (+Variações com contratempo)",
      "I2 Manhã": "Introdução cretinagem",
      "B1 Tarde": "Giro simples",
      "B2 Tarde": "contratempo",
      "I1 Tarde": "sinistro com contratempo + banana invertida",
      "I2 Tarde": "Contratempos duplos (sinistro e 1ª evolução do sinistro)"
    },
    "professores": {
      "B1 Manhã": "GÃO",
      "B2 Manhã": "TONY",
      "I1 Manhã": "GÃO",
      "I2 Manhã": "DAVIDSON",
      "B1 Tarde": "JULY",
      "B2 Tarde": "TONY",
      "I1 Tarde": "GÃO",
      "I2 Tarde": "DAVIDSON"
    }
  },
  {
    "data": "2026-03-28",
    "label": "sábado, 28/03",
    "temas": {
      "B1 Manhã": "Meios giros/Nivelamento",
      "B2 Manhã": "Início de cintura",
      "I1 Manhã": "Sacada/Meia-lua",
      "I2 Manhã": "Giro completo invertido + pião invertido",
      "B1 Tarde": "GIro simples",
      "B2 Tarde": "Caracol com contratempo",
      "I1 Tarde": "Sacada/Meia-lua",
      "I2 Tarde": "Variação de Banana"
    },
    "professores": {
      "B1 Manhã": "GÃO E BIA",
      "B2 Manhã": "TONY",
      "I1 Manhã": "GÃO E BIA",
      "I2 Manhã": "DAVIDSON",
      "B1 Tarde": "MESSIAS",
      "B2 Tarde": "TAZ",
      "I1 Tarde": "GÃO",
      "I2 Tarde": "DAVIDSON"
    }
  },
  {
    "data": "2026-04-04",
    "label": "sábado, 04/04",
    "temas": {
      "B1 Manhã": "Início Módulo",
      "B2 Manhã": "passo de cintura",
      "I1 Manhã": "Pêndulo/Ciscada",
      "I2 Manhã": "Sacada com a perna esquerda",
      "B1 Tarde": "Giro simples",
      "B2 Tarde": "REVISÃO",
      "I1 Tarde": "Introdução Paulista",
      "I2 Tarde": "Variação de Passos de Cintura"
    },
    "professores": {
      "B1 Manhã": "BIA",
      "B2 Manhã": "TONY",
      "I1 Manhã": "GÃO",
      "I2 Manhã": "DAVIDSON",
      "B1 Tarde": "JULY",
      "B2 Tarde": "TAZ",
      "I1 Tarde": "GÃO",
      "I2 Tarde": "DAVIDSON"
    }
  },
  {
    "data": "2026-04-11",
    "label": "sábado, 11/04",
    "temas": {
      "B1 Manhã": "Início Módulo - Peso e contrapeso",
      "B2 Manhã": "passo de cintura",
      "I1 Manhã": "Introdução ao Paulista",
      "I2 Manhã": "Sacada de letra",
      "B1 Tarde": "Passo Básico",
      "B2 Tarde": "Revisão Nivelamento",
      "I1 Tarde": "Paulista com invertido atrás",
      "I2 Tarde": "Combinação de Cintura com Peões"
    },
    "professores": {
      "B1 Manhã": "GÃO E BIA",
      "B2 Manhã": "TONY",
      "I1 Manhã": "GÃO",
      "I2 Manhã": "DAVIDSON",
      "B1 Tarde": "MESSIAS",
      "B2 Tarde": "TAZ",
      "I1 Tarde": "GÃO",
      "I2 Tarde": "DAVIDSON"
    }
  },
  {
    "data": "2026-04-18",
    "label": "sábado, 18/04",
    "temas": {
      "B1 Manhã": "Meio-giro dançando junto",
      "B2 Manhã": "Passo de cintura saindo no invertido",
      "I1 Manhã": "Paulista",
      "I2 Manhã": "Sequencia de sacada de esquerda",
      "B1 Tarde": "Giro do cavalheiro",
      "B2 Tarde": "Revisão e Nivelamento",
      "I1 Tarde": "Paulista",
      "I2 Tarde": "Giros invertidos completos"
    },
    "professores": {
      "B1 Manhã": "GÃO E BIA",
      "B2 Manhã": "TONY E JULY",
      "I1 Manhã": "GÃO E BIA",
      "I2 Manhã": "DAVIDSON",
      "B1 Tarde": "MESSIAS",
      "B2 Tarde": "TAZ",
      "I1 Tarde": "GÃO",
      "I2 Tarde": "DAVIDSON"
    }
  },
  {
    "data": "2026-04-25",
    "label": "sábado, 25/04",
    "temas": {
      "B1 Manhã": "Troca de peso",
      "B2 Manhã": "Ritmo",
      "I1 Manhã": "Nivelamento + Paulista",
      "I2 Manhã": "Aula livre",
      "B1 Tarde": "Troca de peso",
      "B2 Tarde": "Aula junto com o Básico 1",
      "I1 Tarde": "Banana finalizando com paulista",
      "I2 Tarde": "Esmeril unilateral"
    },
    "professores": {
      "B1 Manhã": "BIA",
      "B2 Manhã": "TONY",
      "I1 Manhã": "GÃO",
      "I2 Manhã": "DAVIDSON",
      "B1 Tarde": "MESSIAS",
      "B2 Tarde": "TAZ",
      "I1 Tarde": "GÃO",
      "I2 Tarde": "DAVIDSON"
    }
  },
  {
    "data": "2026-05-02",
    "label": "sábado, 02/05",
    "temas": {
      "B1 Manhã": "Revisão",
      "B2 Manhã": "ESMERIL JUNTO",
      "I1 Manhã": "PAULISTA COM INVERTIDO TRÁS",
      "I2 Manhã": "bêbado",
      "B1 Tarde": "Variação do giro simples",
      "B2 Tarde": "Revisão",
      "I1 Tarde": "introdução ao esmeril",
      "I2 Tarde": "Especial"
    },
    "professores": {
      "B1 Manhã": "BIA",
      "B2 Manhã": "TONY E JULY",
      "I1 Manhã": "GÃO E BIA",
      "I2 Manhã": "DAVIDSON",
      "B1 Tarde": "JULY",
      "B2 Tarde": "TAZ",
      "I1 Tarde": "GÃO E JULY",
      "I2 Tarde": "DAVIDSON"
    }
  },
  {
    "data": "2026-05-09",
    "label": "sábado, 09/05",
    "temas": {
      "B1 Manhã": "variações de giro simples",
      "B2 Manhã": "esmeril junto",
      "I1 Manhã": "Início Módulo - Paulista com invertido",
      "I2 Manhã": "paulista",
      "B1 Tarde": "Giro Completo Trás/Frente (Aulão)",
      "B2 Tarde": "Musicalidade",
      "I1 Tarde": "esmeril (variações)",
      "I2 Tarde": "Turma junta"
    },
    "professores": {
      "B1 Manhã": "BIA",
      "B2 Manhã": "TONY",
      "I1 Manhã": "GÃO E BIA",
      "I2 Manhã": "DAVIDSON",
      "B1 Tarde": "MESSIAS",
      "B2 Tarde": "TAZ",
      "I1 Tarde": "GÃO",
      "I2 Tarde": "DAVIDSON"
    }
  },
  {
    "data": "2026-05-16",
    "label": "sábado, 16/05",
    "temas": {
      "B1 Manhã": "Postura e Ritmo",
      "B2 Manhã": "esmeril",
      "I1 Manhã": "Introdução esmeril aberto",
      "I2 Manhã": "Trocadilho",
      "B1 Tarde": "Postura e Ritmo",
      "B2 Tarde": "NIVELAMENTO",
      "I1 Tarde": "esmeril; introdução pião",
      "I2 Tarde": "Trocadilho"
    },
    "professores": {
      "B1 Manhã": "BIA",
      "B2 Manhã": "DAVIDSON",
      "I1 Manhã": "GÃO E BIA",
      "I2 Manhã": "DAVIDSON",
      "B1 Tarde": "MESSIAS",
      "B2 Tarde": "TAZ",
      "I1 Tarde": "GÃO",
      "I2 Tarde": "DAVIDSON"
    }
  },
  {
    "data": "2026-05-23",
    "label": "sábado, 23/05",
    "temas": {
      "B1 Manhã": "REVISÃO",
      "B2 Manhã": "cobrinha",
      "I1 Manhã": "esmeril abberto",
      "I2 Manhã": "Trocadilho inverso",
      "B1 Tarde": "manivela",
      "B2 Tarde": "invertido",
      "I1 Tarde": "pião",
      "I2 Tarde": "Trocadilho inverso"
    },
    "professores": {
      "B1 Manhã": "BIA",
      "B2 Manhã": "TONY E JULY",
      "I1 Manhã": "GÃO",
      "I2 Manhã": "DAVIDSON",
      "B1 Tarde": "MESSIAS",
      "B2 Tarde": "TAZ",
      "I1 Tarde": "GÃO",
      "I2 Tarde": "DAVIDSON"
    }
  },
  {
    "data": "2026-05-30",
    "label": "sábado, 30/05",
    "temas": {
      "B1 Manhã": "Nivelamento",
      "B2 Manhã": "Contratempo introdução",
      "I1 Manhã": "esmeril variações",
      "I2 Manhã": "Passo de perna",
      "B1 Tarde": "nivelamento",
      "B2 Tarde": "revisão",
      "I1 Tarde": "pião",
      "I2 Tarde": "Passo de perna"
    },
    "professores": {
      "B1 Manhã": "BIA",
      "B2 Manhã": "TONY E JULY",
      "I1 Manhã": "GÃO",
      "I2 Manhã": "DAVIDSON",
      "B1 Tarde": "MESSIAS",
      "B2 Tarde": "TAZ",
      "I1 Tarde": "GÃO",
      "I2 Tarde": "DAVIDSON"
    }
  },
  {
    "data": "2026-06-06",
    "label": "sábado, 06/06",
    "temas": {
      "B1 Manhã": "Chameguinho (Aulão)",
      "B2 Manhã": "contratempo",
      "I1 Manhã": "técnicas de esmeril",
      "I2 Manhã": "Condução do Paulista",
      "B1 Tarde": "Chameguinho (Aulão)",
      "B2 Tarde": "Caminhada Esquerda/Direita",
      "I1 Tarde": "técnicas de esmeril",
      "I2 Tarde": "Condução do Paulista"
    },
    "professores": {
      "B1 Manhã": "BIA",
      "B2 Manhã": "TONY",
      "I1 Manhã": "BIA",
      "I2 Manhã": "DAVIDSON",
      "B1 Tarde": "MESSIAS",
      "B2 Tarde": "TAZ",
      "I1 Tarde": "BIA",
      "I2 Tarde": "DAVIDSON"
    }
  },
  {
    "data": "2026-06-13",
    "label": "sábado, 13/06",
    "temas": {
      "B1 Manhã": "Especial",
      "B2 Manhã": "contratempo",
      "I1 Manhã": "I1 e I2 Pião",
      "I2 Manhã": "Movimentações do paulista (saída do pião/meio giro trás e do meio invertido trás)",
      "B1 Tarde": "manivela, giro dama e cavalheiro, variações",
      "B2 Tarde": "combo de giro",
      "I1 Tarde": "pião invertido",
      "I2 Tarde": "Movimentações do paulista (saída do pião/meio giro trás e do meio invertido trás)"
    },
    "professores": {
      "B1 Manhã": "BIA",
      "B2 Manhã": "TONY",
      "I1 Manhã": "GÃO E BIA",
      "I2 Manhã": "DAVIDSON",
      "B1 Tarde": "MESSIAS",
      "B2 Tarde": "TAZ",
      "I1 Tarde": "GÃO",
      "I2 Tarde": "DAVIDSON"
    }
  },
  {
    "data": "2026-06-20",
    "label": "sábado, 20/06",
    "temas": {
      "B1 Manhã": "SEM AULA - SÃO JOÃO",
      "B2 Manhã": "SEM AULA - SÃO JOÃO",
      "I1 Manhã": "SEM AULA - SÃO JOÃO",
      "I2 Manhã": "SEM AULA - SÃO JOÃO",
      "B1 Tarde": "SEM AULA - SÃO JOÃO",
      "B2 Tarde": "SEM AULA - SÃO JOÃO",
      "I1 Tarde": "SEM AULA - SÃO JOÃO",
      "I2 Tarde": "SEM AULA - SÃO JOÃO"
    },
    "professores": {}
  },
  {
    "data": "2026-06-27",
    "label": "sábado, 27/06",
    "temas": {
      "B1 Manhã": "Turma Junta",
      "B2 Manhã": "contratempo",
      "I1 Manhã": "pião",
      "I2 Manhã": "Pião invertido a partir do giro simples",
      "B1 Tarde": "giro do cavalheiro",
      "B2 Tarde": "banana-banana",
      "I1 Tarde": "pião + contratempo",
      "I2 Tarde": "Pião invertido a partir do giro simples"
    },
    "professores": {
      "B1 Manhã": "BIA",
      "B2 Manhã": "TONY E JULY",
      "I1 Manhã": "GÃO",
      "I2 Manhã": "DAVIDSON",
      "B1 Tarde": "MESSIAS",
      "B2 Tarde": "TAZ",
      "I1 Tarde": "GÃO",
      "I2 Tarde": "DAVIDSON"
    }
  },
  {
    "data": "2026-07-04",
    "label": "sábado, 04/07",
    "temas": {
      "B1 Manhã": "Passo Básico",
      "B2 Manhã": "contratempo",
      "I1 Manhã": "pião",
      "I2 Manhã": "Pião invertido a partir do passo de cintura com contratempo 2",
      "B1 Tarde": "Passo Básico",
      "B2 Tarde": "avião",
      "I1 Tarde": "pião com travada",
      "I2 Tarde": "Pião invertido a partir do passo de cintura com contratempo 2"
    },
    "professores": {
      "B1 Manhã": "BIA",
      "B2 Manhã": "TONY E JULY",
      "I1 Manhã": "GÃO",
      "I2 Manhã": "DAVIDSON",
      "B1 Tarde": "MESSIAS",
      "B2 Tarde": "TAZ",
      "I1 Tarde": "GÃO",
      "I2 Tarde": "DAVIDSON"
    }
  },
  {
    "data": "2026-07-11",
    "label": "sábado, 11/07",
    "temas": {
      "B1 Manhã": "Início Módulo - Soltinho",
      "B2 Manhã": "Esmeril junto",
      "I1 Manhã": "Pêndulo/Ciscada",
      "I2 Manhã": "Variação de Avião",
      "B1 Tarde": "Soltinho",
      "B2 Tarde": "Esmeril junto",
      "I1 Tarde": "Pêndulo/Ciscada",
      "I2 Tarde": "Variação de Avião"
    },
    "professores": {
      "B1 Manhã": "BIA",
      "B2 Manhã": "TONY E JULY",
      "I1 Manhã": "GÃO",
      "I2 Manhã": "DAVIDSON",
      "B1 Tarde": "MESSIAS",
      "B2 Tarde": "TAZ",
      "I1 Tarde": "GÃO",
      "I2 Tarde": "DAVIDSON"
    }
  },
  {
    "data": "2026-07-18",
    "label": "sábado, 18/07",
    "temas": {
      "B1 Manhã": "Troca de peso",
      "B2 Manhã": "Especial",
      "I1 Manhã": "pião",
      "I2 Manhã": "Contratempos duplos (sinistro e 1ª evolução do sinistro)",
      "B1 Tarde": "Início Módulo - Troca de peso",
      "B2 Tarde": "Início Módulo - Especial",
      "I1 Tarde": "sacada de perna",
      "I2 Tarde": "Contratempos duplos (sinistro e 1ª evolução do sinistro)"
    },
    "professores": {
      "B1 Manhã": "BIA",
      "B2 Manhã": "TONY E JULY",
      "I1 Manhã": "GÃO",
      "I2 Manhã": "DAVIDSON",
      "B1 Tarde": "MESSIAS",
      "B2 Tarde": "TAZ",
      "I1 Tarde": "GÃO",
      "I2 Tarde": "DAVIDSON"
    }
  },
  {
    "data": "2026-07-25",
    "label": "sábado, 25/07",
    "temas": {
      "B1 Manhã": "peso e contrapeso",
      "B2 Manhã": "contratempo",
      "I1 Manhã": "Turma Junta",
      "I2 Manhã": "Variação de Banana",
      "B1 Tarde": "Meio Giro Trás/Frente (Aulão/Junto)",
      "B2 Tarde": "Turma Junta",
      "I1 Tarde": "Turma Junta",
      "I2 Tarde": "Variação de Banana"
    },
    "professores": {
      "B1 Manhã": "BIA",
      "B2 Manhã": "TONY",
      "I1 Manhã": "GÃO",
      "I2 Manhã": "DAVIDSON",
      "B1 Tarde": "MESSIAS",
      "B2 Tarde": "TAZ",
      "I1 Tarde": "GÃO",
      "I2 Tarde": "DAVIDSON"
    }
  },
  {
    "data": "2026-08-01",
    "label": "sábado, 01/08",
    "temas": {
      "B1 Manhã": "musicalidade",
      "B2 Manhã": "contratempo",
      "I1 Manhã": "pião com travada",
      "I2 Manhã": "-",
      "B1 Tarde": "Giro Completo Trás/Frente (Aulão)",
      "B2 Tarde": "Meio Giro Invertido Trás/Frente (Aulão/Junto)",
      "I1 Tarde": "caminhada e travada",
      "I2 Tarde": "Variação de Passos de Cintura"
    },
    "professores": {
      "B1 Manhã": "BIA",
      "B2 Manhã": "TONY E JULY",
      "I1 Manhã": "GÃO",
      "I2 Manhã": "DAVIDSON",
      "B1 Tarde": "MESSIAS",
      "B2 Tarde": "TAZ",
      "I1 Tarde": "GÃO",
      "I2 Tarde": "DAVIDSON"
    }
  },
  {
    "data": "2026-08-08",
    "label": "sábado, 08/08",
    "temas": {
      "B1 Manhã": "Postura e Ritmo",
      "B2 Manhã": "Avião (+Variações sem Contratempo)",
      "I1 Manhã": "Sinistro",
      "I2 Manhã": "Combinação de Cintura com Peões",
      "B1 Tarde": "Postura e Ritmo",
      "B2 Tarde": "Avião (+Variações sem Contratempo)",
      "I1 Tarde": "Sinistro",
      "I2 Tarde": "Combinação de Cintura com Peões"
    },
    "professores": {
      "B1 Manhã": "BIA",
      "B2 Manhã": "TONY E JULY",
      "I1 Manhã": "GÃO",
      "I2 Manhã": "DAVIDSON",
      "B1 Tarde": "MESSIAS",
      "B2 Tarde": "TAZ",
      "I1 Tarde": "GÃO",
      "I2 Tarde": "DAVIDSON"
    }
  },
  {
    "data": "2026-08-15",
    "label": "sábado, 15/08",
    "temas": {
      "B1 Manhã": "Giro Simples Cavalheiro/Dama",
      "B2 Manhã": "Musicalidade",
      "I1 Manhã": "Contratempo",
      "I2 Manhã": "Giros invertidos completos",
      "B1 Tarde": "Giro Simples Cavalheiro/Dama",
      "B2 Tarde": "Musicalidade",
      "I1 Tarde": "Contratempo",
      "I2 Tarde": "Giros invertidos completos"
    },
    "professores": {
      "B1 Manhã": "BIA",
      "B2 Manhã": "TONY E JULY",
      "I1 Manhã": "GÃO",
      "I2 Manhã": "DAVIDSON",
      "B1 Tarde": "MESSIAS",
      "B2 Tarde": "TAZ",
      "I1 Tarde": "GÃO",
      "I2 Tarde": "DAVIDSON"
    }
  },
  {
    "data": "2026-08-22",
    "label": "sábado, 22/08",
    "temas": {
      "B1 Manhã": "Peso e Contrapeso",
      "B2 Manhã": "invertido",
      "I1 Manhã": "caminhada + variações",
      "I2 Manhã": "Esmeril unilateral",
      "B1 Tarde": "-",
      "B2 Tarde": "Banana (+Variações sem Contratempo)",
      "I1 Tarde": "Avião (+Variações com Contratempo)",
      "I2 Tarde": "Esmeril unilateral"
    },
    "professores": {
      "B1 Manhã": "BIA",
      "B2 Manhã": "TONY",
      "I1 Manhã": "GÃO E BIA",
      "I2 Manhã": "DAVIDSON",
      "B1 Tarde": "MESSIAS",
      "B2 Tarde": "TAZ",
      "I1 Tarde": "GÃO",
      "I2 Tarde": "DAVIDSON"
    }
  },
  {
    "data": "2026-08-29",
    "label": "sábado, 29/08",
    "temas": {
      "B1 Manhã": "Chameguinho (Aulão)",
      "B2 Manhã": "Chuveirinho (+Variações sem Contratempo",
      "I1 Manhã": "Banana (+Variações com Contratempo)",
      "I2 Manhã": "Especial",
      "B1 Tarde": "Chameguinho (Aulão)",
      "B2 Tarde": "início de contratempo",
      "I1 Tarde": "Banana (+Variações com Contratempo)",
      "I2 Tarde": "Especial"
    },
    "professores": {
      "B1 Manhã": "BIA",
      "B2 Manhã": "TONY E JULY",
      "I1 Manhã": "GÃO",
      "I2 Manhã": "DAVIDSON",
      "B1 Tarde": "MESSIAS",
      "B2 Tarde": "TAZ",
      "I1 Tarde": "GÃO",
      "I2 Tarde": "DAVIDSON"
    }
  },
  {
    "data": "2026-09-05",
    "label": "sábado, 05/09",
    "temas": {
      "B1 Manhã": "Especial",
      "B2 Manhã": "invertido",
      "I1 Manhã": "breck",
      "I2 Manhã": "Turma junta",
      "B1 Tarde": "Especial",
      "B2 Tarde": "contratempo",
      "I1 Tarde": "Giro completo trás/frente (junto)",
      "I2 Tarde": "Turma junta"
    },
    "professores": {
      "B1 Manhã": "BIA",
      "B2 Manhã": "TONY E JULY",
      "I1 Manhã": "GÃO",
      "I2 Manhã": "DAVIDSON",
      "B1 Tarde": "MESSIAS",
      "B2 Tarde": "TAZ",
      "I1 Tarde": "GÃO",
      "I2 Tarde": "DAVIDSON"
    }
  },
  {
    "data": "2026-09-12",
    "label": "sábado, 12/09",
    "temas": {
      "B1 Manhã": "Turma Junta",
      "B2 Manhã": "Caminhada Esquerda/Direita",
      "I1 Manhã": "Chuveirinho (+Variações com Contratempo)",
      "I2 Manhã": "Trocadilho",
      "B1 Tarde": "Turma Junta",
      "B2 Tarde": "Caminhada Esquerda/Direita",
      "I1 Tarde": "Chuveirinho (+Variações com Contratempo)",
      "I2 Tarde": "Trocadilho"
    },
    "professores": {
      "B1 Manhã": "BIA",
      "B2 Manhã": "TONY E JULY",
      "I1 Manhã": "GÃO",
      "I2 Manhã": "DAVIDSON",
      "B1 Tarde": "MESSIAS",
      "B2 Tarde": "TAZ",
      "I1 Tarde": "GÃO",
      "I2 Tarde": "DAVIDSON"
    }
  },
  {
    "data": "2026-09-19",
    "label": "sábado, 19/09",
    "temas": {
      "B1 Manhã": "Passo Básico",
      "B2 Manhã": "Xaxadinho (Aulão)",
      "I1 Manhã": "Giro Giro – Giro Gira (+Variações com Contratempo)",
      "I2 Manhã": "Trocadilho inverso",
      "B1 Tarde": "Passo Básico",
      "B2 Tarde": "Xaxadinho (Aulão)",
      "I1 Tarde": "Giro Giro – Giro Gira (+Variações com Contratempo)",
      "I2 Tarde": "Trocadilho inverso"
    },
    "professores": {
      "B1 Manhã": "BIA",
      "B2 Manhã": "TONY E JULY",
      "I1 Manhã": "GÃO",
      "I2 Manhã": "DAVIDSON",
      "B1 Tarde": "MESSIAS",
      "B2 Tarde": "TAZ",
      "I1 Tarde": "GÃO",
      "I2 Tarde": "DAVIDSON"
    }
  },
  {
    "data": "2026-09-26",
    "label": "sábado, 26/09",
    "temas": {
      "B1 Manhã": "Soltinho",
      "B2 Manhã": "Xaxadinho (junto)",
      "I1 Manhã": "Passo de Cintura (+Variações com contratempo)",
      "I2 Manhã": "Passo de perna",
      "B1 Tarde": "Soltinho",
      "B2 Tarde": "Xaxadinho (junto)",
      "I1 Tarde": "Passo de Cintura (+Variações com contratempo)",
      "I2 Tarde": "Passo de perna"
    },
    "professores": {
      "B1 Manhã": "BIA",
      "B2 Manhã": "TONY E JULY",
      "I1 Manhã": "GÃO",
      "I2 Manhã": "DAVIDSON",
      "B1 Tarde": "MESSIAS",
      "B2 Tarde": "TAZ",
      "I1 Tarde": "GÃO",
      "I2 Tarde": "DAVIDSON"
    }
  },
  {
    "data": "2026-10-03",
    "label": "sábado, 03/10",
    "temas": {
      "B1 Manhã": "Início Módulo - Troca de peso",
      "B2 Manhã": "Passo de Cintura (+Variações sem Contratempo)",
      "I1 Manhã": "Sacada/Meia-lua",
      "I2 Manhã": "Condução do Paulista",
      "B1 Tarde": "giro completo",
      "B2 Tarde": "Revisão",
      "I1 Tarde": "passo de perna",
      "I2 Tarde": "Condução do Paulista"
    },
    "professores": {
      "B1 Manhã": "BIA",
      "B2 Manhã": "TONY E JULY",
      "I1 Manhã": "GÃO",
      "I2 Manhã": "DAVIDSON",
      "B1 Tarde": "MESSIAS",
      "B2 Tarde": "TAZ",
      "I1 Tarde": "GÃO",
      "I2 Tarde": "DAVIDSON"
    }
  },
  {
    "data": "2026-10-10",
    "label": "sábado, 10/10",
    "temas": {
      "B1 Manhã": "Meio Giro Trás/Frente (Aulão/Junto)",
      "B2 Manhã": "Esmeril junto",
      "I1 Manhã": "Pêndulo/Ciscada",
      "I2 Manhã": "Movimentações do paulista (saída do pião/meio giro trás e do meio invertido trás)",
      "B1 Tarde": "Meio Giro Trás/Frente (Aulão/Junto)",
      "B2 Tarde": "Nivelamento",
      "I1 Tarde": "Contratempo",
      "I2 Tarde": "Movimentações do paulista (saída do pião/meio giro trás e do meio invertido trás)"
    },
    "professores": {
      "B1 Manhã": "BIA",
      "B2 Manhã": "TONY E JULY",
      "I1 Manhã": "GÃO",
      "I2 Manhã": "DAVIDSON",
      "B1 Tarde": "MESSIAS",
      "B2 Tarde": "TAZ",
      "I1 Tarde": "GÃO",
      "I2 Tarde": "DAVIDSON"
    }
  },
  {
    "data": "2026-10-17",
    "label": "sábado, 17/10",
    "temas": {
      "B1 Manhã": "Giro Completo Trás/Frente (Aulão)",
      "B2 Manhã": "Especial",
      "I1 Manhã": "Especial",
      "I2 Manhã": "Pião invertido a partir do giro simples",
      "B1 Tarde": "Giro Completo Trás/Frente (Aulão)",
      "B2 Tarde": "invertido",
      "I1 Tarde": "Especial",
      "I2 Tarde": "Pião invertido a partir do giro simples"
    },
    "professores": {
      "B1 Manhã": "BIA",
      "B2 Manhã": "TONY E JULY",
      "I1 Manhã": "GÃO",
      "I2 Manhã": "DAVIDSON",
      "B1 Tarde": "MESSIAS",
      "B2 Tarde": "TAZ",
      "I1 Tarde": "GÃO",
      "I2 Tarde": "DAVIDSON"
    }
  },
  {
    "data": "2026-10-24",
    "label": "sábado, 24/10",
    "temas": {
      "B1 Manhã": "Postura e Ritmo",
      "B2 Manhã": "Turma Junta",
      "I1 Manhã": "Turma Junta",
      "I2 Manhã": "Pião invertido a partir do passo de cintura com contratempo 2",
      "B1 Tarde": "Postura e Ritmo",
      "B2 Tarde": "invertido + giro gira",
      "I1 Tarde": "Turma Junta",
      "I2 Tarde": "Pião invertido a partir do passo de cintura com contratempo 2"
    },
    "professores": {
      "B1 Manhã": "BIA",
      "B2 Manhã": "TONY E JULY",
      "I1 Manhã": "GÃO",
      "I2 Manhã": "DAVIDSON",
      "B1 Tarde": "MESSIAS",
      "B2 Tarde": "TAZ",
      "I1 Tarde": "GÃO",
      "I2 Tarde": "DAVIDSON"
    }
  },
  {
    "data": "2026-10-31",
    "label": "sábado, 31/10",
    "temas": {
      "B1 Manhã": "Giro Simples Cavalheiro/Dama",
      "B2 Manhã": "Meio Giro Invertido Trás/Frente (Aulão/Junto)",
      "I1 Manhã": "Pião",
      "I2 Manhã": "Variação de Avião",
      "B1 Tarde": "Giro Simples Cavalheiro/Dama",
      "B2 Tarde": "Meio Giro Invertido Trás/Frente (Aulão/Junto)",
      "I1 Tarde": "Pião",
      "I2 Tarde": "Variação de Avião"
    },
    "professores": {
      "B1 Manhã": "BIA",
      "B2 Manhã": "TONY E JULY",
      "I1 Manhã": "GÃO",
      "I2 Manhã": "DAVIDSON",
      "B1 Tarde": "MESSIAS",
      "B2 Tarde": "TAZ",
      "I1 Tarde": "GÃO",
      "I2 Tarde": "DAVIDSON"
    }
  },
  {
    "data": "2026-11-07",
    "label": "sábado, 07/11",
    "temas": {
      "B1 Manhã": "Peso e Contrapeso",
      "B2 Manhã": "Avião (+Variações sem Contratempo)",
      "I1 Manhã": "Sinistro",
      "I2 Manhã": "Contratempos duplos (sinistro e 1ª evolução do sinistro)",
      "B1 Tarde": "Peso e Contrapeso",
      "B2 Tarde": "Avião (+Variações sem Contratempo)",
      "I1 Tarde": "Sinistro",
      "I2 Tarde": "Contratempos duplos (sinistro e 1ª evolução do sinistro)"
    },
    "professores": {
      "B1 Manhã": "BIA",
      "B2 Manhã": "TONY E JULY",
      "I1 Manhã": "GÃO",
      "I2 Manhã": "DAVIDSON",
      "B1 Tarde": "MESSIAS",
      "B2 Tarde": "TAZ",
      "I1 Tarde": "GÃO",
      "I2 Tarde": "DAVIDSON"
    }
  },
  {
    "data": "2026-11-14",
    "label": "sábado, 14/11",
    "temas": {
      "B1 Manhã": "Chameguinho (Aulão)",
      "B2 Manhã": "Musicalidade",
      "I1 Manhã": "Contratempo",
      "I2 Manhã": "Variação de Banana",
      "B1 Tarde": "Chameguinho (Aulão)",
      "B2 Tarde": "Musicalidade",
      "I1 Tarde": "Contratempo",
      "I2 Tarde": "Variação de Banana"
    },
    "professores": {
      "B1 Manhã": "BIA",
      "B2 Manhã": "TONY E JULY",
      "I1 Manhã": "GÃO",
      "I2 Manhã": "DAVIDSON",
      "B1 Tarde": "MESSIAS",
      "B2 Tarde": "TAZ",
      "I1 Tarde": "GÃO",
      "I2 Tarde": "DAVIDSON"
    }
  },
  {
    "data": "2026-11-21",
    "label": "sábado, 21/11",
    "temas": {
      "B1 Manhã": "Especial",
      "B2 Manhã": "Banana (+Variações sem Contratempo)",
      "I1 Manhã": "Avião (+Variações com Contratempo)",
      "I2 Manhã": "Variação de Passos de Cintura",
      "B1 Tarde": "Especial",
      "B2 Tarde": "Banana (+Variações sem Contratempo)",
      "I1 Tarde": "Avião (+Variações com Contratempo)",
      "I2 Tarde": "Variação de Passos de Cintura"
    },
    "professores": {
      "B1 Manhã": "BIA",
      "B2 Manhã": "TONY E JULY",
      "I1 Manhã": "GÃO",
      "I2 Manhã": "DAVIDSON",
      "B1 Tarde": "MESSIAS",
      "B2 Tarde": "TAZ",
      "I1 Tarde": "GÃO",
      "I2 Tarde": "DAVIDSON"
    }
  },
  {
    "data": "2026-11-28",
    "label": "sábado, 28/11",
    "temas": {
      "B1 Manhã": "Turma Junta",
      "B2 Manhã": "Chuveirinho (+Variações sem Contratempo",
      "I1 Manhã": "Banana (+Variações com Contratempo)",
      "I2 Manhã": "Combinação de Cintura com Peões",
      "B1 Tarde": "Turma Junta",
      "B2 Tarde": "Chuveirinho (+Variações sem Contratempo",
      "I1 Tarde": "Banana (+Variações com Contratempo)",
      "I2 Tarde": "Combinação de Cintura com Peões"
    },
    "professores": {
      "B1 Manhã": "BIA",
      "B2 Manhã": "TONY E JULY",
      "I1 Manhã": "GÃO",
      "I2 Manhã": "DAVIDSON",
      "B1 Tarde": "MESSIAS",
      "B2 Tarde": "TAZ",
      "I1 Tarde": "GÃO",
      "I2 Tarde": "DAVIDSON"
    }
  },
  {
    "data": "2026-12-05",
    "label": "sábado, 05/12",
    "temas": {
      "B1 Manhã": "Passo Básico",
      "B2 Manhã": "Giro-Giro (+Variações sem Contratempo)",
      "I1 Manhã": "Giro completo trás/frente (junto)",
      "I2 Manhã": "Giros invertidos completos",
      "B1 Tarde": "Passo Básico",
      "B2 Tarde": "Giro-Giro (+Variações sem Contratempo)",
      "I1 Tarde": "Giro completo trás/frente (junto)",
      "I2 Tarde": "Giros invertidos completos"
    },
    "professores": {
      "B1 Manhã": "BIA",
      "B2 Manhã": "TONY E JULY",
      "I1 Manhã": "GÃO",
      "I2 Manhã": "DAVIDSON",
      "B1 Tarde": "MESSIAS",
      "B2 Tarde": "TAZ",
      "I1 Tarde": "GÃO",
      "I2 Tarde": "DAVIDSON"
    }
  },
  {
    "data": "2026-12-12",
    "label": "sábado, 12/12",
    "temas": {
      "B1 Manhã": "Soltinho",
      "B2 Manhã": "Caminhada Esquerda/Direita",
      "I1 Manhã": "Chuveirinho (+Variações com Contratempo)",
      "I2 Manhã": "Esmeril unilateral",
      "B1 Tarde": "Soltinho",
      "B2 Tarde": "Caminhada Esquerda/Direita",
      "I1 Tarde": "Chuveirinho (+Variações com Contratempo)",
      "I2 Tarde": "Esmeril unilateral"
    },
    "professores": {
      "B1 Manhã": "BIA",
      "B2 Manhã": "TONY E JULY",
      "I1 Manhã": "GÃO",
      "I2 Manhã": "DAVIDSON",
      "B1 Tarde": "MESSIAS",
      "B2 Tarde": "TAZ",
      "I1 Tarde": "GÃO",
      "I2 Tarde": "DAVIDSON"
    }
  },
  {
    "data": "2026-12-19",
    "label": "sábado, 19/12",
    "temas": {
      "B1 Manhã": "SEM AULA - RECESSO",
      "B2 Manhã": "SEM AULA - RECESSO",
      "I1 Manhã": "SEM AULA - RECESSO",
      "I2 Manhã": "SEM AULA - RECESSO",
      "B1 Tarde": "SEM AULA - RECESSO",
      "B2 Tarde": "SEM AULA - RECESSO",
      "I1 Tarde": "SEM AULA - RECESSO",
      "I2 Tarde": "SEM AULA - RECESSO"
    },
    "professores": {}
  },
  {
    "data": "2026-12-26",
    "label": "sábado, 26/12",
    "temas": {
      "B1 Manhã": "SEM AULA - RECESSO",
      "B2 Manhã": "SEM AULA - RECESSO",
      "I1 Manhã": "SEM AULA - RECESSO",
      "I2 Manhã": "SEM AULA - RECESSO",
      "B1 Tarde": "SEM AULA - RECESSO",
      "B2 Tarde": "SEM AULA - RECESSO",
      "I1 Tarde": "SEM AULA - RECESSO",
      "I2 Tarde": "SEM AULA - RECESSO"
    },
    "professores": {}
  }
];

// Histórico de 51 semanas/sábados de 2023 da planilha pedagógica F4A
export const historicalScheduleRows2023: ScheduleRowData[] = [
  {
    "data": "2023-01-07",
    "label": "sábado, 07/01",
    "temas": {
      "B1 Manhã": "Aula com BIA",
      "B2 Manhã": "Musicalidade",
      "I1 Manhã": "Sacada/Meia-lua",
      "I2 Manhã": "Turma junta",
      "B1 Tarde": "Aula com MESSIAS",
      "B2 Tarde": "Passo de Cintura (+Variações sem Contratempo)",
      "I1 Tarde": "Avião (+Variações com Contratempo)",
      "I2 Tarde": "—"
    },
    "professores": {
      "B1 Manhã": "BIA",
      "B2 Manhã": "TONY",
      "I1 Manhã": "DAVIDSON",
      "I2 Manhã": "DAVIDSON",
      "B1 Tarde": "MESSIAS",
      "B2 Tarde": "TAZ",
      "I1 Tarde": "GÃO"
    }
  },
  {
    "data": "2023-01-14",
    "label": "sábado, 14/01",
    "temas": {
      "B1 Manhã": "Aula com BIA",
      "B2 Manhã": "Especial",
      "I1 Manhã": "Aula com GÃO",
      "I2 Manhã": "Passo de perna",
      "B1 Tarde": "Meio Giro Trás/Frente (Aulão/Junto)",
      "B2 Tarde": "Passo de Cintura (+Variações sem Contratempo)",
      "I1 Tarde": "Avião (+Variações com Contratempo)",
      "I2 Tarde": "—"
    },
    "professores": {
      "B1 Manhã": "BIA",
      "B2 Manhã": "TONY E JULY",
      "I1 Manhã": "GÃO",
      "I2 Manhã": "DAVIDSON",
      "B1 Tarde": "MESSIAS",
      "B2 Tarde": "TAZ",
      "I1 Tarde": "GÃO"
    }
  },
  {
    "data": "2023-01-21",
    "label": "sábado, 21/01",
    "temas": {
      "B1 Manhã": "Giro Completo Trás/Frente (Aulão)",
      "B2 Manhã": "Giro-Giro (+Variações sem Contratempo)",
      "I1 Manhã": "Sequência de caracol com avião",
      "I2 Manhã": "Sequência de passo de perna + paulista",
      "B1 Tarde": "Revisão passo simples, soltinho e meio giro",
      "B2 Tarde": "Revisão passo cintura e início esmeril",
      "I1 Tarde": "Avião (+Variações com Contratempo)",
      "I2 Tarde": "—"
    },
    "professores": {
      "B1 Manhã": "BIA",
      "B2 Manhã": "TONY E JULY",
      "I1 Manhã": "GÃO",
      "I2 Manhã": "DAVIDSON",
      "B1 Tarde": "MESSIAS",
      "B2 Tarde": "TAZ",
      "I1 Tarde": "GÃO"
    }
  },
  {
    "data": "2023-01-28",
    "label": "sábado, 28/01",
    "temas": {
      "B1 Manhã": "Abertura soltinho e giro simples",
      "B2 Manhã": "Giro-giro",
      "I1 Manhã": "Avião com contratempos",
      "I2 Manhã": "Avião invertido + contratempo",
      "B1 Tarde": "Meio giro",
      "B2 Tarde": "Esmeril junto",
      "I1 Tarde": "—",
      "I2 Tarde": "—"
    },
    "professores": {
      "B1 Manhã": "BIA",
      "B2 Manhã": "GÃO",
      "I1 Manhã": "GÃO",
      "I2 Manhã": "DAVIDSON",
      "B1 Tarde": "MESSIAS",
      "B2 Tarde": "TAZ"
    }
  },
  {
    "data": "2023-02-04",
    "label": "sábado, 04/02",
    "temas": {
      "B1 Manhã": "Troca de peso e passo básico",
      "B2 Manhã": "Banana banana",
      "I1 Manhã": "Avião + contratempo",
      "I2 Manhã": "Sequência das últimas aulas",
      "B1 Tarde": "Passo básico e meio-giros",
      "B2 Tarde": "Esmeril junto",
      "I1 Tarde": "Giro-giro com contratempo",
      "I2 Tarde": "—"
    },
    "professores": {
      "B1 Manhã": "BIA",
      "B2 Manhã": "TONY",
      "I1 Manhã": "TAZ E BIA",
      "I2 Manhã": "DAVIDSON",
      "B1 Tarde": "BIA",
      "B2 Tarde": "TAZ E JULY",
      "I1 Tarde": "TAZ E BIA"
    }
  },
  {
    "data": "2023-02-11",
    "label": "sábado, 11/02",
    "temas": {
      "B1 Manhã": "—",
      "B2 Manhã": "—",
      "I1 Manhã": "—",
      "I2 Manhã": "—",
      "B1 Tarde": "—",
      "B2 Tarde": "—",
      "I1 Tarde": "—",
      "I2 Tarde": "—"
    },
    "professores": {}
  },
  {
    "data": "2023-02-25",
    "label": "sábado, 25/02",
    "temas": {
      "B1 Manhã": "Giro da dama e giro cavalheiro",
      "B2 Manhã": "banana-banana",
      "I1 Manhã": "turma junta",
      "I2 Manhã": "—",
      "B1 Tarde": "básico e meio-giro",
      "B2 Tarde": "Início contratempo",
      "I1 Tarde": "chuveirinho com contratempo + banana com contratempo",
      "I2 Tarde": "—"
    },
    "professores": {
      "B1 Manhã": "JULY",
      "B2 Manhã": "DAVIDSON",
      "I1 Manhã": "DAVIDSON",
      "B1 Tarde": "JULY",
      "B2 Tarde": "TAZ",
      "I1 Tarde": "TAZ"
    }
  },
  {
    "data": "2023-03-04",
    "label": "sábado, 04/03",
    "temas": {
      "B1 Manhã": "GIRO SIMPLES",
      "B2 Manhã": "Avião",
      "I1 Manhã": "giro-giro com contratempo",
      "I2 Manhã": "Sequencia com contratempo de 7",
      "B1 Tarde": "Postura + passos iniciais",
      "B2 Tarde": "CONTRATEMPO condução",
      "I1 Tarde": "contratempo de 5 tempos + 7 tempos",
      "I2 Tarde": "—"
    },
    "professores": {
      "B1 Manhã": "BIA",
      "B2 Manhã": "TONY",
      "I1 Manhã": "GÃO",
      "I2 Manhã": "DAVIDSON",
      "B1 Tarde": "MESSIAS",
      "B2 Tarde": "TAZ E JULY",
      "I1 Tarde": "GÃO"
    }
  },
  {
    "data": "2023-03-11",
    "label": "sábado, 11/03",
    "temas": {
      "B1 Manhã": "xaxadinho; chuveirinho",
      "B2 Manhã": "Revisão",
      "I1 Manhã": "Aula com GÃO",
      "I2 Manhã": "Introdução cretinagem",
      "B1 Tarde": "Giro simples",
      "B2 Tarde": "contratempo",
      "I1 Tarde": "sinistro com contratempo + banana invertida",
      "I2 Tarde": "—"
    },
    "professores": {
      "B1 Manhã": "GÃO",
      "B2 Manhã": "TONY",
      "I1 Manhã": "GÃO",
      "I2 Manhã": "DAVIDSON",
      "B1 Tarde": "JULY",
      "B2 Tarde": "TONY",
      "I1 Tarde": "GÃO"
    }
  },
  {
    "data": "2023-03-18",
    "label": "sábado, 18/03",
    "temas": {
      "B1 Manhã": "Meios giros/Nivelamento",
      "B2 Manhã": "Início de cintura",
      "I1 Manhã": "Aula com GÃO E BIA",
      "I2 Manhã": "Giro completo invertido + pião invertido",
      "B1 Tarde": "GIro simples",
      "B2 Tarde": "Caracol com contratempo",
      "I1 Tarde": "—",
      "I2 Tarde": "—"
    },
    "professores": {
      "B1 Manhã": "GÃO E BIA",
      "B2 Manhã": "TONY",
      "I1 Manhã": "GÃO E BIA",
      "I2 Manhã": "DAVIDSON",
      "B2 Tarde": "TAZ"
    }
  },
  {
    "data": "2023-03-25",
    "label": "sábado, 25/03",
    "temas": {
      "B1 Manhã": "Início Módulo",
      "B2 Manhã": "passo de cintura",
      "I1 Manhã": "—",
      "I2 Manhã": "Sacada com a perna esquerda",
      "B1 Tarde": "Giro simples",
      "B2 Tarde": "REVISÃO",
      "I1 Tarde": "Introdução Paulista",
      "I2 Tarde": "—"
    },
    "professores": {
      "B2 Manhã": "TONY",
      "I2 Manhã": "DAVIDSON",
      "B1 Tarde": "JULY",
      "B2 Tarde": "TAZ",
      "I1 Tarde": "GÃO"
    }
  },
  {
    "data": "2023-04-01",
    "label": "sábado, 01/04",
    "temas": {
      "B1 Manhã": "Peso e contrapeso",
      "B2 Manhã": "passo de cintura",
      "I1 Manhã": "Introdução ao Paulista",
      "I2 Manhã": "Sacada de letra",
      "B1 Tarde": "—",
      "B2 Tarde": "Revisão Nivelamento",
      "I1 Tarde": "Paulista com invertido atrás",
      "I2 Tarde": "—"
    },
    "professores": {
      "B1 Manhã": "GÃO E BIA",
      "B2 Manhã": "TONY",
      "I1 Manhã": "GÃO",
      "I2 Manhã": "DAVIDSON",
      "B2 Tarde": "TAZ",
      "I1 Tarde": "GÃO"
    }
  },
  {
    "data": "2023-04-08",
    "label": "sábado, 08/04",
    "temas": {
      "B1 Manhã": "Meio-giro dançando junto",
      "B2 Manhã": "Passo de cintura saindo no invertido",
      "I1 Manhã": "Paulista",
      "I2 Manhã": "Sequencia de sacada de esquerda",
      "B1 Tarde": "Giro do cavalheiro",
      "B2 Tarde": "Revisão e Nivelamento",
      "I1 Tarde": "Paulista",
      "I2 Tarde": "—"
    },
    "professores": {
      "B1 Manhã": "GÃO E BIA",
      "B2 Manhã": "TONY E JULY",
      "I1 Manhã": "GÃO E BIA",
      "I2 Manhã": "DAVIDSON",
      "B1 Tarde": "MESSIAS",
      "B2 Tarde": "TAZ",
      "I1 Tarde": "GÃO"
    }
  },
  {
    "data": "2023-04-15",
    "label": "sábado, 15/04",
    "temas": {
      "B1 Manhã": "—",
      "B2 Manhã": "Ritmo",
      "I1 Manhã": "Nivelamento + Paulista",
      "I2 Manhã": "Aula livre",
      "B1 Tarde": "—",
      "B2 Tarde": "Aula junto com o Básico 1",
      "I1 Tarde": "Banana finalizando com paulista",
      "I2 Tarde": "—"
    },
    "professores": {
      "B2 Manhã": "TONY",
      "I1 Manhã": "GÃO",
      "I2 Manhã": "DAVIDSON",
      "I1 Tarde": "GÃO"
    }
  },
  {
    "data": "2023-04-22",
    "label": "sábado, 22/04",
    "temas": {
      "B1 Manhã": "Revisão",
      "B2 Manhã": "ESMERIL JUNTO",
      "I1 Manhã": "PAULISTA COM INVERTIDO TRÁS",
      "I2 Manhã": "bêbado",
      "B1 Tarde": "Variação do giro simples",
      "B2 Tarde": "Revisão",
      "I1 Tarde": "introdução ao esmeril",
      "I2 Tarde": "—"
    },
    "professores": {
      "B1 Manhã": "BIA",
      "I1 Manhã": "GÃO E BIA",
      "I2 Manhã": "DAVIDSON",
      "B1 Tarde": "JULY",
      "B2 Tarde": "TAZ",
      "I1 Tarde": "GÃO E JULY"
    }
  },
  {
    "data": "2023-04-29",
    "label": "sábado, 29/04",
    "temas": {
      "B1 Manhã": "variações de giro simples",
      "B2 Manhã": "esmeril junto",
      "I1 Manhã": "Paulista com invertido",
      "I2 Manhã": "paulista",
      "B1 Tarde": "—",
      "B2 Tarde": "—",
      "I1 Tarde": "esmeril (variações)",
      "I2 Tarde": "—"
    },
    "professores": {
      "B1 Manhã": "BIA",
      "B2 Manhã": "TONY",
      "I1 Manhã": "GÃO E BIA",
      "I2 Manhã": "DAVIDSON",
      "I1 Tarde": "GÃO"
    }
  },
  {
    "data": "2023-05-06",
    "label": "sábado, 06/05",
    "temas": {
      "B1 Manhã": "—",
      "B2 Manhã": "esmeril",
      "I1 Manhã": "Introdução esmeril aberto",
      "I2 Manhã": "Aula com DAVIDSON",
      "B1 Tarde": "—",
      "B2 Tarde": "NIVELAMENTO",
      "I1 Tarde": "esmeril; introdução pião",
      "I2 Tarde": "—"
    },
    "professores": {
      "B2 Manhã": "DAVIDSON",
      "I1 Manhã": "GÃO E BIA",
      "I2 Manhã": "DAVIDSON",
      "I1 Tarde": "GÃO"
    }
  },
  {
    "data": "2023-05-13",
    "label": "sábado, 13/05",
    "temas": {
      "B1 Manhã": "REVISÃO",
      "B2 Manhã": "cobrinha",
      "I1 Manhã": "esmeril abberto",
      "I2 Manhã": "—",
      "B1 Tarde": "manivela",
      "B2 Tarde": "invertido",
      "I1 Tarde": "pião",
      "I2 Tarde": "—"
    },
    "professores": {}
  },
  {
    "data": "2023-05-20",
    "label": "sábado, 20/05",
    "temas": {
      "B1 Manhã": "Nivelamento",
      "B2 Manhã": "Contratempo introdução",
      "I1 Manhã": "esmeril variações",
      "I2 Manhã": "—",
      "B1 Tarde": "nivelamento",
      "B2 Tarde": "revisão",
      "I1 Tarde": "pião",
      "I2 Tarde": "—"
    },
    "professores": {}
  },
  {
    "data": "2023-05-27",
    "label": "sábado, 27/05",
    "temas": {
      "B1 Manhã": "—",
      "B2 Manhã": "contratempo",
      "I1 Manhã": "técnicas de esmeril",
      "I2 Manhã": "—",
      "B1 Tarde": "—",
      "B2 Tarde": "—",
      "I1 Tarde": "técnicas de esmeril",
      "I2 Tarde": "—"
    },
    "professores": {
      "B2 Manhã": "TONY",
      "I1 Manhã": "BIA",
      "I1 Tarde": "BIA"
    }
  },
  {
    "data": "2023-06-03",
    "label": "sábado, 03/06",
    "temas": {
      "B1 Manhã": "Aula com BIA",
      "B2 Manhã": "contratempo",
      "I1 Manhã": "I1 e I2 Pião",
      "I2 Manhã": "—",
      "B1 Tarde": "manivela, giro dama e cavalheiro, variações",
      "B2 Tarde": "combo de giro",
      "I1 Tarde": "pião invertido",
      "I2 Tarde": "—"
    },
    "professores": {
      "B1 Manhã": "BIA",
      "B2 Manhã": "TONY",
      "I1 Manhã": "GÃO E BIA",
      "B1 Tarde": "MESSIAS",
      "B2 Tarde": "TAZ"
    }
  },
  {
    "data": "2023-06-10",
    "label": "sábado, 10/06",
    "temas": {
      "B1 Manhã": "—",
      "B2 Manhã": "contratempo",
      "I1 Manhã": "pião",
      "I2 Manhã": "—",
      "B1 Tarde": "giro do cavalheiro",
      "B2 Tarde": "banana-banana",
      "I1 Tarde": "pião + contratempo",
      "I2 Tarde": "—"
    },
    "professores": {}
  },
  {
    "data": "2023-06-17",
    "label": "sábado, 17/06",
    "temas": {
      "B1 Manhã": "—",
      "B2 Manhã": "contratempo",
      "I1 Manhã": "pião",
      "I2 Manhã": "—",
      "B1 Tarde": "—",
      "B2 Tarde": "avião",
      "I1 Tarde": "pião com travada",
      "I2 Tarde": "—"
    },
    "professores": {}
  },
  {
    "data": "2023-06-24",
    "label": "sábado, 24/06",
    "temas": {
      "B1 Manhã": "—",
      "B2 Manhã": "—",
      "I1 Manhã": "—",
      "I2 Manhã": "—",
      "B1 Tarde": "—",
      "B2 Tarde": "—",
      "I1 Tarde": "—",
      "I2 Tarde": "—"
    },
    "professores": {}
  },
  {
    "data": "2023-07-01",
    "label": "sábado, 01/07",
    "temas": {
      "B1 Manhã": "—",
      "B2 Manhã": "—",
      "I1 Manhã": "pião",
      "I2 Manhã": "—",
      "B1 Tarde": "—",
      "B2 Tarde": "—",
      "I1 Tarde": "sacada de perna",
      "I2 Tarde": "—"
    },
    "professores": {}
  },
  {
    "data": "2023-07-08",
    "label": "sábado, 08/07",
    "temas": {
      "B1 Manhã": "peso e contrapeso",
      "B2 Manhã": "contratempo",
      "I1 Manhã": "—",
      "I2 Manhã": "—",
      "B1 Tarde": "—",
      "B2 Tarde": "—",
      "I1 Tarde": "—",
      "I2 Tarde": "—"
    },
    "professores": {
      "B1 Manhã": "BIA",
      "B2 Manhã": "TONY"
    }
  },
  {
    "data": "2023-07-15",
    "label": "sábado, 15/07",
    "temas": {
      "B1 Manhã": "musicalidade",
      "B2 Manhã": "contratempo",
      "I1 Manhã": "pião com travada",
      "I2 Manhã": "-",
      "B1 Tarde": "—",
      "B2 Tarde": "—",
      "I1 Tarde": "caminhada e travada",
      "I2 Tarde": "—"
    },
    "professores": {}
  },
  {
    "data": "2023-07-22",
    "label": "sábado, 22/07",
    "temas": {
      "B1 Manhã": "—",
      "B2 Manhã": "—",
      "I1 Manhã": "—",
      "I2 Manhã": "—",
      "B1 Tarde": "—",
      "B2 Tarde": "—",
      "I1 Tarde": "—",
      "I2 Tarde": "—"
    },
    "professores": {}
  },
  {
    "data": "2023-07-29",
    "label": "sábado, 29/07",
    "temas": {
      "B1 Manhã": "—",
      "B2 Manhã": "—",
      "I1 Manhã": "—",
      "I2 Manhã": "—",
      "B1 Tarde": "—",
      "B2 Tarde": "—",
      "I1 Tarde": "—",
      "I2 Tarde": "—"
    },
    "professores": {}
  },
  {
    "data": "2023-08-05",
    "label": "sábado, 05/08",
    "temas": {
      "B1 Manhã": "—",
      "B2 Manhã": "invertido",
      "I1 Manhã": "caminhada + variações",
      "I2 Manhã": "—",
      "B1 Tarde": "-",
      "B2 Tarde": "Aula com TAZ",
      "I1 Tarde": "—",
      "I2 Tarde": "—"
    },
    "professores": {
      "B2 Manhã": "TONY",
      "I1 Manhã": "GÃO E BIA",
      "B2 Tarde": "TAZ"
    }
  },
  {
    "data": "2023-08-12",
    "label": "sábado, 12/08",
    "temas": {
      "B1 Manhã": "—",
      "B2 Manhã": "—",
      "I1 Manhã": "—",
      "I2 Manhã": "—",
      "B1 Tarde": "—",
      "B2 Tarde": "início de contratempo",
      "I1 Tarde": "Aula com GÃO",
      "I2 Tarde": "—"
    },
    "professores": {
      "B2 Tarde": "TAZ",
      "I1 Tarde": "GÃO"
    }
  },
  {
    "data": "2023-08-19",
    "label": "sábado, 19/08",
    "temas": {
      "B1 Manhã": "—",
      "B2 Manhã": "invertido",
      "I1 Manhã": "breck",
      "I2 Manhã": "—",
      "B1 Tarde": "—",
      "B2 Tarde": "contratempo",
      "I1 Tarde": "—",
      "I2 Tarde": "—"
    },
    "professores": {}
  },
  {
    "data": "2023-08-26",
    "label": "sábado, 26/08",
    "temas": {
      "B1 Manhã": "—",
      "B2 Manhã": "—",
      "I1 Manhã": "—",
      "I2 Manhã": "—",
      "B1 Tarde": "—",
      "B2 Tarde": "—",
      "I1 Tarde": "—",
      "I2 Tarde": "—"
    },
    "professores": {}
  },
  {
    "data": "2023-09-02",
    "label": "sábado, 02/09",
    "temas": {
      "B1 Manhã": "—",
      "B2 Manhã": "—",
      "I1 Manhã": "—",
      "I2 Manhã": "—",
      "B1 Tarde": "—",
      "B2 Tarde": "—",
      "I1 Tarde": "—",
      "I2 Tarde": "—"
    },
    "professores": {}
  },
  {
    "data": "2023-09-09",
    "label": "sábado, 09/09",
    "temas": {
      "B1 Manhã": "—",
      "B2 Manhã": "—",
      "I1 Manhã": "—",
      "I2 Manhã": "—",
      "B1 Tarde": "—",
      "B2 Tarde": "—",
      "I1 Tarde": "—",
      "I2 Tarde": "—"
    },
    "professores": {}
  },
  {
    "data": "2023-09-16",
    "label": "sábado, 16/09",
    "temas": {
      "B1 Manhã": "—",
      "B2 Manhã": "—",
      "I1 Manhã": "—",
      "I2 Manhã": "—",
      "B1 Tarde": "giro completo",
      "B2 Tarde": "Revisão",
      "I1 Tarde": "passo de perna",
      "I2 Tarde": "—"
    },
    "professores": {}
  },
  {
    "data": "2023-09-23",
    "label": "sábado, 23/09",
    "temas": {
      "B1 Manhã": "—",
      "B2 Manhã": "—",
      "I1 Manhã": "—",
      "I2 Manhã": "—",
      "B1 Tarde": "—",
      "B2 Tarde": "Nivelamento",
      "I1 Tarde": "Contratempo",
      "I2 Tarde": "—"
    },
    "professores": {}
  },
  {
    "data": "2023-09-30",
    "label": "sábado, 30/09",
    "temas": {
      "B1 Manhã": "—",
      "B2 Manhã": "—",
      "I1 Manhã": "—",
      "I2 Manhã": "—",
      "B1 Tarde": "—",
      "B2 Tarde": "invertido",
      "I1 Tarde": "—",
      "I2 Tarde": "—"
    },
    "professores": {}
  },
  {
    "data": "2023-10-07",
    "label": "sábado, 07/10",
    "temas": {
      "B1 Manhã": "—",
      "B2 Manhã": "—",
      "I1 Manhã": "—",
      "I2 Manhã": "—",
      "B1 Tarde": "—",
      "B2 Tarde": "invertido + giro gira",
      "I1 Tarde": "—",
      "I2 Tarde": "—"
    },
    "professores": {}
  },
  {
    "data": "2023-10-14",
    "label": "sábado, 14/10",
    "temas": {
      "B1 Manhã": "—",
      "B2 Manhã": "—",
      "I1 Manhã": "—",
      "I2 Manhã": "—",
      "B1 Tarde": "—",
      "B2 Tarde": "—",
      "I1 Tarde": "—",
      "I2 Tarde": "—"
    },
    "professores": {}
  },
  {
    "data": "2023-10-21",
    "label": "sábado, 21/10",
    "temas": {
      "B1 Manhã": "—",
      "B2 Manhã": "—",
      "I1 Manhã": "—",
      "I2 Manhã": "—",
      "B1 Tarde": "—",
      "B2 Tarde": "—",
      "I1 Tarde": "—",
      "I2 Tarde": "—"
    },
    "professores": {}
  },
  {
    "data": "2023-10-28",
    "label": "sábado, 28/10",
    "temas": {
      "B1 Manhã": "—",
      "B2 Manhã": "—",
      "I1 Manhã": "—",
      "I2 Manhã": "—",
      "B1 Tarde": "—",
      "B2 Tarde": "—",
      "I1 Tarde": "—",
      "I2 Tarde": "—"
    },
    "professores": {}
  },
  {
    "data": "2023-11-04",
    "label": "sábado, 04/11",
    "temas": {
      "B1 Manhã": "—",
      "B2 Manhã": "—",
      "I1 Manhã": "—",
      "I2 Manhã": "—",
      "B1 Tarde": "—",
      "B2 Tarde": "—",
      "I1 Tarde": "—",
      "I2 Tarde": "—"
    },
    "professores": {}
  },
  {
    "data": "2023-11-11",
    "label": "sábado, 11/11",
    "temas": {
      "B1 Manhã": "—",
      "B2 Manhã": "—",
      "I1 Manhã": "—",
      "I2 Manhã": "—",
      "B1 Tarde": "—",
      "B2 Tarde": "—",
      "I1 Tarde": "—",
      "I2 Tarde": "—"
    },
    "professores": {}
  },
  {
    "data": "2023-11-18",
    "label": "sábado, 18/11",
    "temas": {
      "B1 Manhã": "—",
      "B2 Manhã": "—",
      "I1 Manhã": "—",
      "I2 Manhã": "—",
      "B1 Tarde": "—",
      "B2 Tarde": "—",
      "I1 Tarde": "—",
      "I2 Tarde": "—"
    },
    "professores": {}
  },
  {
    "data": "2023-11-25",
    "label": "sábado, 25/11",
    "temas": {
      "B1 Manhã": "—",
      "B2 Manhã": "—",
      "I1 Manhã": "—",
      "I2 Manhã": "—",
      "B1 Tarde": "—",
      "B2 Tarde": "—",
      "I1 Tarde": "—",
      "I2 Tarde": "—"
    },
    "professores": {}
  },
  {
    "data": "2023-12-02",
    "label": "sábado, 02/12",
    "temas": {
      "B1 Manhã": "—",
      "B2 Manhã": "—",
      "I1 Manhã": "—",
      "I2 Manhã": "—",
      "B1 Tarde": "—",
      "B2 Tarde": "—",
      "I1 Tarde": "—",
      "I2 Tarde": "—"
    },
    "professores": {}
  },
  {
    "data": "2023-12-09",
    "label": "sábado, 09/12",
    "temas": {
      "B1 Manhã": "—",
      "B2 Manhã": "—",
      "I1 Manhã": "—",
      "I2 Manhã": "—",
      "B1 Tarde": "—",
      "B2 Tarde": "—",
      "I1 Tarde": "—",
      "I2 Tarde": "—"
    },
    "professores": {}
  },
  {
    "data": "2023-12-16",
    "label": "sábado, 16/12",
    "temas": {
      "B1 Manhã": "—",
      "B2 Manhã": "—",
      "I1 Manhã": "—",
      "I2 Manhã": "—",
      "B1 Tarde": "—",
      "B2 Tarde": "—",
      "I1 Tarde": "—",
      "I2 Tarde": "—"
    },
    "professores": {}
  },
  {
    "data": "2023-12-23",
    "label": "sábado, 23/12",
    "temas": {
      "B1 Manhã": "—",
      "B2 Manhã": "—",
      "I1 Manhã": "—",
      "I2 Manhã": "—",
      "B1 Tarde": "—",
      "B2 Tarde": "—",
      "I1 Tarde": "—",
      "I2 Tarde": "—"
    },
    "professores": {}
  },
  {
    "data": "2023-12-30",
    "label": "sábado, 30/12",
    "temas": {
      "B1 Manhã": "—",
      "B2 Manhã": "—",
      "I1 Manhã": "—",
      "I2 Manhã": "—",
      "B1 Tarde": "—",
      "B2 Tarde": "—",
      "I1 Tarde": "—",
      "I2 Tarde": "—"
    },
    "professores": {}
  }
];

export function buildInitialCronogramas(aulasList: Aula[]): Cronograma[] {
  const result: Cronograma[] = [];
  annualScheduleRows.forEach((row) => {
    Object.entries(row.temas).forEach(([turmaNome, tema]) => {
      const target = aulasList.find(
        (a) => a.nome.trim().toLowerCase() === turmaNome.trim().toLowerCase()
      );
      if (target) {
        const prof = row.professores?.[turmaNome];
        result.push({
          id: `crono_${row.data}_${target.id}`,
          aula_id: target.id,
          data_aula: row.data,
          tema_aula: tema,
          observacoes: prof ? `Prof: ${prof}` : undefined
        });
      }
    });
  });
  return result;
}
