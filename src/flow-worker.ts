import { IWorker } from './interfaces/IWorker';

export class FlowWorker implements IWorker {
  eventListeners: any = {};
  postMessage = (eventName, message: any) => {
    (this.eventListeners[eventName] || []).map(listener => {
      listener({ eventName: eventName, data: message });
    });
  };
  addEventListener = (eventName: string, callback: (event: any) => void) => {
    if (!this.eventListeners[eventName]) {
      this.eventListeners[eventName] = [];
    }
    this.eventListeners[eventName].push(callback);
  };
  terminate = () => {
    this.eventListeners = {};
  };
}

let ctx: FlowWorker = new FlowWorker();
export const getWorker = () => {
  ctx = new FlowWorker();
  ctx.addEventListener('worker', onWorkerMessage);
  return ctx;
};

import { FlowEventRunner, FlowTask, ObservableTask } from '@devhelpr/flowrunner';
import { BehaviorSubject, Subject } from 'rxjs';

import fetch from 'cross-fetch';
import { replaceValues } from './helpers/replace-values';
import * as uuid from 'uuid';

import { registerTasks } from './flow-tasks';
import { testRunner } from './tests-runner/tests-runner';

import {
  registerExpressionFunction,
  isRangeValue,
  getRangeFromValues,
  getRangeValueParameters,
} from '@devhelpr/expressionrunner';

const uuidV4 = uuid.v4;

registerExpressionFunction('sum', (a: number, ...args: number[]) => {
  console.log('sum', a, args[0]);
  if (isRangeValue(a.toString())) {
    const range = getRangeFromValues((args[0] as any).values, a.toString());
    const valueParameterNames = getRangeValueParameters(a.toString());
    let result = 0;
    console.log(range);
    range.map((value, index) => {
      if (args[0][valueParameterNames[index]]) {
        result += Number(args[0][valueParameterNames[index]]) || 0;
      } else {
        result += Number(value) || 0;
      }
      return true;
    });
    return result;
  } else {
    // todo ... add other arguments as well
    return Number(a) + args[0];
  }
});

registerExpressionFunction('Math.PI', (a: number, ...args: number[]) => {
  return Math.PI;
});
registerExpressionFunction('Math.sqrt', (a: number, ...args: number[]) => {
  return Math.sqrt(a);
});
registerExpressionFunction('Math.sin', (a: number, ...args: number[]) => {
  return Math.sin(a);
});
registerExpressionFunction('sin', (a: number, ...args: number[]) => {
  return Math.sin(a);
});

registerExpressionFunction('hypot', (a: number, ...args: number[]) => {
  return Math.hypot(a, args[0]);
});

registerExpressionFunction('Math.sindegree', (a: number, ...args: number[]) => {
  return Math.sin((a * Math.PI) / 180);
});
registerExpressionFunction('Math.random', (a: number, ...args: number[]) => {
  return Math.random();
});
registerExpressionFunction('Math.atan', (a: number, ...args: number[]) => {
  return Math.atan(a);
});

// -.4/(hypot(x-((t/1000)%10),y-((t/1000)%8))-((t/1000)%2)*9)

//Math.sin((t/100)-Math.sqrt((x-7.5)^2+(y-6)^2))
//Math.sin(x+0.5*y+0.5*time/100)
//Math.sin((Math.sqrt(((x-7.5)*(x-7.5))+((-7.5+y)*(-7.5+y))))*time/10000)
//Math.sin(time/10000-(Math.sqrt(((x-7.5)*(x-7.5))+((-7.5+y)*(-7.5+y)))))
//Math.sin(x/2) - Math.sin(x-t/1000) - y+6
registerExpressionFunction('Math.floor', (a: number, ...args: number[]) => {
  return Math.floor(a);
});

registerExpressionFunction('Math.ceil', (a: number, ...args: number[]) => {
  return Math.ceil(a);
});

