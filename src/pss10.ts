/**
 * VitaU — escala PSS-10 (Perceived Stress Scale) adaptada ao contexto universitário.
 * 10 itens, escala Likert 0..4. Itens 4, 5, 7 e 8 têm pontuação invertida.
 * Total 0..40 → baixo (0-13), moderado (14-26), alto (27-40).
 */
import { StressLevel } from './storage';

export const LIKERT = ['Nunca', 'Quase nunca', 'Às vezes', 'Quase sempre', 'Sempre'];

export const QUESTIONS: string[] = [
  'ficou abalado(a) por algo que aconteceu de forma inesperada nos estudos ou na vida?',
  'sentiu que não conseguiu controlar as coisas importantes da sua rotina acadêmica?',
  'se sentiu nervoso(a) ou estressado(a) por causa da faculdade?',
  'se sentiu confiante na sua capacidade de lidar com seus problemas e tarefas acadêmicas?',
  'sentiu que as coisas na faculdade estavam acontecendo conforme o esperado?',
  'achou que não daria conta de todas as tarefas, provas e prazos?',
  'conseguiu controlar as irritações do seu dia a dia acadêmico?',
  'sentiu que estava no controle dos seus estudos?',
  'ficou irritado(a) por situações dos estudos que estavam fora do seu controle?',
  'sentiu que as dificuldades acadêmicas se acumularam a ponto de não conseguir superá-las?',
];

/** Índices (base 0) das questões com pontuação invertida. */
const REVERSED = new Set([3, 4, 6, 7]);

export function scorePSS10(answers: number[]): number {
  return answers.reduce((sum, a, i) => sum + (REVERSED.has(i) ? 4 - a : a), 0);
}

export function classify(total: number): StressLevel {
  if (total <= 13) return 'baixo';
  if (total <= 26) return 'moderado';
  return 'alto';
}

export const TIPS: Record<StressLevel, string> = {
  baixo:
    'Seu nível de estresse percebido está sob controle. Continue mantendo bons hábitos de ' +
    'sono, organização e pausas — e use o VitaU para monitorar regularmente.',
  moderado:
    'Você apresenta estresse moderado. Experimente dividir as tarefas em blocos menores, ' +
    'incluir pausas reais entre os estudos e cuidar do sono. Reavalie em uma semana.',
  alto:
    'Seu estresse percebido está elevado. Priorize o essencial, converse com pessoas de ' +
    'confiança e considere apoio do serviço de psicologia da sua universidade. Você não ' +
    'precisa lidar com tudo sozinho(a).',
};
