CREATE MIGRATION m1f4tjcxu6xooauxhawi2sairnhflz6j4ihwjlcnqvie3llpwfksua
    ONTO m1o2fp26aupkxw2zvswezr45syweyxfyhi3bwywgjovlnnpatg66mq
{
  ALTER TYPE default::Follow {
      ALTER LINK followed {
          ON TARGET DELETE DELETE SOURCE;
      };
      ALTER LINK follower {
          ON TARGET DELETE DELETE SOURCE;
      };
  };
  ALTER TYPE default::Hive {
      ALTER LINK title {
          ON TARGET DELETE DELETE SOURCE;
      };
  };
};
