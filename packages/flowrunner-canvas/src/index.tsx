import * as React from 'react';
import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Suspense } from 'react';

//import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';

import ReactDOM from 'react-dom';

import { Subject } from 'rxjs';

//import fetch from 'cross-fetch';

import { Toolbar } from './components/toolbar';
export { Toolbar };

import { FooterToolbar } from './components/footer-toolbar';
export { FooterToolbar };

import { Login } from './components/login';
export { Login };

import { DebugInfo } from './components/debug-info';
export { DebugInfo };

import {
  FlowConnector,
  EmptyFlowConnector,
  IFlowrunnerConnector,
  ApplicationMode,
  IStorageProvider,
  setCustomConfig,
  getFlowAgent,
  flowrunnerStorageProvider,
  configurableFlowrunnerStorageProvider,
  readOnlyFlowrunnerStorageProvider,
  useFlowStore,
  useCanvasModeStateStore,
  useSelectedNodeStore,
  useFlows,
  FlowState,
  registerPlugins,
  IFlowAgent,
  IModalSize,
  INodeDependency,
  FormNodeDatasourceProvider,
  useFormNodeDatasourceContext,
  createIndexedDBStorageProvider,
  PositionProvider,
  setPluginRegistry,
  renderHtmlNode,
  getNodeInstance,
  ErrorBoundary,
  FlowStorageProviderService,
  INode,
  INodeFlowState,
  ICustomTaskConfig,
} from '@devhelpr/flowrunner-canvas-core';

import { UserInterfaceView } from '@devhelpr/flowrunner-canvas-ui-view';

let flowRunnerConnectorInstance: IFlowrunnerConnector;
let flowRunnerCanvasPluginRegisterFunctions: any[] = [];

//const UserInterfaceViewEditor = React.lazy(() => import('./components/userinterface-view-editor').then(({ UserInterfaceViewEditor }) => ({ default: UserInterfaceViewEditor })));
//const CanvasComponent = React.lazy(() => import('./components/canvas').then(({ Canvas }) => ({ default: Canvas })));

import { UserInterfaceViewEditor } from './components/userinterface-view-editor';
import { Canvas as CanvasComponent } from './components/canvas';
import { IExampleFlow } from './components/new-flow';
export { CanvasComponent };
export { UserInterfaceViewEditor };
export type { IExampleFlow } from './components/new-flow';

// TODO : improve this.. currently needed to be able to use react in an external script
// which is used by the online editor to provide external defined tasks
// solution could be to import flowrunner-canvas and build/package it like that by
// the webpack-build pipeline from the online editor it self
//
(window as any).react = React;

let pluginRegistry: any = {};

export const registerFlowRunnerCanvasPlugin = (
  name,
  VisualizationComponent,
  FlowTaskPlugin,
  FlowTaskPluginClassName,
  flowType?: string,
  flowRunnerConnector?: IFlowrunnerConnector,
  customPluginRegistry?: any,
  customConfig?: ICustomTaskConfig,
) => {
  if (flowRunnerConnectorInstance || flowRunnerConnector || customPluginRegistry) {
    const plugin = {
      VisualizationComponent: VisualizationComponent,
      FlowTaskPlugin: FlowTaskPlugin,
      FlowTaskPluginClassName: FlowTaskPluginClassName,
      flowType: flowType || 'playground',
    };

    if (customPluginRegistry) {
      customPluginRegistry[FlowTaskPluginClassName] = plugin;
      console.log(customPluginRegistry);
    } else {
      pluginRegistry[FlowTaskPluginClassName] = plugin;
      console.log(pluginRegistry);
    }

    const customPluginConfig = customConfig || {};
    customPluginConfig.shapeType = 'Html';
    customPluginConfig.hasUI = true;
    if (!customPluginConfig.presetValues) {
      customPluginConfig.presetValues = {};
    }
    customPluginConfig.presetValues.htmlPlugin = FlowTaskPluginClassName;

    setCustomConfig(FlowTaskPluginClassName, customPluginConfig);
    console.log('custom config', FlowTaskPluginClassName, customPluginConfig);
    if (!customPluginRegistry) {
      if (flowRunnerConnector) {
        flowRunnerConnector.setPluginRegistry(pluginRegistry);
      } else {
        flowRunnerConnectorInstance.setPluginRegistry(pluginRegistry);
      }
    }
  }
};

export const addRegisterFunction = (registerFunction: () => void) => {
  flowRunnerCanvasPluginRegisterFunctions.push(registerFunction);
};

export interface IFlowrunnerCanvasProps {
  hasShowDependenciesInMenu?: boolean;
  hasTaskNameAsNodeTitle?: boolean;
  hasCustomNodesAndRepository?: boolean;
  hasJSONEditInMenu?: boolean;
  modalSize?: IModalSize;

  developmentMode?: boolean;

  flowStorageProvider?: IStorageProvider;
  flowrunnerConnector?: IFlowrunnerConnector;
  pluginRegistry?: any;

