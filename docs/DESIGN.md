---
version: alpha
name: CESAR
description: O CESAR é o centro de inovação e conhecimento mais completo do Brasil, atendendo empresas, startups e instituições de ensino com soluções tecnológicas integradas, desenvolvimento profissional e programas de aceleração de negócios.
colors:
  primary: "#232CAF"
  on-primary: "#FFFFFF"
  primary-hover: "#170494"
  secondary: "#37436C"
  on-secondary: "#FFFFFF"
  tertiary: "#8D0689"
  neutral: "#F5F5F5"
  surface: "#FFFFFF"
  on-surface: "#171A24"
  border: "#DADEE8"
  error: "#B3261E"
  on-error: "#FFFFFF"
typography:
  h1:
    fontFamily: DM Sans
    fontSize: 3rem
    fontWeight: 700
  body-md:
    fontFamily: DM Sans
    fontSize: 1rem
    fontWeight: 400
  label-caps:
    fontFamily: DM Sans
    fontSize: 0.75rem
    fontWeight: 600
  buttons:
    fontFamily: Arial
    fontSize: 1rem
    fontWeight: 400
rounded:
  none: 0px
  sm: 4px
  md: 8px
  lg: 12px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-caps}"
    rounded: "{rounded.md}"
    padding: 12px 20px
  button-primary-hover:
    backgroundColor: "{colors.on-primary}"
    textColor: "{colors.on-primary}"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.on-secondary}"
    typography: "{typography.label-caps}"
    rounded: "{rounded.md}"
    padding: 12px 20px
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 10px 14px
---

# CESAR

## Overview

A marca traduz uma estética de “Pragmatismo Técnico” — limpa, objetiva e voltada ao impacto real, sem enfeites decorativos. A linguagem visual combina uma cor primária com acentos terciários vibrantes sobre uma base branca, clara e acessível, criando uma interface ao mesmo tempo sólida e acolhedora. A resposta emocional é de clareza e de movimento para a frente: um sistema pensado para simplificar a complexidade e viabilizar a transformação.

## Colors

A paleta é baseada em tokens semânticos. Use o papel (ex.: `{colors.primary}`) — nunca o hex literal — ao criar componentes.

- **primary:** `#232CAF`
- **on-primary:** `#FFFFFF`
- **primary-hover:** `#170494`
- **secondary:** `#37436C`
- **on-secondary:** `#FFFFFF`
- **tertiary:** `#8D0689`
- **neutral:** `#F5F5F5`
- **surface:** `#FFFFFF`
- **on-surface:** `#171A24`
- **border:** `#DADEE8`
- **error:** `#B3261E`
- **on-error:** `#FFFFFF`

## Typography

- **h1:** fonte `DM Sans`, tamanho `3rem`, peso `700`
- **body-md:** fonte `DM Sans`, tamanho `1rem`, peso `400`
- **label-caps:** fonte `DM Sans`, tamanho `0.75rem`, peso `600`
- **buttons:** fonte `Arial`, tamanho `1rem`, peso `400`

## Layout

Use a escala nomeada; evite valores arbitrários.

Escala de espaçamento:

- **xs:** `4px`
- **sm:** `8px`
- **md:** `16px`
- **lg:** `24px`
- **xl:** `32px`

## Elevation & Depth

A profundidade é transmitida por camadas tonais e bordas sutis, e não por sombras. Os cards se destacam do fundo neutro com superfícies em branco puro e uma única borda fina.

## Shapes

Escala de arredondamento:

- **none:** `0px`
- **sm:** `4px`
- **md:** `8px`
- **lg:** `12px`
- **full:** `9999px`

## Components

### button-primary

- Fundo (`backgroundColor`): `{colors.primary}`
- Texto (`textColor`): `{colors.on-primary}`
- Tipografia (`typography`): `{typography.label-caps}`
- Arredondamento (`rounded`): `{rounded.md}`
- Espaçamento interno (`padding`): `12px 20px`

### button-primary-hover

- Fundo (`backgroundColor`): `{colors.on-primary}`
- Texto (`textColor`): `{colors.on-primary}`

### button-secondary

- Fundo (`backgroundColor`): `{colors.secondary}`
- Texto (`textColor`): `{colors.on-secondary}`
- Tipografia (`typography`): `{typography.label-caps}`
- Arredondamento (`rounded`): `{rounded.md}`
- Espaçamento interno (`padding`): `12px 20px`

### card

- Fundo (`backgroundColor`): `{colors.surface}`
- Texto (`textColor`): `{colors.on-surface}`
- Tipografia (`typography`): `{typography.body-md}`
- Arredondamento (`rounded`): `{rounded.lg}`
- Espaçamento interno (`padding`): `{spacing.lg}`

### input

- Fundo (`backgroundColor`): `{colors.surface}`
- Texto (`textColor`): `{colors.on-surface}`
- Tipografia (`typography`): `{typography.body-md}`
- Arredondamento (`rounded`): `{rounded.md}`
- Espaçamento interno (`padding`): `10px 14px`

## Do's and Don'ts

- Use o tertiary exclusivamente para o CTA mais importante de cada tela — normalmente o envio de um formulário ou o botão de próximo passo — para manter a hierarquia visual e evitar a fadiga de decisão.
- Mantenha padding consistente de 24px (md) dentro de todos os cards e containers, criando um ritmo de layout previsível e fácil de escanear.
- Aplique transições de 200ms ease-out em todas as mudanças de cor e sombra dos elementos interativos, para um feedback suave e profissional sem parecer lento.
- Use DM Sans em 16px (body-md) com altura de linha de 1,5 (24px) em todo o texto corrido, garantindo legibilidade na tela e na impressão.
- Reserve o arredondamento total (9999px) exclusivamente para inputs em formato de pílula, badges e avatares, criando uma distinção visual clara para esses elementos.
- Construa a elevação com o sistema de sombras em três níveis (sm/md/lg) em vez de variações de cor, mantendo uma aparência limpa e acessível em contextos claros e escuros.
- Não use primary ou secondary como CTAs principais — são acentos de apoio e diluem a hierarquia visual se usados em ações críticas.
- Não aplique arredondamento maior que lg (8px) em botões, cards ou controles de formulário comuns; o excesso de arredondamento cria um tom lúdico que conflita com a voz profissional e pragmática do CESAR.
- Não reduza o padding abaixo de sm (12px) dentro de componentes nem abaixo de md (24px) entre seções principais; o espaço em branco é material de design, e a compressão reduz a clareza.
- Não use sombras com desfoque acima de 15px ou opacidade acima de 0,1 na camada de sombra principal; sombras profundas parecem datadas e reduzem a estética moderna e limpa do sistema.
