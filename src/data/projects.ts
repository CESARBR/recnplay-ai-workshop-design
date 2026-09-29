// Projetos da oficina — um ZIP por proposta de app, em public/projects/.
// Cada ZIP é uma pasta pronta para abrir na ferramenta de IA (AGENTS.md, skills e pastas de trabalho).
// Para trocar um projeto, substitua o ZIP (mesmo nome) e ajuste os metadados aqui.

export type Project = {
  /** Nome do arquivo em public/projects/, sem `.zip`. */
  slug: string
  title: string
  description: string
  challenge: string
}

export const projects: Project[] = [
  {
    slug: 'lista-de-tarefas',
    title: 'Lista de Tarefas',
    description:
      'Anotar tarefas, organizá-las por data, prioridade ou categoria e marcá-las como concluídas, com uma visão clara do que falta fazer no dia e na semana.',
    challenge: 'Priorização, categorização e hierarquia de tarefas',
  },
  {
    slug: 'rastreador-de-habitos',
    title: 'Rastreador de Hábitos',
    description:
      'Cadastrar hábitos e marcar diariamente se foram cumpridos, com sequências, calendário visual e estatísticas de consistência como reforço motivacional.',
    challenge: 'Motivação e feedback visual de progresso',
  },
  {
    slug: 'controle-de-gastos-pessoais',
    title: 'Controle de Gastos Pessoais',
    description:
      'Registrar despesas do dia a dia, organizá-las por categoria e entender para onde o dinheiro está indo com gráficos e resumos do orçamento mensal.',
    challenge: 'Visualização de dados simples e não intimidadora',
  },
  {
    slug: 'organizador-de-receitas',
    title: 'Organizador de Receitas',
    description:
      'Salvar, buscar e organizar receitas favoritas, com ingredientes, passo a passo, fotos, tempo de preparo e filtros por refeição, restrição e tempo.',
    challenge: 'Busca, filtros e apresentação visual de conteúdo',
  },
  {
    slug: 'meditacao-e-foco',
    title: 'Meditação e Foco',
    description:
      'Manter a concentração ou relaxar com ciclos de foco e descanso, sessões guiadas de respiração, sons ambientes e acompanhamento do tempo dedicado.',
    challenge: 'Onboarding simples, estados de espera e minimalismo',
  },
]

export const projectFileName = (slug: string) => `${slug}.zip`

// Caminho relativo ao index.html — funciona em qualquer subpath do GitHub Pages.
export const projectFileUrl = (slug: string) => `${import.meta.env.BASE_URL}projects/${projectFileName(slug)}`
