import { BigNumber } from "ethers";
import { Logger } from "winston";
import { IndexerConfig } from "../config/indexer";
import { timeout, wait } from "../utils/timeout";
import { setProviderIndex } from "../config/chainConfig";

class ExponentialBackOff {
  private _current: number;
  private _base: number;
  private _factor: number;
  private _max_delay: number;

  constructor(base: number, max_delay?: number) {
    this._current = base;
    this._base = base;
    this._factor = 1;
    this._max_delay = max_delay || 0;
  }

  public set current(current: number) {
    this._current = current;
  }

  public get current(): number {
    return this._current;
  }

  public get base(): number {
    return this._base;
  }

  public get factor(): number {
    return this._factor;
  }
  public get max_delay(): number {
    return this._max_delay;
  }

  public next_duration(): number {
    const MAX_I64 = 2 ** 64;
    let duration = BigNumber.from(this.current).mul(this.factor);

    if (duration.gt(BigNumber.from(`${MAX_I64}`))) {
      duration = BigNumber.from(`${MAX_I64}`);
    }

    // check if we reached max delay
    if (this.max_delay > 0) {
      if (duration.gt(this.max_delay)) {
        return this.max_delay;
      }
    }

    this.current = BigNumber.from(this.current).mul(this.base).toNumber();

    if (BigNumber.from(this.current).gt(BigNumber.from(`${MAX_I64}`))) {
      this.current = BigNumber.from(`${MAX_I64}`).toNumber();
    }

    return duration.toNumber();
  }
}

export class RetryConfig {
  private _logger: Logger;
  private _operation_name: string;
  private _log_after: number;
  private _warn_after: number;
  private _timeout: number;
  private _limit: number;
  private _attempt_count: number;
  private _too_many_logs_fingerprints: string[];
  private _backoff: ExponentialBackOff;

  constructor(
    operation_name: string,
    logger: Logger,
    too_many_logs_fingerprints: string[],
    limit?: number,
    timeout?: number,
  ) {
    const indexer_config = IndexerConfig.getInstance();

    this._too_many_logs_fingerprints = too_many_logs_fingerprints;
    this._logger = logger;
    this._operation_name = operation_name;
    this._log_after = 1;
    this._warn_after = 10;
    this._limit = limit || indexer_config.REQUEST_RETRIES;
    this._timeout = timeout || indexer_config.ETHEREUM_JSON_RPC_TIMEOUT;
    this._attempt_count = 0;

    let max_delay_ms = 30000;
    this._backoff = new ExponentialBackOff(2000, max_delay_ms);
  }

  public set limit(limit: number) {
    this._limit = limit;
  }

  public set attempt_count(attempt_count: number) {
    this._attempt_count = attempt_count;
  }

  public get backoff(): ExponentialBackOff {
    return this._backoff;
  }

  public get too_many_logs_fingerprints(): string[] {
    return this._too_many_logs_fingerprints;
  }

  public get attempt_count(): number {
    return this._attempt_count;
  }

  public get logger(): Logger {
    return this._logger;
  }

  public get limit(): number {
    return this._limit;
  }
  public get timeout(): number {
    return this._timeout;
  }

  public get log_after(): number {
    return this._log_after;
  }

  public get warn_after(): number {
    return this._warn_after;
  }

  public get operation_name(): string {
    return this._operation_name;
  }

  public async run(try_it: Promise<any>): Promise<any> {
    this.logger.info(`Run with retry: ${this.operation_name}`);
    return await this.run_retry(try_it);
  }

  public async run_retry(try_it: Promise<any>) {
    return await this.run_retry_with_timeout(try_it);
  }

  public async run_retry_with_timeout(
    try_it: Promise<any>,
  ): Promise<any | undefined> {
    if (this.limit < this.attempt_count) {
      const request_limit_error = new Error(
        `Request has reached the limitation error!`,
      );
      request_limit_error.name = "RequestLimitErr";
      throw request_limit_error;
    }

    try {
      this.attempt_count += 1;
      // this.limit -= 1;
      let result = await timeout(try_it, this.timeout);
      return result;
    } catch (err: any) {
      console.log("ERROR: ", err.message);
      let isElapsed;
      if (err.name === "TimeoutErr::Elapsed") {
        isElapsed = true;
      }

      if (isElapsed) {
        if (this.attempt_count >= this.log_after) {
          this.logger.info(
            `Trying again after ${this.operation_name} timed out (attempt #${this.attempt_count})`,
          );
        }
        // let duration = this.backoff.next_duration();
        // await wait(duration);
        // return await this.run_retry(try_it);
      } else {
        if (this.too_many_logs_fingerprints.indexOf(err.message) < 0) {
          const intolerant_error: any = new Error(
            `The request response is not on response tolerant list`,
          );
          intolerant_error.name = "IntolerantErr";
          intolerant_error.inner = err.message;
          throw intolerant_error;
        }

        if (this.attempt_count >= this.warn_after) {
          // This looks like it would be nice to de-duplicate, but if we try
          // to use log! slog complains about requiring a const for the log level
          // See also b05e1594-e408-4047-aefb-71fc60d70e8f
          this.logger.warn(
            `Trying again after ${this.operation_name} failed (attempt #${this.attempt_count}) with result ${err.message}`,
          );
        } else if (this.attempt_count >= this.log_after) {
          // See also b05e1594-e408-4047-aefb-71fc60d70e8f
          this.logger.info(
            `Trying again after ${this.operation_name} failed (attempt #${this.attempt_count}) with result ${err.message}`,
          );
        }

        let duration = this.backoff.next_duration();
        await wait(duration);
        return await this.run_retry(try_it);
      }
    }
  }
}
