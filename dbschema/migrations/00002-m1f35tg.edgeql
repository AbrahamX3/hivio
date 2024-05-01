CREATE MIGRATION m1f35tgdqx2b37qpk6id7t2hrn4qlrmjhnfs7rhd37f6zumkqghw6a
    ONTO m1zvlayuz5um325fsexarnzwonoqttev5inc7gx2kw5poh2zx4riwa
{
  ALTER TYPE default::User {
      ALTER PROPERTY username {
          SET REQUIRED USING (<std::str>{});
      };
  };
};
