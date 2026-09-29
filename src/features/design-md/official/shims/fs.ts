// Substituto de `node:fs` para a biblioteca oficial no navegador.
// O único uso é `readFileSync(spec-config.yaml)`, então devolve o YAML embutido no build.
import specConfig from 'virtual:design-md-spec-config'

export function readFileSync(): string {
  return specConfig
}

export default { readFileSync }
