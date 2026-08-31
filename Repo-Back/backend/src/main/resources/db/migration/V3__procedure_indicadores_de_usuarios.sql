-- =====================================================================
-- V3 - Stored procedure dos indicadores de usuarios do painel (BE02.1)
--
-- Os cartoes do topo do painel gerencial (total de usuarios, admins,
-- clientes, verificados, nao verificados, idade media e total de roteiros)
-- vinham de varias consultas somadas no Java, sendo uma delas um
-- findAll() que trazia a tabela de usuarios inteira para a memoria da
-- aplicacao so para contar.
--
-- A procedure devolve os sete numeros em uma unica linha, calculados
-- dentro do banco. A aplicacao passa a trafegar uma linha em vez de N
-- usuarios.
-- =====================================================================

DROP PROCEDURE IF EXISTS sp_stats_user_overview;

CREATE PROCEDURE sp_stats_user_overview()
    READS SQL DATA
    SQL SECURITY INVOKER
    SELECT
        COUNT(*)                                                          AS totalUsers,
        COALESCE(SUM(COALESCE(u.isAdmin, 0) = 1), 0)                      AS totalAdmins,
        COALESCE(SUM(COALESCE(u.isAdmin, 0) = 0), 0)                      AS totalClients,
        COALESCE(SUM(u.is_verified = 1), 0)                               AS verifiedUsers,
        COALESCE(SUM(u.is_verified = 0), 0)                               AS unverifiedUsers,
        ROUND(AVG(CASE
                      WHEN u.birthDate IS NULL THEN NULL
                      ELSE YEAR(CURDATE()) - YEAR(u.birthDate)
                  END))                                                   AS avgAge,
        (SELECT COUNT(*) FROM itineraries)                                AS totalItineraries
    FROM users u;
