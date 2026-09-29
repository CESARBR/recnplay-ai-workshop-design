// Substituto de `node:process` (usado pelas libs `yaml` e `debug` empacotadas na biblioteca).
const browserProcess = {
  env: {} as Record<string, string | undefined>,
  argv: [] as string[],
  platform: 'browser',
  cwd: () => '/',
  emitWarning: () => {},
}

export default browserProcess
