-- =====================================================================
-- V6 - Restricoes de integridade e indices que faltavam (BE02.3)
--
-- A V2 e a V4 subiram para o banco quatro regras de negocio, todas de
-- unicidade. Esta migracao fecha o resto: os vinculos entre entidades, as
-- colunas que a aplicacao trata como obrigatorias e as faixas de valor que
-- so os DTOs conferem.
--
-- Cada item abaixo foi verificado num MySQL 8.0 antes de virar restricao --
-- todos passavam. Em particular, hoje o banco aceita uma avaliacao apontando
-- para um usuario que nao existe, uma nota 9 numa escala de 1 a 5 e um
-- roteiro que termina antes de comecar.
--
-- Como nas migracoes anteriores, cada restricao vem depois de um passo de
-- limpeza que deixa o banco em condicao de aceita-la. Em banco integro
-- nenhum desses passos altera uma linha.
-- =====================================================================


-- =====================================================================
-- 1. O vinculo que faltava: avaliacao -> usuario
--
-- RatingModel guarda userId como um Long solto, sem @ManyToOne, e foi por
-- isso que o Hibernate nunca criou a chave estrangeira: as outras tres
-- tabelas ganharam a sua porque a entidade declara a associacao. O
-- resultado e que RatingService.createRating grava o userId sem nunca
-- verificar se aquele usuario existe.
--
-- touristSpotXid e userId tambem passam a ser obrigatorios. Isso nao e so
-- higiene: o UNIQUE uk_rating_spot_user (V2), que garante uma avaliacao por
-- usuario em cada local, nao alcanca linha com NULL -- indice UNIQUE nao
-- compara NULLs entre si --, entao sem o NOT NULL a regra tinha uma porta
-- aberta.
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
--
-- DefaultUserService.deleteUser chama deleteById direto. Com as chaves
-- estrangeiras em RESTRICT, que e o padrao, apagar um usuario que tem
-- roteiro falha com erro de integridade -- ou seja, a remocao de usuario
-- pelo painel so funciona hoje para quem nunca gerou nada. E as avaliacoes,
-- que ate agora nao tinham chave nenhuma, ficavam orfas em silencio.
--
-- Roteiro, parada, token de recuperacao e avaliacao nao existem fora do dono:
-- CASCADE e a leitura correta desse vinculo, e e o que faz a operacao que a
-- aplicacao ja tenta fazer passar a funcionar por inteiro.
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
--
-- Fora daqui de proposito: password, first_name, last_name, telephone,
-- country e birthDate. O UserDTO exige todas no cadastro, mas o admin criado
-- pelo Bootstrapper na primeira subida nao tem telefone, pais nem data de
-- nascimento, e para password nao existe valor honesto de preenchimento --
-- um NOT NULL ali derrubaria a migracao num banco antigo em vez de corrigir
-- alguma coisa.
-- =====================================================================

-- E-mail e a identidade de login (findByEmail) e ja e UNIQUE desde a V2.
-- Conta sem e-mail nao consegue entrar nem recuperar a senha. O
-- preenchimento segue o mesmo padrao da V2 para e-mail duplicado: um
-- endereco claramente invalido, derivado do code, em vez de apagar a conta e
-- arrastar roteiros junto.
UPDATE users
SET email = CONCAT('sem-email.', code, '@invalido.local')
WHERE email IS NULL OR TRIM(email) = '';

ALTER TABLE users MODIFY email VARCHAR(255) NOT NULL;

-- isAdmin aceitava NULL, e a V3 teve de contornar isso contando NULL como
-- cliente para que admins + clientes fechasse com o total. Todo caminho de
-- cadastro grava o campo (o UserDTO usa boolean primitivo), entao o NULL so
-- existe como residuo. As consultas do painel mantem o COALESCE e o
-- "IS NULL OR": viram verificacao redundante, nao codigo errado.
UPDATE users SET isAdmin = 0 WHERE isAdmin IS NULL;
ALTER TABLE users MODIFY isAdmin BIT(1) NOT NULL DEFAULT b'0';


-- =====================================================================
-- 4. Faixas de valor que so os DTOs conferiam
--
-- RatingRequestDTO e RatingController declaram @Min(1) @Max(5) para a nota,
-- e PlaceRequestDTO exige latitude e longitude. Validacao de DTO cobre o que
-- entra pela API; nao cobre carga direta, script de manutencao nem um
-- endpoint novo que esqueca a anotacao. O CHECK cobre.
--
-- Cada limpeza escolhe a correcao menos destrutiva: nota fora da faixa e
-- trazida para dentro dela em vez de a avaliacao ser apagada com o
-- comentario junto; data final impossivel e coordenada impossivel viram NULL,
-- que e a forma de dizer "nao se sabe" nas tres colunas.
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
--
-- Medido com EXPLAIN FORMAT=TREE sobre uma base semeada (2.000 usuarios,
-- 4.000 roteiros, 20.000 locais, 5.000 avaliacoes), comparando o plano antes
-- e depois de cada indice. Oito das onze consultas do painel ja resolviam
-- por indice depois da V2 e da V4; estas tres nao.
-- =====================================================================

-- /stats/traveler-profiles: mesmo caso que a V4 corrigiu em places.category.
-- A V2 indexou a coluna, mas a consulta agrupa por uma expressao sobre ela,
-- e indice comum nao ordena por expressao -- o plano montava uma tabela
-- temporaria para agrupar. Com o indice funcional o agrupamento passa a ser
-- lido em ordem ("Aggregate using temporary table" vira "Group aggregate"
-- com "Stream results"). idx_users_traveler_profile sai: nenhuma consulta
-- filtra por travelerProfile, ele existia so para esta agregacao.
DROP INDEX idx_users_traveler_profile ON users;
CREATE INDEX idx_users_profile_label
    ON users ((COALESCE(NULLIF(TRIM(travelerProfile), ''), 'Sem perfil')));

-- /stats/itineraries-per-month agrupa por YEAR(start_date), MONTH(start_date).
-- Um indice sobre start_date ordena por data, nao por (ano, mes), entao servia
-- para varrer mas nao para agrupar. Com as duas expressoes no indice, e nessa
-- ordem, somem a tabela temporaria e tambem o passo final de ordenacao: o
-- resultado ja sai cronologico da leitura do indice.
CREATE INDEX idx_itineraries_year_month
    ON itineraries ((YEAR(start_date)), (MONTH(start_date)));

-- /stats/top-rated-places e /stats/most-commented-places agrupam por
-- touristSpotXid, mas leem tambem rating e comment. uk_rating_spot_user
-- comeca pelo xid e poderia servir ao agrupamento, so que nao carrega essas
-- duas colunas, e por isso o otimizador preferia varrer a tabela inteira.
-- Com as tres no mesmo indice a varredura passa a ser do indice, sem tocar na
-- tabela. A agregacao em si continua usando tabela temporaria nas duas: ela
-- acontece depois do join com a CTE dos nomes, e nesse ponto a ordem do
-- indice ja se perdeu.
CREATE INDEX idx_rating_spot_value ON RatingModel (touristSpotXid, rating, comment);
