CREATE MIGRATION m1b4bc2owcvqemdvvpfc6lz5itdsmhb4uhn6zus33ekkmnhlhmbooq
    ONTO m13sib7oouq5jl6urvqqoe6blkbsylcdcd6jvocu4i5rye35la6zea
{
  ALTER TYPE default::Title {
      ALTER LINK seasons {
          RESET EXPRESSION;
          RESET EXPRESSION;
          ON TARGET DELETE ALLOW;
          RESET OPTIONALITY;
          SET TYPE default::Season;
      };
  };
};
