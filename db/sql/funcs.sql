CREATE FUNCTION findfights(p integer, c integer)
  RETURNS SETOF fights AS
$$
SELECT * FROM fights WHERE
(player1=$1 AND character1=$2) OR
(player2=$1 AND character2=$2)
$$
  LANGUAGE sql;

CREATE FUNCTION findfights(p varchar, c varchar)
  RETURNS SETOF fights AS
$$
SELECT * FROM fights WHERE
(lower(player1name)=$1 AND lower(character1name)=$2) OR
(lower(player2name)=$1 AND lower(character2name)=$2)
$$
  LANGUAGE sql;

CREATE FUNCTION findfights(p integer, c varchar)
  RETURNS SETOF fights AS
$$
SELECT * FROM fights WHERE
(player1=$1 AND lower(character1name)=$2) OR
(player2=$1 AND lower(character2name)=$2)
$$
  LANGUAGE sql;

CREATE FUNCTION findfights(p varchar, c integer)
  RETURNS SETOF fights AS
$$
SELECT * FROM fights WHERE
(lower(player1name)=$1 AND character1=$2) OR
(lower(player2name)=$1 AND character2=$2)
$$
  LANGUAGE sql;
