// Teste da arquitetura: prova que a camada de serviços continua protegida.
//
// Passa o lint no arquivo que quebra a regra de propósito e confere se as duas violações
// foram barradas. O resultado é invertido de propósito: aqui, o lint reprovar é o sucesso.
//
// Rode com: npm run test:arquitetura

const { execSync } = require('child_process');

const ALVO = 'tests/arquitetura/teste-acesso-direto-a-api.ts';
const REGRA = 'no-restricted-imports';
const VIOLACOES_ESPERADAS = 2;

// O lint sai com código de erro quando encontra problemas — que é justamente o que
// esperamos aqui, então o relatório é lido tanto do sucesso quanto da falha.
let relatorio;
try {
  relatorio = execSync(`npx eslint --no-ignore -f json ${ALVO}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
} catch (erro) {
  relatorio = erro.stdout;
}

let barradas;
try {
  barradas = JSON.parse(relatorio)
    .flatMap((arquivo) => arquivo.messages)
    .filter((problema) => problema.ruleId === REGRA);
} catch {
  console.error('FALHOU: o lint não devolveu um relatório legível.\n');
  console.error(relatorio);
  process.exit(1);
}

console.log(`Arquivo testado: ${ALVO}`);
console.log(`Acessos diretos ao backend barrados: ${barradas.length} de ${VIOLACOES_ESPERADAS} esperados\n`);
barradas.forEach((problema) => console.log(`  linha ${problema.line}: ${problema.message}`));

if (barradas.length < VIOLACOES_ESPERADAS) {
  console.error('\nFALHOU: alguma forma de chamar o backend direto da tela passou sem ser barrada.');
  console.error('A camada de serviços deixou de estar protegida — confira a regra no eslint.config.js.');
  process.exit(1);
}

console.log('\nOK: nenhuma tela consegue chamar o backend direto. A camada de serviços está protegida.');