  showsStateMachineUpdates?: boolean;

  onGetExamples: undefined | (() => Promise<IExampleFlow[]>);
  onGetExampleFlow: undefined | ((exampleName: string) => Promise<any[]>);
  onMessageFromFlow?: (message, flowAgent: IFlowAgent) => void;
  getNodeDependencies?: (nodeName: string) => INodeDependency[];
  renderMenuOptions?: () => JSX.Element;
  onFlowHasChanged?: (flow: any) => void;
}

const InternalFlowrunnerCanvas = (props: IFlowrunnerCanvasProps) => {
  const [renderFlowCanvas, setRenderFlowCanvas] = useState(false);
  const [nodeStateFunction, setNodeStateFunction] = useState<any>(undefined);

  const flowrunnerConnector = useRef((props.flowrunnerConnector || new FlowConnector()) as IFlowrunnerConnector);
  const canvasToolbarsubject = useRef(undefined as any);
  const formNodesubject = useRef(undefined as any);

  const renderHtmlNodeRef = useRef(undefined as any);
  const getNodeInstanceRef = useRef(undefined as any);
  const flowAgent = useRef(undefined as any);
  const isUnmounting = useRef(false);

  let hasStorageProvider = false;

  let storageProvider: IStorageProvider | undefined = undefined;
  if (props.flowStorageProvider !== undefined) {
    storageProvider = props.flowStorageProvider as IStorageProvider;
    hasStorageProvider = true;
    FlowStorageProviderService.setFlowStorageProvider(storageProvider);
  }

  flowrunnerConnector.current.hasStorageProvider = hasStorageProvider;
  flowrunnerConnector.current.storageProvider = storageProvider;
  flowRunnerConnectorInstance = flowrunnerConnector.current;

  if (!!props.developmentMode) {
    registerPlugins(registerFlowRunnerCanvasPlugin);
  }
  const flows = useFlows(flowrunnerConnector.current, useFlowStore, undefined, props.onFlowHasChanged);

  useEffect(() => {
    canvasToolbarsubject.current = new Subject<string>();
    formNodesubject.current = new Subject<any>();

    renderHtmlNodeRef.current = renderHtmlNode;
    getNodeInstanceRef.current = getNodeInstance;

    flowAgent.current = getFlowAgent();
    if (props.onMessageFromFlow) {
      flowAgent.current.addEventListener('external', props.onMessageFromFlow);
    }
    flowAgent.current.postMessage('worker', {
      command: 'init',
    });

    if (flowRunnerCanvasPluginRegisterFunctions) {
      flowRunnerCanvasPluginRegisterFunctions.map((registerFunction) => {
        registerFunction();
        return true;
      });
    }
    flowrunnerConnector.current.setPluginRegistry({ ...pluginRegistry, ...props.pluginRegistry });

    setPluginRegistry({ ...pluginRegistry, ...props.pluginRegistry });

    const onDestroyAndRecreateWorker = () => {
      console.log('onDestroyAndRecreateWorker handling');
      if (flowAgent) {
        flowAgent.current.removeEventListener('external', props.onMessageFromFlow);
        //flowAgent.current.terminate();
      }

      if (!flowAgent.current) {
        flowAgent.current = getFlowAgent();
      }

      if (props.onMessageFromFlow) {
        flowAgent.current.addEventListener('external', props.onMessageFromFlow);
      }
      flowAgent.current.postMessage('worker', {
        command: 'init',
      });
      if (flowrunnerConnector.current) {
        flowrunnerConnector.current.registerWorker(flowAgent.current);
      }
    };

    if (flowrunnerConnector.current) {
      flowrunnerConnector.current.registerWorker(flowAgent.current);
      flowrunnerConnector.current.registerDestroyAndRecreateWorker(onDestroyAndRecreateWorker);
      flowrunnerConnector.current.setAppMode(ApplicationMode.Canvas);
      console.log('RENDER ORDER 1');
      setRenderFlowCanvas(true);
    }

    return () => {
      isUnmounting.current = true;
      if (props.onMessageFromFlow && flowAgent) {
        flowAgent.current.removeEventListener('external', props.onMessageFromFlow);
        flowAgent.current.addEventListener('external', props.onMessageFromFlow);
      }
    };
  }, [props.flowStorageProvider, props.flowrunnerConnector]);

  useEffect(() => {
    if (flows.flowState !== FlowState.idle) {
      flows.reloadFlow();
    }
  }, [props.flowStorageProvider, props.flowrunnerConnector]);

  const getNodeStateFunction = (nodeFlowstateFunction: (node: INode) => INodeFlowState) => {
    setNodeStateFunction({ getFunction: nodeFlowstateFunction });
  };

  if (!renderFlowCanvas || !flowrunnerConnector.current) {
    return <></>;
  }

  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <ErrorBoundary>
          <DebugInfo flowrunnerConnector={flowrunnerConnector.current}></DebugInfo>

          <Toolbar
            hasShowDependenciesInMenu={props.hasShowDependenciesInMenu}
            hasTaskNameAsNodeTitle={props.hasTaskNameAsNodeTitle || false}
            hasCustomNodesAndRepository={props.hasCustomNodesAndRepository || false}
            hasJSONEditInMenu={props.hasJSONEditInMenu || false}
            renderMenuOptions={props.renderMenuOptions}
            canvasToolbarsubject={canvasToolbarsubject.current}
            hasRunningFlowRunner={true}
            isFlowEditorOnly={true}
            flowrunnerConnector={flowrunnerConnector.current}
            flow={flows.flow}
            flowId={flows.flowId}
            flows={flows.flows}
            flowType={flows.flowType}
            flowState={flows.flowState}
            modalSize={props.modalSize}
            getFlows={flows.getFlows}
            loadFlow={flows.loadFlow}
            saveFlow={flows.saveFlow}
            onGetFlows={flows.onGetFlows}
            onGetExamples={props.onGetExamples}
            onGetExampleFlow={props.onGetExampleFlow}
            getNodeInstance={getNodeInstanceRef.current}
            renderHtmlNode={renderHtmlNodeRef.current}
            getNodeState={nodeStateFunction?.getFunction}
          ></Toolbar>

          <CanvasComponent
            canvasToolbarsubject={canvasToolbarsubject.current}
            hasCustomNodesAndRepository={
              props.hasCustomNodesAndRepository !== undefined ? props.hasCustomNodesAndRepository : true
            }
            showsStateMachineUpdates={props.showsStateMachineUpdates || false}
            renderHtmlNode={renderHtmlNodeRef.current}
            isEditingInModal={false}
            hasDefaultUITasks={false}
            flowrunnerConnector={flowrunnerConnector.current}
            getNodeInstance={getNodeInstanceRef.current}
            formNodesubject={formNodesubject.current}
            flowHasNodes={flows.flow && flows.flow.length > 0}
            flowId={flows.flowId}
            flowType={flows.flowType}
            flowState={flows.flowState}
            saveFlow={flows.saveFlow}
            modalSize={props.modalSize}
            initialOpacity={0}
            hasTaskNameAsNodeTitle={props.hasTaskNameAsNodeTitle}
            getNodeDependencies={props.getNodeDependencies}
            useFlowStore={useFlowStore}
            useCanvasModeStateStore={useCanvasModeStateStore}
            useSelectedNodeStore={useSelectedNodeStore}
            externalId="AppCanvas"
            getNodeStateFunction={getNodeStateFunction}
          ></CanvasComponent>
        </ErrorBoundary>
      </Suspense>
    </>
  );
};