registerExpressionFunction('Math.round', (a: number, ...args: number[]) => {
  return Math.round(a);
});

registerExpressionFunction('vlookup', (a: number, ...args: number[]) => {
  if (isRangeValue(a.toString())) {
    const range = getRangeFromValues((args[0] as any).values, a.toString());
    const valueParameterNames = getRangeValueParameters(a.toString());
    let search = (args[0] as any)[args[1]];

    range.map((value, index) => {
      if (args[0][valueParameterNames[index]]) {
      } else {
      }
      return true;
    });
  }

  return 0;
});

let webAssembly;

//import('./wasm').then((wasmWasm) => {
//
//});

/*
import ("../rust/pkg/index_bg.wasm").then(wasm => {
  console.log("WASM", wasm);
});
*/

let flow: FlowEventRunner;
let observables = {};

export class PreviewTask extends FlowTask {
  public execute(node: any, services: any) {
    //console.log('previewtask', node);
    return true;
  }

  public isStartingOnInitFlow() {
    return false;
  }

  public getName() {
    return 'PreviewTask';
  }
}

export class ListTask extends FlowTask {
  public execute(node: any, services: any) {
    if (node.propertyName) {
      let nodeName = node.name;
      if (node.useListFromNode) {
        nodeName = node.useListFromNode;
      }

      let list: any[] = services.flowEventRunner.getPropertyFromNode(nodeName, node.propertyName) || [];
      //console.log(list, node.payload.action);
      const payload = Object.assign({}, node.payload);
      if (payload.action) {
        if (payload.action == 'clear') {
          list = [];
        } else if (payload.action == 'assign') {
          list = [];
          if (payload.listFromProperty) {
            list = payload[payload.listFromProperty];
          }
          delete payload.listFromProperty;
        } else if (payload.action == 'getCount') {
          if (payload.assignToProperty) {
            node.payload[payload.assignToProperty] = list.length;
          }
          delete payload.assignToProperty;
          return node.payload;
        } else if (payload.action == 'getIndex') {
          if (payload.assignToProperty && payload.indexProperty) {
            node.payload[payload.assignToProperty] = list[payload[payload.indexProperty]];
          }
          delete payload.assignToProperty;
          delete payload.indexProperty;
          return node.payload;
        } else if (payload.action == 'swap') {
          console.log(
            list,
            node.payload.action,
            payload.item1,
            payload.item2,
            list.length,
            'condition',
            payload.item1 !== undefined &&
              payload.item2 !== undefined &&
              !isNaN(payload.item1) &&
              !isNaN(payload.item2) &&
              payload.item1 >= 0 &&
              payload.item2 >= 0 &&
              payload.item1 < list.length &&
              payload.item2 < list.length,
            node.payload,
          );

          if (
            payload.item1 !== undefined &&
            payload.item2 !== undefined &&
            !isNaN(payload.item1) &&
            !isNaN(payload.item2) &&
            payload.item1 >= 0 &&
            payload.item2 >= 0 &&
            payload.item1 < list.length &&
            payload.item2 < list.length
          ) {
            [list[payload.item1], list[payload.item2]] = [list[payload.item2], list[payload.item1]];
            console.log(list, 'after swap');
            delete payload.item1;
            delete payload.item2;

            services.flowEventRunner.setPropertyOnNode(nodeName, node.propertyName, list);

            return node.payload;
          }
          return node.payload;
        } else if (payload.action == 'get') {
          // dummy action
        }
        delete payload.action;
      } else {
        list.push(node.payload);
      }

      services.flowEventRunner.setPropertyOnNode(nodeName, node.propertyName, list);

      return list;
    }
    return [];
  }

  public getName() {
    return 'ListTask';
  }
}

