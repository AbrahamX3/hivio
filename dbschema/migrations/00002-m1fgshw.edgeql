CREATE MIGRATION m1fgshwvmqxhghkuqc674drbywt7brwjxe7bq45n2y4pp4arzd77bq
    ONTO m1njnx46uty7ek344kwba66mmb2rlimnlvoflausq4tpjkesolkzfq
{
  CREATE TYPE default::Episode {
      CREATE REQUIRED LINK season: default::Season {
          ON TARGET DELETE DELETE SOURCE;
      };
      CREATE REQUIRED PROPERTY episode_number: std::int32;
      CREATE CONSTRAINT std::exclusive ON ((.season, .episode_number));
      CREATE REQUIRED PROPERTY air_date: cal::local_date;
      CREATE REQUIRED PROPERTY createdAt: std::datetime {
          SET default := (std::datetime_current());
      };
      CREATE REQUIRED PROPERTY name: std::str;
      CREATE REQUIRED PROPERTY overview: std::str;
      CREATE REQUIRED PROPERTY runtime: std::int32;
      CREATE PROPERTY updatedAt: std::datetime {
          CREATE REWRITE
              INSERT 
              USING (std::datetime_of_statement());
          CREATE REWRITE
              UPDATE 
              USING (std::datetime_of_statement());
      };
  };
  ALTER TYPE default::Season {
      DROP PROPERTY episodes;
  };
  ALTER TYPE default::Season {
      CREATE MULTI LINK episodes := (.<season[IS default::Episode]);
  };
  ALTER TYPE default::Hive {
      CREATE PROPERTY currentRunTime: std::int32;
  };
  ALTER TYPE default::Season {
      DROP CONSTRAINT std::exclusive ON ((.title, .season));
  };
  ALTER TYPE default::Season {
      ALTER PROPERTY season {
          RENAME TO season_number;
      };
  };
  ALTER TYPE default::Season {
      CREATE CONSTRAINT std::exclusive ON ((.title, .season_number));
      CREATE REQUIRED PROPERTY total_episodes: std::int32 {
          SET REQUIRED USING (<std::int32>{});
      };
  };
};
