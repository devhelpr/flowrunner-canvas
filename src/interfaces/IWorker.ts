export interface IWorker {
  postMessage: (message: any) => void;
  addEventListener: (eventName: string, callback: (event: any) => void) => void;
}
