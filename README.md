# 4ANDAR — Gestão Escolar para Escolas de Dança (Forró)

> **Missão:** Gestão escolar completa para escolas de dança, focada em forró, abrangendo aulas, pagamentos, nivelamento e comunicação.

---

## 1. Visão Geral

O **4ANDAR** é uma plataforma de gestão escolar voltada a escolas de dança (com foco em forró). Organiza turmas, cronograma de aulas, presença, pagamentos, nivelamento técnico, eventos, avisos e comunicação — com perfis distintos para **equipe** (professores/admin) e **alunos**.

---

## 2. Perfis de Usuário e Permissões

- **Equipe / Admin:**
  - Gerenciamento completo de alunos (cadastro, edição, mensalidade, vencimento).
  - Gerenciamento de turmas, professores e cronograma semanal de temas.
  - Confirmação e controle de faltas/presenças + exportação CSV.
  - Registro e controle de pagamentos (PIX, dinheiro, cartão) e monitoramento de inadimplência.
  - Avaliação de nivelamento técnico com ficha estruturada.
  - Gestão de eventos e mural de avisos.
  - Busca global rápida de alunos no topo da interface.
  - Sincronização da grade de aulas com o Google Calendar pessoal do professor.
- **Aluno:**
  - Visualização de suas aulas e turmas recomendadas de acordo com seu nível (B1, B2, I1, I2).
  - Solicitação de presença na próxima aula do seu nível.
  - Consulta de histórico financeiro e status de mensalidades.
  - Agendamento de sessão de nivelamento e consulta de feedbacks/histórico.
  - Visualização de mural de avisos e agenda de eventos da escola.

---

## 3. Modelo de Entidades (Banco de Dados)

| Entidade | Campos Principais | Finalidade |
|---|---|---|
| **Aluno** | `id`, `user_id`, `nome`, `telefone`, `email`, `nivel_atual` (B1, B2, I1, I2), `papel` (Condutor/Conduzido/Ambos), `mensalidade_valor`, `dia_vencimento`, `data_matricula`, `data_inicio_nivel`, `status` | Cadastro dos alunos |
| **Equipe** | `id`, `user_id`, `nome`, `email`, `telefone`, `papel_equipe` (Professor/Admin), `google_calendar_token`, `ativo` | Professores e administradores |
| **Aula** (Turma) | `id`, `nome`, `nivel` (B1, B2, I1, I2), `turno` (Manhã, Tarde, Noite), `dia_semana`, `horario_inicio`, `horario_fim`, `equipe_id` (Professor) | Turmas regulares |
| **Cronograma** | `id`, `aula_id`, `data_aula`, `tema_aula`, `observacoes` | Planejamento semanal com tema por data/turma |
| **Presenca** | `id`, `aluno_id`, `aula_id`, `data_aula`, `status` (pendente, confirmada, ausente), `confirmado_por` | Controle de chamada e solicitações |
| **Pagamento** | `id`, `aluno_id`, `valor`, `data_pagamento`, `data_vencimento`, `metodo` (PIX, dinheiro, cartao), `tipo` (mensalidade, avulso), `status` (pago, pendente, atrasado), `comprovante_url` | Gestão financeira |
| **NivelamentoSessao** | `id`, `aluno_id`, `data_agendada`, `nivel_atual`, `nivel_alvo`, `papel` (Condutor, Conduzido), `avaliador_aulao`, `avaliador_danca`, `avaliador_observa`, `status` (Agendado, Concluído, Cancelado), `resultado` (Aprovado, Reprovado), `feedback_aulao`, `feedback_danca`, `feedback_geral` | Sessões de teste técnico |
| **CriterioNivelamento** | `id`, `nivel`, `secao` (Aulão, Dança a dois), `criterio`, `descricao`, `peso` | Critérios técnicos de pontuação |
| **Evento** | `id`, `titulo`, `descricao`, `data_evento`, `horario`, `local`, `foto_url`, `preco`, `vagas_limite`, `vagas_preenchidas` | Festas, workshops, quadrilhas, shows |
| **Aviso** | `id`, `titulo`, `conteudo`, `data_publicacao`, `link_url`, `link_texto`, `fixado`, `autor_id` | Mural de avisos da escola |

