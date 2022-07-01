import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { Subject } from 'rxjs';
import fetch from 'cross-fetch';
import { Toolbar } from './components/toolbar';
import { FooterToolbar } from './components/footer-toolbar';
import { Login } from './components/login';
import { DebugInfo } from './components/debug-info';
import { FlowConnector, EmptyFlowConnector } from './flow-connector';
import { ApplicationMode } from './interfaces/IFlowrunnerConnector';
export { ApplicationMode } from './interfaces/IFlowrunnerConnector';
import { setCustomConfig } from './config';
import { getFlowAgent } from './flow-agent';
import { FlowStorageProviderService } from './services/FlowStorageProviderService';
import { flowrunnerStorageProvider, configurableFlowrunnerStorageProvider, readOnlyFlowrunnerStorageProvider } from './flow-localstorage-provider';
import { createIndexedDBStorageProvider, setDefaultFlow, setDefaultFlowTitle, setTasks } from './flow-indexeddb-provider';
import { useFlowStore } from './state/flow-state';
import { useCanvasModeStateStore } from './state/canvas-mode-state';
import { useSelectedNodeStore } from './state/selected-node-state';
import { useFlows, FlowState } from './use-flows';
import { registerPlugins } from './external-plugins';
import { ErrorBoundary } from './helpers/error';
import { PositionProvider } from './components/contexts/position-context';
import { FormNodeDatasourceProvider, useFormNodeDatasourceContext } from './components/contexts/form-node-datasource-context';
let flowRunnerConnectorInstance;
let flowRunnerCanvasPluginRegisterFunctions = [];
const UserInterfaceViewEditor = React.lazy(() => import('./components/userinterface-view-editor').then(({ UserInterfaceViewEditor }) => ({ default: UserInterfaceViewEditor })));
const CanvasComponent = React.lazy(() => import('./components/canvas').then(({ Canvas }) => ({ default: Canvas })));
window.react = React;
let pluginRegistry = {};
export const flowrunnerLocalStorageProvider = flowrunnerStorageProvider;
export const configurableFlowrunnerLocalStorageProvider = configurableFlowrunnerStorageProvider;
export const readOnlyFlowrunnerLocalStorageProvider = readOnlyFlowrunnerStorageProvider;
export { createIndexedDBStorageProvider, setDefaultFlow, setDefaultFlowTitle, setTasks };
export { FormNodeDatasourceProvider, useFormNodeDatasourceContext };
export * from "./state-machine";
export const registerFlowRunnerCanvasPlugin = (name, VisualizationComponent, FlowTaskPlugin, FlowTaskPluginClassName, flowType) => {
    if (flowRunnerConnectorInstance) {
        pluginRegistry[FlowTaskPluginClassName] = {
            VisualizationComponent: VisualizationComponent,
            FlowTaskPlugin: FlowTaskPlugin,
            FlowTaskPluginClassName: FlowTaskPluginClassName,
            flowType: flowType || "playground"
        };
        console.log(pluginRegistry);
        setCustomConfig(FlowTaskPluginClassName, {
            shapeType: 'Html',
            hasUI: true,
            presetValues: {
                htmlPlugin: FlowTaskPluginClassName
            }
        });
        flowRunnerConnectorInstance.setPluginRegistry(pluginRegistry);
    }
};
export const addRegisterFunction = (registerFunction) => {
    flowRunnerCanvasPluginRegisterFunctions.push(registerFunction);
};
export { FlowConnector };
export { setCustomConfig };
export { useFlowStore };
const InternalFlowrunnerCanvas = (props) => {
    const [renderFlowCanvas, setRenderFlowCanvas] = useState(false);
    const flowrunnerConnector = useRef((props.flowrunnerConnector || new FlowConnector()));
    const canvasToolbarsubject = useRef(undefined);
    const formNodesubject = useRef(undefined);
    const renderHtmlNode = useRef(undefined);
    const getNodeInstance = useRef(undefined);
    const flowAgent = useRef(undefined);
    const isUnmounting = useRef(false);
    let hasStorageProvider = false;
    let storageProvider = undefined;
    if (props.flowStorageProvider !== undefined) {
        storageProvider = props.flowStorageProvider;
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
        canvasToolbarsubject.current = new Subject();
        formNodesubject.current = new Subject();
        import('./render-html-node').then((moduleRenderHtmlNode) => {
            const setPluginRegistry = moduleRenderHtmlNode.setPluginRegistry;
            renderHtmlNode.current = moduleRenderHtmlNode.renderHtmlNode;
            getNodeInstance.current = moduleRenderHtmlNode.getNodeInstance;
            const options = {};
            if (hasStorageProvider) {
                options.initialStoreState = storageProvider === null || storageProvider === void 0 ? void 0 : storageProvider.getFlowPackage();
            }
            flowAgent.current = getFlowAgent();
            if (props.onMessageFromFlow) {
                flowAgent.current.addEventListener("external", props.onMessageFromFlow);
            }
            flowAgent.current.postMessage("worker", {
                command: 'init'
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
                console.log("onDestroyAndRecreateWorker handling");
                if (flowAgent) {
                    flowAgent.current.removeEventListener("external", props.onMessageFromFlow);
                    flowAgent.current.terminate();
                }
                flowAgent.current = getFlowAgent();
                if (props.onMessageFromFlow) {
                    flowAgent.current.addEventListener("external", props.onMessageFromFlow);
                }
                flowAgent.current.postMessage("worker", {
                    command: 'init'
                });
                if (flowrunnerConnector.current) {
                    flowrunnerConnector.current.registerWorker(flowAgent.current);
                }
            };
            if (flowrunnerConnector.current) {
                flowrunnerConnector.current.registerWorker(flowAgent.current);
                flowrunnerConnector.current.registerDestroyAndRecreateWorker(onDestroyAndRecreateWorker);
                flowrunnerConnector.current.setAppMode(ApplicationMode.Canvas);
                console.log("RENDER ORDER 1");
                setRenderFlowCanvas(true);
            }
        });
        return () => {
            isUnmounting.current = true;
            if (props.onMessageFromFlow && flowAgent) {
                flowAgent.current.removeEventListener("external", props.onMessageFromFlow);
                flowAgent.current.addEventListener("external", props.onMessageFromFlow);
            }
        };
    }, [props.flowStorageProvider, props.flowrunnerConnector]);
    useEffect(() => {
        if (flows.flowState !== FlowState.idle) {
            flows.reloadFlow();
        }
    }, [props.flowStorageProvider, props.flowrunnerConnector]);
    if (!renderFlowCanvas || !flowrunnerConnector.current) {
        return _jsx(_Fragment, {});
    }
    return _jsx(_Fragment, { children: _jsx(Suspense, { fallback: _jsx("div", { children: "Loading..." }), children: _jsxs(ErrorBoundary, { children: [_jsx(DebugInfo, { flowrunnerConnector: flowrunnerConnector.current }), _jsx(Toolbar, { hasShowDependenciesInMenu: props.hasShowDependenciesInMenu, hasTaskNameAsNodeTitle: props.hasTaskNameAsNodeTitle || false, hasCustomNodesAndRepository: props.hasCustomNodesAndRepository || false, hasJSONEditInMenu: props.hasJSONEditInMenu || false, renderMenuOptions: props.renderMenuOptions, canvasToolbarsubject: canvasToolbarsubject.current, hasRunningFlowRunner: true, isFlowEditorOnly: true, flowrunnerConnector: flowrunnerConnector.current, flow: flows.flow, flowId: flows.flowId, flows: flows.flows, flowType: flows.flowType, flowState: flows.flowState, modalSize: props.modalSize, getFlows: flows.getFlows, loadFlow: flows.loadFlow, saveFlow: flows.saveFlow, onGetFlows: flows.onGetFlows, getNodeInstance: getNodeInstance.current, renderHtmlNode: renderHtmlNode.current }), _jsx(CanvasComponent, { canvasToolbarsubject: canvasToolbarsubject.current, hasCustomNodesAndRepository: props.hasCustomNodesAndRepository !== undefined ? props.hasCustomNodesAndRepository : true, showsStateMachineUpdates: props.showsStateMachineUpdates || false, renderHtmlNode: renderHtmlNode.current, isEditingInModal: false, flowrunnerConnector: flowrunnerConnector.current, getNodeInstance: getNodeInstance.current, formNodesubject: formNodesubject.current, flowHasNodes: flows.flow && flows.flow.length > 0, flowId: flows.flowId, flowType: flows.flowType, flowState: flows.flowState, saveFlow: flows.saveFlow, modalSize: props.modalSize, initialOpacity: 0, hasTaskNameAsNodeTitle: props.hasTaskNameAsNodeTitle, getNodeDependencies: props.getNodeDependencies, useFlowStore: useFlowStore, useCanvasModeStateStore: useCanvasModeStateStore, useSelectedNodeStore: useSelectedNodeStore, externalId: "AppCanvas" })] }) }) });
};
export const FlowrunnerCanvas = memo((props) => {
    return _jsx(PositionProvider, { children: _jsx(InternalFlowrunnerCanvas, { ...props }) });
});
const TestApp = (props) => {
    const { setDatasource } = useFormNodeDatasourceContext();
    const [debugList, setDebugList] = useState([]);
    const onMessageFromFlow = useCallback((event, flowAgent) => {
        if (event && event.data) {
            if (event.data.command === 'RegisterFlowNodeObservers') {
                return;
            }
            console.log("onMessageFromFlow", event.data.command);
            if (event.data.command === 'SendNodeExecution') {
                setDebugList(state => [...state, event.data.command + "-" + event.data.name]);
            }
        }
    }, []);
    useEffect(() => {
        setDatasource("testlocal", ["testapp1", "testapp2"]);
    }, []);
    const flowCanvas = _jsx(FlowrunnerCanvas, { developmentMode: true, flowStorageProvider: props.flowrunnerStorageProvider, onMessageFromFlow: onMessageFromFlow, flowrunnerConnector: new FlowConnector() });
    return (_jsxs("div", { className: "row no-gutters h-100", children: [_jsx("div", { className: "col-12 col-md-6 h-100", children: flowCanvas }), _jsx("div", { className: "col-12 col-md-6 h-100", style: {
                    overflow: "hidden",
                    maxHeight: "100vh",
                    overflowY: "scroll"
                }, children: _jsx("div", { className: "overflow-visible", children: debugList.map((debugItem, index) => {
                        return _jsx("div", { children: debugItem }, index);
                    }) }) })] }));
};
export const startEditor = async (flowStorageProvider, doLocalStorageFlowEditorOnly) => {
    if (!!doLocalStorageFlowEditorOnly) {
        const root = document.getElementById('flowstudio-root');
        createIndexedDBStorageProvider().then((result) => {
            if (!result) {
                throw new Error("No Storage Provider is available");
            }
            const flowrunnerStorageProvider = result;
            console.log("flowrunnerStorageProvider", flowrunnerStorageProvider);
            ReactDOM.render(_jsx(FormNodeDatasourceProvider, { children: _jsx(TestApp, { flowrunnerStorageProvider: flowrunnerStorageProvider }) }), root);
        }).catch(() => {
            throw new Error("Error when creating Storage Provider");
        });
        return;
    }
    import('./render-html-node').then((module) => {
        fetch('/get-config')
            .then(res => {
            if (res.status >= 400) {
                throw new Error("Bad response from server");
            }
            return res.json();
        })
            .then(config => {
            console.log("config", config);
            if (config) {
                Object.keys(config).forEach((keyName) => {
                    setCustomConfig(keyName, config[keyName]);
                });
            }
            const setPluginRegistry = module.setPluginRegistry;
            const renderHtmlNode = module.renderHtmlNode;
            const getNodeInstance = module.getNodeInstance;
            let hasStorageProvider = false;
            let storageProvider = undefined;
            if (flowStorageProvider !== undefined) {
                storageProvider = flowStorageProvider;
                hasStorageProvider = true;
                FlowStorageProviderService.setFlowStorageProvider(storageProvider);
            }
            const options = {};
            if (hasStorageProvider) {
                options.initialStoreState = storageProvider === null || storageProvider === void 0 ? void 0 : storageProvider.getFlowPackage();
            }
            let worker = getFlowAgent();
            worker.postMessage("worker", {
                command: 'init'
            });
            setPluginRegistry(pluginRegistry);
            const root = document.getElementById('flowstudio-root');
            const hasRunningFlowRunner = root && root.getAttribute("data-has-running-flowrunner") == "true";
            let flowrunnerConnector = undefined;
            const onDestroyAndRecreateWorker = () => {
                console.log("onDestroyAndRecreateWorker handling");
                if (worker) {
                    worker.terminate();
                }
                worker = getFlowAgent();
                worker.postMessage("worker", {
                    command: 'init'
                });
                flowrunnerConnector.registerWorker(worker);
            };
            if (!!hasRunningFlowRunner) {
                flowrunnerConnector = new FlowConnector();
                flowrunnerConnector.registerWorker(worker);
                flowrunnerConnector.registerDestroyAndRecreateWorker(onDestroyAndRecreateWorker);
            }
            else {
                flowrunnerConnector = new EmptyFlowConnector();
            }
            flowRunnerConnectorInstance = flowrunnerConnector;
            flowrunnerConnector.hasStorageProvider = hasStorageProvider;
            flowrunnerConnector.storageProvider = storageProvider;
            let applicationMode = ApplicationMode.Canvas;
            if (hasStorageProvider) {
                if (!!storageProvider.isUI) {
                    applicationMode = ApplicationMode.UI;
                }
            }
            const paths = location.pathname.split("/");
            if (paths.length > 1) {
                if (paths[1] == "ui") {
                    applicationMode = ApplicationMode.UI;
                }
            }
            flowrunnerConnector.setAppMode(applicationMode);
            const hasLogin = root && root.getAttribute("data-has-login") === "true";
            const hasUIControlsBar = root && root.getAttribute("data-has-uicontrols") === "true";
            let canvasToolbarsubject = new Subject();
            let formNodesubject = new Subject();
            if (applicationMode === ApplicationMode.Canvas) {
                const App = (props) => {
                    const [loggedIn, setLoggedIn] = useState(props.isLoggedIn);
                    const [editorMode, setEditorMode] = useState("canvas");
                    const flows = useFlows(flowrunnerConnector, useFlowStore);
                    const onClose = () => {
                        setLoggedIn(true);
                        return true;
                    };
                    const onEditorMode = (editorMode) => {
                        flowrunnerConnector.flowView = editorMode;
                        setEditorMode(editorMode);
                    };
                    return _jsx(_Fragment, { children: hasLogin && !loggedIn ? _jsx(Login, { onClose: onClose }) :
                            _jsx(_Fragment, { children: _jsx(Suspense, { fallback: _jsx("div", { children: "Loading..." }), children: _jsxs(ErrorBoundary, { children: [!!hasUIControlsBar && editorMode == "canvas" && flowrunnerConnector.isActiveFlowRunner() && _jsx(DebugInfo, { flowrunnerConnector: flowrunnerConnector }), _jsx(Toolbar, { canvasToolbarsubject: canvasToolbarsubject, hasTaskNameAsNodeTitle: true, hasRunningFlowRunner: !!hasRunningFlowRunner, flowrunnerConnector: flowrunnerConnector, hasCustomNodesAndRepository: true, hasJSONEditInMenu: true, onEditorMode: onEditorMode, flow: flows.flow, flowId: flows.flowId, flows: flows.flows, flowType: flows.flowType, flowState: flows.flowState, getFlows: flows.getFlows, loadFlow: flows.loadFlow, saveFlow: flows.saveFlow, onGetFlows: flows.onGetFlows, getNodeInstance: getNodeInstance, renderHtmlNode: renderHtmlNode }), editorMode == "canvas" &&
                                                _jsx(CanvasComponent, { canvasToolbarsubject: canvasToolbarsubject, hasCustomNodesAndRepository: true, showsStateMachineUpdates: true, isEditingInModal: false, formNodesubject: formNodesubject, renderHtmlNode: renderHtmlNode, flowrunnerConnector: flowrunnerConnector, getNodeInstance: getNodeInstance, flowHasNodes: flows.flow && flows.flow.length > 0, flowId: flows.flowId, flowType: flows.flowType, flowState: flows.flowState, saveFlow: flows.saveFlow, hasTaskNameAsNodeTitle: true, initialOpacity: 0, useFlowStore: useFlowStore, useCanvasModeStateStore: useCanvasModeStateStore, useSelectedNodeStore: useSelectedNodeStore, externalId: "AppCanvas" }), editorMode == "uiview-editor" && _jsx(Suspense, { fallback: _jsx("div", { children: "Loading..." }), children: _jsx(UserInterfaceViewEditor, { renderHtmlNode: renderHtmlNode, flowrunnerConnector: flowrunnerConnector, getNodeInstance: getNodeInstance }) }), _jsx(FooterToolbar, {})] }) }) }) });
                };
                if (flowRunnerCanvasPluginRegisterFunctions) {
                    flowRunnerCanvasPluginRegisterFunctions.map((registerFunction) => {
                        registerFunction();
                        return true;
                    });
                }
                flowrunnerConnector.setPluginRegistry(pluginRegistry);
                const start = (isLoggednIn) => {
                    console.log("pluginRegistry", pluginRegistry);
                    ReactDOM.render(_jsx(PositionProvider, { children: _jsx(FormNodeDatasourceProvider, { children: _jsx(App, { isLoggedIn: isLoggednIn }) }) }), root);
                };
                if (hasStorageProvider) {
                    start(true);
                    return;
                }
                fetch('/api/verify-token', {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    }
                })
                    .then(res => {
                    if (res.status >= 400) {
                        return {
                            isLoggedIn: false
                        };
                    }
                    return {
                        isLoggedIn: true
                    };
                })
                    .then(response => {
                    start(response.isLoggedIn);
                })
                    .catch(err => {
                    console.error(err);
                });
            }
            else if (applicationMode === ApplicationMode.UI) {
                import('./components/userinterface-view').then((module) => {
                    const UserInterfaceView = module.UserInterfaceView;
                    flowrunnerConnector.flowView = "uiview";
                    const App = (props) => {
                        return _jsx(ErrorBoundary, { children: _jsx(UserInterfaceView, { renderHtmlNode: renderHtmlNode, flowrunnerConnector: flowrunnerConnector, getNodeInstance: getNodeInstance }) });
                    };
                    if (flowRunnerCanvasPluginRegisterFunctions) {
                        flowRunnerCanvasPluginRegisterFunctions.map((registerFunction) => {
                            registerFunction();
                            return true;
                        });
                    }
                    flowrunnerConnector.setPluginRegistry(pluginRegistry);
                    console.log("pluginRegistry", pluginRegistry);
                    ReactDOM.render(_jsx(PositionProvider, { children: _jsx(FormNodeDatasourceProvider, { children: _jsx(App, {}) }) }), root);
                });
            }
        })
            .catch(err => {
            console.error(err);
        });
    });
};
if (!!window.autoStartFlowrunnerEditor) {
    startEditor();
}
else if (!!window.autoStartFlowrunnerEditorOnly) {
    startEditor(undefined, true);
}
//# sourceMappingURL=index.js.map