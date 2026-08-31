-- =====================================================================
-- V5 - Stored procedure dos indicadores de roteiros do painel (BE02.2)
--
-- Contraparte da sp_stats_user_overview (V3) para os cartoes de roteiros:
-- total de roteiros, duracao media em dias, nota media, quantos foram
-- avaliados e quantos nao foram.
--
-- Os quatro primeiros numeros ja vinham agregados do banco desde a BE02.1,
-- mas duas contas ainda eram refeitas na aplicacao: o arredondamento das
-- medias e o total de nao avaliados, obtido subtraindo os avaliados do
-- total. Aqui as cinco colunas saem prontas e o Java so repassa.
--
-- Por que uma rotina e nao mais uma consulta anotada: e o mesmo indicador
-- que a V3 resolveu do lado de usuarios, e mantendo os dois no mesmo lugar
-- a definicao dos cartoes do painel fica versionada com o esquema, nao
-- espalhada entre esquema e codigo.
--
-- READS SQL DATA declara ao servidor que a rotina apenas consulta. Sem isso
-- o MySQL recusa a chamada quando a conexao esta marcada como somente
-- leitura. O corpo e uma instrucao unica, sem BEGIN ... END, para nao
-- depender de troca de DELIMITER na leitura do arquivo pelo Flyway.
--
-- Observacoes sobre o calculo, ambas mantendo o numero que o painel ja
-- exibia:
--
-- - a duracao e DATEDIFF(end_date, start_date), em dias, e o CASE deixa
--   fora da media o roteiro que nao tem as duas datas -- media sobre nada e
--   NULL, e o painel entende NULL como "sem dado", nao como zero;
-- - avaliado e o roteiro com rating preenchido; avaliados + nao avaliados
--   fecham com o total por construcao, o que a subtracao feita no Java
--   tambem dava, mas sem o banco garantir.
-- =====================================================================

DROP PROCEDURE IF EXISTS sp_stats_itinerary_overview;

CREATE PROCEDURE sp_stats_itinerary_overview()
    READS SQL DATA
    SQL SECURITY INVOKER
    SELECT
        COUNT(*)                                                            AS totalItineraries,
        ROUND(AVG(CASE
                      WHEN i.start_date IS NULL OR i.end_date IS NULL THEN NULL
                      ELSE DATEDIFF(i.end_date, i.start_date)
                  END), 1)                                                  AS avgDurationDays,
        ROUND(AVG(i.rating), 1)                                             AS avgRating,
        COALESCE(SUM(i.rating IS NOT NULL), 0)                              AS ratedCount,
        COALESCE(SUM(i.rating IS NULL), 0)                                  AS unratedCount
    FROM itineraries i;
