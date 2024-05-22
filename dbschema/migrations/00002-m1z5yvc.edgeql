CREATE MIGRATION m1z5yvc2k3qx6f6ja43jdsoybk4lsjonn7pfgevq6uflpvmhqeq5sa
    ONTO m1onpv7bio2tqxydb76s2i6phachied3wi3wen632k4etgzwaw64va
{
  ALTER TYPE default::Hive {
      CREATE CONSTRAINT std::exclusive ON ((.title, .addedBy));
      ALTER LINK title {
          DROP CONSTRAINT std::exclusive;
      };
  };
};
