-- =====================================================================
-- V2 - Indices que sustentam os indicadores do painel gerencial (BE02.1)
--
-- Duas naturezas de indice entram aqui:
--
--   1. UNIQUE, que sobe para o banco regras de negocio que hoje so existem
--      dentro do Java e, por isso, dependem de o codigo lembrar de conferir:
--        - um e-mail pertence a um unico usuario;
--        - um usuario avalia um ponto turistico uma unica vez.
--
--   2. Indices comuns nas colunas usadas pelos GROUP BY / ORDER BY do painel,
--      para que a agregacao seja resolvida pelo indice em vez de varrer a
--      tabela inteira a cada abertura do dashboard.
--
-- Antes de cada UNIQUE existe um passo de limpeza. Em um banco integro ele
-- nao altera nenhuma linha; em um banco que ficou com duplicata (porque a
-- checagem no Java tem corrida entre dois cadastros simultaneos) ele resolve
-- a duplicata de forma previsivel, sem derrubar a migracao.
-- =====================================================================


-- ---------------------------------------------------------------------
-- Regra: um e-mail pertence a um unico usuario
--
-- UserRepository.findByEmail devolve um objeto so: com duplicata, o login ja
-- estouraria NonUniqueResultException. A limpeza preserva a conta mais antiga
-- (menor code) e desloca as demais para <email>.dup<code>, em vez de apagar
-- usuario, que arrastaria roteiros e avaliacoes junto.
-- ---------------------------------------------------------------------
UPDATE users u
JOIN (
    SELECT email, MIN(code) AS keep_code
    FROM users
    WHERE email IS NOT NULL
    GROUP BY email
    HAVING COUNT(*) > 1
) d ON d.email = u.email AND u.code > d.keep_code
SET u.email = CONCAT(u.email, '.dup', u.code);

CREATE UNIQUE INDEX uk_users_email ON users (email);


-- ---------------------------------------------------------------------
-- Regra: um usuario avalia um ponto turistico uma unica vez
--
-- RatingService.createRating ja recusa a segunda avaliacao, mas so depois de
-- consultar; o indice fecha a janela entre a consulta e o insert. A limpeza
-- mantem a avaliacao original (menor id) e descarta as repetidas.
-- ---------------------------------------------------------------------
DELETE r FROM RatingModel r
JOIN (
    SELECT MIN(id) AS keep_id, touristSpotXid, userId
    FROM RatingModel
    WHERE touristSpotXid IS NOT NULL AND userId IS NOT NULL
    GROUP BY touristSpotXid, userId
    HAVING COUNT(*) > 1
) d ON d.touristSpotXid = r.touristSpotXid
   AND d.userId = r.userId
   AND r.id > d.keep_id;

CREATE UNIQUE INDEX uk_rating_spot_user ON RatingModel (touristSpotXid, userId);


-- ---------------------------------------------------------------------
-- Indices de apoio as consultas agregadas do painel
-- ---------------------------------------------------------------------

-- /stats/countries e /stats/traveler-profiles: GROUP BY direto na coluna
CREATE INDEX idx_users_country          ON users (country);
CREATE INDEX idx_users_traveler_profile ON users (travelerProfile);

-- /stats/overview: contagem de admins/clientes e de verificados/nao verificados
CREATE INDEX idx_users_is_admin    ON users (isAdmin);
CREATE INDEX idx_users_is_verified ON users (is_verified);

-- /stats/overview e /stats/age-groups: media de idade e faixas etarias
CREATE INDEX idx_users_birth_date ON users (birthDate);

-- /stats/itineraries-per-month: agrupamento cronologico
CREATE INDEX idx_itineraries_start_date ON itineraries (start_date);

-- /stats/itinerary-overview: media e contagem de roteiros avaliados
CREATE INDEX idx_itineraries_rating ON itineraries (rating);

-- /stats/places-by-category e /stats/most-visited-places
CREATE INDEX idx_places_category ON places (category);
CREATE INDEX idx_places_name     ON places (name);

-- /stats/top-rated-places e /stats/most-commented-places: join do xid da
-- avaliacao com o nome do lugar
CREATE INDEX idx_places_xid ON places (xid);

-- Recuperacao de senha: findTopByUserEmailAndCodeOrderByExpiresAtDesc.
-- Nao e UNIQUE de proposito: o codigo tem 6 digitos aleatorios e pode se
-- repetir entre usuarios diferentes sem que isso seja um erro.
CREATE INDEX idx_password_reset_user_code ON password_reset_tokens (user_code, code);
