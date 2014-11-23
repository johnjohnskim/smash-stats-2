--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: u_characters; Type: TABLE; Schema: public; Owner: dev; Tablespace: 
--

CREATE TABLE u_characters (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    rating integer,
    notes character varying(255)
);


ALTER TABLE public.u_characters OWNER TO dev;

--
-- Name: characters; Type: VIEW; Schema: public; Owner: dev
--

CREATE VIEW characters AS
 SELECT u_characters.id,
    u_characters.name,
    u_characters.rating,
    u_characters.notes
   FROM u_characters;


ALTER TABLE public.characters OWNER TO dev;

--
-- Name: u_players; Type: TABLE; Schema: public; Owner: dev; Tablespace: 
--

CREATE TABLE u_players (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    rating integer,
    notes character varying(255)
);


ALTER TABLE public.u_players OWNER TO dev;

--
-- Name: players; Type: VIEW; Schema: public; Owner: dev
--

CREATE VIEW players AS
 SELECT u_players.id,
    u_players.name,
    u_players.rating,
    u_players.notes
   FROM u_players;


ALTER TABLE public.players OWNER TO dev;

--
-- Name: u_stages; Type: TABLE; Schema: public; Owner: dev; Tablespace: 
--

CREATE TABLE u_stages (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    rating integer,
    notes character varying(255)
);


ALTER TABLE public.u_stages OWNER TO dev;

--
-- Name: stages; Type: VIEW; Schema: public; Owner: dev
--

CREATE VIEW stages AS
 SELECT u_stages.id,
    u_stages.name,
    u_stages.rating,
    u_stages.notes
   FROM u_stages;


ALTER TABLE public.stages OWNER TO dev;

--
-- Name: u_fights; Type: TABLE; Schema: public; Owner: dev; Tablespace: 
--

CREATE TABLE u_fights (
    id integer NOT NULL,
    date timestamp without time zone DEFAULT now(),
    player1 integer,
    player2 integer,
    player3 integer,
    player4 integer,
    character1 integer,
    character2 integer,
    character3 integer,
    character4 integer,
    stage integer NOT NULL,
    winner integer NOT NULL,
    rating integer,
    notes character varying(255)
);


ALTER TABLE public.u_fights OWNER TO dev;

--
-- Name: fights; Type: VIEW; Schema: public; Owner: dev
--

CREATE VIEW fights AS
 SELECT x.id,
    x.date,
    x.player1,
    x.p1name,
    x.player2,
    x.p2name,
    x.player3,
    x.p3name,
    x.player4,
    x.p4name,
    x.character1,
    x.c1name,
    x.character2,
    x.c2name,
    x.character3,
    x.c3name,
    x.character4,
    x.c4name,
    x.stage,
    x.stagename,
    x.winner,
    p.name AS winnername,
    x.winnerchar,
    c.name AS winnercharname,
    x.notes
   FROM ((( SELECT DISTINCT f.id,
            f.date,
            f.player1,
            p1.name AS p1name,
            f.player2,
            p2.name AS p2name,
            f.player3,
            p3.name AS p3name,
            f.player4,
            p4.name AS p4name,
            f.character1,
            c1.name AS c1name,
            f.character2,
            c2.name AS c2name,
            f.character3,
            c3.name AS c3name,
            f.character4,
            c4.name AS c4name,
            f.stage,
            s.name AS stagename,
            f.winner,
            f.rating,
            f.notes,
                CASE
                    WHEN (f.winner = f.player1) THEN f.character1
                    WHEN (f.winner = f.player2) THEN f.character2
                    WHEN (f.winner = f.player3) THEN f.character3
                    WHEN (f.winner = f.player4) THEN f.character4
                    ELSE NULL::integer
                END AS winnerchar
           FROM (((((((((u_fights f
             LEFT JOIN players p1 ON ((p1.id = f.player1)))
             LEFT JOIN players p2 ON ((p2.id = f.player2)))
             LEFT JOIN players p3 ON ((p3.id = f.player3)))
             LEFT JOIN players p4 ON ((p4.id = f.player4)))
             LEFT JOIN characters c1 ON ((c1.id = f.character1)))
             LEFT JOIN characters c2 ON ((c2.id = f.character2)))
             LEFT JOIN characters c3 ON ((c3.id = f.character3)))
             LEFT JOIN characters c4 ON ((c4.id = f.character4)))
             JOIN stages s ON ((s.id = f.stage)))) x
     JOIN players p ON ((p.id = x.winner)))
     JOIN characters c ON ((c.id = x.winnerchar)));


ALTER TABLE public.fights OWNER TO dev;

--
-- Name: u_characters_id_seq; Type: SEQUENCE; Schema: public; Owner: dev
--

CREATE SEQUENCE u_characters_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.u_characters_id_seq OWNER TO dev;

--
-- Name: u_characters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dev
--

