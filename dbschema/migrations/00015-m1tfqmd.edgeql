CREATE MIGRATION m1tfqmd7m637akmfhlzeyhro3ovy37ukmk6iq5yaur7bszkoq3mqwa
    ONTO m1ftiw7pvsragqkpivexm2p7pqlebw7wqhdlp7oaxkz2an66mr5hyq
{
  ALTER TYPE default::Title {
      ALTER LINK seasons {
          USING (.<title[IS default::Seasons]);
      };
  };
};
