CREATE TABLE u_characters
(
  id serial PRIMARY KEY,
  name varchar(50) NOT NULL,
  rating int,
  notes varchar(255)
);

CREATE TABLE u_stages
(
  id serial PRIMARY KEY,
  name varchar(50) NOT NULL,
  rating int,
  notes varchar(255)
);

CREATE TABLE u_players
(
  id serial PRIMARY KEY,
  name varchar(50) NOT NULL,
  rating int,
  notes varchar(255)
);

CREATE TABLE u_fights
(
  id serial PRIMARY KEY,
  date timestamp DEFAULT now(),
  player1 integer REFERENCES u_players,
  player2 integer REFERENCES u_players,
  player3 integer REFERENCES u_players,
  player4 integer REFERENCES u_players,
  character1 integer REFERENCES u_characters,
  character2 integer REFERENCES u_characters,
  character3 integer REFERENCES u_characters,
  character4 integer REFERENCES u_characters,
  stage integer NOT NULL REFERENCES u_stages,
  winner integer NOT NULL REFERENCES u_players,
  rating int,
  notes varchar(255)
);