---

## 4. Módulos do Sistema

### 4.1 Aulas & Cronograma
- Cadastro de turmas categorizadas por níveis do forró:
  - **B1**: Básico 1
  - **B2**: Básico 2
  - **I1**: Intermediário 1
  - **I2**: Intermediário 2
- Matriz interativa de planejamento semanal (Data × Turma) com edição inline do tema da aula.
- Associação de professor responsável da equipe.

### 4.2 Presença & Frequência
- **Fluxo do Aluno:** Solicita presença para a próxima aula do seu nível.
- **Fluxo da Equipe:** Lista de presença diária com botões rápidos (Confirmar / Ausente).
- **Exportação:** Download da lista de presença em `.csv` com filtros por turma e data.

### 4.3 Gestão Financeira (Pagamentos)
- Registro de mensalidades e avulsos (PIX, Dinheiro, Cartão).
- Painel com filtros (pagos, pendentes, atrasados).
- Workflow de régua de cobrança: lembrete por e-mail a vencer (≤ 3 dias) ou vencido.

### 4.4 Nivelamento Técnico
- Agendamento de avaliação pelos alunos (selecionando papel: condutor ou conduzido e nível alvo).
- Ficha de avaliação estruturada com 2 etapas fundamentais:
  1. **Aulão:** Ritmo, postura, base, tempo musical.
  2. **Dança a dois:** Condução/resposta, conexão, dinâmica de salão, repertório do nível.
- Resultado com aprovação/reprovação e feedback descritivo.
- Na aprovação, atualização automática do `nivel_atual` e `data_inicio_nivel` do aluno.

### 4.5 Eventos & Avisos
- Feed de avisos da escola com suporte a links (ex.: links para grupos de WhatsApp).
- Catálogo de eventos (workshops, festas, bailes de forró) com controle de lotação/vagas.

### 4.6 Integrações & Ferramentas de Produtividade
- **Busca Global Instantânea:** Atalho/input no topo para busca de alunos por nome ou telefone com acesso direto à ficha do aluno.
- **Google Calendar:** Conexão OAuth com a conta Google do professor para sincronização automática das aulas atribuídas a ele na semana/mês.

---

## 5. Rotas da Aplicação

| Rota | Descrição | Perfil |
|---|---|---|
| `/` ou `/home` | Dashboard inicial com resumo e atalhos | Todos |
| `/cronograma` | Grade semanal de aulas e temas | Todos (Edição: Equipe) |
| `/aulas` | Gestão de turmas e horários | Equipe |
| `/presenca` | Confirmação de presença e lista diária | Equipe |
| `/proxima-aula` | Confirmação rápida de presença na próxima aula | Aluno |
| `/frequencia` | Histórico e estatísticas de frequência | Equipe / Aluno |
| `/alunos` | Cadastro e gestão de alunos | Equipe |
| `/pagamentos` | Painel financeiro da escola | Equipe |
| `/meus-pagamentos` | Extrato de mensalidades do aluno | Aluno |
| `/nivelamento` | Avaliação e gestão de sessões de nivelamento | Equipe |
| `/agendamento-nivelamento` | Agendar teste de nivelamento | Aluno |
| `/meus-nivelamentos` | Resultados e histórico de nivelamentos | Aluno |
| `/eventos` | Agenda de eventos e inscrições | Todos |
| `/avisos` | Mural de notícias | Todos |
| `/equipe` | Cadastro de professores e staff | Equipe |
| `/agenda-google` | Sincronização com Google Calendar | Professores |
| `/perfil` | Dados cadastrais do usuário | Todos |
