export interface IWorker {
  postMessage: (eventName: string, message: any) => void;
  addEventListener: (eventName: string, callback: (event: any) => void) => void;
  terminate: () => void;
}
