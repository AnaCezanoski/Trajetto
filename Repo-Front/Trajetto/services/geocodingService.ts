// Busca de endereços no Nominatim (OpenStreetMap), usado para escolher o ponto de
// partida do roteiro.
//
// Este é o único serviço que não fala com o backend do Trajetto, e por isso não usa o
// cliente compartilhado: aquele cliente anexa o token da sessão em toda requisição, e o
// token não deve sair para um serviço de terceiros.

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

// Exigido pela política de uso do Nominatim: identifica o aplicativo que está consultando.
const USER_AGENT = 'TrajettoApp/1.0 (admin@authserver.com.br)';

const COUNTRY_CODES = 'it';
const RESULT_LIMIT = 5;

export interface PlaceSuggestion {
  lat: number;
  lng: number;
  /** Endereço completo, para o usuário conferir que achou o lugar certo. */
  displayName: string;
  /** Rua e número, para caber na linha da lista. */
  shortName: string;
}

/** Endereços que combinam com o texto digitado. Lista vazia quando nada é encontrado. */
export async function searchAddresses(query: string): Promise<PlaceSuggestion[]> {
  const params = new URLSearchParams({
    q: query,
    countrycodes: COUNTRY_CODES,
    limit: String(RESULT_LIMIT),
    format: 'json',
    addressdetails: '1',
  });

  const res = await fetch(`${NOMINATIM_URL}?${params}`, {
    headers: {
      'Accept-Language': 'pt-BR,pt;q=0.9',
      'User-Agent': USER_AGENT,
    },
  });

  const data = await res.json();
  if (!Array.isArray(data)) return [];

  return data.map((item: any) => {
    const addr = item.address ?? {};
    const short =
      addr.road
        ? `${addr.road}${addr.house_number ? ' ' + addr.house_number : ''}${addr.suburb ? ', ' + addr.suburb : ''}`
        : item.display_name.split(',')[0];
    return {
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      displayName: item.display_name,
      shortName: short,
    };
  });
}

export const geocodingService = { searchAddresses };
