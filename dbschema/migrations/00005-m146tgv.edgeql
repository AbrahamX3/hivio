CREATE MIGRATION m146tgvyltfff3mlicesfxg67dbvypt6mkrofihookhucw66z4bc6a
    ONTO m1yrjwgrxsbpss2np52uw55glny5ia4bbomj4rtpixdrboenkz5pnq
{
  ALTER TYPE default::Hive {
      CREATE PROPERTY currentEpisode: std::int32;
      CREATE PROPERTY currentSeason: std::int32;
      CREATE PROPERTY startedAt: std::datetime;
  };
};
