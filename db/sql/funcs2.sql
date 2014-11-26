CREATE FUNCTION findpfights(integer DEFAULT NULL, integer DEFAULT NULL)
  RETURNS SETOF fights AS
$$
SELECT * FROM fights WHERE
($1 IS NULL OR $1 IN (player1, player2)) AND
($2 IS NULL OR $2 IN (player1, player2))
$$
  LANGUAGE sql;

CREATE FUNCTION findpfights(varchar DEFAULT NULL, varchar DEFAULT NULL)
  RETURNS SETOF fights AS
$$
SELECT * FROM fights WHERE
($1 IS NULL OR $1 IN (lower(player1name), lower(player2name))) AND
($2 IS NULL OR $2 IN (lower(player1name), lower(player2name)))
$$
  LANGUAGE sql;


CREATE FUNCTION findcfights(integer DEFAULT NULL, integer DEFAULT NULL)
  RETURNS SETOF fights AS
$$
SELECT * FROM fights WHERE
($1 IS NULL OR $1 IN (character1, character2)) AND
($2 IS NULL OR $2 IN (character1, character2))
$$
  LANGUAGE sql;


CREATE FUNCTION findcfights(varchar DEFAULT NULL, varchar DEFAULT NULL)
  RETURNS SETOF fights AS
$$
SELECT * FROM fights WHERE
($1 IS NULL OR $1 IN (lower(character1name), lower(character2name))) AND
($2 IS NULL OR $2 IN (lower(character1name), lower(character2name)))
$$
  LANGUAGE sql;

-- Alternate findcfights
CREATE FUNCTION findcfights(integer DEFAULT NULL, integer DEFAULT NULL)
  RETURNS SETOF fights AS
$$
SELECT * FROM fights WHERE
($1 IS NULL OR $1 IN (character1, character2)) AND
($2 IS NULL OR $2 IN (character1, character2)) AND
(($1=$2 AND character1=character2) OR ($1!=$2 AND character1!=character2))
$$
  LANGUAGE sql;

CREATE FUNCTION findcfights(varchar DEFAULT NULL, varchar DEFAULT NULL)
  RETURNS SETOF fights AS
$$
SELECT * FROM fights WHERE
($1 IS NULL OR $1 IN (lower(character1name), lower(character2name))) AND
($2 IS NULL OR $2 IN (lower(character1name), lower(character2name))) AND
(($1=$2 AND character1=character2) OR ($1!=$2 AND character1!=character2))
$$
  LANGUAGE sql;
