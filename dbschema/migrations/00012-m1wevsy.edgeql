CREATE MIGRATION m1wevsyat2khzqho5upauvyptzmpzonm4actxoyekbonlw5c7veq3a
    ONTO m1wfontq7trugslwtqdj56ytjzdlmshc52abdqtolqpz64tgm2jwna
{
  ALTER TYPE default::Follower {
      CREATE CONSTRAINT std::exclusive ON ((.follower, .followed));
      ALTER LINK followed {
          DROP CONSTRAINT std::exclusive;
      };
      ALTER LINK follower {
          DROP CONSTRAINT std::exclusive;
      };
  };
};
