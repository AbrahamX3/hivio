CREATE MIGRATION m13sib7oouq5jl6urvqqoe6blkbsylcdcd6jvocu4i5rye35la6zea
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
      CREATE REQUIRED PROPERTY createdAt: std::datetime {
          SET default := (std::datetime_current());
      };
      CREATE REQUIRED PROPERTY date: cal::local_date;
      CREATE PROPERTY description: std::str;
      CREATE PROPERTY imdbId: std::str;
      CREATE REQUIRED PROPERTY name: std::str;
      CREATE PROPERTY poster: std::str;
      CREATE PROPERTY posterBlur: std::str;
      CREATE PROPERTY rating: std::float32;
      CREATE PROPERTY updatedAt: std::datetime {
          CREATE REWRITE
              INSERT 
              USING (std::datetime_of_statement());
          CREATE REWRITE
              UPDATE 
              USING (std::datetime_of_statement());
      };
  };
  CREATE SCALAR TYPE default::TitleStatus EXTENDING enum<UPCOMING, PENDING, WATCHING, UNFINISHED, FINISHED>;
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
  };
  CREATE TYPE default::Follower {
      CREATE REQUIRED LINK follower: default::User;
      CREATE REQUIRED LINK followed: default::User;
      CREATE CONSTRAINT std::exclusive ON ((.follower, .followed));
      CREATE REQUIRED PROPERTY createdAt: std::datetime {
          SET default := (std::datetime_current());
      };
  };
  ALTER TYPE default::User {
      CREATE MULTI LINK followers := (.<follower[IS default::Follower]);
  };
  CREATE GLOBAL default::CurrentUser := (std::assert_single((SELECT
      default::User
  FILTER
      (.identity = GLOBAL ext::auth::ClientTokenIdentity)
  )));
  CREATE TYPE default::Hive {
      CREATE REQUIRED LINK addedBy: default::User;
      CREATE REQUIRED LINK title: default::Title {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY createdAt: std::datetime {
          SET default := (std::datetime_current());
      };
      CREATE PROPERTY finishedAt: std::datetime;
      CREATE REQUIRED PROPERTY isFavorite: std::bool {
          SET default := false;
      };
      CREATE PROPERTY rating: std::float32;
      CREATE REQUIRED PROPERTY status: default::TitleStatus;
      CREATE PROPERTY updatedAt: std::datetime {
          CREATE REWRITE
              INSERT 
              USING (std::datetime_of_statement());
          CREATE REWRITE
              UPDATE 
              USING (std::datetime_of_statement());
      };
  };
  CREATE TYPE default::Season {
      CREATE REQUIRED LINK title: default::Title;
      CREATE REQUIRED PROPERTY season: std::int32;
      CREATE CONSTRAINT std::exclusive ON ((.title, .season));
      CREATE REQUIRED PROPERTY createdAt: std::datetime {
          SET default := (std::datetime_current());
      };
      CREATE REQUIRED PROPERTY date: cal::local_date;
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
