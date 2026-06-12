# VitaU — MVP

App mobile de **saúde integral para universitários**. MVP do projeto da disciplina
de Gestão de Projetos e Métodos Ágeis (PUCPR, 2026/1).

## Funcionalidades

| Tela | História | Descrição |
|------|----------|-----------|
| Cadastro / Login | US01 / US02 | Conta com e-mail e senha (validações) + login social simulado |
| Início | — | Dashboard com resumo do dia e atalhos para todas as áreas |
| Humor | US04 / US06 | Registro diário com escala de emojis, nota e gráfico dos últimos 7 dias |
| Estresse | US05 | Questionário PSS-10 adaptado, pontuação, classificação e histórico |
| Sono | US08 / US09 | Horários, duração, classificação, qualidade percebida (1–5), observação textual e gráfico semanal |
| Alertas de sono | US10 | Lembretes locais por horário e dia da semana, respeitando o "não perturbe" do aparelho |
| Refeições | US11 | Registro por categoria (café, almoço, jantar, lanche), descrição, horário editável e histórico diário |
| Hidratação | US12 | Contador de copos/ml, meta diária configurável, barra de progresso e histórico de 7 dias |
| Mindfulness | US07 | Exercícios guiados por categoria, player com cronômetro/áudio e marcação de concluídos |
| Dicas nutricionais | US13 | Conteúdos por tema com tempo de leitura, favoritos e estado vazio amigável |
| VitaU+ (apoio psicológico) | US14 | Recurso premium: profissionais parceiros, agendamento e chat — com aviso de LGPD/CFP |
| Painel administrativo | — | Visão agregada e anônima: engajamento, humor/estresse/sono coletivos e lista de estudantes |

As funcionalidades das Sprints 3 e 4 (US07, US09–US14) seguem os critérios de aceite
registrados no Jira do projeto (board **VitaU - Brasil**).

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
- **expo-notifications** — alertas locais de rotina de sono (US10)
- **expo-av** — áudio dos exercícios de mindfulness (US07)
- Tipografia **Fraunces + Plus Jakarta Sans**, ícones **@expo/vector-icons**, gradientes via **expo-linear-gradient**

> Notas do MVP: as notificações de sono disparam no app no celular (Expo Go / build) — no
> navegador a configuração é salva, mas não há disparo. O chat do VitaU+ e o login social são
> simulados localmente, sem backend.

## Estrutura

```
App.tsx              Ponto de entrada (fontes + providers + navegação)
src/
  theme.ts           Cores, tipografia e tokens de design
  storage.ts         Persistência local (AsyncStorage) + dados de demonstração
  content.ts         Catálogos estáticos (mindfulness, dicas, profissionais)
  notifications.ts   Agendamento de alertas locais de sono (US10)
  auth.tsx           Contexto de autenticação
  pss10.ts           Escala PSS-10 (questões, pontuação, classificação)
  navigation.tsx     Fluxo de autenticação, telas do estudante e do admin
  components/        UI reutilizável (botões, cartões, gráfico, header)
  screens/           Telas: login, cadastro, início, humor, estresse, sono,
                     alertas de sono, refeições, hidratação, mindfulness,
                     dicas nutricionais, VitaU+ (chat) e admin
```
