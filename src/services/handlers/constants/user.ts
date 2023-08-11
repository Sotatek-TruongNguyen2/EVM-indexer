enum UserLevel {
  UNKNOWN = "UNKNOWN",
  SAPPHIRE = "SAPPHIRE",
  RUBY = "RUBY",
  EMERALD = "EMERALD",
  DIAMOND = "DIAMOND",
  BLUE_DIAMOND = "BLUE_DIAMOND",
  BLACK_DIAMOND = "BLACK_DIAMOND",
  CROWN_DIAMOND = "CROWN_DIAMOND",
}

const UserLevelGlobalInterest = {
  UNKNOWN: 0,
  SAPPHIRE: 100,
  RUBY: 200,
  EMERALD: 300,
  DIAMOND: 400,
  BLUE_DIAMOND: 600,
  BLACK_DIAMOND: 800,
  CROWN_DIAMOND: 1000,
};

const UserStakingInterest = {
  "100-16100": 600,
  "16100-61000": 700,
  "60100-160000": 800,
  "160000-310000": 1000,
  "310000-": 1200,
};

const ACCUMULATIVE_PRECISION = 1e18;
const BASIS_POINT = 10000;

const USER_LEVEL_PASSED_INTEREST = 100;

export {
  UserLevel,
  UserStakingInterest,
  UserLevelGlobalInterest,
  ACCUMULATIVE_PRECISION,
  BASIS_POINT,
  USER_LEVEL_PASSED_INTEREST,
};
