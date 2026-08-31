-- =====================================================================
-- V5 - Stored procedure dos indicadores de roteiros do painel (BE02.2)
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