export class OutputValueTask extends FlowTask {
  public execute(node: any, services: any) {
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

  public getName() {
    return 'OutputValueTask';
  }
}

export class InputTask extends FlowTask {
  public execute(node: any, services: any) {
    if (node.propertyName) {
      node.payload = Object.assign({}, node.payload);
      let value = node.defaultValue || '';
      try {
        if (node.nodeDatasource && node.nodeDatasource === 'flow') {
          if (node.mode && node.mode === 'list') {
            value = node.values;
          } else {
            value = node.value;
          }
        } else {
          value = services.flowEventRunner.getPropertyFromNode(node.name, node.propertyName);
        }
        if (value === undefined) {
          value = node.defaultValue || '';
        }
        //console.log('InputTask', value, node);
      } catch (err) {
        console.log('InputTask', err, node);
        value = node.defaultValue || '';
      }
      node.payload[node.propertyName] = value;
      return node.payload;
    }

    return node.payload;
  }

  public getName() {
    return 'InputTask';
  }
}

let flowPluginNodes = {};

const FlowPluginWrapperTask = pluginName => {
  class FlowPluginWrapperTaskInternal extends FlowTask {
    public execute(node: any, services: any) {
      if (node.observable) {
        new Promise((resolve, reject) => {
          const executeId = uuidV4();
          //console.log("FlowPluginWrapperTaskInternal", pluginName, node.name, executeId, node.payload);
          flowPluginNodes[node.name] = {
            resolve,
            executeId,
          };
          const payload = { ...node.payload, executeId: executeId };
          ctx.postMessage('external', {
            command: 'ExecuteFlowPlugin',
            payload: payload,
            nodeName: node.name,
            pluginName: pluginName,
          });
        }).then(payload => {
          //console.log("payload FlowPluginWrapperTask", node, payload);
          node.observable.next({
            nodeName: node.name,
            payload: Object.assign({}, payload),
          });
        });

        return node.observable;
      }
      return false;
    }

    public getName() {
      return pluginName;
    }

    public getObservable(node: any) {
      if (node.observable === undefined) {
        node.observable = new BehaviorSubject<any>({ nodeName: node.name, payload: {} });
      }
      return node.observable;
    }

    public isAttachedToExternalObservable() {
      return false;
    }
  }

  return FlowPluginWrapperTaskInternal;
};

let timers: any = {};

export class TimerTask extends FlowTask {
  isExecuting: boolean = false;
  clearTimeout: any = undefined;
  node: any = undefined;

  constructor() {
    super();
    console.log('create TimerTask');
  }

  public timer = () => {
    /*

      problem with pausing the flow is that this can happen during handling of
      executeNode internal emits, and then the executeNode/triggerEventOnNode never finished

    */
    if (!this.isExecuting) {
      this.isExecuting = true;

      if (this.clearTimeout) {
        clearTimeout(this.clearTimeout);
        this.clearTimeout = undefined;
      }

      if (this.node.executeNode) {
        flow.executeNode(this.node.executeNode, this.node.payload || {}).then(() => {
          this.isExecuting = false;
          if (!!this.isBeingKilled) {
            return;
          }
          this.clearTimeout = setTimeout(this.timer, this.node.interval);
        });
      } else {
        flow.triggerEventOnNode(this.node.name, 'onTimer', this.node.payload || {}).then(() => {
          this.isExecuting = false;
          if (!!this.isBeingKilled) {
            return;
          }
          this.clearTimeout = setTimeout(this.timer, this.node.interval);
        });
      }
    } else {
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

  public execute(node: any, services: any) {
    this.node = node;
    this.isExecuting = false;
    //console.log('timer execute', node);
    if (node.mode === 'executeNode' || node.events) {
      if (this.clearTimeout) {
        clearTimeout(this.clearTimeout);
        this.clearTimeout = undefined;
      }
      this.clearTimeout = setTimeout(this.timer, node.interval);
      return;
    } else {
      if (node.interval) {
        if (timers[node.name]) {
          clearInterval(timers[node.name]);
          timers[node.name] = undefined;
        }

        let subject = new Subject<string>();
        const timer = setInterval(() => {
          subject.next(Object.assign({}, node.payload));
        }, node.interval);
        timers[node.name] = timer;
        return subject;
      }
    }
    /*if (timers[node.name]) {
      clearInterval(timers[node.name]);
      timers[node.name] = undefined;
    }*/

    return false;
  }

  isBeingKilled = false;
  public kill() {
    //console.log('kill TimerTask');

    this.isBeingKilled = true;
    if (this.clearTimeout) {
      clearTimeout(this.clearTimeout);
      this.clearTimeout = undefined;
    }
  }

  public getName() {
    return 'TimerTask';
  }
}

export class RandomTask extends ObservableTask {
  public execute(node: any, services: any) {
    node.payload = Object.assign({}, node.payload);
    let propertyName = 'value';
    if (node.assignToProperty) {
      propertyName = node.assignToProperty;
    }
    if (node.maxValue) {
      node.payload[propertyName] = Math.round(Math.random() * node.maxValue);
    } else {
      node.payload[propertyName] = Math.random();
    }
    return node.payload;
  }

  public getName() {
    return 'RandomTask';
  }
}

export class ApiProxyTask extends FlowTask {
  public execute(node: any, services: any) {
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
      } catch (err) {
        console.error(err);
        reject('Api-proxy : Bad response from server (' + node.name + ') : ' + err);
      }
    });

