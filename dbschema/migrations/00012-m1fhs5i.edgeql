CREATE MIGRATION m1fhs5ifccqkzh6fvom5kozuaomlhj6dcvwnmdkqz5jzinsd5lfd4q
    ONTO m1c5p3pol2bi3w6tdmdut4xtbzsmlrathwok3zpiov4d4rcd37mkuq
{
  ALTER TYPE default::User {
      CREATE MULTI LINK hive := (.<addedBy[IS default::Hive]);
  };
};
