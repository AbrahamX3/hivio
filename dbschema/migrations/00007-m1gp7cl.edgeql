CREATE MIGRATION m1gp7clxqzgmnh7urc6fzqaebls2w5hnvynuqjbfft4vndzlevdbaa
    ONTO m1gmirebr7tdbcqmly4tqlrrb4diq4plzz4edlfrid2plu3w7vwf6q
{
  ALTER TYPE default::Hive {
      CREATE PROPERTY runtime: std::int32;
  };
};