    return promise;
  }

  public getName() {
    return 'ApiProxyTask';
  }
}

export class MapPayloadTask extends FlowTask {
  public execute(node: any, services: any) {
    /*
			TODO :
				- loop through all properties of "node.map"-property
				- each value can contain mustache's {} .. 
					.. if value is a string: the contents should be mapped on the payload and contain nested properties
					.. value can also be an object.. treat that as a map
						.. and so on
				 - return the new result as a new payload

				 - how to treat arrays?
				 
		*/
    return true;
  }
  public getName() {
    return 'MapPayloadTask';
  }
}

const onWorkerMessage = event => {
  // event.data contains event message data
  //console.log("event from flow", event);
  if (event && event.data) {
    let data: any = event.data;
    let command = data.command;
    if (command == 'init') {
      /*
      import('../rust/pkg').then(wasm => {
        console.log('wasm', wasm, wasm.greet('hello wasm!'));
        wasm.init();

        webAssembly = wasm;
        let flow = [
          {
            name: 'start',
            taskName: 'assign',
            valueInt: 1,
            mode: 'int',
            next: 'add',
          },
          {
            name: 'add',
            taskName: 'operation',
            operator: 'add',
            valueInt: 1,
            mode: 'int',
            next: 'condition',
          },
          {
            name: 'condition',
            taskName: 'if',
            condition: 'lower',
            valueInt: 10000,
            mode: 'int',
            next: 'add',
            elseStep: 'else',
          },
          {
            name: 'else',
            taskName: 'assign',
            value: 'ready',
            mode: '',
          },
        ];
        let flowrunner = webAssembly.Flowrunner.new(`[]`, `{"flow":${JSON.stringify(flow)}}`);
        console.log('wasm test', flowrunner.convert(JSON.stringify({})));        
      });
      */
    } else if (command == 'executeFlowNode' && data.nodeName) {
      if (!flow) {
        return;
      }
      const sendMessageOnResolve = !!data.sendMessageOnResolve;
      let payload = { ...data.payload };
      flow
        .executeNode(data.nodeName, payload || {})
        .then(result => {
          if (sendMessageOnResolve) {
            ctx.postMessage('external', {
              command: 'ExecuteFlowNodeResult',
              result: result,
              payload: { ...(result as any) },
            });
          }
        })
        .catch(error => {
          console.log('executeNode failed', error);
          if (sendMessageOnResolve) {
            ctx.postMessage('external', {
              command: 'ExecuteFlowNodeResult',
              result: false,
              payload: undefined,
            });
          }
        });
      payload = null;
    } else if (command == 'modifyFlowNode') {
      if (!data.nodeName) {
        return;
      }

      if (!flow) {
        return;
      }
      flow.setPropertyOnNode(data.nodeName, data.propertyName, data.value, data.additionalValues || {});
      //console.log('modifyFlowNode', data);
      if (data.executeNode !== undefined && data.executeNode !== '') {
        flow
          .retriggerNode(data.executeNode)
          .then(result => {
            //console.log('result after modifyFlowNode executeNode', result);
          })
          .catch(error => {
            console.log('modifyFlowNode executeNode failed', data, error);
          });
      }

      if (data.triggerEvent !== undefined && data.triggerEvent !== '') {
        if (!flow) {
          return;
        }

        flow
          .triggerEventOnNode(data.nodeName, data.triggerEvent, {})
          .then(result => {
            //console.log('result after modifyFlowNode executeNode', result);
          })
          .catch(error => {
            console.log('modifyFlowNode triggerEventOnNode failed', data, error);
          });
      }
    } else if (command == 'pushFlowToFlowrunner') {
      //console.log("pushFlowToFlowrunner", data);
      startFlow({ flow: data.flow }, data.pluginRegistry, !!data.autoStartNodes, data.flowId);
    } else if (command == 'registerFlowNodeObserver') {
      if (observables[data.nodeName]) {
        (observables[data.nodeName] as any).unsubscribe();
        observables[data.nodeName] = undefined;
      }

      if (!flow) {
        return;
      }

      const observable = flow.getObservableNode(data.nodeName);
      //console.log("registerFlowNodeObserver", data.nodeName, observable);
      if (observable) {
        let nodeName = data.nodeName;
        let subscribtion = observable.subscribe({
          complete: () => {
            console.log('COMPLETE SendObservableNodePayload', nodeName);
          },
          next: (payload: any) => {
            //console.log("command SendObservableNodePayload", payload);
            ctx.postMessage('external', {
              command: 'SendObservableNodePayload',
              payload: payload.payload,
              nodeName: payload.nodeName,
            });
          },
        });
        observables[data.nodeName] = subscribtion;
      }
    } else if (command == 'ResultFlowPlugin') {
      // send payload to resolve method from promise in FlowPluginTask?
      const resolve = flowPluginNodes[data.nodeName];
      if (resolve && resolve.resolve && resolve.executeId === data.payload.executeId) {
        let payload = { ...data.payload };
        resolve.resolve(payload);
        flowPluginNodes[data.nodeName] = undefined;
        payload = null;
      }
    } else if (command == 'PauseFlowrunner') {
      if (!flow) {
        return;
      }
      flow.pauseFlowrunner();
    } else if (command == 'ResumeFlowrunner') {
      if (!flow) {
        return;
      }
      flow.resumeFlowrunner();
    } else if (command == 'runTests') {
      if (!flow) {
        return;
      }
      testRunner(data.flowId, flow, ctx);
    }

    data = null;
  }
};

