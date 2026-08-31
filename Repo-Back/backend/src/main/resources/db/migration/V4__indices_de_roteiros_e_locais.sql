-- =====================================================================
-- V4 - Indices de roteiros e locais (BE02.2)
-- =====================================================================

-- Regra: um usuario tem no maximo um roteiro ativo
--
-- A regra e antiga e esta espalhada pelo ItineraryService: gerar roteiro,
-- criar o roteiro de exemplo e ativar um roteiro existente comecam todos
-- desativando os anteriores na mao. E getActiveItinerary confia nisso ao
-- devolver activeItineraries.get(0) -- ele pega o primeiro de uma lista que
-- deveria ter no maximo um elemento.
--
-- Como nada disso e atomico, duas requisicoes simultaneas do mesmo usuario
-- deixam dois roteiros ativos, e a partir dai o app passa a mostrar um
-- roteiro que depende da ordem que o banco devolveu.
--
-- O UNIQUE nao pode ser sobre (user_id, is_active) direto: isso limitaria o
-- usuario a um roteiro inativo tambem. A coluna gerada resolve: ela vale
-- user_id enquanto o roteiro esta ativo e NULL quando nao esta, e indice
-- UNIQUE no MySQL nao compara NULLs entre si. O efeito e um UNIQUE que so
-- enxerga as linhas ativas.
-- ---------------------------------------------------------------------

-- Limpeza: com mais de um ativo, o mais recente (maior id) fica; os outros
-- so perdem a marca de ativo, nenhum roteiro e apagado. Em banco integro
-- nao altera nenhuma linha.
UPDATE itineraries i
JOIN (
    SELECT user_id, MAX(id) AS keep_id
    FROM itineraries
    WHERE is_active = 1
    GROUP BY user_id
    HAVING COUNT(*) > 1
) d ON d.user_id = i.user_id AND i.id <> d.keep_id
SET i.is_active = 0
WHERE i.is_active = 1;

ALTER TABLE itineraries
    ADD COLUMN active_user_id BIGINT
        GENERATED ALWAYS AS (CASE WHEN is_active = 1 THEN user_id END) VIRTUAL;

CREATE UNIQUE INDEX uk_itineraries_active_per_user ON itineraries (active_user_id);


-- ---------------------------------------------------------------------
-- Regra: cada posicao de um roteiro e ocupada por um local so
-- ---------------------------------------------------------------------

DELETE p FROM places p
JOIN (
    SELECT itinerary_id, order_index, MIN(id) AS keep_id
    FROM places
    WHERE itinerary_id IS NOT NULL AND order_index IS NOT NULL
    GROUP BY itinerary_id, order_index
    HAVING COUNT(*) > 1
) d ON d.itinerary_id = p.itinerary_id
   AND d.order_index  = p.order_index
   AND p.id > d.keep_id;

CREATE UNIQUE INDEX uk_places_itinerary_order ON places (itinerary_id, order_index);


-- ---------------------------------------------------------------------
-- Indices de apoio as consultas agregadas de roteiros e locais
-- ---------------------------------------------------------------------

-- /stats/itinerary-overview le start_date, end_date e rating na mesma
-- varredura (duracao media por DATEDIFF, nota media, avaliados e nao
-- avaliados). Com as tres colunas no mesmo indice, o agregado se resolve
-- percorrendo o indice, sem tocar na tabela.
--
-- idx_itineraries_start_date sai porque start_date e a primeira coluna do
-- novo indice, entao tudo que ele atendia (inclusive o GROUP BY por ano e
-- mes de /stats/itineraries-per-month) o novo atende. idx_itineraries_rating
-- sai porque nenhuma consulta filtra ou ordena por rating: ele existia so
-- para essa media, que agora vem do indice composto. Indice que nao e lido
-- continua sendo pago em cada insert e update.
DROP INDEX idx_itineraries_start_date ON itineraries;
DROP INDEX idx_itineraries_rating     ON itineraries;
CREATE INDEX idx_itineraries_overview ON itineraries (start_date, end_date, rating);

-- /stats/places-by-category nao agrupa por category, e sim pelo rotulo
-- COALESCE(NULLIF(TRIM(category), ''), 'Outros') -- e um indice comum nao
-- serve para agrupar por expressao. O indice funcional guarda o resultado ja
-- calculado, que e exatamente a chave do GROUP BY.
DROP INDEX idx_places_category ON places;
CREATE INDEX idx_places_category_label
    ON places ((COALESCE(NULLIF(TRIM(category), ''), 'Outros')));

-- /stats/top-rated-places e /stats/most-commented-places montam o nome do
-- lugar com ROW_NUMBER() OVER (PARTITION BY xid ORDER BY id). As tres colunas
-- que a subconsulta le entram no indice, entao ela se resolve percorrendo o
-- indice e nunca chega na tabela. O EXPLAIN mostra que o passo de ordenacao
-- do window function continua la -- o MySQL nao aproveita a ordem do indice
-- para dispensa-lo --, mas a ordenacao passa a ser sobre as colunas do indice
-- e nao sobre linhas inteiras. idx_places_xid sai por ser prefixo do novo.
DROP INDEX idx_places_xid ON places;
CREATE INDEX idx_places_xid_id_name ON places (xid, id, name);
