// Codes returned by Ethereum node providers if an eth_getLogs request is too heavy.
// The first one is for Infura when it hits the log limit, the rest for Alchemy timeouts.
const TOO_MANY_LOGS_FINGERPRINTS = [
  "502",
  "ServerError(-32005)",
  "503 Service Unavailable",
  "ServerError(-32000)",
  "Socket connection timeout",
  "Request failed with status code 503",
  "aborted",
  `could not detect network (event="noNetwork"`,
];

export { TOO_MANY_LOGS_FINGERPRINTS };
