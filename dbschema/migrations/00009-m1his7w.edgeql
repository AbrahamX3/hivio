CREATE MIGRATION m1his7w5u2n7loagkvpsibp6s6s76u4zydalmwy2ek3iahzwy3cpza
    ONTO m15zexsji4vyij2pcmxgwiesh64o4abhwqi2kjdfotyxefpv7aboga
{
  ALTER TYPE default::User {
      ALTER LINK followers {
          USING (.<followed[IS default::Follower]);
      };
  };
};
