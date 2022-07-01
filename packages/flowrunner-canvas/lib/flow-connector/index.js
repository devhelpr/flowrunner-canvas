import { ApplicationMode } from '../interfaces/IFlowrunnerConnector';
export class EmptyFlowConnector {
    constructor() {
        this.storageProvider = undefined;
        this.hasStorageProvider = false;
        this.flowView = '';
        this.forcePushToFlowRunner = false;
        this.onMessage = (event) => { };
        this.registerNodeStateObserver = (observableId, callback) => { };
        this.unregisterNodeStateObserver = (observableId) => { };
        this.registerFlowNodeObserver = (nodeName, observableId, callback) => { };
        this.unregisterFlowNodeObserver = (nodeName, observableId) => { };
        this.registerFlowExecutionObserver = (observableId, callback) => { };
        this.unregisterFlowExecuteObserver = observableId => { };
        this.updateFlowNode = () => { };
        this.resetCurrentFlow = () => { };
        this.pushFlowToFlowrunner = (flow, autoStartNodes = true, flowId) => { };
        this.executeFlowNode = (nodeName, payload) => { };
        this.modifyFlowNode = (nodeName, propertyName, value, executeNode, eventName, additionalValues, isBundledNode, bundleNodeId) => { };
        this.isActiveFlowRunner = () => {
            return false;
        };
        this.setPluginRegistry = (pluginRegistry) => { };
        this.getPluginRegistry = () => {
            return {};
        };
        this.pauseFlowrunner = () => { };
        this.resumeFlowrunner = () => { };
        this.setFlowType = (flowType) => { };
        this.setAppMode = (mode) => { };
        this.getAppMode = () => {
            return ApplicationMode.Canvas;
        };
        this.registerScreenUICallback = (callback) => { };
        this.registerDestroyAndRecreateWorker = (onDestroyAndRecreateWorker) => { };
        this.killAndRecreateWorker = () => { };
        this.registerOnReceiveFlowNodeExecuteResult = (onReceiveFlowNodeExecuteResult) => { };
        this.runTests = (flowId) => { };
        this.getTasksFromPluginRegistry = () => {
            return [];
        };
    }
    getNodeExecutions() {
        return [];
    }
    getNodeExecutionsByNodeName(nodeName) {
        return [];
    }
    registerWorker(worker) { }
}
export class FlowConnector {
    constructor() {
        this.storageProvider = undefined;
        this.hasStorageProvider = false;
        this.worker = undefined;
        this.observables = [];
        this.nodeExecutions = [];
        this.nodeExecutionsByNode = {};
        this.pluginRegistry = {};
        this.flowType = 'playground';
        this.applicationMode = ApplicationMode.Canvas;
        this.flowView = '';
        this.nodeState = {};
        this.forcePushToFlowRunner = false;
        this.screenUICallback = action => {
            return;
        };
        this.registerOnReceiveFlowNodeExecuteResult = (onReceiveFlowNodeExecuteResult) => {
            this.onReceiveFlowNodeExecuteResult = onReceiveFlowNodeExecuteResult;
        };
        this.onError = (error) => {
            console.log('WORKER ERROR!!!', error);
        };
        this.onMessage = (event, flowAgent) => {
            if (event && event.data) {
                if (event.data.command == 'ExecuteFlowNodeResult') {
                    if (this.onReceiveFlowNodeExecuteResult) {
                        if (!event.data.result) {
                            this.onReceiveFlowNodeExecuteResult(false);
                        }
                        else {
                            this.onReceiveFlowNodeExecuteResult(event.data.payload);
                        }
                    }
                }
                else if (event.data.command == 'SendNodeExecution') {
                    if (event.data) {
                        this.nodeStateObservables.map((callbackInfo, index) => {
                            callbackInfo.callback(event.data.name, event.data.result, event.data.touchedNodes);
                        });
                        this.nodeState[event.data.name] = event.data.result;
                    }
                    this.nodeExecutions.push(event.data);
                    this.nodeExecutions.splice(0, this.nodeExecutions.length - 1000);
                    if (!this.nodeExecutionsByNode[event.data.name]) {
                        this.nodeExecutionsByNode[event.data.name] = [];
                    }
                    this.nodeExecutionsByNode[event.data.name].push(event.data);
                    this.nodeExecutionsByNode[event.data.name].splice(0, this.nodeExecutionsByNode[event.data.name].length - 5);
                    this.executionObservables.map(exectutionObservable => {
                        exectutionObservable.callback(event.data);
                    });
                }
                else if (event.data.command == 'SendObservableNodePayload') {
                    if (event.data.payload &&
                        event.data.payload.nodeName &&
                        this.observables.filter(observable => {
                            return observable.nodeName === event.data.payload.nodeName;
                        }).length > 0) {
                        this.observables
                            .filter(observable => {
                            return observable.nodeName === event.data.payload.nodeName;
                        })
                            .map((observable, index) => {
                            observable.callback(event.data.payload.payload);
                        });
                    }
                    else if (event.data.nodeName &&
                        this.observables.filter(observable => {
                            return observable.nodeName === event.data.nodeName;
                        }).length > 0) {
                        this.observables
                            .filter(observable => {
                            return observable.nodeName === event.data.nodeName;
                        })
                            .map((observable, index) => {
                            observable.callback(event.data.payload);
                        });
                    }
                }
                else if (event.data.command == 'ExecuteFlowPlugin') {
                    let pluginInfo = this.pluginRegistry[event.data.pluginName];
                    if (pluginInfo) {
                        let pluginInstance = new pluginInfo.FlowTaskPlugin();
                        let result = pluginInstance.execute({ payload: { ...event.data.payload } }, {
                            flowrunnerConnector: this,
                        });
                        if (this.worker) {
                            this.worker.postMessage('worker', {
                                command: 'ResultFlowPlugin',
                                nodeName: event.data.nodeName,
                                payload: result,
                                pluginName: event.data.pluginName,
                            });
                        }
                    }
                }
                else if (event.data.command == 'SendScreen') {
                    if (this.screenUICallback) {
                        this.screenUICallback({
                            action: 'SendScreen',
                            payload: event.data.payload,
                        });
                    }
                }
                else if (event.data.command == 'RegisterFlowNodeObservers') {
                    console.log('RegisterFlowNodeObservers', this.observables);
                    this.observables.map(observable => {
                        if (this.worker) {
                            this.worker.postMessage('worker', {
                                command: 'registerFlowNodeObserver',
                                nodeName: observable.nodeName,
                            });
                        }
                    });
                }
            }
            return;
        };
        this.registerFlowNodeObserver = (nodeName, observableId, callback) => {
            let results = this.observables.filter(ob => {
                return ob.nodeName == ob.nodeName && ob.id == observableId;
            });
            if (results.length == 0) {
                this.observables.push({
                    nodeName: nodeName,
                    callback: callback,
                    id: observableId,
                });
            }
            if (this.worker) {
                this.worker.postMessage('worker', {
                    command: 'registerFlowNodeObserver',
                    nodeName: nodeName,
                });
            }
        };
        this.unregisterFlowNodeObserver = (nodeName, observableId) => {
            let indexes = [];
            this.observables.map((observable, index) => {
                if (observable.id === observableId) {
                    if (indexes.length === 0) {
                        indexes.push(index);
                    }
                }
            });
            indexes.map((indexInObservables) => {
                this.observables[indexInObservables] = undefined;
                delete this.observables[indexInObservables];
                this.observables.splice(indexInObservables, 1);
            });
        };
        this.executionObservables = [];
        this.registerFlowExecutionObserver = (observableId, callback) => {
            let results = this.executionObservables.filter(ob => {
                return ob.id == observableId;
            });
            if (results.length == 0) {
                this.executionObservables.push({
                    callback: callback,
                    id: observableId,
                });
            }
        };
        this.unregisterFlowExecuteObserver = observableId => {
            let indexes = [];
            this.executionObservables.map((observable, index) => {
                if (observable.id === observableId) {
                    if (indexes.length === 0) {
                        indexes.push(index);
                    }
                }
            });
            indexes.map((indexInObservables) => {
                this.executionObservables[indexInObservables] = undefined;
                delete this.executionObservables[indexInObservables];
                this.executionObservables.splice(indexInObservables, 1);
            });
        };
        this.currentFlowId = '';
        this.resetCurrentFlow = () => {
            this.currentFlowId = '';
        };
        this.updateFlowNode = () => { };
        this.pushFlowToFlowrunner = (flow, autoStartNodes = true, flowId) => {
            this.forcePushToFlowRunner = false;
            let flowToFlowRunner = [
                ...flow.map(node => {
                    return { ...node };
                }),
            ];
            this.nodeState = {};
            if (this.worker) {
                console.log('should destroy?', this.currentFlowId != flowId, this.currentFlowId, flowId);
                if (this.onDestroyAndRecreateWorker && this.currentFlowId != flowId) {
                    this.onDestroyAndRecreateWorker();
                }
                this.currentFlowId = flowId;
                console.log('AFTER onDestroyAndRecreateWorker');
                this.nodeExecutions = [];
                this.nodeExecutionsByNode = {};
                let pluginRegistryTasks = [];
                for (var pluginName of Object.keys(this.pluginRegistry)) {
                    let plugin = this.pluginRegistry[pluginName];
                    pluginRegistryTasks.push(plugin);
                }
                if (this.flowType == 'playground') {
                    this.worker.postMessage('worker', {
                        command: 'pushFlowToFlowrunner',
                        flow: flowToFlowRunner,
                        flowId: flowId,
                        pluginRegistry: pluginRegistryTasks,
                        autoStartNodes: autoStartNodes,
                    });
                }
                else {
                    this.worker.postMessage('worker', {
                        command: 'pushFlowToFlowrunner',
                        flow: [],
                        pluginRegistry: pluginRegistryTasks,
                        autoStartNodes: autoStartNodes,
                    });
                }
            }
        };
        this.executeFlowNode = (nodeName, payload) => {
            if (this.flowType == 'playground') {
                if (this.worker) {
                    this.worker.postMessage('worker', {
                        command: 'executeFlowNode',
                        nodeName: nodeName,
                        payload: payload,
                        sendMessageOnResolve: true,
                    });
                }
            }
        };
        this.modifyFlowNode = (nodeName, propertyName, value, executeNode, eventName, additionalValues, isBundledNode, bundleNodeId) => {
            if (this.flowType == 'playground') {
                if (this.worker) {
                    this.worker.postMessage('worker', {
                        command: 'modifyFlowNode',
                        nodeName: nodeName,
                        propertyName: propertyName,
                        value: value,
                        executeNode: executeNode || '',
                        triggerEvent: eventName || '',
                        additionalValues: additionalValues,
                        isBundledNode: isBundledNode,
                        bundleNodeId: bundleNodeId,
                    });
                }
            }
        };
        this.isActiveFlowRunner = () => {
            return true;
        };
        this.setPluginRegistry = (pluginRegistry) => {
            this.pluginRegistry = pluginRegistry;
        };
        this.getPluginRegistry = () => {
            return this.pluginRegistry;
        };
        this.getTasksFromPluginRegistry = () => {
            if (!this.pluginRegistry) {
                return [];
            }
            return Object.keys(this.pluginRegistry).map(pluginName => {
                let plugin = this.pluginRegistry[pluginName];
                return {
                    className: plugin.FlowTaskPluginClassName,
                    fullName: plugin.FlowTaskPluginClassName,
                    flowType: plugin.flowType || 'playground',
                };
            });
        };
        this.pauseFlowrunner = () => {
            if (this.worker) {
                this.worker.postMessage('worker', {
                    command: 'PauseFlowrunner',
                });
            }
        };
        this.resumeFlowrunner = () => {
            if (this.worker) {
                this.worker.postMessage('worker', {
                    command: 'ResumeFlowrunner',
                });
            }
        };
        this.setFlowType = (flowType) => {
            this.flowType = flowType || 'playground';
        };
        this.setAppMode = (mode) => {
            this.applicationMode = mode;
        };
        this.getAppMode = () => {
            return this.applicationMode;
        };
        this.registerScreenUICallback = (callback) => {
            this.screenUICallback = callback;
        };
        this.registerDestroyAndRecreateWorker = (onDestroyAndRecreateWorker) => {
            this.onDestroyAndRecreateWorker = onDestroyAndRecreateWorker;
        };
        this.killAndRecreateWorker = () => {
            this.onDestroyAndRecreateWorker();
        };
        this.nodeStateObservables = [];
        this.registerNodeStateObserver = (observableId, callback) => {
            console.log('registerNodeStateObserver', observableId);
            let results = this.nodeStateObservables.filter(ob => {
                return ob.id == observableId;
            });
            if (results.length == 0) {
                this.nodeStateObservables.push({
                    callback: callback,
                    id: observableId,
                });
            }
        };
        this.unregisterNodeStateObserver = (observableId) => {
            console.log('unregisterNodeStateObserver', observableId);
            let indexes = [];
            this.nodeStateObservables.map((observable, index) => {
                if (observable.id === observableId) {
                    if (indexes.length === 0) {
                        indexes.push(index);
                    }
                }
            });
            indexes.map((indexInObservables) => {
                this.nodeStateObservables[indexInObservables] = undefined;
                delete this.nodeStateObservables[indexInObservables];
                this.nodeStateObservables.splice(indexInObservables, 1);
            });
        };
        this.runTests = (flowId) => {
            if (this.worker) {
                this.worker.postMessage('worker', {
                    command: 'runTests',
                    flowId: flowId,
                });
            }
        };
    }
    getNodeExecutions() {
        return this.nodeExecutions;
    }
    getNodeExecutionsByNodeName(nodeName) {
        if (this.nodeExecutionsByNode[nodeName]) {
            return this.nodeExecutionsByNode[nodeName];
        }
        return [];
    }
    registerWorker(worker) {
        this.worker = worker;
        worker.postMessage('worker', { a: 1 });
        console.log('registerWorker');
        worker.addEventListener('external', this.onMessage);
        worker.addEventListener('externalerror', this.onError);
    }
}
//# sourceMappingURL=index.js.map