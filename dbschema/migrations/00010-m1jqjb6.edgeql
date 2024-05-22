CREATE MIGRATION m1jqjb627yh2jo67llxuk372sf7oucsiturdh3q22iuwsalmii5bpa
    ONTO m1his7w5u2n7loagkvpsibp6s6s76u4zydalmwy2ek3iahzwy3cpza
{
  ALTER TYPE default::User {
      DROP LINK followers;
  };
  ALTER TYPE default::Follower RENAME TO default::Follow;
};
