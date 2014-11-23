CREATE VIEW stagemeta AS
 SELECT s.name,
    ( SELECT count(*) AS count
           FROM fights
          WHERE fights.stage = s.id) AS total
   FROM stages s;

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
 SELECT x.pid1,
    x.pname1,
    x.pid2,
    x.pname2,
    x.total,
    x.wins,
        CASE
            WHEN x.total = 0 THEN NULL
            ELSE cast(x.wins AS float) / cast(x.total AS float)
        END AS winpct
   FROM ( SELECT p.id AS pid1,
            p.name AS pname1,
            q.id AS pid2,
            q.name AS pname2,
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
 SELECT x.cid1,
    x.cname1,
    x.cid2,
    x.cname2,
    x.total,
    x.wins,
        CASE
            WHEN x.total = 0 THEN NULL
            ELSE cast(x.wins AS float) / cast(x.total AS float)
        END AS winpct
   FROM ( SELECT c.id AS cid1,
            c.name AS cname1,
            d.id AS cid2,
            d.name AS cname2,
            ( SELECT count(*) AS count
                   FROM findcfights(c.id, d.id) ) AS total,
            ( SELECT count(*) AS count
                   FROM findcfights(c.id, d.id)
                  WHERE winnerchar = c.id ) AS wins
           FROM characters c
             LEFT JOIN characters d ON c.id != d.id) x;
