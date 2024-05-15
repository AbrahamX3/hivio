CREATE MIGRATION m1q2mz6qxxbqhfnbixuinrj6krrjwgde3x5b6bujzfw2bttq42eocq
    ONTO m1b4bc2owcvqemdvvpfc6lz5itdsmhb4uhn6zus33ekkmnhlhmbooq
{
  ALTER TYPE default::Title {
      ALTER LINK seasons {
          ON SOURCE DELETE DELETE TARGET;
          RESET ON TARGET DELETE;
      };
  };
};
