export interface OpcaoResposta {
  letra: string;
  texto: string;
  pontuacao: Record<string, number>;
}

export interface Pergunta {
  id: number;
  texto: string;
  tipo: 'sim_nao' | 'multipla_escolha';
  pontuacao?: Record<string, Record<string, number>>;
  opcoes?: OpcaoResposta[];
}

export interface Perfil {
  nome: string;
  emoji: string;
  descricao: string;
  destinos_sugeridos: string[];
}

export interface QuizData {
  perguntas: Pergunta[];
  perfis: Record<string, Perfil>;
}

export const quizData: QuizData = {
  perguntas: [
    {
      id: 1,
      texto: "Você prefere destinos movimentados e cheios de pessoas?",
      tipo: "sim_nao",
      pontuacao: {
        sim: { SOCIAL: 2, AVENTUREIRO: 1 },
        nao: { SOLITARIO: 2, NATUREZA: 1 }
      }
    },
    {
      id: 2,
      texto: "Museus, galerias e sítios históricos são paradas obrigatórias nas suas viagens?",
      tipo: "sim_nao",
      pontuacao: {
        sim: { CULTURAL: 3 },
        nao: { AVENTUREIRO: 1, LUXO: 1 }
      }
    },
    {
      id: 3,
      texto: "Você toparia dormir em uma tenda no meio de uma floresta?",
      tipo: "sim_nao",
      pontuacao: {
        sim: { AVENTUREIRO: 3, NATUREZA: 2 },
        nao: { LUXO: 2, CULTURAL: 1 }
      }
    },
    {
      id: 4,
      texto: "O que mais importa no seu destino?",
      tipo: "multipla_escolha",
      opcoes: [
        { letra: "A", texto: "Praias paradisíacas e sol", pontuacao: { RELAXAMENTO: 3 } },
        { letra: "B", texto: "Trilhas e paisagens naturais", pontuacao: { NATUREZA: 3 } },
        { letra: "C", texto: "História, arte e cultura local", pontuacao: { CULTURAL: 3 } },
        { letra: "D", texto: "Festas, bares e vida noturna", pontuacao: { SOCIAL: 3 } }
      ]
    },
    {
      id: 5,
      texto: "Você planeja cada detalhe da viagem com antecedência?",
      tipo: "sim_nao",
      pontuacao: {
        sim: { CULTURAL: 1, LUXO: 2 },
        nao: { AVENTUREIRO: 2, SOCIAL: 1 }
      }
    },
    {
      id: 6,
      texto: "Gastar bem em uma hospedagem confortável faz parte da experiência para você?",
      tipo: "sim_nao",
      pontuacao: {
        sim: { LUXO: 3 },
        nao: { AVENTUREIRO: 1, MOCHILEIRO: 2 }
      }
    },
    {
      id: 7,
      texto: "Como você prefere se locomover dentro do destino?",
      tipo: "multipla_escolha",
      opcoes: [
        { letra: "A", texto: "A pé, explorando cada esquina", pontuacao: { CULTURAL: 2, MOCHILEIRO: 1 } },
        { letra: "B", texto: "Carro alugado ou motorista particular", pontuacao: { LUXO: 2 } },
        { letra: "C", texto: "Transporte público como um local", pontuacao: { MOCHILEIRO: 3 } },
        { letra: "D", texto: "Barco, quadriciclo, cavalo — quanto mais inusitado, melhor", pontuacao: { AVENTUREIRO: 3 } }
      ]
    },
    {
      id: 8,
      texto: "Você costuma experimentar a culinária local mesmo sem saber o que está comendo?",
      tipo: "sim_nao",
      pontuacao: {
        sim: { CULTURAL: 2, AVENTUREIRO: 1, MOCHILEIRO: 1 },
        nao: { LUXO: 1, RELAXAMENTO: 1 }
      }
    },
    {
      id: 9,
      texto: "Você prefere viajar sozinho?",
      tipo: "sim_nao",
      pontuacao: {
        sim: { SOLITARIO: 3, MOCHILEIRO: 1 },
        nao: { SOCIAL: 2, RELAXAMENTO: 1 }
      }
    },
    {
      id: 10,
      texto: "Qual dessas atividades mais combina com você?",
      tipo: "multipla_escolha",
      opcoes: [
        { letra: "A", texto: "Mergulho, rafting ou escalada", pontuacao: { AVENTUREIRO: 3 } },
        { letra: "B", texto: "Tour histórico ou visita a museu", pontuacao: { CULTURAL: 3 } },
        { letra: "C", texto: "Spa, piscina e massagem", pontuacao: { RELAXAMENTO: 3 } },
        { letra: "D", texto: "Bate-papo com moradores locais em um bar", pontuacao: { SOCIAL: 3 } }
      ]
    },
    {
      id: 11,
      texto: "Você se sente confortável mudando de planos na hora?",
      tipo: "sim_nao",
      pontuacao: {
        sim: { AVENTUREIRO: 2, MOCHILEIRO: 2 },
        nao: { LUXO: 1, CULTURAL: 1 }
      }
    },
    {
      id: 12,
      texto: "Trilhas, cachoeiras e parques naturais são seu tipo de programa?",
      tipo: "sim_nao",
      pontuacao: {
        sim: { NATUREZA: 3, AVENTUREIRO: 1 },
        nao: { LUXO: 1, SOCIAL: 1 }
      }
    },
    {
      id: 13,
      texto: "O que você faz na primeira manhã em um novo destino?",
      tipo: "multipla_escolha",
      opcoes: [
        { letra: "A", texto: "Café lento no quarto e sem pressa", pontuacao: { RELAXAMENTO: 3, LUXO: 1 } },
        { letra: "B", texto: "Já saio para explorar as ruas", pontuacao: { CULTURAL: 2, MOCHILEIRO: 2 } },
        { letra: "C", texto: "Busco a primeira trilha disponível", pontuacao: { NATUREZA: 2, AVENTUREIRO: 2 } },
        { letra: "D", texto: "Encontro outros viajantes no hostel", pontuacao: { SOCIAL: 3 } }
      ]
    },
    {
      id: 14,
      texto: "Você já viajou para um lugar só para um festival, evento ou show?",
      tipo: "sim_nao",
      pontuacao: {
        sim: { SOCIAL: 3, AVENTUREIRO: 1 },
        nao: { SOLITARIO: 1, CULTURAL: 1 }
      }
    },
    {
      id: 15,
      texto: "Quanto ao orçamento, como você se descreve?",
      tipo: "multipla_escolha",
      opcoes: [
        { letra: "A", texto: "Economizo em tudo para viajar mais vezes", pontuacao: { MOCHILEIRO: 3 } },
        { letra: "B", texto: "Gasto equilibrado — nem luxo nem privação", pontuacao: { CULTURAL: 1, RELAXAMENTO: 1 } },
        { letra: "C", texto: "Prefiro viajar menos e bem, sem economizar", pontuacao: { LUXO: 3 } },
        { letra: "D", texto: "Não me importo muito, o importante é a experiência", pontuacao: { AVENTUREIRO: 2, NATUREZA: 1 } }
      ]
    }
  ],
  perfis: {
    AVENTUREIRO: {
      nome: "Aventureiro",
      emoji: "🧗",
      descricao: "Você vive para sair da zona de conforto! Prefere trilhas íngremes, esportes radicais e destinos fora do óbvio. O risco controlado é parte do prazer da viagem.",
      destinos_sugeridos: ["Patagônia", "Nepal", "Nova Zelândia", "Costa Rica"]
    },
    CULTURAL: {
      nome: "Explorador Cultural",
      emoji: "🏛️",
      descricao: "Sua bagagem vem cheia de conhecimento. Você ama museus, ruínas históricas, gastronomia local e as histórias por trás de cada lugar. Cada viagem é uma aula.",
      destinos_sugeridos: ["Roma", "Kyoto", "Cairo", "Atenas"]
    },
    NATUREZA: {
      nome: "Amante da Natureza",
      emoji: "🌿",
      descricao: "Para você, a melhor vista é a que não tem prédios. Cachoeiras, florestas, fauna e flora selvagem são o que fazem uma viagem valer a pena.",
      destinos_sugeridos: ["Amazônia", "Islândia", "Galápagos", "Borneo"]
    },
    LUXO: {
      nome: "Viajante de Luxo",
      emoji: "✨",
      descricao: "Conforto é inegociável. Você prefere hotéis cinco estrelas, restaurantes premiados e serviços exclusivos. Viajar bem é uma arte, e você leva isso a sério.",
      destinos_sugeridos: ["Dubai", "Maldivas", "Amalfi", "Bora Bora"]
    },
    MOCHILEIRO: {
      nome: "Mochileiro",
      emoji: "🎒",
      descricao: "Leve, livre e sem amarras. Você prefere hostels, transporte público e roteiros improvisados. O caminho importa tanto quanto o destino.",
      destinos_sugeridos: ["Sudeste Asiático", "América do Sul", "Europa Central", "Marrocos"]
    },
    RELAXAMENTO: {
      nome: "Viajante Relaxado",
      emoji: "🌅",
      descricao: "Sua viagem ideal tem praia, sol, um bom livro e zero compromissos. Você não foge das atrações, mas nunca abre mão de recarregar as energias.",
      destinos_sugeridos: ["Maldivas", "Fernando de Noronha", "Bali", "Caribe"]
    },
    SOCIAL: {
      nome: "Viajante Social",
      emoji: "🥂",
      descricao: "Você coleciona amizades em cada fuso horário. Festivais, bares locais, hostels animados — qualquer lugar onde se possa conhecer gente nova é o seu lugar.",
      destinos_sugeridos: ["Ibiza", "Rio de Janeiro", "Bangkok", "Amsterdã"]
    },
    SOLITARIO: {
      nome: "Viajante Solitário",
      emoji: "🧘",
      descricao: "Você viaja para se encontrar, não para se perder em multidões. Introspecção, silêncio e conexão profunda com o lugar são o que fazem uma viagem perfeita.",
      destinos_sugeridos: ["Escócia", "Tibete", "Lapônia Finlandesa", "Deserto do Atacama"]
    }
  }
};

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function calcularPerfil(scores: Record<string, number>): string {
  return Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b)[0];
}
