CREATE MIGRATION m1gmirebr7tdbcqmly4tqlrrb4diq4plzz4edlfrid2plu3w7vwf6q
    ONTO m146tgvyltfff3mlicesfxg67dbvypt6mkrofihookhucw66z4bc6a
{
  ALTER SCALAR TYPE default::TitleStatus EXTENDING enum<PENDING, WATCHING, UNFINISHED, FINISHED>;
};