export const FlowrunnerCanvas = memo((props: IFlowrunnerCanvasProps) => {
  return (
    <PositionProvider>
      <InternalFlowrunnerCanvas {...props} />
    </PositionProvider>
  );
});

interface ITestAppProps {
  flowrunnerStorageProvider: IStorageProvider;
}

const TestApp = (props: ITestAppProps) => {
  const { setDatasource } = useFormNodeDatasourceContext();
  const [debugList, setDebugList] = useState([] as string[]);
  const onMessageFromFlow = useCallback((event: any, flowAgent: any) => {
    if (event && event.data) {
      if (event.data.command === 'RegisterFlowNodeObservers') {
        return;
      }
      console.log('onMessageFromFlow', event.data.command);

      if (event.data.command === 'SendNodeExecution') {
        //if (this.
        setDebugList((state) => [...state, event.data.command + '-' + event.data.name]);
      }
    }
  }, []);

  useEffect(() => {
    setDatasource('testlocal', ['testapp1', 'testapp2']);
  }, []);

  const flowCanvas = (
    <FlowrunnerCanvas
      developmentMode={true}
      flowStorageProvider={props.flowrunnerStorageProvider}
      onMessageFromFlow={onMessageFromFlow}
      flowrunnerConnector={new FlowConnector()}
      onGetExamples={undefined}
      onGetExampleFlow={undefined}
    ></FlowrunnerCanvas>
  );

  return (
    <div className="row no-gutters h-100">
      <div className="col-12 col-md-6 h-100">{flowCanvas}</div>
      <div
        className="col-12 col-md-6 h-100"
        style={{
          overflow: 'hidden',
          maxHeight: '100vh',
          overflowY: 'scroll',
        }}
      >
        <div className="overflow-visible">
          {debugList.map((debugItem, index) => {
            return <div key={index}>{debugItem}</div>;
          })}
        </div>
      </div>
    </div>
  );
};
/*
  return (
	  <FlowrunnerCanvas
		flowStorageProvider={flowrunnerLocalStorageProvider} 
		onMessageFromFlow={onMessageFromFlow}     
	  ></FlowrunnerCanvas>
	);
  }
  */
