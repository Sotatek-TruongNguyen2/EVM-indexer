export class EthGetLogsFilter {
  private _contracts: string[];
  private _event_signatures: string[];
  constructor(_contracts: string[], _event_signatures: string[]) {
    this._contracts = _contracts;
    this._event_signatures = _event_signatures;
  }

  static from_contract(address: string) {
    return new EthGetLogsFilter([address], []);
  }

  static from_event(event_signatures: string) {
    return new EthGetLogsFilter([], [event_signatures]);
  }

  public get contracts(): string[] {
    return this._contracts;
  }

  public get event_signatures(): string[] {
    return this._event_signatures;
  }

  // public set event_signatures(signature: string) {
  //   this._event_signatures.push(signature);

  // }
}
