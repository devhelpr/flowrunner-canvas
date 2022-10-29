/* eslint-disable react/jsx-no-useless-fragment */
/*import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';


import App from './app/app';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
<StrictMode><App /></StrictMode>
);
*/

import * as React from 'react';
import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Suspense } from 'react';

import * as ReactDOM from 'react-dom/client';

import { Subject } from 'rxjs';

import fetch from 'cross-fetch';

import {
  FlowrunnerCanvas,
  CanvasComponent,
  Toolbar,
  FooterToolbar,
  Login,
  DebugInfo,
  UserInterfaceViewEditor,
  IExampleFlow,
  registerFlowRunnerCanvasPlugin,
} from '@devhelpr/flowrunner-canvas';

import {
  FlowConnector,
  EmptyFlowConnector,
  IFlowrunnerConnector,
  ApplicationMode,
  IStorageProvider,
  setCustomConfig,
  getFlowAgent,
  useFlowStore,
  useCanvasModeStateStore,
  useSelectedNodeStore,
  useFlows,
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
  registerTaskImplementationOverride,
} from '@devhelpr/flowrunner-canvas-core';

import { UserInterfaceView } from '@devhelpr/flowrunner-canvas-ui-view';
import { registerCustomPlugins } from './flow-plugins';
import { createFlowrunnerStorageProvider } from './flow-localstorage-provider';
import { ApiProxyTask } from './flow-plugins/api-custom-proxy-task';
import { MapBoxTestTask } from './flow-plugins/mapbox-test-task';
import { getMapBoxTestComponent } from './html-plugins/mapbox-test';
import { getEChartsComponent } from './html-plugins/echarts-test';
import { EChartsTestTask } from './flow-plugins/echarts-test-task';

let flowRunnerConnectorInstance: IFlowrunnerConnector;
const flowRunnerCanvasPluginRegisterFunctions: any[] = [];

// TODO : improve this.. currently needed to be able to use react in an external script
// which is used by the online editor to provide external defined tasks
// solution could be to import flowrunner-canvas and build/package it like that by
// the webpack-build pipeline from the online editor it self
//
(window as any).react = React;

const pluginRegistry: any = {};

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
      hasCustomNodesAndRepository={false}
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
		onMessageFromFlow={onMessageFromFlow
      onGetExamples={undefined}
      onGetExampleFlow={undefined}    
	  ></FlowrunnerCanvas>
	);
  }
  */

const onGetExampleFlows = () => {
  return new Promise<IExampleFlow[]>((resolve, _reject) => {
    resolve([
      {
        exampleName: 'test',
        exampleTitle: 'Test flow',
      },
    ]);
  });
};
const onGetExampleFlow = () => {
  return new Promise<any[]>((resolve, _reject) => {
    import('./data/test.json').then((data) => {
      resolve(data.default as unknown as any[]);
    });
  });
};

