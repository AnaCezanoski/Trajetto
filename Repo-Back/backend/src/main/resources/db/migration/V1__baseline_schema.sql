-- =====================================================================
-- V1 - Baseline do esquema do Trajetto
--
-- Retrato da estrutura que a aplicacao vinha criando automaticamente ate
-- a adocao do Flyway. A partir daqui nenhuma alteracao de esquema e feita
-- pela aplicacao: toda mudanca entra como um novo arquivo V<n>__*.sql.
-- =====================================================================

CREATE TABLE users (
    code              BIGINT       NOT NULL AUTO_INCREMENT,
    first_name        VARCHAR(255),
    last_name         VARCHAR(255),
    email             VARCHAR(255),
    password          VARCHAR(255),
    telephone         VARCHAR(255),
    country           VARCHAR(255),
    birthDate         DATE,
    travelerProfile   VARCHAR(255),
    isAdmin           BIT,
    is_verified       BIT          NOT NULL,
    verification_code VARCHAR(255),
    PRIMARY KEY (code)
) ENGINE=InnoDB;

CREATE TABLE itineraries (
    id                 BIGINT     NOT NULL AUTO_INCREMENT,
    user_id            BIGINT     NOT NULL,
    start_date         DATE,
    end_date           DATE,
    date               VARCHAR(255),
    is_active          BIT,
    origin_latitude    FLOAT(53),
    origin_longitude   FLOAT(53),
    rating             INTEGER,
    rating_description TEXT,
    PRIMARY KEY (id),
    CONSTRAINT fk_itineraries_user FOREIGN KEY (user_id) REFERENCES users (code)
) ENGINE=InnoDB;

CREATE TABLE places (
    id                   BIGINT       NOT NULL AUTO_INCREMENT,
    itinerary_id         BIGINT,
    xid                  VARCHAR(255),
    name                 VARCHAR(255) NOT NULL,
    address              VARCHAR(255),
    latitude             FLOAT(53),
    longitude            FLOAT(53),
    estimated_visit_time TIME(6),
    order_index          INTEGER,
    opening_hours        VARCHAR(256),
    category             VARCHAR(255),
    fee                  VARCHAR(255),
    PRIMARY KEY (id),
    CONSTRAINT fk_places_itinerary FOREIGN KEY (itinerary_id) REFERENCES itineraries (id)
) ENGINE=InnoDB;

CREATE TABLE password_reset_tokens (
    id        BIGINT       NOT NULL AUTO_INCREMENT,
    user_code BIGINT       NOT NULL,
    code      VARCHAR(255) NOT NULL,
    expiresAt DATETIME(6)  NOT NULL,
    used      BIT          NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_password_reset_tokens_user FOREIGN KEY (user_code) REFERENCES users (code)
) ENGINE=InnoDB;

CREATE TABLE RatingModel (
    id              BIGINT  NOT NULL AUTO_INCREMENT,
    userId          BIGINT,
    user_name       VARCHAR(255),
    touristSpotXid  VARCHAR(255),
    rating          INTEGER NOT NULL,
    comment         VARCHAR(255),
    createdAt       DATETIME(6),
    PRIMARY KEY (id)
) ENGINE=InnoDB;
