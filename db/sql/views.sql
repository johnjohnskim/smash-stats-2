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
    x.player1name,
    x.player2,
    x.player2name,
    x.player3,
    x.player3name,
    x.player4,
    x.player4name,
    x.character1,
    x.character1name,
    x.character2,
    x.character2name,
    x.character3,
    x.character3name,
    x.character4,
    x.character4name,
    x.stage,
    x.stagename,
    x.winner,
    p.name AS winnername,
    x.winner2,
    q.name AS winner2name,
    x.winnerchar,
    c.name AS winnercharname,
    x.winner2char,
    d.name AS winner2charname,
    x.rating1,
    x.rating2,
    x.rating3,
    x.rating4,
    x.type,
    x.notes
  FROM ( SELECT DISTINCT
            f.id,
            f.date,
            f.player1,
            p1.name AS player1name,
            f.player2,
            p2.name AS player2name,
            f.player3,
            p3.name AS player3name,
            f.player4,
            p4.name AS player4name,
            f.character1,
            c1.name AS character1name,
            f.character2,
            c2.name AS character2name,
            f.character3,
            c3.name AS character3name,
            f.character4,
            c4.name AS character4name,
            f.stage,
            s.name AS stagename,
            f.winner,
            f.winner2,
            f.rating1,
            f.rating2,
            f.rating3,
            f.rating4,
            f.type,
            f.notes,
            CASE
              WHEN f.winner = f.player1 THEN f.character1
              WHEN f.winner = f.player2 THEN f.character2
              WHEN f.winner = f.player3 THEN f.character3
              WHEN f.winner = f.player4 THEN f.character4
              ELSE NULL
            END AS winnerchar,
            CASE
              WHEN f.winner2 = f.player1 THEN f.character1
              WHEN f.winner2 = f.player2 THEN f.character2
              WHEN f.winner2 = f.player3 THEN f.character3
              WHEN f.winner2 = f.player4 THEN f.character4
              ELSE NULL
            END AS winner2char
          FROM u_fights f
            LEFT JOIN players p1 ON p1.id = f.player1
            LEFT JOIN players p2 ON p2.id = f.player2
            LEFT JOIN players p3 ON p3.id = f.player3
            LEFT JOIN players p4 ON p4.id = f.player4
            LEFT JOIN characters c1 ON c1.id = f.character1
            LEFT JOIN characters c2 ON c2.id = f.character2
            LEFT JOIN characters c3 ON c3.id = f.character3
            LEFT JOIN characters c4 ON c4.id = f.character4
            INNER JOIN stages s ON s.id = f.stage) x
    INNER JOIN players p ON p.id = x.winner
    LEFT JOIN players q ON q.id = x.winner2
    INNER JOIN characters c ON c.id = x.winnerchar
    LEFT JOIN characters d ON d.id = x.winner2char;

CREATE VIEW events AS
SELECT * FROM u_events;
