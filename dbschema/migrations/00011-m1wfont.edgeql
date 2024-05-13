CREATE MIGRATION m1wfontq7trugslwtqdj56ytjzdlmshc52abdqtolqpz64tgm2jwna
    ONTO m1mti7eeq7ain3ooedc5mxsy5f4cg4teavybhdu5oqwf6ulbpjn5pq
{
  ALTER TYPE default::Follower {
      ALTER LINK followed {
          CREATE CONSTRAINT std::exclusive;
      };
      ALTER LINK follower {
          CREATE CONSTRAINT std::exclusive;
      };
      ALTER PROPERTY createdAt {
          SET default := (std::datetime_current());
          DROP REWRITE
              INSERT ;
              SET REQUIRED USING (<std::datetime>{});
          };
      };
  ALTER TYPE default::Hive {
      ALTER LINK createdBy {
          RENAME TO addedBy;
      };
  };
  ALTER TYPE default::User {
      ALTER PROPERTY createdAt {
          SET default := (std::datetime_current());
          DROP REWRITE
              INSERT ;
              SET REQUIRED USING (<std::datetime>{});
          };
      };
};
