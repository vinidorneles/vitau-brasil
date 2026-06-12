/**
 * VitaU — catálogos de conteúdo estático (sem backend).
 * Mindfulness (US07), dicas nutricionais (US13) e profissionais parceiros (US14).
 */

// ---------------- Mindfulness (US07) ----------------

export type MindfulnessExercise = {
  id: string;
  title: string;
  category: string;
  durationSec: number;
  description: string;
  steps?: string[];
  /** Padrão de respiração (segundos) — guia a animação do player. */
  breathing?: { inhale: number; hold: number; exhale: number; holdOut?: number };
  /** Faixa de áudio ambiente opcional (reproduzida durante o exercício). */
  audioUrl?: string;
};

export const MINDFULNESS_CATEGORIES = ['Respiração', 'Meditação', 'Foco', 'Sono'] as const;

export const MINDFULNESS: MindfulnessExercise[] = [
  {
    id: 'mf-resp-478',
    title: 'Respiração 4-7-8',
    category: 'Respiração',
    durationSec: 120,
    description:
      'Técnica clássica para acalmar o sistema nervoso antes de uma prova ou apresentação.',
    breathing: { inhale: 4, hold: 7, exhale: 8 },
    steps: [
      'Sente-se com a coluna ereta e relaxe os ombros.',
      'Inspire pelo nariz contando até 4.',
      'Segure o ar contando até 7.',
      'Expire lentamente pela boca contando até 8.',
    ],
  },
  {
    id: 'mf-resp-box',
    title: 'Respiração quadrada',
    category: 'Respiração',
    durationSec: 180,
    description: 'Equilíbrio e foco em 4 tempos iguais — ótima para reduzir a ansiedade.',
    breathing: { inhale: 4, hold: 4, exhale: 4, holdOut: 4 },
    steps: [
      'Inspire em 4 tempos.',
      'Segure em 4 tempos.',
      'Expire em 4 tempos.',
      'Permaneça vazio em 4 tempos e repita.',
    ],
  },
  {
    id: 'mf-med-corpo',
    title: 'Escaneamento corporal',
    category: 'Meditação',
    durationSec: 300,
    description: 'Meditação guiada que percorre o corpo liberando tensões acumuladas no dia.',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    steps: [
      'Deite-se confortavelmente e feche os olhos.',
      'Leve a atenção aos pés e suba lentamente pelo corpo.',
      'Observe cada região sem julgar, apenas relaxando.',
    ],
  },
  {
    id: 'mf-med-presenca',
    title: 'Atenção plena de 5 minutos',
    category: 'Meditação',
    durationSec: 300,
    description: 'Volte ao momento presente observando a respiração e os sons ao redor.',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
  },
  {
    id: 'mf-foco-pomodoro',
    title: 'Preparação para estudar',
    category: 'Foco',
    durationSec: 90,
    description: 'Centre a mente antes de iniciar um bloco de estudos concentrado.',
    breathing: { inhale: 4, hold: 2, exhale: 6 },
  },
  {
    id: 'mf-sono-relax',
    title: 'Relaxamento para dormir',
    category: 'Sono',
    durationSec: 240,
    description: 'Desacelere o corpo e a mente para uma noite de sono mais tranquila.',
    breathing: { inhale: 4, hold: 0, exhale: 8 },
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
  },
];

// ---------------- Dicas nutricionais (US13) ----------------

export type NutritionTip = {
  id: string;
  title: string;
  category: string;
  readMin: number; // tempo estimado de leitura (min)
  body: string;
};

export const NUTRITION_CATEGORIES = ['Rotina', 'Energia', 'Hidratação', 'Economia'] as const;

