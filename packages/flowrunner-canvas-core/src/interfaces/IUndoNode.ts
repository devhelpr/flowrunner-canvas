export enum IUndoConnectionMode {
  reconnect = 0,
  addConnection,
}

export interface IUndoNode {
  undoType: string;
  node: any;
  connectionMode?: IUndoConnectionMode;
  connections: any[] | undefined;
}
