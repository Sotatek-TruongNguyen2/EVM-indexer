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

enum UserLevelScore {
  UNKNOWN = 1,
  SAPPHIRE = 2,
  RUBY = 3,
  EMERALD = 4,
  DIAMOND = 5,
  BLUE_DIAMOND = 6,
  BLACK_DIAMOND = 7,
  CROWN_DIAMOND = 8,
}

const USER_LEVEL_UP_REQUIREMENTS = {
  [UserLevel.CROWN_DIAMOND]: [
    UserLevel.BLACK_DIAMOND,
    UserLevel.BLACK_DIAMOND,
    UserLevel.BLACK_DIAMOND,
  ],
  [UserLevel.BLACK_DIAMOND]: [
    UserLevel.BLUE_DIAMOND,
    UserLevel.BLUE_DIAMOND,
    UserLevel.BLUE_DIAMOND,
  ],
  [UserLevel.BLUE_DIAMOND]: [
    UserLevel.DIAMOND,
    UserLevel.DIAMOND,
    UserLevel.DIAMOND,
  ],
  [UserLevel.DIAMOND]: [UserLevel.EMERALD, UserLevel.EMERALD, UserLevel.RUBY],
  [UserLevel.EMERALD]: [UserLevel.RUBY, UserLevel.RUBY, UserLevel.SAPPHIRE],
  [UserLevel.RUBY]: [UserLevel.SAPPHIRE, UserLevel.SAPPHIRE],
};

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
  "100-8000": 400,
  "8100-20000": 500,
  "20100-50000": 600,
  "50100-120000": 800,
  "120000-": 1000,
};

const ACCUMULATIVE_PRECISION = 1e18;
const BASIS_POINT = 10000;

const USER_LEVEL_PASSED_INTEREST = 100;

export {
  UserLevel,
  UserLevelScore,
  UserStakingInterest,
  UserLevelGlobalInterest,
  ACCUMULATIVE_PRECISION,
  BASIS_POINT,
  USER_LEVEL_PASSED_INTEREST,
  USER_LEVEL_UP_REQUIREMENTS,
};
