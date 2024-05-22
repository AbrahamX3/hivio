CREATE MIGRATION m1apb2ufj4zf6xyrmvyws645xuortwdtuz4ymb25c3qmbfpoizpwwq
    ONTO m1z5yvc2k3qx6f6ja43jdsoybk4lsjonn7pfgevq6uflpvmhqeq5sa
{
  ALTER TYPE default::Season {
      ALTER LINK title {
          ON TARGET DELETE DELETE SOURCE;
      };
  };
};
