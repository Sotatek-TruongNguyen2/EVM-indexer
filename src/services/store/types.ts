enum LogCode {
  SubgraphStartFailure,
  SubgraphSyncingFailure,
  SubgraphSyncingFailureNotRecorded,
  BlockIngestionStatus,
  BlockIngestionLagging,
  GraphQlQuerySuccess,
  GraphQlQueryFailure,
  TokioContention,
}

export { LogCode };
