// Facilitadores da oficina. As fotos ficam em public/ (quadradas, fundo claro).

export type Facilitator = {
  name: string
  role: string
  /** Idioma do cargo, quando diferente de pt-BR, para a pronúncia correta no leitor de tela. */
  roleLang?: string
  photo: string
}

export const facilitators: Facilitator[] = [
  { name: 'Victor Ximenes', role: 'Senior Design Manager', roleLang: 'en', photo: 'victor.webp' },
  { name: 'Fabiano Marinho', role: 'Líder de Design', photo: 'fabiano.webp' },
  { name: 'Bruno Lima', role: 'UI Development Manager', roleLang: 'en', photo: 'bruno.webp' },
]

export const facilitatorPhotoUrl = (photo: string) => `${import.meta.env.BASE_URL}${photo}`
