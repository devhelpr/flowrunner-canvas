import * as React from 'react';

export const FlowConnectorCore = (props: any) => {
	return <></>;
}

export { FlowConnector , EmptyFlowConnector} from './flow-connector';
export { IFlowrunnerConnector, ApplicationMode, IExecutionEvent } from './interfaces/IFlowrunnerConnector';
export { IStorageProvider } from './interfaces/IStorageProvider';

export * from './interfaces/IFlowAgent';
export * from './interfaces/IFlowrunnerSocketConnector';
export * from './interfaces/IModalSize';
export * from './interfaces/INodeDependency';
export * from './interfaces/shape-types';

export { setCustomConfig, getTaskConfig, getTaskConfigForTask } from './config';
export { getFlowAgent } from './flow-agent';

export { 
	flowrunnerStorageProvider , 
	configurableFlowrunnerStorageProvider, 
	readOnlyFlowrunnerStorageProvider
} from './flow-localstorage-provider';

export * from './state/flow-state';
export * from './state/canvas-mode-state';
export * from './state/selected-node-state';
export * from './state/layout-state';
export * from './state/modules-menu-state';
export * from './state/nodes-state';
export * from './state/nodes-touched';
export * from './state/selected-node-state';
export * from './state/state-machines-state';

export { useFlows, FlowState } from './use-flows';
export { registerPlugins } from './external-plugins';

export * from './contexts/position-context';
export { FormNodeDatasourceProvider, useFormNodeDatasourceContext } from './contexts/form-node-datasource-context';

export { createIndexedDBStorageProvider, setDefaultFlow, setDefaultFlowTitle, setTasks } from './flow-indexeddb-provider'; 

export { renderHtmlNode, setPluginRegistry, getNodeInstance } from "./render-html-node";
export * from "./helpers/error";
export * from "./helpers/flow-methods";
export * from "./helpers/flow-to-canvas";
export * from "./helpers/intersect";
export * from "./helpers/line-points";
export * from "./helpers/replace-values";
export * from "./helpers/shape-measures";
export * from "./helpers/shape-settings";
export * from "./services/FlowStorageProviderService";
export * from "./services/PointerService";
export * from "./services/multi-select-service";
export * from "./tests-runner/tests-runner"
export * from "./flow";

export * from "./html-plugins/form-node"
export * from "./state-machine";
export { onFocus } from "./html-plugins/form-controls/helpers/focus";

export { getDefaultUITasks , registerTasks } from "./flow-tasks";
