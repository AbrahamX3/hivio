CREATE MIGRATION m1zvlayuz5um325fsexarnzwonoqttev5inc7gx2kw5poh2zx4riwa
    ONTO initial
{
  CREATE EXTENSION pgcrypto VERSION '1.3';
  CREATE EXTENSION auth VERSION '1.0';
  CREATE SCALAR TYPE default::TitleType EXTENDING enum<MOVIE, SERIES>;
  CREATE TYPE default::Title {
      CREATE REQUIRED PROPERTY genres: array<std::int32>;
      CREATE REQUIRED PROPERTY createdAt: std::datetime {
          SET default := (std::datetime_current());
      };
      CREATE REQUIRED PROPERTY date: cal::local_date;
      CREATE PROPERTY description: std::str;
      CREATE REQUIRED PROPERTY imdbId: std::str;
      CREATE PROPERTY poster: std::str;
      CREATE PROPERTY posterBlur: std::str;
      CREATE REQUIRED PROPERTY title: std::str;
      CREATE REQUIRED PROPERTY tmdbId: std::int32;
      CREATE PROPERTY type: default::TitleType;
      CREATE PROPERTY updated: std::datetime {
          CREATE REWRITE
              INSERT 
              USING (std::datetime_of_statement());
          CREATE REWRITE
              UPDATE 
              USING (std::datetime_of_statement());
      };
  };
  CREATE TYPE default::User {
      CREATE REQUIRED LINK identity: ext::auth::Identity;
      CREATE PROPERTY avatar: std::str;
      CREATE PROPERTY createdAt: std::datetime {
          CREATE REWRITE
              INSERT 
              USING (std::datetime_of_statement());
      };
      CREATE PROPERTY updatedAt: std::datetime {
          CREATE REWRITE
              INSERT 
              USING (std::datetime_of_statement());
          CREATE REWRITE
              UPDATE 
              USING (std::datetime_of_statement());
      };
      CREATE PROPERTY username: std::str;
  };
  CREATE GLOBAL default::CurrentUser := (std::assert_single((SELECT
      default::User
  FILTER
      (.identity = GLOBAL ext::auth::ClientTokenIdentity)
  )));
  CREATE SCALAR TYPE default::TitleStatus EXTENDING enum<UPCOMING, PENDING, WATCHING, UNFINISHED, FINISHED>;
  CREATE TYPE default::List {
      CREATE REQUIRED LINK createdBy: default::User;
      CREATE REQUIRED LINK title: default::Title;
      CREATE REQUIRED PROPERTY createdAt: std::datetime {
          SET default := (std::datetime_current());
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
};
