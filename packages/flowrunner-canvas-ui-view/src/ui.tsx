import * as React from 'react';
import { useState, useEffect, useRef } from 'react';

import {
  FlowConnector,
  EmptyFlowConnector,
  ApplicationMode,
  IStorageProvider,
  setCustomConfig,
  renderHtmlNode,
  getNodeInstance,
  setPluginRegistry,
  getFlowAgent,
  FlowStorageProviderService,
  getDefaultUITasks,
  readOnlyFlowrunnerStorageProvider,
  FormNodeDatasourceProvider,
  PositionProvider,
} from '@devhelpr/flowrunner-canvas-core';

import { UserInterfaceView } from './userinterface-view';

export interface IUIViewProps {
  flowId: string;
  flowPackage?: any;
  showTitleBar?: boolean;
}

export const UIView = (props: IUIViewProps) => {
  const [flowPackage, setFlowPackage] = useState(undefined as any);
  const flowrunnerConnector = useRef(null as any);

  useEffect(() => {
    let hasStorageProvider = false;

    let storageProvider: IStorageProvider | undefined = undefined;
    storageProvider = readOnlyFlowrunnerStorageProvider(props.flowPackage, getDefaultUITasks);
    hasStorageProvider = true;

    const options: any = {};

    if (hasStorageProvider) {
      options.initialStoreState = storageProvider?.getFlowPackage();
    }

    let worker = getFlowAgent();
    worker.postMessage('worker', {
      command: 'init',
    });

    let pluginRegistry = {};
    setPluginRegistry(pluginRegistry);

    const root = document.getElementById('flowstudio-root');

    const hasRunningFlowRunner = root && root.getAttribute('data-has-running-flowrunner') == 'true';

    const onDestroyAndRecreateWorker = () => {
      console.log('onDestroyAndRecreateWorker handling');
      if (worker) {
        worker.terminate();
      }
      worker = getFlowAgent();
      worker.postMessage('worker', {
        command: 'init',
      });
      flowrunnerConnector.current.registerWorker(worker);
    };

    //if (!!hasRunningFlowRunner) {
    flowrunnerConnector.current = new FlowConnector();
    flowrunnerConnector.current.registerWorker(worker);
    flowrunnerConnector.current.registerDestroyAndRecreateWorker(onDestroyAndRecreateWorker);
    //} else {
    //	flowrunnerConnector.current = new EmptyFlowConnector();
    //}
    flowrunnerConnector.current.hasStorageProvider = hasStorageProvider;
    flowrunnerConnector.current.storageProvider = storageProvider;

    let applicationMode = ApplicationMode.UI;

    flowrunnerConnector.current.setAppMode(applicationMode);

    flowrunnerConnector.current.flowView = 'uiview';

    if ((window as any).flowRunnerCanvasPluginRegisterFunctions) {
      (window as any).flowRunnerCanvasPluginRegisterFunctions.map((registerFunction) => {
        registerFunction();
        return true;
      });
    }

    flowrunnerConnector.current.setPluginRegistry(pluginRegistry);
    console.log('pluginRegistry', pluginRegistry);

    function registerFlowRunnerCanvasPlugin(name, VisualizationComponent, FlowTaskPlugin, FlowTaskPluginClassName) {
      pluginRegistry[FlowTaskPluginClassName] = {
        VisualizationComponent: VisualizationComponent,
        FlowTaskPlugin: FlowTaskPlugin,
        FlowTaskPluginClassName: FlowTaskPluginClassName,
      };
      console.log(pluginRegistry);

      setCustomConfig(FlowTaskPluginClassName, {
        shapeType: 'Html',
        hasUI: true,
        presetValues: {
          htmlPlugin: FlowTaskPluginClassName,
        },
      });
      flowrunnerConnector.current.setPluginRegistry(pluginRegistry);
    }
    (window as any).registerFlowRunnerCanvasPlugin = registerFlowRunnerCanvasPlugin;

    if (props.flowPackage) {
      setFlowPackage(props.flowPackage);
    }
    return () => {
      if (worker) {
        worker.terminate();
        //worker = null;
      }
    };
  }, []);

  return (
    <>
      {flowPackage && (
        <PositionProvider>
          <FormNodeDatasourceProvider>
            <UserInterfaceView
              renderHtmlNode={renderHtmlNode}
              flowrunnerConnector={flowrunnerConnector.current}
              getNodeInstance={getNodeInstance}
              flowId={props.flowId}
              flowPackage={flowPackage}
              showTitleBar={props.showTitleBar}
            ></UserInterfaceView>
          </FormNodeDatasourceProvider>
        </PositionProvider>
      )}
    </>
  );
};
