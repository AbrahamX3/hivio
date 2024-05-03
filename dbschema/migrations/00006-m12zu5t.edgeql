CREATE MIGRATION m12zu5tflgnnw63rbat4up4rzbk5rxnwiju5nxdv3vhg4lhsse5eqa
    ONTO m1qw4g2swuisulrruggjrjc5w5p5al5eaaxwghhjoiyse5brkjxtlq
{
  ALTER TYPE default::Hive {
      CREATE REQUIRED PROPERTY isFavorite: std::bool {
          SET default := false;
      };
  };
};
