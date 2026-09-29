// Passo a passo curto para quem abre o gerador pela primeira vez.
const linkClass = 'font-semibold text-tertiary-text underline underline-offset-4'

export function HowToUse() {
  return (
    <section aria-labelledby="como-usar-gerador" className="flex max-w-3xl flex-col gap-sm">
      <h2 id="como-usar-gerador" className="label-caps text-brand-secondary">
        Como usar
      </h2>
      <ol className="flex list-decimal flex-col gap-1 pl-5 text-muted-foreground">
        <li>
          Em <strong className="text-foreground">Identidade</strong>, troque o nome e a descrição da ACME pelos da sua
          marca.
        </li>
        <li>
          Escolha a cor da marca e clique em <strong className="text-foreground">Gerar sistema</strong>, ou ajuste à
          mão as cores, a tipografia, os espaçamentos e os componentes.
        </li>
        <li>
          Confira o resultado na <strong className="text-foreground">Prévia</strong> e corrija o que aparecer em{' '}
          <strong className="text-foreground">Problemas</strong> (o botão “Ir para o campo” leva até o ajuste).
        </li>
        <li>
          Em <strong className="text-foreground">Orientações</strong>, descreva a personalidade da marca e as regras
          do que fazer e do que evitar.
        </li>
        <li>
          Clique em <strong className="text-foreground">Baixar DESIGN.md</strong> e coloque o arquivo na raiz da pasta
          do seu{' '}
          {/* Link comum: o site usa rotas com hash, e a página também é renderizada fora do roteador nos testes. */}
          <a href="#/projetos" className={linkClass}>
            projeto
          </a>
          .
        </li>
      </ol>
    </section>
  )
}
