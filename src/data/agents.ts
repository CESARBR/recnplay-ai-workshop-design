// Lista dos AGENTS.md disponíveis para download na oficina — um por app de exemplo.
// Os arquivos ficam em public/agents/ — para adicionar ou trocar um, edite o .md
// correspondente e ajuste os metadados aqui.

export type AgentFile = {
  slug: string
  title: string
  description: string
  challenge: string
}

export const agents: AgentFile[] = [
  {
    slug: '01-todo-list',
    title: 'To-Do List',
    description:
      'Anotar tarefas, organizá-las por data, prioridade ou categoria e marcá-las como concluídas, com uma visão clara do que falta fazer no dia e na semana.',
    challenge: 'Priorização, categorização e hierarquia de tarefas',
  },
  {
    slug: '02-habit-tracker',
    title: 'Rastreador de Hábitos',
    description:
      'Cadastrar hábitos e marcar diariamente se foram cumpridos, com sequências, calendário visual e estatísticas de consistência como reforço motivacional.',
    challenge: 'Motivação e feedback visual de progresso',
  },
  {
    slug: '03-controle-de-gastos',
    title: 'Controle de Gastos Pessoais',
    description:
      'Registrar despesas do dia a dia, organizá-las por categoria e entender para onde o dinheiro está indo com gráficos e resumos do orçamento mensal.',
    challenge: 'Visualização de dados simples e não intimidadora',
  },
  {
    slug: '04-organizador-de-receitas',
    title: 'Organizador de Receitas',
    description:
      'Salvar, buscar e organizar receitas favoritas, com ingredientes, passo a passo, fotos, tempo de preparo e filtros por refeição, restrição e tempo.',
    challenge: 'Busca, filtros e apresentação visual de conteúdo',
  },
  {
    slug: '05-meditacao-foco',
    title: 'Meditação e Foco (Pomodoro)',
    description:
      'Manter a concentração ou relaxar com ciclos de foco e descanso, sessões guiadas de respiração, sons ambientes e acompanhamento do tempo dedicado.',
    challenge: 'Onboarding simples, estados de espera e minimalismo',
  },
]

// Caminho relativo ao index.html — funciona em qualquer subpath do GitHub Pages.
export const agentFileUrl = (slug: string) => `${import.meta.env.BASE_URL}agents/${slug}.md`