ALTER SEQUENCE u_characters_id_seq OWNED BY u_characters.id;


--
-- Name: u_fights_id_seq; Type: SEQUENCE; Schema: public; Owner: dev
--

CREATE SEQUENCE u_fights_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.u_fights_id_seq OWNER TO dev;

--
-- Name: u_fights_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dev
--

ALTER SEQUENCE u_fights_id_seq OWNED BY u_fights.id;


--
-- Name: u_players_id_seq; Type: SEQUENCE; Schema: public; Owner: dev
--

CREATE SEQUENCE u_players_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.u_players_id_seq OWNER TO dev;

--
-- Name: u_players_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dev
--

ALTER SEQUENCE u_players_id_seq OWNED BY u_players.id;


--
-- Name: u_stages_id_seq; Type: SEQUENCE; Schema: public; Owner: dev
--

CREATE SEQUENCE u_stages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.u_stages_id_seq OWNER TO dev;

--
-- Name: u_stages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dev
--

ALTER SEQUENCE u_stages_id_seq OWNED BY u_stages.id;


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: dev
--

ALTER TABLE ONLY u_characters ALTER COLUMN id SET DEFAULT nextval('u_characters_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: dev
--

ALTER TABLE ONLY u_fights ALTER COLUMN id SET DEFAULT nextval('u_fights_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: dev
--

ALTER TABLE ONLY u_players ALTER COLUMN id SET DEFAULT nextval('u_players_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: dev
--

ALTER TABLE ONLY u_stages ALTER COLUMN id SET DEFAULT nextval('u_stages_id_seq'::regclass);


--
-- Data for Name: u_characters; Type: TABLE DATA; Schema: public; Owner: dev
--

COPY u_characters (id, name, rating, notes) FROM stdin;
1	Bowser	\N	\N
2	Bowser Jr.	\N	\N
3	Captain Falcon	\N	\N
4	Charizard	\N	\N
5	Dark Pit	\N	\N
6	Diddy Kong	\N	\N
7	Donkey Kong	\N	\N
8	Dr. Mario	\N	\N
9	Duck Hunt	\N	\N
10	Falco	\N	\N
11	Fox	\N	\N
12	Ganondorf	\N	\N
13	Greninja	\N	\N
14	Ike	\N	\N
15	Jigglypuff	\N	\N
16	King Dedede	\N	\N
17	Kirby	\N	\N
18	Link	\N	\N
19	Little Mac	\N	\N
20	Lucario	\N	\N
21	Lucina	\N	\N
22	Luigi	\N	\N
23	Mario	\N	\N
24	Marth	\N	\N
25	Mega Man	\N	\N
26	Meta Knight	\N	\N
27	Mii Brawler	\N	\N
28	Mii Gunner	\N	\N
29	Mii Swordfighter	\N	\N
30	Mr. Game & Watch	\N	\N
31	Ness	\N	\N
32	Olimar	\N	\N
33	Pac-Man	\N	\N
34	Palutena	\N	\N
35	Peach	\N	\N
36	Pikachu	\N	\N
37	Pit	\N	\N
38	R.O.B.	\N	\N
39	Robin	\N	\N
40	Rosalina & Luma	\N	\N
41	Samus	\N	\N
42	Sheik	\N	\N
43	Shulk	\N	\N
44	Sonic	\N	\N
45	Toon Link	\N	\N
46	Villager	\N	\N
47	Wario	\N	\N
48	Wii Fit Trainer	\N	\N
49	Yoshi	\N	\N
50	Zelda	\N	\N
51	Zero Suit Samus	\N	\N
52	Mewtwo	\N	\N
\.


--
-- Name: u_characters_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dev
--

SELECT pg_catalog.setval('u_characters_id_seq', 52, true);


--
-- Data for Name: u_fights; Type: TABLE DATA; Schema: public; Owner: dev
--

COPY u_fights (id, date, player1, player2, player3, player4, character1, character2, character3, character4, stage, winner, rating, notes) FROM stdin;
\.


--
-- Name: u_fights_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dev
--

SELECT pg_catalog.setval('u_fights_id_seq', 1, false);


--
-- Data for Name: u_players; Type: TABLE DATA; Schema: public; Owner: dev
--

COPY u_players (id, name, rating, notes) FROM stdin;
1	John	\N	\N
2	Lowell	\N	\N
3	Luke	\N	\N
4	Brett	\N	\N
\.


--
-- Name: u_players_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dev
--

SELECT pg_catalog.setval('u_players_id_seq', 4, true);


--
-- Data for Name: u_stages; Type: TABLE DATA; Schema: public; Owner: dev
--

COPY u_stages (id, name, rating, notes) FROM stdin;
1	75m	\N	\N
2	Battlefield	\N	\N
3	Big Battlefield	\N	\N
4	Boxing Ring	\N	\N
5	Bridge of Eldin	\N	\N
6	Castle Siege	\N	\N
7	Coliseum	\N	\N
8	Delfino Plaza	\N	\N
9	Duck Hunt	\N	\N
10	Final Destination	\N	\N
11	Flat Zone	\N	\N
12	Flat Zone 2	\N	\N
13	Gamer	\N	\N
14	Garden of Hope	\N	\N
15	Gaur Plain	\N	\N
16	Halberd	\N	\N
17	Jungle Hijinxs	\N	\N
18	Kalos Pokémon League	\N	\N
19	Kongo Jungle 64	\N	\N
20	Luigi's Mansion	\N	\N
21	Lylat Cruise	\N	\N
22	Mario Circuit	\N	\N
23	Mario Circuit (Brawl)	\N	\N
24	Mario Galaxy	\N	\N
25	Miiverse	\N	\N
26	Mushroom Kingdom U	\N	\N
27	Norfair	\N	\N
28	Onett 	\N	\N
29	Orbital Gate Assault	\N	\N
30	Pac-Land	\N	\N
31	Palutena's Temple	\N	\N
32	Pilotwings	\N	\N
33	Pokémon Stadium 2	\N	\N
34	Port Town Aero Dive	\N	\N
35	Pyrosphere	\N	\N
36	Skyloft	\N	\N
37	Skyworld	\N	\N
38	Smashville	\N	\N
39	Temple	\N	\N
40	The Great Cave Offensive	\N	\N
41	Town and City	\N	\N
42	Wii Fit Studio	\N	\N
43	Wily Castle	\N	\N
44	Windy Hill Zone	\N	\N
45	Woolly World	\N	\N
46	Wrecking Crew	\N	\N
47	Wuhu Island	\N	\N
48	Yoshi's Island	\N	\N
\.


--
-- Name: u_stages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dev
--

SELECT pg_catalog.setval('u_stages_id_seq', 48, true);


--
-- Name: u_characters_pkey; Type: CONSTRAINT; Schema: public; Owner: dev; Tablespace: 
--

ALTER TABLE ONLY u_characters
    ADD CONSTRAINT u_characters_pkey PRIMARY KEY (id);


--
-- Name: u_fights_pkey; Type: CONSTRAINT; Schema: public; Owner: dev; Tablespace: 
--

ALTER TABLE ONLY u_fights
    ADD CONSTRAINT u_fights_pkey PRIMARY KEY (id);


--
-- Name: u_players_pkey; Type: CONSTRAINT; Schema: public; Owner: dev; Tablespace: 
--

ALTER TABLE ONLY u_players
    ADD CONSTRAINT u_players_pkey PRIMARY KEY (id);


--
-- Name: u_stages_pkey; Type: CONSTRAINT; Schema: public; Owner: dev; Tablespace: 
--

ALTER TABLE ONLY u_stages
    ADD CONSTRAINT u_stages_pkey PRIMARY KEY (id);


--
-- Name: u_fights_character1_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY u_fights
    ADD CONSTRAINT u_fights_character1_fkey FOREIGN KEY (character1) REFERENCES u_characters(id);


--
-- Name: u_fights_character2_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY u_fights
    ADD CONSTRAINT u_fights_character2_fkey FOREIGN KEY (character2) REFERENCES u_characters(id);


--
-- Name: u_fights_character3_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY u_fights
    ADD CONSTRAINT u_fights_character3_fkey FOREIGN KEY (character3) REFERENCES u_characters(id);


--
-- Name: u_fights_character4_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY u_fights
    ADD CONSTRAINT u_fights_character4_fkey FOREIGN KEY (character4) REFERENCES u_characters(id);


--
-- Name: u_fights_player1_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY u_fights
    ADD CONSTRAINT u_fights_player1_fkey FOREIGN KEY (player1) REFERENCES u_players(id);


--
-- Name: u_fights_player2_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY u_fights
    ADD CONSTRAINT u_fights_player2_fkey FOREIGN KEY (player2) REFERENCES u_players(id);


--
-- Name: u_fights_player3_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY u_fights
    ADD CONSTRAINT u_fights_player3_fkey FOREIGN KEY (player3) REFERENCES u_players(id);


--
-- Name: u_fights_player4_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY u_fights
    ADD CONSTRAINT u_fights_player4_fkey FOREIGN KEY (player4) REFERENCES u_players(id);


--
-- Name: u_fights_stage_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY u_fights
    ADD CONSTRAINT u_fights_stage_fkey FOREIGN KEY (stage) REFERENCES u_stages(id);


--
-- Name: u_fights_winner_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dev
--

ALTER TABLE ONLY u_fights
    ADD CONSTRAINT u_fights_winner_fkey FOREIGN KEY (winner) REFERENCES u_players(id);


--
-- Name: public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

