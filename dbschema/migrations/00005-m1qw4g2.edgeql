CREATE MIGRATION m1qw4g2swuisulrruggjrjc5w5p5al5eaaxwghhjoiyse5brkjxtlq
    ONTO m1hm2hny7jx22wkulezykqzdgw6fufgx4pq2cqyh3fw3724546di6a
{
  ALTER TYPE default::List RENAME TO default::Hive;
  ALTER TYPE default::Hive {
      CREATE PROPERTY finishedAt: std::datetime;
  };
};
