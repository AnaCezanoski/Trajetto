// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

// Mantém o acesso ao backend concentrado na camada de serviços: telas, componentes,
// contextos e hooks importam de 'services', nunca o cliente HTTP nem bibliotecas de rede.
const CAMADA_DE_SERVICOS = {
  paths: [
    {
      name: 'axios',
      message: 'Chamadas ao backend ficam na camada de serviços (services/). Importe o serviço correspondente de "services".',
    },
  ],
  patterns: [
    {
      group: ['**/services/api', '**/services/api.*', './api', '../services/api'],
      message: 'O cliente HTTP é interno à camada de serviços. Importe o serviço correspondente de "services".',
    },
  ],
};

module.exports = defineConfig([
  expoConfig,
  {
    // A pasta tests/arquitetura guarda código que quebra a regra de propósito, para ser
    // reprovado pelo teste (npm run test:arquitetura). Fica fora do lint do dia a dia.
    ignores: ['dist/*', 'tests/arquitetura/*'],
  },
  {
    files: [
      'app/**/*.{ts,tsx}',
      'components/**/*.{ts,tsx}',
      'context/**/*.{ts,tsx}',
      'hooks/**/*.{ts,tsx}',
      'navigation/**/*.{ts,tsx}',
      'tests/**/*.{ts,tsx}',
      'App.tsx',
    ],
    rules: {
      'no-restricted-imports': ['error', CAMADA_DE_SERVICOS],
    },
  },
]);
