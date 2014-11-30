-- CREATE VIEW stagemeta AS
--  SELECT s.id,
--     s.name,
--     ( SELECT count(*) AS count
--            FROM fights
--           WHERE fights.stage = s.id) AS total
--    FROM stages s;

CREATE VIEW stagemeta AS
 SELECT s.id, s.name, f.count total, CAST(f.ratingChange AS int) ratingChange
   FROM stages s
   LEFT JOIN (SELECT count(*) count, avg(abs(rating1)) ratingChange, stage
              FROM fights GROUP BY stage) f ON f.stage=s.id

CREATE VIEW stagewins AS
 SELECT x.player,
    x.playername,
    x.stage,
    x.stagename,
    x.total,
    x.wins,
    CASE
        WHEN x.total = 0 THEN NULL
        ELSE cast(x.wins as float) / cast(x.total as float)
    END AS winpct
   FROM ( SELECT p.id AS player,
            p.name AS playername,
            s.id AS stage,
            s.name AS stagename,
            ( SELECT count(*) AS count
                  FROM findpfights(p.id)
                  WHERE stage = s.id ) AS total,
            ( SELECT count(*) AS count
                  FROM findpfights(p.id)
                  WHERE stage = s.id AND winner = p.id ) AS wins
           FROM players p
            LEFT JOIN stages s ON true) x;

CREATE VIEW playermeta AS
 SELECT x.id,
    x.name,
    x.total,
    x.wins,
    CASE
        WHEN x.total = 0 THEN NULL
        ELSE cast(x.wins AS float) / cast(x.total AS float)
    END AS winpct
   FROM ( SELECT p.id,
            p.name,
            ( SELECT count(*) AS count
                   FROM findpfights(p.id) ) AS total,
            ( SELECT count(*) AS count
                   FROM findpfights(p.id)
                  WHERE winner = p.id ) AS wins
           FROM players p) x;

CREATE VIEW playervs AS
 SELECT x.player1,
    x.player1name,
    x.player2,
    x.player2name,
    x.total,
    x.wins,
        CASE
            WHEN x.total = 0 THEN NULL
            ELSE cast(x.wins AS float) / cast(x.total AS float)
        END AS winpct
   FROM ( SELECT p.id AS player1,
            p.name AS player1name,
            q.id AS player2,
            q.name AS player2name,
            ( SELECT count(*) AS count
                   FROM findpfights(p.id, q.id) ) AS total,
            ( SELECT count(*) AS count
                   FROM findpfights(p.id, q.id)
                  WHERE winner = p.id ) AS wins
           FROM players p
             LEFT JOIN players q ON p.id != q.id) x;

CREATE VIEW characterwins AS
 SELECT  x.player,
     x.playername,
     x."character",
     x.charactername,
     x.total,
     x.wins,
        CASE
            WHEN  x.total = 0 THEN NULL
            ELSE  cast(x.wins AS float) /  cast(x.total AS float)
        END AS winpct
   FROM ( SELECT p.id AS player,
            p.name AS playername,
            c.id AS "character",
            c.name AS charactername,
            ( SELECT count(*) AS count
                   FROM findfights(p.id, c.id) ) AS total,
            ( SELECT count(*) AS count
                   FROM findfights(p.id, c.id)
                  WHERE winner = p.id ) AS wins
           FROM players p
             LEFT JOIN characters c ON true) x;

CREATE VIEW charactermeta AS
 SELECT x.id,
    x.name,
    x.total,
    x.wins,
        CASE
            WHEN x.total = 0 THEN NULL
            ELSE cast(x.wins AS float) / cast(x.total AS float)
        END AS winpct
   FROM ( SELECT c.id,
            c.name,
            ( SELECT count(*) AS count
                   FROM findcfights(c.id) ) AS total,
            ( SELECT count(*) AS count
                   FROM findcfights(c.id)
                  WHERE winnerchar=c.id ) AS wins
           FROM characters c) x;

CREATE VIEW charactervs AS
 SELECT x.character1,
    x.character1name,
    x.character2,
    x.character2name,
    x.total,
    x.wins,
        CASE
            WHEN x.total = 0 THEN NULL
            ELSE cast(x.wins AS float) / cast(x.total AS float)
        END AS winpct
   FROM ( SELECT c.id AS character1,
            c.name AS character1name,
            d.id AS character2,
            d.name AS character2name,
            ( SELECT count(*) AS count
                   FROM findcfights(c.id, d.id) ) AS total,
            ( SELECT count(*) AS count
                   FROM findcfights(c.id, d.id)
                  WHERE winnerchar = c.id ) AS wins
           FROM characters c
             LEFT JOIN characters d ON c.id != d.id) x;
