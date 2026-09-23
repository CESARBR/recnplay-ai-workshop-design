import { createHashRouter, Navigate, RouterProvider } from 'react-router'

import { SiteLayout } from '@/components/layout/site-layout'
import { AgentsMdPage } from '@/pages/agents-md'
import { DesignMdPage } from '@/pages/design-md'
import { HomePage } from '@/pages/home'

// Hash router: o GitHub Pages não tem fallback de SPA, então as rotas ficam em
// /#/agentsmd e /#/designmd e funcionam ao recarregar ou compartilhar o link.
const router = createHashRouter([
  {
    element: <SiteLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'agentsmd', element: <AgentsMdPage /> },
      { path: 'designmd', element: <DesignMdPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
