CREATE MIGRATION m1mti7eeq7ain3ooedc5mxsy5f4cg4teavybhdu5oqwf6ulbpjn5pq
    ONTO m17tzoqzs2prygkutptjyvy5shr5nh3gomtaech2cbdmuglkbbhwsa
{
  CREATE TYPE default::Follower {
      CREATE REQUIRED LINK followed: default::User;
      CREATE REQUIRED LINK follower: default::User;
      CREATE PROPERTY createdAt: std::datetime {
          CREATE REWRITE
              INSERT 
              USING (std::datetime_of_statement());
      };
  };
  ALTER TYPE default::User {
      CREATE MULTI LINK followers: default::Follower;
  };
};
