CREATE MIGRATION m1ryvbpsaswu6xqgmnfow7aztyo6gclp2ilblkm2jron2j2vql5krq
    ONTO m1wevsyat2khzqho5upauvyptzmpzonm4actxoyekbonlw5c7veq3a
{
  CREATE TYPE default::Seasons {
      CREATE REQUIRED LINK title: default::Title;
      CREATE REQUIRED PROPERTY season: std::int32;
      CREATE CONSTRAINT std::exclusive ON ((.title, .season));
      CREATE REQUIRED PROPERTY createdAt: std::datetime {
          SET default := (std::datetime_current());
      };
      CREATE REQUIRED PROPERTY date: cal::local_date;
      CREATE REQUIRED PROPERTY episodes: std::int32;
      CREATE PROPERTY updated: std::datetime {
          CREATE REWRITE
              INSERT 
              USING (std::datetime_of_statement());
          CREATE REWRITE
              UPDATE 
              USING (std::datetime_of_statement());
      };
  };
  ALTER TYPE default::Title {
      CREATE MULTI LINK seasons: default::Seasons;
      CREATE PROPERTY rating: std::float32;
  };
};
