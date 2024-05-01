CREATE MIGRATION m1ve2wdc6ybctwmmalvxhlkucwpssunetn5eewy5o5uesn3mbxzhja
    ONTO m1lcjqyavwtinip5btzzbruyhxruhqeyqr5lhf75xlxqixdpy6boya
{
  ALTER TYPE default::User {
      CREATE REQUIRED PROPERTY email: std::str {
          SET REQUIRED USING (<std::str>{});
      };
      ALTER PROPERTY username {
          RESET OPTIONALITY;
      };
  };
};
