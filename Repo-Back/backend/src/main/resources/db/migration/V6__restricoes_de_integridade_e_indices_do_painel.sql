-- =====================================================================
-- V6 - Restricoes de integridade e indices que faltavam (BE02.3)
--
-- A V2 e a V4 subiram para o banco quatro regras de negocio, todas de
-- unicidade.
-- Em particular, hoje o banco aceita uma avaliacao apontando
-- para um usuario que nao existe, uma nota 9 numa escala de 1 a 5 e um
-- roteiro que termina antes de comecar.
-- =====================================================================

-- =====================================================================
-- 1. O vinculo que faltava: avaliacao -> usuario
-- =====================================================================

-- Limpeza: avaliacao sem autor, sem local, ou apontando para usuario que ja
-- nao existe. Nenhuma delas e exibida em lugar nenhum: os rankings do painel
-- filtram por xid nao nulo, e a tela de um local busca por xid.
DELETE r FROM RatingModel r
LEFT JOIN users u ON u.code = r.userId
WHERE r.userId IS NULL
   OR u.code IS NULL
   OR r.touristSpotXid IS NULL
   OR TRIM(r.touristSpotXid) = '';

ALTER TABLE RatingModel
    MODIFY userId         BIGINT       NOT NULL,
    MODIFY touristSpotXid VARCHAR(255) NOT NULL;

ALTER TABLE RatingModel
    ADD CONSTRAINT fk_rating_user
        FOREIGN KEY (userId) REFERENCES users (code) ON DELETE CASCADE;


-- =====================================================================
-- 2. Os vinculos passam a levar os filhos junto
-- =====================================================================

ALTER TABLE itineraries DROP FOREIGN KEY fk_itineraries_user;
ALTER TABLE itineraries
    ADD CONSTRAINT fk_itineraries_user
        FOREIGN KEY (user_id) REFERENCES users (code) ON DELETE CASCADE;

ALTER TABLE password_reset_tokens DROP FOREIGN KEY fk_password_reset_tokens_user;
ALTER TABLE password_reset_tokens
    ADD CONSTRAINT fk_password_reset_tokens_user
        FOREIGN KEY (user_code) REFERENCES users (code) ON DELETE CASCADE;

-- Limpeza: parada sem roteiro nao tem sentido no modelo -- PlaceModel so
-- existe como parada de um roteiro, e o app sempre a cria junto com ele.
DELETE FROM places WHERE itinerary_id IS NULL;

ALTER TABLE places DROP FOREIGN KEY fk_places_itinerary;
ALTER TABLE places MODIFY itinerary_id BIGINT NOT NULL;
ALTER TABLE places
    ADD CONSTRAINT fk_places_itinerary
        FOREIGN KEY (itinerary_id) REFERENCES itineraries (id) ON DELETE CASCADE;


-- =====================================================================
-- 3. Colunas que a aplicacao ja trata como obrigatorias
-- =====================================================================
UPDATE users
SET email = CONCAT('sem-email.', code, '@invalido.local')
WHERE email IS NULL OR TRIM(email) = '';

ALTER TABLE users MODIFY email VARCHAR(255) NOT NULL;

UPDATE users SET isAdmin = 0 WHERE isAdmin IS NULL;
ALTER TABLE users MODIFY isAdmin BIT(1) NOT NULL DEFAULT b'0';


-- =====================================================================
-- 4. Faixas de valor que so os DTOs conferiam
-- =====================================================================

UPDATE RatingModel SET rating = LEAST(5, GREATEST(1, rating))
WHERE rating < 1 OR rating > 5;

ALTER TABLE RatingModel
    ADD CONSTRAINT ck_rating_valor CHECK (rating BETWEEN 1 AND 5);

UPDATE itineraries SET rating = LEAST(5, GREATEST(1, rating))
WHERE rating IS NOT NULL AND (rating < 1 OR rating > 5);

ALTER TABLE itineraries
    ADD CONSTRAINT ck_itineraries_nota CHECK (rating IS NULL OR rating BETWEEN 1 AND 5);

UPDATE itineraries SET end_date = NULL
WHERE start_date IS NOT NULL AND end_date IS NOT NULL AND end_date < start_date;

ALTER TABLE itineraries
    ADD CONSTRAINT ck_itineraries_periodo
        CHECK (start_date IS NULL OR end_date IS NULL OR end_date >= start_date);

UPDATE places SET latitude  = NULL WHERE latitude  IS NOT NULL AND (latitude  < -90  OR latitude  > 90);
UPDATE places SET longitude = NULL WHERE longitude IS NOT NULL AND (longitude < -180 OR longitude > 180);

ALTER TABLE places
    ADD CONSTRAINT ck_places_coordenadas CHECK (
        (latitude  IS NULL OR latitude  BETWEEN  -90 AND  90) AND
        (longitude IS NULL OR longitude BETWEEN -180 AND 180));

-- order_index e a posicao da parada na sequencia do roteiro, contada de zero.
UPDATE places SET order_index = NULL WHERE order_index < 0;

ALTER TABLE places
    ADD CONSTRAINT ck_places_ordem CHECK (order_index IS NULL OR order_index >= 0);


-- =====================================================================
-- 5. Os tres indices que faltavam no painel
-- =====================================================================

DROP INDEX idx_users_traveler_profile ON users;
CREATE INDEX idx_users_profile_label
    ON users ((COALESCE(NULLIF(TRIM(travelerProfile), ''), 'Sem perfil')));

CREATE INDEX idx_itineraries_year_month
    ON itineraries ((YEAR(start_date)), (MONTH(start_date)));

CREATE INDEX idx_rating_spot_value ON RatingModel (touristSpotXid, rating, comment);
