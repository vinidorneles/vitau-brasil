/**
 * VitaU — camada de persistência local (AsyncStorage).
 * MVP acadêmico: dados ficam no dispositivo, sem backend.
 * Obs.: senhas são guardadas em texto apenas por simplicidade do MVP —
 * em produção use hash + backend seguro.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserRole = 'student' | 'admin';
export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

export type MoodEntry = {
  date: string; // YYYY-MM-DD
  score: number; // 1..5
  note?: string;
  createdAt: string;
};

export type StressLevel = 'baixo' | 'moderado' | 'alto';
export type StressEntry = {
  date: string;
  total: number; // 0..40
  level: StressLevel;
  answers: number[]; // 10 respostas (0..4)
  createdAt: string;
};

export type SleepEntry = {
  date: string;
  bedtime: string; // HH:MM
  wake: string; // HH:MM
  durationMin: number;
  quality: number | null; // 1..5 opcional
  createdAt: string;
};

const K = {
  users: '@vitau/users',
  session: '@vitau/session',
  mood: (u: string) => `@vitau/mood/${u}`,
  stress: (u: string) => `@vitau/stress/${u}`,
  sleep: (u: string) => `@vitau/sleep/${u}`,
};

async function getJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function setJSON(key: string, value: unknown): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

/** Data local no formato YYYY-MM-DD. */
export function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Rótulo curto da data (ex.: 21/05). */
export function shortDate(dateKey: string): string {
  const [, m, d] = dateKey.split('-');
  return `${d}/${m}`;
}

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ---------- usuários e sessão ----------

export async function getUsers(): Promise<User[]> {
  const users = await getJSON<User[]>(K.users, []);
  // normaliza registros antigos sem o campo role
  return users.map((u) => ({ ...u, role: u.role ?? 'student' }));
}

export async function createUser(
  name: string,
  email: string,
  password: string,
  role: UserRole = 'student',
): Promise<User> {
  const users = await getUsers();
  const user: User = { id: uid(), name, email: email.toLowerCase(), password, role };
  users.push(user);
  await setJSON(K.users, users);
  return user;
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const users = await getUsers();
  return users.find((u) => u.email === email.toLowerCase());
}

export async function setSession(userId: string | null): Promise<void> {
  if (userId) await AsyncStorage.setItem(K.session, userId);
  else await AsyncStorage.removeItem(K.session);
}

export async function getSessionUser(): Promise<User | null> {
  const id = await AsyncStorage.getItem(K.session);
  if (!id) return null;
  const users = await getUsers();
  return users.find((u) => u.id === id) ?? null;
}

// ---------- humor (US04) ----------

export async function getMoods(userId: string): Promise<MoodEntry[]> {
  const list = await getJSON<MoodEntry[]>(K.mood(userId), []);
  return list.sort((a, b) => b.date.localeCompare(a.date));
}

export async function saveMood(userId: string, score: number, note: string): Promise<void> {
  const list = await getJSON<MoodEntry[]>(K.mood(userId), []);
  const date = todayKey();
  const entry: MoodEntry = { date, score, note: note.trim() || undefined, createdAt: new Date().toISOString() };
  const idx = list.findIndex((m) => m.date === date);
  if (idx >= 0) list[idx] = entry; // um registro por dia
  else list.push(entry);
  await setJSON(K.mood(userId), list);
}

// ---------- estresse PSS-10 (US05) ----------

export async function getStress(userId: string): Promise<StressEntry[]> {
  const list = await getJSON<StressEntry[]>(K.stress(userId), []);
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function saveStress(
  userId: string,
  total: number,
  level: StressLevel,
  answers: number[],
): Promise<void> {
  const list = await getJSON<StressEntry[]>(K.stress(userId), []);
  list.push({ date: todayKey(), total, level, answers, createdAt: new Date().toISOString() });
  await setJSON(K.stress(userId), list);
}

// ---------- sono (US08) ----------

export async function getSleep(userId: string): Promise<SleepEntry[]> {
  const list = await getJSON<SleepEntry[]>(K.sleep(userId), []);
  return list.sort((a, b) => b.date.localeCompare(a.date));
}

export async function saveSleep(
  userId: string,
  bedtime: string,
  wake: string,
  durationMin: number,
  quality: number | null,
): Promise<void> {
  const list = await getJSON<SleepEntry[]>(K.sleep(userId), []);
  const date = todayKey();
  const entry: SleepEntry = { date, bedtime, wake, durationMin, quality, createdAt: new Date().toISOString() };
  const idx = list.findIndex((s) => s.date === date);
  if (idx >= 0) list[idx] = entry;
  else list.push(entry);
  await setJSON(K.sleep(userId), list);
}

// ---------- dados de demonstração ----------

/** Credenciais da conta de demonstração (exibidas na tela de login). */
export const DEMO_LOGIN = { email: 'ana@vitau.app', password: 'estudante123' };

/** Credenciais da conta de coordenação (painel administrativo). */
export const DEMO_ADMIN = { email: 'admin@vitau.app', password: 'admin1234' };

/** Garante que a conta de coordenação exista (idempotente). */
async function ensureAdmin(): Promise<void> {
  const admin = await findUserByEmail(DEMO_ADMIN.email);
  if (!admin) {
    await createUser('Coordenação VitaU', DEMO_ADMIN.email, DEMO_ADMIN.password, 'admin');
  }
}

function dateAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return todayKey(d);
}

function isoAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(21, 30, 0, 0);
  return d.toISOString();
}

/**
 * Popula contas + histórico de exemplo no primeiro uso, para que o app
 * possa ser explorado sem precisar cadastrar nada. Idempotente.
 */
export async function seedDemoData(): Promise<void> {
  await ensureAdmin();
  const existing = await getUsers();
  if (existing.some((u) => u.role !== 'admin')) return;

  const ana = await createUser('Ana Beatriz', 'ana@vitau.app', 'estudante123');
  await createUser('Lucas Martins', 'lucas@vitau.app', 'estudante123');

  const moodSeed: Array<[number, number, string?]> = [
    [6, 3, 'Semana de provas começando.'],
    [5, 2],
    [4, 4, 'Estudei com o grupo, rendeu bem.'],
    [3, 3],
    [2, 4],
    [1, 5, 'Entreguei o trabalho final! 🎉'],
    [0, 4],
  ];
  const moods: MoodEntry[] = moodSeed.map(([ago, score, note]) => ({
    date: dateAgo(ago),
    score,
    note,
    createdAt: isoAgo(ago),
  }));
  await setJSON(K.mood(ana.id), moods);

  const stress: StressEntry[] = [
    {
      date: dateAgo(9),
      total: 24,
      level: 'moderado',
      answers: [3, 3, 2, 1, 1, 3, 1, 1, 3, 3],
      createdAt: isoAgo(9),
    },
    {
      date: dateAgo(2),
      total: 12,
      level: 'baixo',
      answers: [1, 1, 1, 3, 3, 1, 3, 3, 1, 1],
      createdAt: isoAgo(2),
    },
  ];
  await setJSON(K.stress(ana.id), stress);

  const sleepSeed: Array<[number, string, string, number, number]> = [
    [5, '23:30', '07:00', 450, 4],
    [4, '00:40', '06:50', 370, 3],
    [3, '01:10', '07:00', 350, 2],
    [2, '22:50', '07:10', 500, 5],
    [1, '23:45', '06:30', 405, 3],
    [0, '23:05', '07:20', 495, 4],
  ];
  const sleep: SleepEntry[] = sleepSeed.map(([ago, bedtime, wake, durationMin, quality]) => ({
    date: dateAgo(ago),
    bedtime,
    wake,
    durationMin,
    quality,
    createdAt: isoAgo(ago),
  }));
  await setJSON(K.sleep(ana.id), sleep);
}

// ---------- painel administrativo ----------

export type StudentSummary = {
  name: string;
  email: string;
  moods: number;
  stress: number;
  sleep: number;
  lastMood: number | null;
};

export type AdminStats = {
  students: number;
  totalRecords: number;
  engagement: { mood: number; stress: number; sleep: number };
  mood: { count: number; avg: number; dist: number[] };
  stress: { count: number; avg: number; dist: Record<StressLevel, number> };
  sleep: {
    count: number;
    avgMin: number;
    dist: { insuficiente: number; adequado: number; otimo: number };
  };
  perStudent: StudentSummary[];
};

/** Agrega os dados de todos os estudantes para o painel da coordenação. */
export async function getAdminStats(): Promise<AdminStats> {
  const students = (await getUsers()).filter((u) => u.role !== 'admin');
  const s: AdminStats = {
    students: students.length,
    totalRecords: 0,
    engagement: { mood: 0, stress: 0, sleep: 0 },
    mood: { count: 0, avg: 0, dist: [0, 0, 0, 0, 0] },
    stress: { count: 0, avg: 0, dist: { baixo: 0, moderado: 0, alto: 0 } },
    sleep: { count: 0, avgMin: 0, dist: { insuficiente: 0, adequado: 0, otimo: 0 } },
    perStudent: [],
  };
  let moodSum = 0;
  let stressSum = 0;
  let sleepSum = 0;

  for (const u of students) {
    const [moods, stress, sleep] = await Promise.all([
      getMoods(u.id),
      getStress(u.id),
      getSleep(u.id),
    ]);
    if (moods.length) s.engagement.mood++;
    if (stress.length) s.engagement.stress++;
    if (sleep.length) s.engagement.sleep++;

    for (const m of moods) {
      s.mood.count++;
      moodSum += m.score;
      s.mood.dist[m.score - 1]++;
    }
    for (const st of stress) {
      s.stress.count++;
      stressSum += st.total;
      s.stress.dist[st.level]++;
    }
    for (const sl of sleep) {
      s.sleep.count++;
      sleepSum += sl.durationMin;
      if (sl.durationMin < 360) s.sleep.dist.insuficiente++;
      else if (sl.durationMin <= 480) s.sleep.dist.adequado++;
      else s.sleep.dist.otimo++;
    }

    s.perStudent.push({
      name: u.name,
      email: u.email,
      moods: moods.length,
      stress: stress.length,
      sleep: sleep.length,
      lastMood: moods[0]?.score ?? null,
    });
  }

  s.mood.avg = s.mood.count ? moodSum / s.mood.count : 0;
  s.stress.avg = s.stress.count ? stressSum / s.stress.count : 0;
  s.sleep.avgMin = s.sleep.count ? Math.round(sleepSum / s.sleep.count) : 0;
  s.totalRecords = s.mood.count + s.stress.count + s.sleep.count;
  s.perStudent.sort((a, b) => b.moods + b.stress + b.sleep - (a.moods + a.stress + a.sleep));
  return s;
}
