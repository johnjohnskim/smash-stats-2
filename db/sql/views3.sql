CREATE VIEW PlayerTimeline AS
SELECT date, player, wins, total, CASE WHEN total=0 THEN null ELSE cast(wins AS float)/total END winpct
FROM (
    SELECT DISTINCT date, p.id, name player,
    (SELECT count(*) FROM fights WHERE p.id=winner AND date<=f.date) wins,
    (SELECT count(*) FROM findpfights(p.id) WHERE date<=f.date) total
    FROM fights f
    LEFT JOIN players p ON true
) r;

CREATE VIEW CharacterTimeline AS
SELECT date, character, wins, total, CASE WHEN total=0 THEN null ELSE cast(wins AS float)/total END winpct
FROM (
    SELECT DISTINCT date, c.id, c.name "character",
    (SELECT count(*) FROM fights WHERE c.id=winnerchar AND date<=f.date) wins,
    (SELECT count(*) FROM findcfights(c.id) WHERE date<=f.date) total
    FROM fights f
    LEFT JOIN characters c ON true
) r;
