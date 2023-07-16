interface EnvironmentConfigType {
  MAXIMUM_BRANCH_STAKING: number;
  SHAPPIRE_LEVEL_STAKING_CONDITION: number;
}

export class EnvironmentConfig {
  private static instance: EnvironmentConfigType;
  public static getInstance(): EnvironmentConfigType {
    if (!EnvironmentConfig.instance) {
      EnvironmentConfig.instance = {
        MAXIMUM_BRANCH_STAKING: Number(
          process.env.MAXIMUM_BRANCH_STAKING || 600_000,
        ),
        SHAPPIRE_LEVEL_STAKING_CONDITION: Number(
          process.env.SHAPPIRE_LEVEL_STAKING_CONDITION || 1_500_000,
        ),
      };
    }

    return EnvironmentConfig.instance;
  }
}
