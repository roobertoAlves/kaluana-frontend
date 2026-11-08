import type { GuideDefinition } from './guideMachine.ts'

export const OVERLOAD_GUIDE: GuideDefinition = {
  id: 'sobrecarga',
  version: 1,
  title: 'Quando tudo parece demais',
  summary: 'Poucos passos para parar, diminuir o que está chegando até você e escolher o próximo passo pequeno.',
  start: 'inicio',
  steps: {
    inicio: {
      id: 'inicio',
      text: 'O que está acontecendo agora?',
      options: [
        {
          id: 'muita-coisa',
          label: 'Muita coisa ao mesmo tempo',
          next: 'pausa',
        },
        { id: 'ambiente', label: 'Barulho ou gente demais', next: 'ambiente' },
        { id: 'comecar', label: 'Não sei por onde começar', next: 'passo' },
      ],
    },
    pausa: {
      id: 'pausa',
      text: 'Antes de decidir qualquer coisa, que tal parar um pouco?',
      options: [
        {
          id: 'respirar',
          label: 'Respirar por alguns minutos',
          next: 'depois',
          action: 'OPEN_RELAX',
        },
        { id: 'agua', label: 'Beber água e voltar', next: 'depois' },
      ],
      defaultOption: 'agua',
      timeoutSec: 120,
    },
    ambiente: {
      id: 'ambiente',
      text: 'Dá para diminuir o que está chegando até você?',
      options: [
        { id: 'lugar', label: 'Ir para um lugar mais calmo', next: 'depois' },
        {
          id: 'som',
          label: 'Colocar um som de fundo',
          next: 'depois',
          action: 'OPEN_SOUNDS',
        },
        { id: 'nao-da', label: 'Agora não dá', next: 'pausa' },
      ],
    },
    passo: {
      id: 'passo',
      text: 'Escolha só a próxima coisa pequena.',
      options: [
        {
          id: 'tarefas',
          label: 'Ver minhas tarefas de hoje',
          next: 'fim',
          action: 'OPEN_TASKS',
        },
        { id: 'pausa-antes', label: 'Fazer uma pausa antes', next: 'pausa' },
      ],
    },
    depois: {
      id: 'depois',
      text: 'E agora, como prefere seguir?',
      options: [
        { id: 'voltar', label: 'Voltar ao que eu estava fazendo', next: 'fim' },
        {
          id: 'contato',
          label: 'Falar com alguém de confiança',
          next: 'fim',
          action: 'OPEN_CONTACTS',
        },
        {
          id: 'proximo',
          label: 'Escolher o próximo passo pequeno',
          next: 'passo',
        },
      ],
      defaultOption: 'voltar',
      timeoutSec: 180,
    },
    fim: {
      id: 'fim',
      text: 'Pronto. Você pode voltar a este guia sempre que precisar.',
      options: [],
      final: true,
    },
  },
}

export const GUIDES: GuideDefinition[] = [OVERLOAD_GUIDE]
