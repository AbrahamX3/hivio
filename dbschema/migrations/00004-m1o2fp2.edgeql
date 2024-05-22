CREATE MIGRATION m1o2fp26aupkxw2zvswezr45syweyxfyhi3bwywgjovlnnpatg66mq
    ONTO m1apb2ufj4zf6xyrmvyws645xuortwdtuz4ymb25c3qmbfpoizpwwq
{
  ALTER TYPE default::Hive {
      ALTER LINK addedBy {
          ON TARGET DELETE DELETE SOURCE;
      };
  };
};
