CREATE MIGRATION m1q4ohaaql2nduzdcrq6jjuodgxpzgdw7h2x2a7jun5fqr7b52qxla
    ONTO m1tfqmd7m637akmfhlzeyhro3ovy37ukmk6iq5yaur7bszkoq3mqwa
{
  ALTER TYPE default::Seasons RENAME TO default::Season;
  ALTER TYPE default::Season {
      ALTER PROPERTY updated {
          RENAME TO updatedAt;
      };
  };
  ALTER TYPE default::Title {
      ALTER PROPERTY type {
          SET REQUIRED USING (<default::TitleType>{});
      };
  };
  ALTER TYPE default::Title {
      ALTER PROPERTY updated {
          RENAME TO updatedAt;
      };
  };
  ALTER TYPE default::User {
      ALTER LINK followers {
          USING (.<follower[IS default::Follower]);
      };
  };
};
