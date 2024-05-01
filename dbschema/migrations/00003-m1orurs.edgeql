CREATE MIGRATION m1orurs2eicjcf66w6mizajjm7ti4bttcjdld7pqqriu3geabglj3q
    ONTO m1ve2wdc6ybctwmmalvxhlkucwpssunetn5eewy5o5uesn3mbxzhja
{
  ALTER TYPE default::User {
      ALTER PROPERTY email {
          CREATE CONSTRAINT std::exclusive;
      };
      ALTER PROPERTY username {
          CREATE CONSTRAINT std::exclusive;
      };
  };
};
