CREATE VIEW characters AS
SELECT * FROM u_characters;

CREATE VIEW stages AS
SELECT * FROM u_stages;

CREATE VIEW players AS
SELECT * FROM u_players;

CREATE VIEW fights AS
  SELECT x.id,
    x.date,
    x.player1,
    x.p1name,
    x.player2,
    x.p2name,
    x.character1,
    x.c1name,
    x.character2,
    x.c2name,
    x.stage,
    x.stagename,
    x.winner,
    p.name AS winnername,
    x.winnerchar,
    c.name AS winnercharname,
    x.rating,
    x.notes
   FROM ( SELECT DISTINCT
            f.id,
            f.date,
            f.player1,
            p1.name AS p1name,
            f.player2,
            p2.name AS p2name,
            f.character1,
            c1.name AS c1name,
            f.character2,
            c2.name AS c2name,
            f.stage,
            s.name AS stagename,
            f.winner,
            f.rating,
            f.notes,
            CASE
              WHEN f.winner = f.player1 THEN f.character1
              WHEN f.winner = f.player2 THEN f.character2
              ELSE NULL
            END AS winnerchar
          FROM u_fights f
            LEFT JOIN players p1 ON p1.id = f.player1
            LEFT JOIN players p2 ON p2.id = f.player2
            LEFT JOIN characters c1 ON c1.id = f.character1
            LEFT JOIN characters c2 ON c2.id = f.character2
            INNER JOIN stages s ON s.id = f.stage) x
     INNER JOIN players p ON p.id = x.winner
     INNER JOIN characters c ON c.id = x.winnerchar;
