CREATE MIGRATION m1ftiw7pvsragqkpivexm2p7pqlebw7wqhdlp7oaxkz2an66mr5hyq
    ONTO m1ryvbpsaswu6xqgmnfow7aztyo6gclp2ilblkm2jron2j2vql5krq
{
  ALTER TYPE default::Title {
      CREATE CONSTRAINT std::exclusive ON ((.tmdbId, .type));
  };
};
