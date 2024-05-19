CREATE MIGRATION m15zexsji4vyij2pcmxgwiesh64o4abhwqi2kjdfotyxefpv7aboga
    ONTO m1gp7clxqzgmnh7urc6fzqaebls2w5hnvynuqjbfft4vndzlevdbaa
{
  ALTER TYPE default::Hive {
      DROP PROPERTY runtime;
  };
  ALTER TYPE default::Title {
      CREATE PROPERTY runtime: std::int32;
  };
};
