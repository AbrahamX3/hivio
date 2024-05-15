CREATE MIGRATION m1yrjwgrxsbpss2np52uw55glny5ia4bbomj4rtpixdrboenkz5pnq
    ONTO m1q2mz6qxxbqhfnbixuinrj6krrjwgde3x5b6bujzfw2bttq42eocq
{
  ALTER TYPE default::Title {
      ALTER LINK seasons {
          USING (.<title[IS default::Season]);
          RESET ON SOURCE DELETE;
      };
  };
};
