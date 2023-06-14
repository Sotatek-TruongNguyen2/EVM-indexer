export const timeout = (prom: Promise<any>, time: number): Promise<any> => {
  const timeoutError = new Error(
    `execution time has exceeded the allowed time frame of ${time} ms`,
  );
  let timer; // will receive the setTimeout defined from time

  timeoutError.name = "TimeoutErr::Elapsed";

  return Promise.race([
    prom,
    new Promise((_r, rej) => (timer = setTimeout(rej, time, timeoutError))), // returns the defined timeoutError in case of rejection
  ])
    .catch((err: Error) => {
      // handle errors that may occur during the promise race
      throw err;
    })
    .finally(() => clearTimeout(timer)); // clears timer
};

export const wait = (duration: number) => {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res(true);
    }, duration);
  });
};
