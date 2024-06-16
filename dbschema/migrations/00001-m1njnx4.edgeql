CREATE MIGRATION m1njnx46uty7ek344kwba66mmb2rlimnlvoflausq4tpjkesolkzfq
    ONTO initial
{
  CREATE EXTENSION pgcrypto VERSION '1.3';
  CREATE EXTENSION auth VERSION '1.0';
  CREATE SCALAR TYPE default::TitleType EXTENDING enum<MOVIE, SERIES>;
  CREATE TYPE default::Title {
      CREATE REQUIRED PROPERTY genres: array<std::int32>;
      CREATE REQUIRED PROPERTY tmdbId: std::int32;
      CREATE REQUIRED PROPERTY type: default::TitleType;
      CREATE CONSTRAINT std::exclusive ON ((.tmdbId, .type));
      CREATE INDEX ON (.type);
      CREATE INDEX ON (.tmdbId);
      CREATE REQUIRED PROPERTY createdAt: std::datetime {
          SET default := (std::datetime_current());
      };
      CREATE PROPERTY description: std::str;
      CREATE PROPERTY imdbId: std::str;
      CREATE REQUIRED PROPERTY name: std::str;
      CREATE PROPERTY poster: std::str;
      CREATE PROPERTY posterBlur: std::str;
      CREATE PROPERTY rating: std::float32;
      CREATE REQUIRED PROPERTY release_date: cal::local_date;
      CREATE PROPERTY runtime: std::int32;
      CREATE PROPERTY updatedAt: std::datetime {
          CREATE REWRITE
              INSERT 
              USING (std::datetime_of_statement());
          CREATE REWRITE
              UPDATE 
              USING (std::datetime_of_statement());
      };
  };
  CREATE SCALAR TYPE default::TitleStatus EXTENDING enum<PENDING, WATCHING, UNFINISHED, FINISHED>;
  CREATE TYPE default::User {
      CREATE REQUIRED LINK identity: ext::auth::Identity {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE PROPERTY avatar: std::str;
      CREATE REQUIRED PROPERTY createdAt: std::datetime {
          SET default := (std::datetime_current());
      };
      CREATE REQUIRED PROPERTY email: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY name: std::str;
      CREATE REQUIRED PROPERTY status: default::TitleStatus {
          SET default := 'WATCHING';
      };
      CREATE PROPERTY updatedAt: std::datetime {
          CREATE REWRITE
              INSERT 
              USING (std::datetime_of_statement());
          CREATE REWRITE
              UPDATE 
              USING (std::datetime_of_statement());
      };
      CREATE PROPERTY username: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE INDEX ON (.username);
  };
  CREATE TYPE default::Follow {
      CREATE REQUIRED LINK followed: default::User {
          ON TARGET DELETE DELETE SOURCE;
      };
      CREATE REQUIRED LINK follower: default::User {
          ON TARGET DELETE DELETE SOURCE;
      };
      CREATE CONSTRAINT std::exclusive ON ((.follower, .followed));
      CREATE REQUIRED PROPERTY createdAt: std::datetime {
          SET default := (std::datetime_current());
      };
  };
  CREATE TYPE default::Hive {
      CREATE REQUIRED LINK addedBy: default::User {
          ON TARGET DELETE DELETE SOURCE;
      };
      CREATE REQUIRED LINK title: default::Title {
          ON TARGET DELETE DELETE SOURCE;
      };
      CREATE CONSTRAINT std::exclusive ON ((.title, .addedBy));
      CREATE REQUIRED PROPERTY status: default::TitleStatus;
      CREATE INDEX ON (.status);
      CREATE REQUIRED PROPERTY createdAt: std::datetime {
          SET default := (std::datetime_current());
      };
      CREATE PROPERTY currentEpisode: std::int32;
      CREATE PROPERTY currentSeason: std::int32;
      CREATE PROPERTY finishedAt: std::datetime;
      CREATE REQUIRED PROPERTY isFavorite: std::bool {
          SET default := false;
      };
      CREATE PROPERTY rating: std::float32;
      CREATE PROPERTY startedAt: std::datetime;
      CREATE PROPERTY updatedAt: std::datetime {
          CREATE REWRITE
              INSERT 
              USING (std::datetime_of_statement());
          CREATE REWRITE
              UPDATE 
              USING (std::datetime_of_statement());
      };
  };
  ALTER TYPE default::User {
      CREATE MULTI LINK followers := (.<followed[IS default::Follow]);
      CREATE MULTI LINK following := (.<follower[IS default::Follow]);
      CREATE MULTI LINK hive := (.<addedBy[IS default::Hive]);
  };
  CREATE GLOBAL default::CurrentUser := (std::assert_single((SELECT
      default::User
  FILTER
      (.identity = GLOBAL ext::auth::ClientTokenIdentity)
  )));
  CREATE TYPE default::Season {
      CREATE REQUIRED LINK title: default::Title {
          ON TARGET DELETE DELETE SOURCE;
      };
      CREATE REQUIRED PROPERTY season: std::int32;
      CREATE CONSTRAINT std::exclusive ON ((.title, .season));
      CREATE REQUIRED PROPERTY air_date: cal::local_date;
      CREATE REQUIRED PROPERTY createdAt: std::datetime {
          SET default := (std::datetime_current());
      };
      CREATE REQUIRED PROPERTY episodes: std::int32;
      CREATE PROPERTY updatedAt: std::datetime {
          CREATE REWRITE
              INSERT 
              USING (std::datetime_of_statement());
          CREATE REWRITE
              UPDATE 
              USING (std::datetime_of_statement());
      };
  };
  ALTER TYPE default::Title {
      CREATE MULTI LINK seasons := (.<title[IS default::Season]);
  };
};
