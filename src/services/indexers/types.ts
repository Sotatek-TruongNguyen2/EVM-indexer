enum BlockStreamState {
  /// Starting or restarting reconciliation.
  ///
  /// Valid next states: Reconciliation
  BeginReconciliation,

  /// The BlockStream is reconciling the subgraph store state with the chain store state.
  ///
  /// Valid next states: YieldingBlocks, Idle, BeginReconciliation (in case of revert)
  Reconciliation,

  /// The BlockStream is emitting blocks that must be processed in order to bring the subgraph
  /// store up to date with the chain store.
  ///
  /// Valid next states: BeginReconciliation
  YieldingBlocks,

  /// The BlockStream experienced an error and is pausing before attempting to produce
  /// blocks again.
  ///
  /// Valid next states: BeginReconciliation
  RetryAfterDelay,

  /// The BlockStream has reconciled the subgraph store and chain store states.
  /// No more work is needed until a chain head update.
  ///
  /// Valid next states: BeginReconciliation
  Idle,
}

enum ReconciliationStep {
  ProcessDescendantBlocks,
  Retry,
  /// Subgraph pointer now matches chain head pointer.
  /// Reconciliation is complete.
  Done,
}

enum NextBlockReturnsState {
  Revert,
  Done,
  NextBlocks,
}

type BlockWithTriggers<T> = {
  block: T;
  triggers: any[];
};

type NextBlocks<T> = {
  range_size: number;
  blocks_with_triggers: BlockWithTriggers<T>[];
};

type NextBlockReturns<T> = {
  state: NextBlockReturnsState;
  data?: NextBlocks<T>;
};

type IndexingState<T> = {
  state: BlockStreamState;
  next_blocks?: NextBlockReturns<T>;
};

export {
  BlockWithTriggers,
  NextBlockReturns,
  IndexingState,
  NextBlockReturnsState,
  ReconciliationStep,
  BlockStreamState,
};
