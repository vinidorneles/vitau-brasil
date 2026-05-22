# VitaU — MVP

App mobile de **saúde integral para universitários**. MVP do projeto da disciplina
de Gestão de Projetos e Métodos Ágeis (PUCPR, 2026/1).

## Funcionalidades

| Tela | História | Descrição |
|------|----------|-----------|
| Cadastro / Login | US01 / US02 | Conta com e-mail e senha (validações) + login social simulado |
| Início | — | Dashboard com resumo do dia e atalhos |
| Humor | US04 / US06 | Registro diário com escala de emojis, nota e gráfico dos últimos 7 dias |
| Estresse | US05 | Questionário PSS-10 adaptado, pontuação, classificação e histórico |
| Sono | US08 / US09 | Horários, duração, classificação, qualidade e gráfico semanal |
| Painel administrativo | — | Visão agregada e anônima: engajamento, humor/estresse/sono coletivos e lista de estudantes |

## Como rodar

```bash
cd vitau-app
npm install
npx expo start
```

Depois:
- pressione **`w`** para abrir no navegador, ou
- escaneie o QR Code com o app **Expo Go** (Android/iOS).

Requer **Node.js 20.19+** (recomendado 22 LTS).

## Contas de demonstração

As contas abaixo são **criadas automaticamente no primeiro uso** — não é preciso
cadastrar nada para testar o app:

| Perfil | E-mail | Senha | Observação |
|--------|--------|-------|------------|
| Estudante (com dados) | `ana@vitau.app` | `estudante123` | histórico de humor, estresse e sono já preenchido |
| Estudante (vazio) | `lucas@vitau.app` | `estudante123` | conta limpa, para testar os fluxos do zero |
| Coordenação (admin) | `admin@vitau.app` | `admin1234` | acessa o painel administrativo com a visão agregada |

Também é possível **criar uma conta nova** pela tela de cadastro ou usar o **login
social simulado** (Google / Apple). Estudantes entram nas telas do app; a conta de
coordenação entra direto no painel administrativo.

> Observação: por ser um MVP acadêmico, as senhas são guardadas localmente em texto
> e não há backend. Em produção, use hash + servidor seguro.

## Tecnologia

- **React Native + Expo** (SDK 56, TypeScript)
- **React Navigation** — fluxo de autenticação e telas principais com header de navegação
- **AsyncStorage** — dados ficam no dispositivo, sem backend (ideal para demo)
- Tipografia **Fraunces + Plus Jakarta Sans**, ícones **@expo/vector-icons**, gradientes via **expo-linear-gradient**

## Estrutura

```
App.tsx              Ponto de entrada (fontes + providers + navegação)
src/
  theme.ts           Cores, tipografia e tokens de design
  storage.ts         Persistência local (AsyncStorage) + dados de demonstração
  auth.tsx           Contexto de autenticação
  pss10.ts           Escala PSS-10 (questões, pontuação, classificação)
  navigation.tsx     Fluxo de autenticação, telas do estudante e do admin
  components/        UI reutilizável (botões, cartões, gráfico, header)
  screens/           Telas: login, cadastro, início, humor, estresse, sono, admin
```
