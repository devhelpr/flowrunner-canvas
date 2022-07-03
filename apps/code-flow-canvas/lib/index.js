import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { Subject } from 'rxjs';
import fetch from 'cross-fetch';
import { FlowrunnerCanvas, CanvasComponent, Toolbar, FooterToolbar, Login, DebugInfo, UserInterfaceViewEditor } from '@devhelpr/flowrunner-canvas';
import { FlowConnector, EmptyFlowConnector, ApplicationMode, setCustomConfig, getFlowAgent, useFlowStore, useCanvasModeStateStore, useSelectedNodeStore, useFlows, FormNodeDatasourceProvider, useFormNodeDatasourceContext, createIndexedDBStorageProvider, PositionProvider, setPluginRegistry, renderHtmlNode, getNodeInstance, ErrorBoundary, FlowStorageProviderService } from '@devhelpr/flowrunner-canvas-core';
import { UserInterfaceView } from "@devhelpr/flowrunner-canvas-ui-view";
let flowRunnerConnectorInstance;
let flowRunnerCanvasPluginRegisterFunctions = [];
window.react = React;
let pluginRegistry = {};
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
                                            _jsx(CanvasComponent, { canvasToolbarsubject: canvasToolbarsubject, hasCustomNodesAndRepository: true, hasDefaultUITasks: true, showsStateMachineUpdates: true, isEditingInModal: false, formNodesubject: formNodesubject, renderHtmlNode: renderHtmlNode, flowrunnerConnector: flowrunnerConnector, getNodeInstance: getNodeInstance, flowHasNodes: flows.flow && flows.flow.length > 0, flowId: flows.flowId, flowType: flows.flowType, flowState: flows.flowState, saveFlow: flows.saveFlow, hasTaskNameAsNodeTitle: true, initialOpacity: 0, useFlowStore: useFlowStore, useCanvasModeStateStore: useCanvasModeStateStore, useSelectedNodeStore: useSelectedNodeStore, externalId: "AppCanvas" }), editorMode == "uiview-editor" && _jsx(Suspense, { fallback: _jsx("div", { children: "Loading..." }), children: _jsx(UserInterfaceViewEditor, { renderHtmlNode: renderHtmlNode, flowrunnerConnector: flowrunnerConnector, getNodeInstance: getNodeInstance }) }), _jsx(FooterToolbar, {})] }) }) }) });
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
        }
    })
        .catch(err => {
        console.error(err);
    });
};
if (!!window.autoStartFlowrunnerEditor) {
    startEditor();
}
else if (!!window.autoStartFlowrunnerEditorOnly) {
    startEditor(undefined, true);
}
//# sourceMappingURL=index.js.map