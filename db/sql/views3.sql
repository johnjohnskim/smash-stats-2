-- CREATE VIEW PlayerTimeline AS
-- SELECT date, player, wins, total, CASE WHEN total=0 THEN null ELSE cast(wins AS float)/total END winpct
-- FROM (
--     SELECT DISTINCT date, p.id, name player,
--     (SELECT count(*) FROM fights WHERE p.id=winner AND date<=f.date) wins,
--     (SELECT count(*) FROM findpfights(p.id) WHERE date<=f.date) total
--     FROM fights f
--     LEFT JOIN players p ON true
-- ) r WHERE total>0;

CREATE VIEW PlayerTimeline AS
SELECT CastedDate date, player, wins, total, CASE WHEN total=0 THEN null ELSE cast(wins AS float)/total END winpct, 1200+rating rating
FROM (
    SELECT distinct CastedDate, p.id, name player,
    (SELECT count(*) FROM fights WHERE p.id=winner AND CAST(date as date)<=CastedDate) wins,
    (SELECT count(*) FROM findpfights(p.id) WHERE CAST(date as date)<=CastedDate) total,
    (SELECT sum(rating * CASE WHEN winner=p.id THEN 1 ELSE -1 END) FROM findpfights(p.id) WHERE CAST(date as date)<=CastedDate) rating
    FROM (SELECT *, CAST(date as date) CastedDate FROM fights) f
    LEFT JOIN players p ON true
) r WHERE total>0;

-- CREATE VIEW PlayerRatingTimeline AS
-- SELECT CastedDate date, player, rating
-- FROM (
--     SELECT distinct CastedDate, p.id, name player,
--     (SELECT sum(rating * CASE WHEN winner=p.id THEN 1 ELSE -1 END) FROM findpfights(p.id) WHERE CAST(date as date)<=CastedDate) rating
--     FROM (SELECT *, CAST(date as date) CastedDate FROM fights) f
--     LEFT JOIN players p ON true
-- ) r WHERE rating!=0

CREATE VIEW CharacterTimeline AS
SELECT CastedDate date, character, wins, total, CASE WHEN total=0 THEN null ELSE cast(wins AS float)/total END winpct
FROM (
    SELECT DISTINCT CastedDate, c.id, c.name "character",
    (SELECT count(*) FROM fights WHERE c.id=winnerchar AND CAST(date as date)<=CastedDate) wins,
    (SELECT count(*) FROM findcfights(c.id) WHERE CAST(date as date)<=CastedDate) total
    FROM (SELECT *, CAST(date as date) CastedDate FROM fights) f
    LEFT JOIN characters c ON true
) r WHERE total>0;
