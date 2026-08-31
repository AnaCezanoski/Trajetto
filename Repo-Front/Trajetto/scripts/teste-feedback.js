// Teste do padrão de feedback: prova que a regra de "qual aviso a tela mostra" está correta.
//
// A regra é a única parte do padrão com decisão de verdade — carregando, erro, vazio ou
// conteúdo — e vive separada da aparência justamente para poder ser testada sem abrir o app,
// sem emulador e sem backend.
//
// Rode com: npm run test:feedback

const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const REGRA = 'components/feedback/feedbackStatus.ts';

// A regra é escrita em TypeScript como o resto do app; aqui ela é compilada para uma pasta
// temporária só para poder ser executada direto pelo Node.
const saida = fs.mkdtempSync(path.join(os.tmpdir(), 'teste-feedback-'));
try {
  execSync(`npx tsc ${REGRA} --outDir "${saida}" --module commonjs --target es2019 --skipLibCheck`, {
    stdio: ['ignore', 'pipe', 'pipe'],
  });
} catch (erro) {
  console.error('FALHOU: a regra de feedback não compilou.\n');
  console.error(String(erro.stdout || '') + String(erro.stderr || ''));
  process.exit(1);
}

const { resolveFeedbackStatus } = require(path.join(saida, 'feedbackStatus.js'));

const carregando = { loading: true,  error: null,  data: null };
const falhou     = { loading: false, error: new Error('caiu'), data: null };

const CASOS = [
  ['primeira carga, nada na tela ainda',        carregando,                                            'loading'],
  ['a busca falhou',                            falhou,                                                'error'],
  ['falhou mesmo com dado antigo na tela',      { loading: false, error: new Error('caiu'), data: [1] }, 'error'],
  ['respondeu sem nenhum item',                 { loading: false, error: null, data: [] },              'empty'],
  ['respondeu com um objeto sem conteúdo',      { loading: false, error: null, data: {} },              'empty'],
  ['respondeu sem nada',                        { loading: false, error: null, data: null },            'empty'],
  ['respondeu com itens',                       { loading: false, error: null, data: [1, 2] },          'content'],
  ['zero é conteúdo, não é vazio',              { loading: false, error: null, data: 0 },               'content'],
  ['atualizar não apaga o que já está na tela', { loading: true,  error: null, data: [1] },             'content'],
];

console.log(`Regra testada: ${REGRA}\n`);

let falhas = 0;
for (const [descricao, estado, esperado] of CASOS) {
  const obtido = resolveFeedbackStatus(estado);
  const passou = obtido === esperado;
  if (!passou) falhas++;
  console.log(`  ${passou ? 'ok  ' : 'FALHA'} ${descricao} -> ${obtido}${passou ? '' : ` (esperado: ${esperado})`}`);
}

// A tela pode ter uma noção própria de vazio; o padrão precisa respeitar.
const painelSemNumeros = { loading: false, error: null, data: { total: 0 } };
const comRegraPropria = resolveFeedbackStatus(painelSemNumeros, (d) => d.total === 0);
const respeitaRegraPropria = comRegraPropria === 'empty';
if (!respeitaRegraPropria) falhas++;
console.log(`  ${respeitaRegraPropria ? 'ok  ' : 'FALHA'} a tela pode dizer o que considera vazio -> ${comRegraPropria}`);

fs.rmSync(saida, { recursive: true, force: true });

console.log(`\n${CASOS.length + 1 - falhas} de ${CASOS.length + 1} casos passaram.`);

if (falhas > 0) {
  console.error('\nFALHOU: a tela mostraria o aviso errado em pelo menos um caso.');
  process.exit(1);
}

console.log('OK: carregando, erro, vazio e conteúdo aparecem sempre na situação certa.');
