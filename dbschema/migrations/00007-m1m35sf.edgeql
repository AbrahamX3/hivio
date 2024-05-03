CREATE MIGRATION m1m35sf7766obf3dhrkctmq24tkziu4xt6dyoe2df563xqn7s73jwa
    ONTO m12zu5tflgnnw63rbat4up4rzbk5rxnwiju5nxdv3vhg4lhsse5eqa
{
  ALTER TYPE default::Title {
      ALTER PROPERTY imdbId {
          RESET OPTIONALITY;
      };
  };
  ALTER TYPE default::User {
      ALTER LINK identity {
          CREATE CONSTRAINT std::exclusive;
      };
  };
};
