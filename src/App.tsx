import { lazy } from 'react'
import { createHashRouter, Navigate, RouterProvider } from 'react-router'

import { SiteLayout, type SiteRouteHandle } from '@/components/layout/site-layout'
import { HomePage } from '@/pages/home'
import { ProjectsPage } from '@/pages/projects'

// O gerador de DESIGN.md (com o lint oficial) fica num chunk separado para não pesar a home.
const loadDesignMdPage = () => import('@/pages/design-md')
const DesignMdPage = lazy(() => loadDesignMdPage().then((module) => ({ default: module.DesignMdPage })))

// Site estático (GitHub Pages): depois da primeira carga, baixa o chunk do gerador em segundo
// plano, para a ferramenta abrir mesmo que a rede caia antes de a pessoa navegar até ela.
const prefetch = () => void loadDesignMdPage()
if ('requestIdleCallback' in window) window.requestIdleCallback(prefetch, { timeout: 5000 })
else setTimeout(prefetch, 2000)

// Hash router: o GitHub Pages não tem fallback de SPA, então as rotas ficam em
// /#/projetos e /#/designmd e funcionam ao recarregar ou compartilhar o link.
const router = createHashRouter([
  {
    element: <SiteLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'projetos', element: <ProjectsPage /> },
      // Endereço antigo (quando os downloads eram só o AGENTS.md): mantém links já compartilhados.
      { path: 'agentsmd', element: <Navigate to="/projetos" replace /> },
      {
        path: 'designmd',
        element: <DesignMdPage />,
        handle: { wide: true } satisfies SiteRouteHandle,
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