export const NUTRITION_TIPS: NutritionTip[] = [
  {
    id: 'nt-cafe',
    title: 'Não pule o café da manhã',
    category: 'Rotina',
    readMin: 2,
    body:
      'Começar o dia sem comer derruba a concentração nas primeiras aulas. Combine uma fonte de carboidrato (pão integral, aveia, fruta) com uma de proteína (ovo, iogurte, queijo). Se a manhã é corrida, deixe algo prático separado na noite anterior.',
  },
  {
    id: 'nt-lanche',
    title: 'Lanches inteligentes entre aulas',
    category: 'Energia',
    readMin: 3,
    body:
      'Para evitar o pico e a queda de energia, prefira castanhas, frutas, iogurte natural ou uma barra de cereais com pouco açúcar. Eles seguram a fome sem causar sonolência no meio da tarde de estudos.',
  },
  {
    id: 'nt-agua',
    title: 'Hidratação também é desempenho',
    category: 'Hidratação',
    readMin: 2,
    body:
      'A desidratação leve já reduz atenção e memória. Tenha sempre uma garrafa por perto e use o registro de ingestão hídrica do VitaU para acompanhar sua meta diária. Café e energéticos não substituem água.',
  },
  {
    id: 'nt-marmita',
    title: 'Marmita: economia e saúde juntas',
    category: 'Economia',
    readMin: 4,
    body:
      'Cozinhar em maior quantidade e congelar porções economiza dinheiro e garante refeições equilibradas na semana de provas. Monte o prato com metade de vegetais, um quarto de proteína e um quarto de carboidrato.',
  },
  {
    id: 'nt-cafeina',
    title: 'Cafeína sem exagero',
    category: 'Energia',
    readMin: 3,
    body:
      'A cafeína ajuda no foco, mas em excesso atrapalha o sono e aumenta a ansiedade. Evite consumir após o fim da tarde e observe como o seu corpo reage — o registro de sono do app ajuda a perceber o impacto.',
  },
  {
    id: 'nt-noite',
    title: 'Comer bem na véspera da prova',
    category: 'Rotina',
    readMin: 2,
    body:
      'Refeições muito pesadas à noite prejudicam o sono e, com ele, a memória. Prefira algo leve e equilibrado e durma bem: estudar descansado rende mais do que virar a noite com o estômago cheio.',
  },
];

// ---------------- Profissionais parceiros — VitaU+ (US14) ----------------

export type Professional = {
  id: string;
  name: string;
  specialty: string;
  crp: string; // registro no Conselho Regional de Psicologia
  bio: string;
  /** Disponibilidade relativa: offsets de dias a partir de hoje + horários. */
  slotDayOffsets: number[];
  times: string[];
};

export const PROFESSIONALS: Professional[] = [
  {
    id: 'pro-mariana',
    name: 'Dra. Mariana Lopes',
    specialty: 'Ansiedade e rotina acadêmica',
    crp: 'CRP 08/12345',
    bio: 'Psicóloga clínica com foco em estudantes universitários e manejo de ansiedade.',
    slotDayOffsets: [1, 2, 4],
    times: ['09:00', '14:00', '17:00'],
  },
  {
    id: 'pro-rafael',
    name: 'Dr. Rafael Andrade',
    specialty: 'Estresse e burnout',
    crp: 'CRP 08/67890',
    bio: 'Atua com prevenção ao esgotamento e organização da vida acadêmica e pessoal.',
    slotDayOffsets: [1, 3, 5],
    times: ['10:00', '15:30', '18:00'],
  },
  {
    id: 'pro-juliana',
    name: 'Dra. Juliana Prado',
    specialty: 'Sono e bem-estar emocional',
    crp: 'CRP 08/54321',
    bio: 'Especialista em higiene do sono e regulação emocional para jovens adultos.',
    slotDayOffsets: [2, 3, 6],
    times: ['08:30', '13:00', '16:00'],
  },
];

export const MEAL_LABELS: Record<string, { label: string; icon: string }> = {
  cafe: { label: 'Café da manhã', icon: 'coffee' },
  almoco: { label: 'Almoço', icon: 'sun' },
  jantar: { label: 'Jantar', icon: 'moon' },
  lanche: { label: 'Lanche', icon: 'box' },
};
