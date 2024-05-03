CREATE MIGRATION m16hbjtfyqbpdufepiagcvdyqsinx6oirffpbevmurzn7ta5xzmvea
    ONTO m1m35sf7766obf3dhrkctmq24tkziu4xt6dyoe2df563xqn7s73jwa
{
  ALTER TYPE default::Hive {
      ALTER LINK title {
          CREATE CONSTRAINT std::exclusive;
      };
  };
};
