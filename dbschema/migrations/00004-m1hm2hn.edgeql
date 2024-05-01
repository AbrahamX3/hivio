CREATE MIGRATION m1hm2hny7jx22wkulezykqzdgw6fufgx4pq2cqyh3fw3724546di6a
    ONTO m1orurs2eicjcf66w6mizajjm7ti4bttcjdld7pqqriu3geabglj3q
{
  ALTER TYPE default::User {
      CREATE REQUIRED PROPERTY name: std::str {
          SET REQUIRED USING (<std::str>{});
      };
      CREATE REQUIRED PROPERTY status: default::TitleStatus {
          SET default := 'WATCHING';
      };
  };
};
