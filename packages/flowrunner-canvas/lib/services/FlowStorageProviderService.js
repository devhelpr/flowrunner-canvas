let _flowStorageEnabled = false;
let _flowStorageProvider;
export class FlowStorageProviderService {
    static setFlowStorageProvider(flowStorageProvider) {
        _flowStorageProvider = flowStorageProvider;
        _flowStorageEnabled = true;
    }
    static getIsFlowStorageProviderEnabled() {
        return _flowStorageEnabled;
    }
    static getFlowStorageProvider() {
        return _flowStorageProvider;
    }
}
//# sourceMappingURL=FlowStorageProviderService.js.map