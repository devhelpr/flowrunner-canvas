import { FlowEventRunner, FlowTask, ObservableTask } from '@devhelpr/flowrunner';
import { createExpressionTree, executeExpressionTree } from '@devhelpr/expressionrunner';
export class FlowAgent {
    constructor() {
        this.eventListeners = {};
        this.flow = undefined;
        this.observables = {};
        this.postMessage = (eventName, message) => {
            (this.eventListeners[eventName] || []).map(listener => {
                listener({ eventName: eventName, data: message }, this);
            });
        };
        this.addEventListener = (eventName, callback) => {
            if (!this.eventListeners[eventName]) {
                this.eventListeners[eventName] = [];
            }
            this.eventListeners[eventName].push(callback);
        };
        this.removeEventListener = (eventName, callback) => {
            if (this.eventListeners[eventName]) {
                let resultIndex = -1;
                this.eventListeners[eventName].forEach((event, index) => {
                    if (event === callback) {
                        resultIndex = index;
                    }
                });
                if (resultIndex >= 0) {
                    this.eventListeners[eventName].splice(resultIndex, 1);
                }
            }
        };
        this.terminate = () => {
            this.eventListeners = {};
        };
    }
}
export const getFlowAgent = () => {
    const flowWorkerContext = new FlowAgent();
    flowWorkerContext.addEventListener('worker', onFlowAgentMessage);
    return flowWorkerContext;
};
import { BehaviorSubject, Subject } from 'rxjs';
import fetch from 'cross-fetch';
import { replaceValues } from './helpers/replace-values';
import * as uuid from 'uuid';
import { registerTasks } from './flow-tasks';
import { testRunner } from './tests-runner/tests-runner';
import { registerExpressionFunction, isRangeValue, getRangeFromValues, getRangeValueParameters, } from '@devhelpr/expressionrunner';
import { createStateMachine, emptyStateMachine, sendCurrentState, setOnGuardEventCallback, } from './state-machine';
const uuidV4 = uuid.v4;
registerExpressionFunction('sum', (a, ...args) => {
    console.log('sum', a, args[0]);
    if (isRangeValue(a.toString())) {
        const range = getRangeFromValues(args[0].values, a.toString());
        const valueParameterNames = getRangeValueParameters(a.toString());
        let result = 0;
        console.log(range);
        range.map((value, index) => {
            if (args[0][valueParameterNames[index]]) {
                result += Number(args[0][valueParameterNames[index]]) || 0;
            }
            else {
                result += Number(value) || 0;
            }
            return true;
        });
        return result;
    }
    else {
        return Number(a) + args[0];
    }
});
registerExpressionFunction('Math.PI', (a, ...args) => {
    return Math.PI;
});
registerExpressionFunction('Math.sqrt', (a, ...args) => {
    return Math.sqrt(a);
});
registerExpressionFunction('Math.sin', (a, ...args) => {
    return Math.sin(a);
});
registerExpressionFunction('sin', (a, ...args) => {
    return Math.sin(a);
});
registerExpressionFunction('hypot', (a, ...args) => {
    return Math.hypot(a, args[0]);
});
registerExpressionFunction('Math.sindegree', (a, ...args) => {
    return Math.sin((a * Math.PI) / 180);
});
registerExpressionFunction('Math.random', (a, ...args) => {
    return Math.random();
});
registerExpressionFunction('Math.atan', (a, ...args) => {
    return Math.atan(a);
});
registerExpressionFunction('Math.floor', (a, ...args) => {
    return Math.floor(a);
});
registerExpressionFunction('Math.ceil', (a, ...args) => {
    return Math.ceil(a);
});
registerExpressionFunction('Math.round', (a, ...args) => {
    return Math.round(a);
});
registerExpressionFunction('vlookup', (a, ...args) => {
    if (isRangeValue(a.toString())) {
        const range = getRangeFromValues(args[0].values, a.toString());
        const valueParameterNames = getRangeValueParameters(a.toString());
        let search = args[0][args[1]];
        range.map((value, index) => {
            if (args[0][valueParameterNames[index]]) {
            }
            else {
            }
            return true;
        });
    }
    return 0;
});
export class PreviewTask extends FlowTask {
    execute(node, services) {
        return true;
    }
    isStartingOnInitFlow() {
        return false;
    }
    getName() {
        return 'PreviewTask';
    }
}
export class ListTask extends FlowTask {
    execute(node, services) {
        if (node.propertyName) {
            let nodeName = node.name;
            if (node.useListFromNode) {
                nodeName = node.useListFromNode;
            }
            let list = services.flowEventRunner.getPropertyFromNode(nodeName, node.propertyName) || [];
            const payload = Object.assign({}, node.payload);
            if (payload.action) {
                if (payload.action == 'clear') {
                    list = [];
                }
                else if (payload.action == 'assign') {
                    list = [];
                    if (payload.listFromProperty) {
                        list = payload[payload.listFromProperty];
                    }
                    delete payload.listFromProperty;
                }
                else if (payload.action == 'getCount') {
                    if (payload.assignToProperty) {
                        node.payload[payload.assignToProperty] = list.length;
                    }
                    delete payload.assignToProperty;
                    return node.payload;
                }
                else if (payload.action == 'getIndex') {
                    if (payload.assignToProperty && payload.indexProperty) {
                        node.payload[payload.assignToProperty] = list[payload[payload.indexProperty]];
                    }
                    delete payload.assignToProperty;
                    delete payload.indexProperty;
                    return node.payload;
                }
                else if (payload.action == 'swap') {
                    console.log(list, node.payload.action, payload.item1, payload.item2, list.length, 'condition', payload.item1 !== undefined &&
                        payload.item2 !== undefined &&
                        !isNaN(payload.item1) &&
                        !isNaN(payload.item2) &&
                        payload.item1 >= 0 &&
                        payload.item2 >= 0 &&
                        payload.item1 < list.length &&
                        payload.item2 < list.length, node.payload);
                    if (payload.item1 !== undefined &&
                        payload.item2 !== undefined &&
                        !isNaN(payload.item1) &&
                        !isNaN(payload.item2) &&
                        payload.item1 >= 0 &&
                        payload.item2 >= 0 &&
                        payload.item1 < list.length &&
                        payload.item2 < list.length) {
                        [list[payload.item1], list[payload.item2]] = [list[payload.item2], list[payload.item1]];
                        console.log(list, 'after swap');
                        delete payload.item1;
                        delete payload.item2;
                        services.flowEventRunner.setPropertyOnNode(nodeName, node.propertyName, list);
                        return node.payload;
                    }
                    return node.payload;
                }
                else if (payload.action == 'get') {
                }
                delete payload.action;
            }
            else {
                list.push(node.payload);
            }
            services.flowEventRunner.setPropertyOnNode(nodeName, node.propertyName, list);
            return list;
        }
        return [];
    }
    getName() {
        return 'ListTask';
    }
}
export class OutputValueTask extends FlowTask {
    execute(node, services) {
        if (node.propertyName && node.maxValue) {
            const payload = Object.assign({}, node.payload);
            let value = services.flowEventRunner.getPropertyFromNode(node.name, node.propertyName) || node.startValue || 0;
            value += node.increment || 1;
            if (value > node.maxValue) {
                value = node.startValue;
            }
            payload[node.propertyName] = value;
            services.flowEventRunner.setPropertyOnNode(node.name, node.propertyName, value);
            return payload;
        }
        return node.payload;
    }
    getName() {
        return 'OutputValueTask';
    }
}
export class InputTask extends FlowTask {
    execute(node, services) {
        if (node.propertyName) {
            node.payload = Object.assign({}, node.payload);
            let value = node.defaultValue || '';
            try {
                if (node.nodeDatasource && node.nodeDatasource === 'flow') {
                    if (node.mode && node.mode === 'list') {
                        value = node.values;
                    }
                    else {
                        value = node.value;
                    }
                }
                else {
                    value = services.flowEventRunner.getPropertyFromNode(node.name, node.propertyName);
                }
                if (value === undefined) {
                    value = node.defaultValue || '';
                }
            }
            catch (err) {
                console.log('InputTask', err, node);
                value = node.defaultValue || '';
            }
            node.payload[node.propertyName] = value;
            return node.payload;
        }
        return node.payload;
    }
    getName() {
        return 'InputTask';
    }
}
let flowPluginNodes = {};
const FlowPluginWrapperTask = (pluginName, pluginClass) => {
    class FlowPluginWrapperTaskInternal extends FlowTask {
        execute(node, services) {
            if (node.observable) {
                new Promise((resolve, reject) => {
                    const executeId = uuidV4();
                    const payload = { ...node.payload, executeId: executeId };
                    const pluginInstance = new pluginClass();
                    let result = pluginInstance.execute({ payload: payload }, undefined);
                    resolve(result);
                }).then(payload => {
                    node.observable.next({
                        nodeName: node.name,
                        payload: Object.assign({}, payload),
                    });
                });
                return node.observable;
            }
            return false;
        }
        getName() {
            return pluginName;
        }
        getObservable(node) {
            if (node.observable === undefined) {
                node.observable = new BehaviorSubject({ nodeName: node.name, payload: {} });
            }
            return node.observable;
        }
        isAttachedToExternalObservable() {
            return false;
        }
    }
    return FlowPluginWrapperTaskInternal;
};
let timers = {};
export class TimerTask extends FlowTask {
    constructor() {
        super();
        this.isExecuting = false;
        this.clearTimeout = undefined;
        this.node = undefined;
        this.timer = () => {
            if (!this.isExecuting) {
                this.isExecuting = true;
                if (this.clearTimeout) {
                    clearTimeout(this.clearTimeout);
                    this.clearTimeout = undefined;
                }
                if (this.flow.isPaused()) {
                    console.log('PAUSED');
                    this.clearTimeout = setTimeout(this.timer, this.node.interval);
                    return;
                }
                if (this.node.executeNode) {
                    this.flow.executeNode(this.node.executeNode, this.node.payload || {}).then(() => {
                        this.isExecuting = false;
                        if (!!this.isBeingKilled) {
                            return;
                        }
                        this.clearTimeout = setTimeout(this.timer, this.node.interval);
                    });
                }
                else {
                    this.flow.triggerEventOnNode(this.node.name, 'onTimer', this.node.payload || {}).then(() => {
                        this.isExecuting = false;
                        if (!!this.isBeingKilled) {
                            return;
                        }
                        this.clearTimeout = setTimeout(this.timer, this.node.interval);
                    });
                }
            }
            else {
                if (this.clearTimeout) {
                    clearTimeout(this.clearTimeout);
                    this.clearTimeout = undefined;
                }
                if (!!this.isBeingKilled) {
                    return;
                }
                this.clearTimeout = setTimeout(this.timer, this.node.interval);
            }
        };
        this.isBeingKilled = false;
        console.log('create TimerTask');
    }
    execute(node, services) {
        this.node = node;
        this.isExecuting = false;
        this.flow = services.workerContext.flow;
        console.log('timer execute', node);
        if (node.mode === 'executeNode' || node.events) {
            if (this.clearTimeout) {
                clearTimeout(this.clearTimeout);
                this.clearTimeout = undefined;
            }
            this.clearTimeout = setTimeout(this.timer, node.interval);
            return;
        }
        else {
            if (node.interval) {
                if (timers[node.name]) {
                    clearInterval(timers[node.name]);
                    timers[node.name] = undefined;
                }
                let subject = new Subject();
                const timer = setInterval(() => {
                    subject.next(Object.assign({}, node.payload));
                }, node.interval);
                timers[node.name] = timer;
                return subject;
            }
        }
        return false;
    }
    kill() {
        this.isBeingKilled = true;
        if (this.clearTimeout) {
            clearTimeout(this.clearTimeout);
            this.clearTimeout = undefined;
        }
    }
    getName() {
        return 'TimerTask';
    }
}
export class RandomTask extends ObservableTask {
    execute(node, services) {
        node.payload = Object.assign({}, node.payload);
        let propertyName = 'value';
        if (node.assignToProperty) {
            propertyName = node.assignToProperty;
        }
        if (node.maxValue) {
            node.payload[propertyName] = Math.round(Math.random() * node.maxValue);
        }
        else {
            node.payload[propertyName] = Math.random();
        }
        return node.payload;
    }
    getName() {
        return 'RandomTask';
    }
}
export class ApiProxyTask extends FlowTask {
    execute(node, services) {
        const promise = new Promise((resolve, reject) => {
            node.payload = Object.assign({}, node.payload);
            try {
                fetch('/api/proxy', {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        url: replaceValues(node.url, node.payload, true),
                        body: !!node.sendPayloadToApi && node.payload,
                        httpMethod: node.httpMethod || 'get',
                    }),
                })
                    .then(res => {
                    if (res.status >= 400) {
                        throw new Error('Api-proxy : Bad response from server (' + node.name + ')');
                    }
                    return res.json();
                })
                    .then(response => {
                    resolve({ ...node.payload, ...response });
                })
                    .catch(err => {
                    console.error(err);
                    reject('Api-proxy : Bad response from server (' + node.name + ') : ' + err);
                });
            }
            catch (err) {
                console.error(err);
                reject('Api-proxy : Bad response from server (' + node.name + ') : ' + err);
            }
        });
        return promise;
    }
    getName() {
        return 'ApiProxyTask';
    }
}
export class MapPayloadTask extends FlowTask {
    execute(node, services) {
        return true;
    }
    getName() {
        return 'MapPayloadTask';
    }
}
const onFlowAgentMessage = (event, worker) => {
    if (event && event.data) {
        let data = event.data;
        let command = data.command;
        if (command == 'init') {
        }
        else if (command == 'executeFlowNode' && data.nodeName) {
            if (!worker.flow) {
                return;
            }
            const sendMessageOnResolve = !!data.sendMessageOnResolve;
            let payload = data.payload ? { ...data.payload } : undefined;
            if (payload) {
                worker.flow
                    .executeNode(data.nodeName, payload || {})
                    .then(result => {
                    if (sendMessageOnResolve) {
                        worker.postMessage('external', {
                            command: 'ExecuteFlowNodeResult',
                            result: result,
                            payload: { ...result },
                        });
                    }
                })
                    .catch(error => {
                    console.log('executeNode failed', error);
                    if (sendMessageOnResolve) {
                        worker.postMessage('external', {
                            command: 'ExecuteFlowNodeResult',
                            result: false,
                            payload: undefined,
                        });
                    }
                });
            }
            else {
                console.log('retriggerNode', data.nodeName);
                worker.flow
                    .retriggerNode(data.nodeName)
                    .then(result => {
                    if (sendMessageOnResolve) {
                        worker.postMessage('external', {
                            command: 'ExecuteFlowNodeResult',
                            result: result,
                            payload: { ...result },
                        });
                    }
                })
                    .catch(error => {
                    console.log('executeNode failed', error);
                    if (sendMessageOnResolve) {
                        worker.postMessage('external', {
                            command: 'ExecuteFlowNodeResult',
                            result: false,
                            payload: undefined,
                        });
                    }
                });
            }
            payload = null;
        }
        else if (command == 'modifyFlowNode') {
            if (!data.nodeName) {
                return;
            }
            if (!worker.flow) {
                return;
            }
            if (data.propertyName) {
                console.log('modifyFlowNode', data.nodeName, data.propertyName, data.value);
                worker.flow.setPropertyOnNode(data.nodeName, data.propertyName, data.value, data.additionalValues || {});
            }
            else {
                worker.flow.setPropertiesOnNode(data.nodeName, data.additionalValues || {});
            }
            if (data.executeNode !== undefined && data.executeNode !== '') {
                console.log('pre modifyFlowNode executeNode', data);
                worker.flow
                    .retriggerNode(data.executeNode)
                    .then(result => {
                })
                    .catch(error => {
                    console.log('modifyFlowNode executeNode failed', data, error);
                });
            }
            if (data.triggerEvent !== undefined && data.triggerEvent !== '') {
                if (!worker.flow) {
                    return;
                }
                worker.flow
                    .triggerEventOnNode(data.nodeName, data.triggerEvent, {})
                    .then(result => {
                })
                    .catch(error => {
                    console.log('modifyFlowNode triggerEventOnNode failed', data, error);
                });
            }
        }
        else if (command == 'pushFlowToFlowrunner') {
            startFlow({ flow: data.flow }, data.pluginRegistry, !!data.autoStartNodes, data.flowId, worker);
        }
        else if (command == 'registerFlowNodeObserver') {
            if (worker.observables[data.nodeName]) {
                worker.observables[data.nodeName].unsubscribe();
                worker.observables[data.nodeName] = undefined;
            }
            if (!worker.flow) {
                return;
            }
            const observable = worker.flow.getObservableNode(data.nodeName);
            if (observable) {
                let nodeName = data.nodeName;
                let subscribtion = observable.subscribe({
                    complete: () => {
                        console.log('COMPLETE SendObservableNodePayload', nodeName);
                    },
                    next: (payload) => {
                        worker.postMessage('external', {
                            command: 'SendObservableNodePayload',
                            payload: payload.payload,
                            nodeName: payload.nodeName,
                        });
                    },
                });
                worker.observables[data.nodeName] = subscribtion;
            }
        }
        else if (command == 'ResultFlowPlugin') {
            const resolve = flowPluginNodes[data.nodeName];
            if (resolve && resolve.resolve && resolve.executeId === data.payload.executeId) {
                let payload = { ...data.payload };
                resolve.resolve(payload);
                flowPluginNodes[data.nodeName] = undefined;
                payload = null;
            }
        }
        else if (command == 'PauseFlowrunner') {
            if (!worker.flow) {
                return;
            }
            worker.flow.pauseFlowrunner();
        }
        else if (command == 'ResumeFlowrunner') {
            if (!worker.flow) {
                return;
            }
            worker.flow.resumeFlowrunner();
        }
        else if (command == 'runTests') {
            if (!worker.flow) {
                return;
            }
            testRunner(data.flowId, worker.flow, worker);
        }
        data = null;
    }
};
const onExecuteNode = (result, id, title, nodeType, payload, dateTime, worker) => {
    var _a;
    worker.postMessage('external', {
        command: 'SendNodeExecution',
        result: result,
        dateTime: dateTime,
        payload: { ...payload, nodeExecutionId: uuidV4() },
        name: id,
        nodeType: nodeType,
        touchedNodes: (_a = worker.flow) === null || _a === void 0 ? void 0 : _a.getTouchedNodes(),
    });
};
let currentFlowId = '';
let machine = emptyStateMachine;
const startFlow = (flowPackage, pluginRegistry, autoStartNodes = true, flowId, worker) => {
    let isSameFlow = false;
    if (flowId == currentFlowId) {
        isSameFlow = true;
    }
    console.log('startFlow', `isSameFlow = ${isSameFlow}`, flowId, currentFlowId, flowPackage);
    currentFlowId = flowId;
    if (worker.flow !== undefined) {
        for (var key of Object.keys(worker.observables)) {
            worker.observables[key].unsubscribe();
        }
        worker.observables = {};
        for (var timer of Object.keys(timers)) {
            clearInterval(timers[timer]);
        }
        timers = {};
        console.log('before destroyflow', flowId, currentFlowId, isSameFlow);
        worker.flow.destroyFlow();
        if (!isSameFlow) {
            worker.flow = undefined;
        }
    }
    if (!isSameFlow || !worker.flow) {
        worker.flow = new FlowEventRunner();
        worker.flow.registerTask('RandomTask', RandomTask);
        worker.flow.registerTask('TimerTask', TimerTask);
        worker.flow.registerTask('InputTask', InputTask);
        worker.flow.registerTask('ListTask', ListTask);
        worker.flow.registerTask('ApiProxyTask', ApiProxyTask);
        registerTasks(worker.flow);
        if (pluginRegistry) {
            pluginRegistry.map((plugin) => {
                var _a;
                console.log('pluginName', plugin.FlowTaskPluginClassName);
                (_a = worker.flow) === null || _a === void 0 ? void 0 : _a.registerTask(plugin.FlowTaskPluginClassName, FlowPluginWrapperTask(plugin.FlowTaskPluginClassName, plugin.FlowTaskPlugin));
            });
        }
    }
    if (!isSameFlow) {
        worker.flow.registerMiddleware((result, id, title, nodeType, payload, dateTime) => {
            return onExecuteNode(result, id, title, nodeType, payload, dateTime, worker);
        });
    }
    let services = {
        flowEventRunner: worker.flow,
        pluginClasses: {},
        logMessage: (arg1, arg2) => {
            console.log(arg1, arg2);
        },
        registerModel: (modelName, definition) => { },
        getWebAssembly: () => {
            return undefined;
        },
        workerContext: worker,
        getWorker: getFlowAgent,
    };
    let value = false;
    let perfstart = performance.now();
    if (!isSameFlow) {
        try {
            machine = createStateMachine(flowPackage.flow);
            setOnGuardEventCallback((stateMachineName, currentState, eventName, node, payload) => {
                if (node && node.Expression) {
                    const expression = createExpressionTree(node.Expression);
                    const result = executeExpressionTree(expression, payload);
                    console.log('Guard result', result);
                    return result === 1;
                }
                return true;
            });
            console.log('Statemachine definition', machine);
        }
        catch (err) {
            console.log('Statemachine creation error', err);
            machine = emptyStateMachine;
        }
    }
    worker.flow
        .start(flowPackage, services, true, !!autoStartNodes, isSameFlow)
        .then((services) => {
        var _a;
        for (var key of Object.keys(worker.observables)) {
            const observable = (_a = worker.flow) === null || _a === void 0 ? void 0 : _a.getObservableNode(key);
            if (observable) {
                console.log('subscribe observable after start', key);
                let subscribtion = observable.subscribe({
                    next: (payload) => {
                        console.log('SendObservableNodePayload in worker', payload, key);
                        worker.postMessage('external', {
                            command: 'SendObservableNodePayload',
                            payload: { ...(payload || {}) },
                            nodeName: key,
                        });
                    },
                });
                worker.observables[key] = subscribtion;
            }
        }
        console.log('RegisterFlowNodeObservers after start, init time:', performance.now() - perfstart + 'ms');
        worker.postMessage('external', {
            command: 'RegisterFlowNodeObservers',
            payload: {},
        });
        sendCurrentState();
        console.log('flow running');
    })
        .catch(error => {
        console.log('error when starting flow', error);
    });
};
console.log('flowrunner web-worker started');
export default null;
//# sourceMappingURL=flow-agent.js.map