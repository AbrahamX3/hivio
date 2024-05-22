CREATE MIGRATION m1c5p3pol2bi3w6tdmdut4xtbzsmlrathwok3zpiov4d4rcd37mkuq
    ONTO m1jqjb627yh2jo67llxuk372sf7oucsiturdh3q22iuwsalmii5bpa
{
  ALTER TYPE default::User {
      CREATE MULTI LINK followers := (.<followed[IS default::Follow]);
      CREATE MULTI LINK following := (.<follower[IS default::Follow]);
  };
};
