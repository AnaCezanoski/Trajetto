-- =====================================================================
-- V2 - Indices que sustentam os indicadores do painel gerencial (BE02.1)
-- =====================================================================

-- Regra: um e-mail pertence a um unico usuario

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

-- Recuperacao de senha.
-- Nao e UNIQUE de proposito: o codigo tem 6 digitos aleatorios e pode se
-- repetir entre usuarios diferentes sem que isso seja um erro.
CREATE INDEX idx_password_reset_user_code ON password_reset_tokens (user_code, code);
