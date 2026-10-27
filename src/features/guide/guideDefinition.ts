/**
 * Definição versionada do guia de autorregulação (RF5).
 * Regras: no máximo 3 opções fixas por estado e nenhum campo de texto livre.
 * É dado puro (JSON-serializável): o back-end poderá servir esta mesma estrutura.
 */

export type GuideAction = 'OPEN_CONTACTS'

export interface GuideOption {
  id: string
  label: string
  next: string
  action?: GuideAction
}

export interface GuideStateDef {
  id: string
  title: string
  body: string
  options?: GuideOption[]
  /** Etapa temporizada: avança sozinha para `next` quando o prazo vence. */
  timer?: { seconds: number; next: string }
  terminal?: boolean
}

export interface GuideDefinition {
  id: string
  version: number
  initial: string
  states: Record<string, GuideStateDef>
}

export const GUIDE_DEFINITION: GuideDefinition = {
  id: 'autorregulacao-basico',
  version: 1,
  initial: 'inicio',
  states: {
    inicio: {
      id: 'inicio',
      title: 'O que está pesando agora?',
      body: 'Escolha o que mais se aproxima. Não precisa ser exato.',
      options: [
        { id: 'sobrecarga', label: 'Estou sobrecarregado', next: 'respirar' },
        { id: 'impulso', label: 'Quero agir por impulso', next: 'pausa' },
        { id: 'urgencia', label: 'Algo parece urgente', next: 'priorizar' },
      ],
    },
    respirar: {
      id: 'respirar',
      title: 'Respire por 1 minuto',
      body: 'Inspire contando até 4. Solte contando até 6. Repita até o tempo acabar.',
      timer: { seconds: 60, next: 'depois_respirar' },
      options: [{ id: 'pular', label: 'Pular esta etapa', next: 'depois_respirar' }],
    },
    depois_respirar: {
      id: 'depois_respirar',
      title: 'Como está agora?',
      body: 'Sem certo ou errado.',
      options: [
        { id: 'melhor', label: 'Um pouco melhor', next: 'passo_pequeno' },
        { id: 'igual', label: 'Na mesma', next: 'contato' },
      ],
    },
    pausa: {
      id: 'pausa',
      title: 'Espere 30 segundos',
      body: 'Antes de agir, só espere. Pode olhar ao redor e nomear 3 objetos.',
      timer: { seconds: 30, next: 'depois_pausa' },
      options: [{ id: 'pular', label: 'Pular esta etapa', next: 'depois_pausa' }],
    },
    depois_pausa: {
      id: 'depois_pausa',
      title: 'Ainda quer agir?',
      body: 'Passou um tempinho. Veja como está a vontade.',
      options: [
        { id: 'sim', label: 'Sim, com calma', next: 'passo_pequeno' },
        { id: 'nao', label: 'Não mais', next: 'fim' },
      ],
    },
    priorizar: {
      id: 'priorizar',
      title: 'Precisa ser resolvido nos próximos 10 minutos?',
      body: 'Muita coisa parece urgente e pode esperar.',
      options: [
        { id: 'sim', label: 'Sim', next: 'passo_pequeno' },
        { id: 'nao', label: 'Pode esperar', next: 'guardar' },
      ],
    },
    guardar: {
      id: 'guardar',
      title: 'Deixe para depois',
      body: 'Registre em Eventos ou em um lembrete e volte a isso mais tarde.',
      options: [{ id: 'ok', label: 'Combinado', next: 'fim' }],
    },
    passo_pequeno: {
      id: 'passo_pequeno',
      title: 'Escolha um passo pequeno',
      body: 'Só o próximo passo, algo que leve poucos minutos. Faça agora.',
      options: [
        { id: 'fiz', label: 'Fiz', next: 'fim' },
        { id: 'ajuda', label: 'Preciso de ajuda', next: 'contato' },
      ],
    },
    contato: {
      id: 'contato',
      title: 'Falar com alguém pode ajudar',
      body: 'Escolha um dos seus contatos de confiança.',
      options: [
        { id: 'abrir', label: 'Ver meus contatos', next: 'fim', action: 'OPEN_CONTACTS' },
        { id: 'voltar', label: 'Recomeçar', next: 'inicio' },
      ],
    },
    fim: {
      id: 'fim',
      title: 'Ciclo concluído',
      body: 'Você chegou ao fim. Pode refazer quando quiser.',
      terminal: true,
    },
  },
}
