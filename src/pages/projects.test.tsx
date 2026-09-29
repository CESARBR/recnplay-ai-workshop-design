// @vitest-environment jsdom
// Página de projetos: cada projeto listado precisa ter o seu ZIP em public/projects/.
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import { cleanup, render, screen, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it } from 'vitest'

import { projects } from '@/data/projects'

import { ProjectsPage } from './projects'

// Caminho em texto: no ambiente jsdom o `URL` global é o do jsdom, que o `fs` do Node não aceita.
const PUBLIC_PROJECTS = join(import.meta.dirname, '..', '..', 'public', 'projects')

function renderPage() {
  const router = createMemoryRouter([{ path: '/', element: <ProjectsPage /> }, { path: '/designmd', element: null }])
  render(<RouterProvider router={router} />)
}

afterEach(cleanup)

describe('página de projetos', () => {
  it('lista os 5 projetos na ordem, cada um com o seu ZIP', () => {
    renderPage()

    const items = within(screen.getAllByRole('list').at(-1)!).getAllByRole('listitem')
    expect(items.map((item) => within(item).getByRole('heading', { level: 2 }).textContent)).toEqual(
      projects.map((project) => project.title),
    )

    for (const project of projects) {
      const link = screen.getByRole('link', { name: `Baixar o projeto ${project.title} (ZIP)` })
      expect(link.getAttribute('href')).toBe(`/projects/${project.slug}.zip`)
      expect(link.getAttribute('download')).toBe(`${project.slug}.zip`)
      expect(existsSync(join(PUBLIC_PROJECTS, `${project.slug}.zip`))).toBe(true)
    }
  })

  it('todo ZIP em public/projects aparece na página', () => {
    const zips = readdirSync(PUBLIC_PROJECTS).filter((file) => file.endsWith('.zip'))

    expect(zips.sort()).toEqual(projects.map((project) => `${project.slug}.zip`).sort())
  })

  it('explica como usar e leva ao gerador de DESIGN.md', () => {
    renderPage()

    expect(screen.getByRole('heading', { name: 'Como usar' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'gerador de DESIGN.md' }).getAttribute('href')).toBe('/designmd')
  })
})
