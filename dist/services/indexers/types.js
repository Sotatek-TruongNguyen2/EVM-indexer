"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockStreamState = exports.ReconciliationStep = exports.NextBlockReturnsState = void 0;
var BlockStreamState;
(function (BlockStreamState) {
    /// Starting or restarting reconciliation.
    ///
    /// Valid next states: Reconciliation
    BlockStreamState[BlockStreamState["BeginReconciliation"] = 0] = "BeginReconciliation";
    /// The BlockStream is reconciling the subgraph store state with the chain store state.
    ///
    /// Valid next states: YieldingBlocks, Idle, BeginReconciliation (in case of revert)
    BlockStreamState[BlockStreamState["Reconciliation"] = 1] = "Reconciliation";
    /// The BlockStream is emitting blocks that must be processed in order to bring the subgraph
    /// store up to date with the chain store.
    ///
    /// Valid next states: BeginReconciliation
    BlockStreamState[BlockStreamState["YieldingBlocks"] = 2] = "YieldingBlocks";
    /// The BlockStream experienced an error and is pausing before attempting to produce
    /// blocks again.
    ///
    /// Valid next states: BeginReconciliation
    BlockStreamState[BlockStreamState["RetryAfterDelay"] = 3] = "RetryAfterDelay";
    /// The BlockStream has reconciled the subgraph store and chain store states.
    /// No more work is needed until a chain head update.
    ///
    /// Valid next states: BeginReconciliation
    BlockStreamState[BlockStreamState["Idle"] = 4] = "Idle";
})(BlockStreamState || (BlockStreamState = {}));
exports.BlockStreamState = BlockStreamState;
var ReconciliationStep;
(function (ReconciliationStep) {
    ReconciliationStep[ReconciliationStep["ProcessDescendantBlocks"] = 0] = "ProcessDescendantBlocks";
    ReconciliationStep[ReconciliationStep["Revert"] = 1] = "Revert";
    ReconciliationStep[ReconciliationStep["Retry"] = 2] = "Retry";
    /// Subgraph pointer now matches chain head pointer.
    /// Reconciliation is complete.
    ReconciliationStep[ReconciliationStep["Done"] = 3] = "Done";
})(ReconciliationStep || (ReconciliationStep = {}));
exports.ReconciliationStep = ReconciliationStep;
var NextBlockReturnsState;
(function (NextBlockReturnsState) {
    NextBlockReturnsState[NextBlockReturnsState["Revert"] = 0] = "Revert";
    NextBlockReturnsState[NextBlockReturnsState["Done"] = 1] = "Done";
    NextBlockReturnsState[NextBlockReturnsState["NextBlocks"] = 2] = "NextBlocks";
})(NextBlockReturnsState || (NextBlockReturnsState = {}));
exports.NextBlockReturnsState = NextBlockReturnsState;
