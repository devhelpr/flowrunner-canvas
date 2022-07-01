import { IStorageProvider } from '../interfaces/IStorageProvider';

let _flowStorageEnabled: boolean = false;
let _flowStorageProvider: IStorageProvider | undefined;

export class FlowStorageProviderService {
  static setFlowStorageProvider(flowStorageProvider: IStorageProvider) {
    _flowStorageProvider = flowStorageProvider;
    _flowStorageEnabled = true;
  }

  static getIsFlowStorageProviderEnabled() {
    return _flowStorageEnabled;
  }

  static getFlowStorageProvider(): IStorageProvider | undefined {
    return _flowStorageProvider;
  }
}
