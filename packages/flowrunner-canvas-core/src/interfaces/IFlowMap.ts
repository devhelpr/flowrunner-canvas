export interface INodeMapInfo {
  index: number;
  start?: number[];
  end?: number[];
}

export type TFlowMap = Map<string, INodeMapInfo>;
