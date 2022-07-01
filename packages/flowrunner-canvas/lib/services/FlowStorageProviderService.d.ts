import { IStorageProvider } from '../interfaces/IStorageProvider';
export declare class FlowStorageProviderService {
    static setFlowStorageProvider(flowStorageProvider: IStorageProvider): void;
    static getIsFlowStorageProviderEnabled(): boolean;
    static getFlowStorageProvider(): IStorageProvider | undefined;
}
