CREATE FUNCTION findpfights(integer DEFAULT NULL, integer DEFAULT NULL, integer DEFAULT NULL, integer DEFAULT NULL)
  RETURNS SETOF fights AS
$$ 
SELECT * FROM fights WHERE
($1 IS NULL OR $1 IN (player1, player2, player3, player4)) AND
($2 IS NULL OR $2 IN (player1, player2, player3, player4)) AND
($3 IS NULL OR $3 IN (player1, player2, player3, player4)) AND
($4 IS NULL OR $4 IN (player1, player2, player3, player4))
$$
  LANGUAGE sql;

CREATE FUNCTION findpfights(varchar DEFAULT NULL, varchar DEFAULT NULL, varchar DEFAULT NULL, varchar DEFAULT NULL)
  RETURNS SETOF fights AS
$$ 
SELECT * FROM fights WHERE
($1 IS NULL OR $1 IN (lower(p1name), lower(p2name), lower(p3name), lower(p4name))) AND
($2 IS NULL OR $2 IN (lower(p1name), lower(p2name), lower(p3name), lower(p4name))) AND
($3 IS NULL OR $3 IN (lower(p1name), lower(p2name), lower(p3name), lower(p4name))) AND
($4 IS NULL OR $4 IN (lower(p1name), lower(p2name), lower(p3name), lower(p4name)))
$$
  LANGUAGE sql;


CREATE FUNCTION findcfights(integer DEFAULT NULL, integer DEFAULT NULL, integer DEFAULT NULL, integer DEFAULT NULL)
  RETURNS SETOF fights AS
$$ 
SELECT * FROM fights WHERE
($1 IS NULL OR $1 IN (character1, character2, character3, character4)) AND
($2 IS NULL OR $2 IN (character1, character2, character3, character4)) AND
($3 IS NULL OR $3 IN (character1, character2, character3, character4)) AND
($4 IS NULL OR $4 IN (character1, character2, character3, character4))
$$
  LANGUAGE sql;


CREATE FUNCTION findcfights(varchar DEFAULT NULL, varchar DEFAULT NULL, varchar DEFAULT NULL, varchar DEFAULT NULL)
  RETURNS SETOF fights AS
$$ 
SELECT * FROM fights WHERE
($1 IS NULL OR $1 IN (lower(c1name), lower(c2name), lower(c3name), lower(c4name))) AND
($2 IS NULL OR $2 IN (lower(c1name), lower(c2name), lower(c3name), lower(c4name))) AND
($3 IS NULL OR $3 IN (lower(c1name), lower(c2name), lower(c3name), lower(c4name))) AND
($4 IS NULL OR $4 IN (lower(c1name), lower(c2name), lower(c3name), lower(c4name)))
$$
  LANGUAGE sql;

-- Alternate findcfights
CREATE FUNCTION findcfights(integer DEFAULT NULL, integer DEFAULT NULL, integer DEFAULT NULL, integer DEFAULT NULL)
  RETURNS SETOF fights AS
$$ 
WITH match AS (
    SELECT CASE 
        WHEN $1=$2 AND $1>0 THEN 1
        WHEN $1=$3 AND $1>0 THEN 1
        WHEN $1=$4 AND $1>0 THEN 1
        WHEN $2=$3 AND $2>0 THEN 1
        WHEN $2=$4 AND $2>0 THEN 1
        WHEN $3=$4 AND $3>0 THEN 1
        ELSE 0 END AS val
    )
SELECT * FROM fights WHERE
($1 IS NULL OR $1 IN (character1, character2, character3, character4)) AND
($2 IS NULL OR $2 IN (character1, character2, character3, character4)) AND
($3 IS NULL OR $3 IN (character1, character2, character3, character4)) AND
($4 IS NULL OR $4 IN (character1, character2, character3, character4)) AND
((SELECT val FROM match)=0 OR 
    ((SELECT val FROM match)=1 AND
        ((character1 in (character2, character3, character4)) OR
        (character2 in (character3, character4)) OR
        (character3 = character4)))
)
$$
  LANGUAGE sql;

CREATE FUNCTION findcfights(varchar DEFAULT NULL, varchar DEFAULT NULL, varchar DEFAULT NULL, varchar DEFAULT NULL)
  RETURNS SETOF fights AS
$$ 
WITH match AS (
    SELECT CASE 
        WHEN $1=$2 AND $1>'' THEN 1
        WHEN $1=$3 AND $1>'' THEN 1
        WHEN $1=$4 AND $1>'' THEN 1
        WHEN $2=$3 AND $2>'' THEN 1
        WHEN $2=$4 AND $2>'' THEN 1
        WHEN $3=$4 AND $3>'' THEN 1
        ELSE 0 END AS val
    )
SELECT * FROM fights WHERE
($1 IS NULL OR $1 IN (lower(c1name), lower(c2name), lower(c3name), lower(c4name))) AND
($2 IS NULL OR $2 IN (lower(c1name), lower(c2name), lower(c3name), lower(c4name))) AND
($3 IS NULL OR $3 IN (lower(c1name), lower(c2name), lower(c3name), lower(c4name))) AND
($4 IS NULL OR $4 IN (lower(c1name), lower(c2name), lower(c3name), lower(c4name))) AND
((SELECT val FROM match)=0 OR 
    ((SELECT val FROM match)=1 AND
        ((character1 in (character2, character3, character4)) OR
        (character2 in (character3, character4)) OR
        (character3 = character4)))
)
$$
  LANGUAGE sql;