export const startEditor = async (flowStorageProvider?: IStorageProvider, doLocalStorageFlowEditorOnly?: boolean) => {
  if (doLocalStorageFlowEditorOnly) {
    //const root = document.getElementById('flowstudio-root');

    createIndexedDBStorageProvider()
      .then((result) => {
        /*const result = createFlowrunnerStorageProvider({}, [
      {
        name: 'AssignTask',
        id: 'AssignTask',
        taskType: 'AssignTask',
        shapeType: 'Html',
        x: 302,
        y: 570,
        assignToProperty: 'test',
        value: 'hello world',
        htmlPlugin: 'formNode',
      },
    ]);
    */
        if (!result) {
          throw new Error('No Storage Provider is available');
        }
        const flowrunnerStorageProvider = result as IStorageProvider;
        console.log('flowrunnerStorageProvider', flowrunnerStorageProvider);
        const reactRoot = ReactDOM.createRoot(document.getElementById('flowstudio-root') as HTMLElement);

        reactRoot.render(
          <React.StrictMode>
            <FormNodeDatasourceProvider>
              <TestApp flowrunnerStorageProvider={flowrunnerStorageProvider}></TestApp>
            </FormNodeDatasourceProvider>
          </React.StrictMode>,
        );
      })
      .catch(() => {
        throw new Error('Error when creating Storage Provider');
      });

    // needed to prevent fallthrough ...
    return;
  }

  registerCustomPlugins();

  fetch('/api/get-config')
    .then((res) => {
      if (res.status >= 400) {
        throw new Error('Bad response from server');
      }
      return res.json();
    })
    .then((config) => {
      console.log('config', config);
      if (config.config) {
        Object.keys(config.config).forEach((keyName) => {
          setCustomConfig(keyName, config[keyName]);
        });
      }

      registerFlowRunnerCanvasPlugin(
        'MapBoxTestTask',
        getMapBoxTestComponent(config.secrets),
        MapBoxTestTask,
        'MapBoxTestTask',
        'playground',
        undefined,
        pluginRegistry,
        {
          icon: 'fa-map',
          hasConfigMenu: true,
          configMenu: {
            fields: [{ fieldName: 'test' }],
          },
        },
      );

      registerFlowRunnerCanvasPlugin(
        'EChartsTestTask',
        getEChartsComponent(config.secrets),
        EChartsTestTask,
        'EChartsTestTask',
        'playground',
        undefined,
        pluginRegistry,
        {
          icon: 'fas fa-chart-pie',
          hasConfigMenu: true,
          configMenu: {
            fields: [
              {
                fieldName: 'datasource',
                fieldType: 'select',
                options: [
                  { label: 'Property', value: 'property' },
                  { label: 'Grid column', value: 'grid-column' },
                  { label: 'Grid range', value: 'grid-range' },
                ],
              },
              {
                fieldName: 'propertyName',
                visibilityCondition: 'datasource == "property"',
              },
              {
                fieldName: 'gridColumn',
                visibilityCondition: 'datasource == "grid-column"',
              },
              {
                fieldName: 'gridRange',
                visibilityCondition: 'datasource == "grid-range"',
              },
            ],
          },
        },
      );

      let hasStorageProvider = false;

      let storageProvider: IStorageProvider | undefined = undefined;
      if (flowStorageProvider !== undefined) {
        storageProvider = flowStorageProvider as IStorageProvider;
        hasStorageProvider = true;
        FlowStorageProviderService.setFlowStorageProvider(storageProvider);
      }

      let worker = getFlowAgent();
      worker.postMessage('worker', {
        command: 'init',
      });

      setPluginRegistry(pluginRegistry);

      const root = document.getElementById('flowstudio-root');

      const hasRunningFlowRunner = root && root.getAttribute('data-has-running-flowrunner') == 'true';

      let flowrunnerConnector: any = undefined;

      const onDestroyAndRecreateWorker = () => {
        console.log('onDestroyAndRecreateWorker handling code-flow-canvas');
        if (worker) {
          //worker.terminate();
        }
        if (!worker) {
          worker = getFlowAgent();

          worker.postMessage('worker', {
            command: 'init',
          });
          flowrunnerConnector.registerWorker(worker);
        }
      };

      if (hasRunningFlowRunner) {
        if (!flowrunnerConnector) {
          flowrunnerConnector = new FlowConnector();
          flowrunnerConnector.registerWorker(worker);
          flowrunnerConnector.registerDestroyAndRecreateWorker(onDestroyAndRecreateWorker);
        }
      } else {
        flowrunnerConnector = new EmptyFlowConnector();
      }
      flowRunnerConnectorInstance = flowrunnerConnector;

      flowrunnerConnector.hasStorageProvider = hasStorageProvider;
      flowrunnerConnector.storageProvider = storageProvider;

      let applicationMode = ApplicationMode.Canvas;
      if (hasStorageProvider) {
        if ((storageProvider as any).isUI) {
          applicationMode = ApplicationMode.UI;
        }
      }

      // eslint-disable-next-line no-restricted-globals
      const paths = location.pathname.split('/');
      let initalFlowId: string | undefined = undefined;
      if (paths.length > 1) {
        if (paths[1] === 'ui') {
          applicationMode = ApplicationMode.UI;
          document.querySelector('body')?.classList.add('body-ui-view');
          const element = document.querySelector('#loading');
          if (element && element.parentElement) {
            element.parentElement.removeChild(element);
          }
        } else if (paths[1] === 'canvas') {
          applicationMode = ApplicationMode.Canvas;

          if (paths.length > 2) {
            const flowId = paths[2];
            if (flowId !== undefined) {
              initalFlowId = flowId;
              console.log('initalFlowId', initalFlowId);
            } else {
              console.error('No flowId specified');
            }
          }
        }
      }
      flowrunnerConnector.setAppMode(applicationMode);

      const hasLogin = root && root.getAttribute('data-has-login') === 'true';
      const hasUIControlsBar = root && root.getAttribute('data-has-uicontrols') === 'true';

      const canvasToolbarsubject = new Subject<string>();
      const formNodesubject = new Subject<any>();

      interface IAppProps {
        isLoggedIn: boolean;
      }
      console.log('pre registerFlowRunnerCanvasPlugin');

      if (applicationMode === ApplicationMode.Canvas) {
        //import('./components/canvas').then((module) => {
        //const Canvas = module.Canvas;
        const App = (props: IAppProps) => {
          const [loggedIn, setLoggedIn] = useState(props.isLoggedIn);
          const [editorMode, setEditorMode] = useState('canvas');
          const [nodeStateFunction, setNodeStateFunction] = useState<any>(undefined);
          const flows = useFlows(flowrunnerConnector, useFlowStore, initalFlowId);

          const onClose = () => {
            setLoggedIn(true);
            return true;
          };

          const onEditorMode = (editorMode) => {
            flowrunnerConnector.flowView = editorMode;
            setEditorMode(editorMode);
          };

          const onRedirectToFlowUrl = (flowId) => {
            window.location.href = `/canvas/${flowId}`;
          };

          const getNodeStateFunction = (nodeFlowstateFunction: (node: INode) => INodeFlowState) => {
            console.log('getNodeStateFunction', nodeFlowstateFunction);
            setNodeStateFunction({ getFunction: nodeFlowstateFunction });
          };
          /*
					{false && !!hasUIControlsBar && editorMode == "canvas" && flowrunnerConnector.isActiveFlowRunner() &&<UIControlsBar renderHtmlNode={renderHtmlNode}
									flowrunnerConnector={flowrunnerConnector}></UIControlsBar>}
					*/
          // eslint-disable-next-line react/jsx-no-useless-fragment
          return (
            <>
              {hasLogin && !loggedIn ? (
                <Login onClose={onClose}></Login>
              ) : (
                <Suspense fallback={<div>Loading...</div>}>
                  <ErrorBoundary>
                    {!!hasUIControlsBar && editorMode == 'canvas' && flowrunnerConnector.isActiveFlowRunner() && (
                      <DebugInfo flowrunnerConnector={flowrunnerConnector}></DebugInfo>
                    )}

                    <Toolbar
                      canvasToolbarsubject={canvasToolbarsubject}
                      hasTaskNameAsNodeTitle={true}
                      hasRunningFlowRunner={!!hasRunningFlowRunner}
                      flowrunnerConnector={flowrunnerConnector}
                      hasCustomNodesAndRepository={true}
                      hasJSONEditInMenu={true}
                      onEditorMode={onEditorMode}
                      flow={flows.flow}
                      flowId={flows.flowId}
                      flows={flows.flows}
                      flowType={flows.flowType}
                      flowState={flows.flowState}
                      getFlows={flows.getFlows}
                      loadFlow={flows.loadFlow}
                      saveFlow={flows.saveFlow}
                      onGetFlows={flows.onGetFlows}
                      getNodeInstance={getNodeInstance}
                      renderHtmlNode={renderHtmlNode}
                      onRedirectToFlowUrl={onRedirectToFlowUrl}
                      onGetExamples={onGetExampleFlows}
                      onGetExampleFlow={onGetExampleFlow}
                      getNodeState={nodeStateFunction?.getFunction}
                    ></Toolbar>
                    {editorMode === 'canvas' && (
                      <CanvasComponent
                        canvasToolbarsubject={canvasToolbarsubject}
                        hasCustomNodesAndRepository={true}
                        hasDefaultUITasks={true}
                        showsStateMachineUpdates={true}
                        isEditingInModal={false}
                        formNodesubject={formNodesubject}
                        renderHtmlNode={renderHtmlNode}
                        flowrunnerConnector={flowrunnerConnector}
                        getNodeInstance={getNodeInstance}
                        flowHasNodes={flows.flow && flows.flow.length > 0}
                        flowId={flows.flowId}
                        flowType={flows.flowType}
                        flowState={flows.flowState}
                        saveFlow={flows.saveFlow}
                        hasTaskNameAsNodeTitle={true}
                        initialOpacity={0}
                        useFlowStore={useFlowStore}
                        useCanvasModeStateStore={useCanvasModeStateStore}
                        useSelectedNodeStore={useSelectedNodeStore}
                        externalId="AppCanvas"
                        getNodeStateFunction={getNodeStateFunction}
                      ></CanvasComponent>
                    )}
                    {editorMode == 'uiview-editor' && (
                      <Suspense fallback={<div>Loading...</div>}>
                        <UserInterfaceViewEditor
                          renderHtmlNode={renderHtmlNode}
                          flowrunnerConnector={flowrunnerConnector}
                          getNodeInstance={getNodeInstance}
                        />
                      </Suspense>
                    )}
                    <FooterToolbar></FooterToolbar>
                  </ErrorBoundary>
                </Suspense>
              )}
            </>
          );
        };
        if (flowRunnerCanvasPluginRegisterFunctions) {
          flowRunnerCanvasPluginRegisterFunctions.map((registerFunction) => {
            registerFunction();
            return true;
          });
        }
        flowrunnerConnector.setPluginRegistry(pluginRegistry);

        // isLoggedIn is set below and it forced to true when running using a storageProvider
        // or it is not used if data-has-login="false" is set on the document root used by reactdom.render
        const start = (isLoggednIn) => {
          console.log('pluginRegistry', pluginRegistry);
          const reactRoot = ReactDOM.createRoot(root as HTMLElement);
          reactRoot.render(
            <React.StrictMode>
              <PositionProvider>
                <FormNodeDatasourceProvider>
                  <App isLoggedIn={isLoggednIn}></App>
                </FormNodeDatasourceProvider>
              </PositionProvider>
            </React.StrictMode>,
          );
        };

        if (hasStorageProvider) {
          start(true);
          return;
        }

        fetch('/api/verify-token', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then((res) => {
            if (res.status >= 400) {
              return {
                isLoggedIn: false,
              };
            }
            return {
              isLoggedIn: true,
            };
          })
          .then((response) => {
            start((response as any).isLoggedIn);
          })
          .catch((err) => {
            console.error(err);
          });
        //});
      } else if (applicationMode === ApplicationMode.UI) {
        flowrunnerConnector.flowView = 'uiview';

        const App = (props) => {
          return (
            <ErrorBoundary>
              <UserInterfaceView
                renderHtmlNode={renderHtmlNode}
                flowrunnerConnector={flowrunnerConnector}
                getNodeInstance={getNodeInstance}
              ></UserInterfaceView>
            </ErrorBoundary>
          );
        };

        if (flowRunnerCanvasPluginRegisterFunctions) {
          flowRunnerCanvasPluginRegisterFunctions.map((registerFunction) => {
            registerFunction();
            return true;
          });
        }
        flowrunnerConnector.setPluginRegistry(pluginRegistry);

        console.log('pluginRegistry', pluginRegistry);
        const reactRoot = ReactDOM.createRoot(root as HTMLElement);
        reactRoot.render(
          <React.StrictMode>
            <PositionProvider>
              <FormNodeDatasourceProvider>
                <App></App>
              </FormNodeDatasourceProvider>
            </PositionProvider>
          </React.StrictMode>,
        );
      }
    })
    .catch((err) => {
      console.error(err);
    });
};

if ((window as any).autoStartFlowrunnerEditor) {
  startEditor();
} else if ((window as any).autoStartFlowrunnerEditorOnly) {
  startEditor(undefined, true);
}
