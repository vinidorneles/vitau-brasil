# VitaU — MVP

App mobile de **saúde integral para universitários**. MVP do projeto da disciplina
de Gestão de Projetos e Métodos Ágeis (PUCPR, 2026/1).

## Funcionalidades (núcleo Must Have)

| Tela | História | Descrição |
|------|----------|-----------|
| Cadastro / Login | US01 / US02 | Conta com e-mail e senha (validações) + login social simulado |
| Início | — | Dashboard com resumo do dia e atalhos |
| Humor | US04 / US06 | Registro diário com escala de emojis, nota e gráfico dos últimos 7 dias |
| Estresse | US05 | Questionário PSS-10 adaptado, pontuação, classificação e histórico |
| Sono | US08 / US09 | Horários, duração, classificação, qualidade e gráfico semanal |

## Tecnologia

- **React Native + Expo** (SDK 56, TypeScript)
- **React Navigation** (stack de autenticação + abas)
- **AsyncStorage** — dados ficam no dispositivo, sem backend (ideal para demo)

> Observação: por ser um MVP acadêmico, as senhas são guardadas localmente em texto.
> Em produção, use hash + backend seguro.

## Como rodar

```bash
cd vitau-app
npx expo start
```

Depois:
- pressione **`w`** para abrir no navegador, ou
- escaneie o QR Code com o app **Expo Go** (Android/iOS).

Requer **Node.js 20.19+** (recomendado 22 LTS).

## Estrutura

```
App.tsx              Ponto de entrada (providers + navegação)
src/
  theme.ts           Cores e tokens de design
  storage.ts         Persistência local (AsyncStorage)
  auth.tsx           Contexto de autenticação
  pss10.ts           Escala PSS-10 (questões, pontuação, classificação)
  navigation.tsx     Fluxo de autenticação + abas
  components/        UI reutilizável (botões, cartões, gráfico)
  screens/           Telas do app
```
