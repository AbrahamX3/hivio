CREATE MIGRATION m17tzoqzs2prygkutptjyvy5shr5nh3gomtaech2cbdmuglkbbhwsa
    ONTO m16hbjtfyqbpdufepiagcvdyqsinx6oirffpbevmurzn7ta5xzmvea
{
  ALTER TYPE default::Title {
      ALTER PROPERTY title {
          RENAME TO name;
      };
  };
};