let lastDate = new Date();

const onExecuteNode = (result: any, id: any, title: any, nodeType: any, payload: any, dateTime: any) => {
  //if (dateTime >= lastDate) {
  lastDate = dateTime;
  ctx.postMessage('external', {
    command: 'SendNodeExecution',
    result: result,
    dateTime: dateTime,
    payload: { ...payload, nodeExecutionId: uuidV4() },
    name: id,
    nodeType: nodeType,
    touchedNodes: flow.getTouchedNodes(),
  });
  //}
};

let currentFlowId: string = '';
const startFlow = (flowPackage: any, pluginRegistry: string[], autoStartNodes: boolean = true, flowId: string) => {
  let isSameFlow: boolean = false;

  console.log('startFlow', flowId, currentFlowId);
  if (flowId == currentFlowId) {
    isSameFlow = true;
  }

  currentFlowId = flowId;

  if (flow !== undefined) {
    for (var key of Object.keys(observables)) {
      observables[key].unsubscribe();
    }
    observables = {};

    for (var timer of Object.keys(timers)) {
      clearInterval(timers[timer]);
    }
    timers = {};
    console.log('before destroyflow', flowId, currentFlowId, isSameFlow);

    // TODO: analyse if everything that is done in destroyflow should
    //  only be done when !isSameFlow
    // When flow.destroyflow is run here, currently the observable-tasks dont
    //   work anymore (debugtask)

    //flow.destroyFlow();

    if (!isSameFlow) {
      flow.destroyFlow();
      (flow as any) = undefined;
    }
  }

  if (!isSameFlow || !flow) {
    flow = new FlowEventRunner();
    flow.registerTask('PreviewTask', PreviewTask);
    flow.registerTask('InputTask', InputTask);
    flow.registerTask('TimerTask', TimerTask);
    flow.registerTask('RandomTask', RandomTask);
    flow.registerTask('OutputValueTask', OutputValueTask);
    flow.registerTask('ApiProxyTask', ApiProxyTask);
    flow.registerTask('MapPayloadTask', MapPayloadTask);
    flow.registerTask('ListTask', ListTask);

    registerTasks(flow);

    if (pluginRegistry) {
      pluginRegistry.map(pluginName => {
        console.log('pluginName', pluginName);
        flow.registerTask(pluginName, FlowPluginWrapperTask(pluginName));
      });
    }
  }
  /*
  
  ... TODO : send pluginRegistry as serializable data .. not classes/instances etc
  ... TODO : use special "Task" which :
      - has a promise
      - postmessage to main thread
      - execute task on main thread
      - post result to worker
      - worker sends payload to resolve method from promise
  
  console.log("pluginRegistry in worker", (window as any).pluginRegistry);

  if ((window as any).pluginRegistry) {
    
    for (var key of Object.keys((window as any).pluginRegistry)) {
      const plugin = (window as any).pluginRegistry[key];
      if (plugin && plugin.FlowTaskPlugin) {
        flow.registerTask(key, plugin.FlowTaskPlugin);
      }
    }
  }
  */
  if (!isSameFlow) {
    flow.registerMiddleware(onExecuteNode);
  }
  let services = {
    flowEventRunner: flow,
    pluginClasses: {},
    logMessage: (arg1, arg2) => {
      //console.log(arg1, arg2);
    },
    registerModel: (modelName: string, definition: any) => {},
    getWebAssembly: () => {
      return webAssembly;
    },
    workerContext: ctx,
  };
  let value: boolean = false;
  let perfstart = performance.now();
  flow
    .start(flowPackage, services, true, !!autoStartNodes, isSameFlow)
    .then((services: any) => {
      /*
      // see above.. not needed here
      services.logMessage = (arg1, arg2) => {
        console.log(arg1, arg2);
      };

      services.getWebAssembly = () => {
        return webAssembly;
      }
      */
      for (var key of Object.keys(observables)) {
        const observable = flow.getObservableNode(key);
        if (observable) {
          console.log('subscribe observable after start', key);
          let subscribtion = observable.subscribe({
            next: (payload: any) => {
              console.log('SendObservableNodePayload in worker', payload, key);
              ctx.postMessage('external', {
                command: 'SendObservableNodePayload',
                payload: { ...(payload || {}) },
                nodeName: key,
              });
            },
          });
          observables[key] = subscribtion;
        }
      }

      console.log('RegisterFlowNodeObservers after start, init time:', performance.now() - perfstart + 'ms');

      ctx.postMessage('external', {
        command: 'RegisterFlowNodeObservers',
        payload: {},
      });
      console.log('flow running');
    })
    .catch(error => {
      console.log('error when starting flow', error);
    });
};

ctx.addEventListener('worker', onWorkerMessage);

console.log('flowrunner web-worker started');

export default null as any;
