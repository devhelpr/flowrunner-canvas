import { IStorageProvider } from './interfaces/IStorageProvider';
export declare const setDefaultFlowTitle: (title: string) => void;
export declare const setDefaultFlow: (id: any, flow: any[]) => void;
export declare const setAdditionalTasks: (tasks: any[]) => void;
export declare const setTasks: (setupTasks: any[]) => void;
export declare const flowrunnerIndexedDbStorageProvider: IStorageProvider;
export declare const createIndexedDBStorageProvider: () => Promise<IStorageProvider>;
