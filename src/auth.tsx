/**
 * VitaU — contexto de autenticação (US01 cadastro / US02 login).
 * Autenticação local: valida credenciais contra os usuários salvos no dispositivo.
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import * as store from './storage';

type AuthContextType = {
  user: store.User | null;
  loading: boolean;
  signUp: (name: string, email: string, password: string, confirm: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithProvider: (provider: 'Google' | 'Apple') => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<store.User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    store
      .seedDemoData()
      .then(() => store.getSessionUser())
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);

  async function signUp(name: string, email: string, password: string, confirm: string) {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    if (cleanName.length < 2) throw new Error('Informe seu nome completo.');
    if (!EMAIL_RE.test(cleanEmail)) throw new Error('E-mail inválido.');
    if (password.length < 8) throw new Error('A senha deve ter pelo menos 8 caracteres.');
    if (password !== confirm) throw new Error('As senhas não coincidem.');
    if (await store.findUserByEmail(cleanEmail)) {
      throw new Error('Já existe uma conta com este e-mail.');
    }
    const created = await store.createUser(cleanName, cleanEmail, password);
    await store.setSession(created.id);
    setUser(created);
  }

  async function signIn(email: string, password: string) {
    const cleanEmail = email.trim().toLowerCase();
    if (!EMAIL_RE.test(cleanEmail)) throw new Error('E-mail inválido.');
    const found = await store.findUserByEmail(cleanEmail);
    if (!found || found.password !== password) {
      throw new Error('E-mail ou senha incorretos.');
    }
    await store.setSession(found.id);
    setUser(found);
  }

  /**
   * Login social simulado (US02). Sem backend não há OAuth real;
   * o MVP cria/reusa uma conta de demonstração para o provedor escolhido.
   */
  async function signInWithProvider(provider: 'Google' | 'Apple') {
    const email = `demo.${provider.toLowerCase()}@vitau.app`;
    let account = await store.findUserByEmail(email);
    if (!account) {
      account = await store.createUser(`Estudante ${provider}`, email, `social-${provider}`);
    }
    await store.setSession(account.id);
    setUser(account);
  }

  async function signOut() {
    await store.setSession(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signInWithProvider, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}
