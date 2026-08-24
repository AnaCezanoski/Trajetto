// ATENÇÃO: este arquivo quebra a arquitetura DE PROPÓSITO. Ele existe para ser reprovado.
//
// O critério da tarefa diz que nenhuma tela conversa direto com o backend. Só olhar o código
// hoje prova que isso vale hoje; não impede alguém de voltar a chamar a API de dentro de uma
// tela na semana que vem. Quem garante isso daqui pra frente é a regra do lint.
//
// Este arquivo é o alvo do teste: ele faz as duas formas de burlar a camada de serviços
// (importar o cliente HTTP e importar a biblioteca de rede direto). O teste passa quando o
// lint reprova as duas — e falha se alguma passar batido, sinal de que a proteção caiu.
//
// Rode com: npm run test:arquitetura
//
// Não está no aplicativo: nada importa este arquivo, e ele fica fora do lint do dia a dia.

import axios from 'axios';
import { api } from '../../services/api';

export const acessoProibidoPeloClienteHttp = () => api.get('/user/me');

export const acessoProibidoPelaBibliotecaDeRede = () => axios.get('/user/me');
