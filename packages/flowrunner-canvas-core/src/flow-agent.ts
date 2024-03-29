import { FlowEventRunner, FlowTask, ObservableTask } from '@devhelpr/flowrunner';

import { IFlowAgent, GetFlowAgentFunction } from './interfaces/IFlowAgent';

import { createExpressionTree, executeExpressionTree } from '@devhelpr/expressionrunner';

export class FlowAgent implements IFlowAgent {
  eventListeners: any = {};
  isInAutoFormStepMode = false;
  flow?: FlowEventRunner = undefined;
  observables = {};

  postMessage = (eventName, message: any) => {
    (this.eventListeners[eventName] || []).map((listener) => {
      listener({ eventName: eventName, data: message }, this);
    });
  };
  addEventListener = (eventName: string, callback: (event: any, flowAgent: IFlowAgent) => void) => {
    if (!this.eventListeners[eventName]) {
      this.eventListeners[eventName] = [];
    }
    this.eventListeners[eventName].push(callback);
  };
  removeEventListener = (eventName: string, callback: (event: any, flowAgent: IFlowAgent) => void) => {
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
  terminate = () => {
    if (this.flow) {
      console.log('before calling destroyFlow');
      this.flow.destroyFlow();
    }
    this.eventListeners = {};
  };
}

export const getFlowAgent: GetFlowAgentFunction = () => {
  const flowWorkerContext = new FlowAgent();
  flowWorkerContext.addEventListener('worker', onFlowAgentMessage);

  return flowWorkerContext;
};

import { BehaviorSubject, Subject } from 'rxjs';

//import fetch from 'cross-fetch';
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
import {
  getFlowByStartStateNode,
  getStartStateNodeName,
  getStateMachines,
  initStateMachines,
  //createStateMachine,
  //emptyStateMachine,
  IStateMachine,
  registerStateMachine,
  StateChart,
  // sendCurrentState,
  //setOnGuardEventCallback,
} from './state-machine';
import { createVariableStore, resetVariableStore } from './flow-variables';
import { workerData } from 'worker_threads';
import { FlowToCanvas } from './helpers/flow-to-canvas';
import { StateMachine } from '../dist';
import { resetDebugInfo } from './debug-info/debug-info';
import { extendExpressionCompiler } from './expression-compiler';

const uuidV4 = uuid.v4;

extendExpressionCompiler();

registerExpressionFunction('get', ((a: string, ...args: string[]) => {
  const getExpression = a.toString();
  console.log('get', getExpression, args as any);
  return 0;
}) as unknown as (value: number, ...args: number[]) => number);

registerExpressionFunction('sum', ((a: string, ...args: string[]) => {
  console.log('sum', a, args[0]);
  const sumExpression = a.toString();
  if (sumExpression >= 'A' && sumExpression <= 'Z' && sumExpression.length === 1) {
    let helperValues = (args[0] as any).values;
    if (!helperValues) {
      return 0;
    }
    let result = 0;
    helperValues.forEach((row) => {
      const numberValue: Number = Number(sumExpression.charCodeAt(0) as Number) - 65;
      if (numberValue < row.length) {
        result += Number((row as any[])[numberValue as unknown as any]) || 0;
      }
    });
    return result;
  } else if (isRangeValue(sumExpression)) {
    const range = getRangeFromValues((args[0] as any).values, a.toString());
    const valueParameterNames = getRangeValueParameters(a.toString());
    let result = 0;
    console.log(range);
    range.forEach((value, index) => {
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
    return 0;
  }
}) as unknown as (value: number, ...args: number[]) => number);

registerExpressionFunction('avg', ((a: string, ...args: string[]) => {
  console.log('avg', a, args[0]);
  const sumExpression = a.toString();
  if (sumExpression >= 'A' && sumExpression <= 'Z' && sumExpression.length === 1) {
    let helperValues = (args[0] as any).values;
    if (!helperValues) {
      return 0;
    }
    let result = 0;
    if (helperValues.length > 0) {
      helperValues.forEach((row) => {
        const numberValue: Number = Number(sumExpression.charCodeAt(0) as Number) - 65;
        if (numberValue < row.length) {
          result += Number((row as any[])[numberValue as unknown as any]) || 0;
        }
      });
      return result / helperValues.length;
    }
    return result;
  } else if (isRangeValue(sumExpression)) {
    const range = getRangeFromValues((args[0] as any).values, a.toString());
    const valueParameterNames = getRangeValueParameters(a.toString());
    let result = 0;
    console.log(range);
    if (range.length > 0) {
      range.forEach((value, index) => {
        if (args[0][valueParameterNames[index]]) {
          result += Number(args[0][valueParameterNames[index]]) || 0;
        } else {
          result += Number(value) || 0;
        }
      });
      return result / range.length;
    }
    return result;
  } else {
    // todo ... add other arguments as well
    return 0;
  }
}) as unknown as (value: number, ...args: number[]) => number);

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

export class PreviewTask extends FlowTask {
  public override execute(node: any, services: any) {
    //console.log('previewtask', node);
    return true;
  }

  public isStartingOnInitFlow() {
    return false;
  }

  public override getName() {
    return 'PreviewTask';
  }
}

export class ListTask extends FlowTask {
  public override execute(node: any, services: any) {
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

  public override getName() {
    return 'ListTask';
  }
}

export class OutputValueTask extends FlowTask {
  public override execute(node: any, services: any) {
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

  public override getName() {
    return 'OutputValueTask';
  }
}

export class InputTask extends FlowTask {
  public override execute(node: any, services: any) {
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

  public override getName() {
    return 'InputTask';
  }
}

let flowPluginNodes = {};

const FlowPluginWrapperTask = (pluginName, pluginClass: any) => {
  class FlowPluginWrapperTaskInternal extends FlowTask {
    public override execute(node: any, services: any) {
      if (node.observable) {
        new Promise((resolve, reject) => {
          const executeId = uuidV4();
          const payload = { ...node.payload, executeId: executeId };
          const pluginInstance = new pluginClass();
          let result = pluginInstance.execute({ payload: payload }, services);
          resolve(result);
        }).then((payload) => {
          node.observable.next({
            nodeName: node.name,
            payload: Object.assign({}, payload),
          });

          if (services?.isInAutoFormStepMode) {
            if (!services.flowEventRunner.getPropertyFromNode(node.name, 'waitForUserSubmit')) {
              return false;
            }
          }
        });

        return node.observable;
      }
      return false;
    }

    public override getName() {
      return pluginName;
    }

    public getObservable(node: any) {
      if (node.observable === undefined) {
        node.observable = new BehaviorSubject<any>({ nodeName: node.name, payload: {} });
      }
      return node.observable;
    }

    public override isAttachedToExternalObservable() {
      return false;
    }
  }

  return FlowPluginWrapperTaskInternal;
};

let timers: any = {};

export class RandomTask extends ObservableTask {
  public override execute(node: any, services: any) {
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

  public override getName() {
    return 'RandomTask';
  }
}

export class MapPayloadTask extends FlowTask {
  public override execute(node: any, services: any) {
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
  public override getName() {
    return 'MapPayloadTask';
  }
}

const onFlowAgentMessage = (event, worker: IFlowAgent) => {
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
    } else if (command === 'executeFlowNode' && data.nodeName) {
      if (!worker.flow) {
        return;
      }
      const sendMessageOnResolve = !!data.sendMessageOnResolve;
      let payload = data.payload ? { ...data.payload } : undefined;
      if (payload) {
        worker.flow
          .executeNode(data.nodeName, payload || {})
          .then((result) => {
            if (sendMessageOnResolve) {
              worker.postMessage('external', {
                command: 'ExecuteFlowNodeResult',
                result: result,
                payload: { ...(result as any) },
              });
            }
          })
          .catch((error) => {
            console.log('executeNode failed', error);
            if (sendMessageOnResolve) {
              worker.postMessage('external', {
                command: 'ExecuteFlowNodeResult',
                result: false,
                payload: undefined,
              });
            }
          });
      } else {
        console.log('retriggerNode', data.nodeName);
        worker.flow
          .retriggerNode(data.nodeName)
          .then((result) => {
            if (sendMessageOnResolve) {
              worker.postMessage('external', {
                command: 'ExecuteFlowNodeResult',
                result: result,
                payload: { ...(result as any) },
              });
            }
          })
          .catch((error) => {
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
    } else if (command === 'clearNodeState') {
      if (!data.nodeName) {
        return;
      }

      if (!worker.flow) {
        return;
      }
      if (data.initialValues) {
        (worker.flow as any).clearNodeState(data.nodeName, data.initialValues);
      } else {
        (worker.flow as any).clearNodeState(data.nodeName);
      }
    } else if (command === 'modifyFlowNode') {
      if (!data.nodeName) {
        return;
      }

      if (!worker.flow) {
        return;
      }
      if (data.propertyName) {
        console.log('modifyFlowNode', data.nodeName, data.propertyName, data.value);
        worker.flow.setPropertyOnNode(data.nodeName, data.propertyName, data.value, data.additionalValues || {});
      } else {
        worker.flow.setPropertiesOnNode(data.nodeName, data.additionalValues || {});
      }
      //console.log('modifyFlowNode', data);
      if (data.executeNode !== undefined && data.executeNode !== '') {
        console.log('pre modifyFlowNode executeNode', data);
        worker.flow
          .retriggerNode(data.executeNode)
          .then((result) => {
            //console.log('result after modifyFlowNode executeNode', result);
          })
          .catch((error) => {
            console.log('modifyFlowNode executeNode failed', data, error);
          });
      }

      if (data.triggerEvent !== undefined && data.triggerEvent !== '') {
        if (!worker.flow) {
          return;
        }
        console.log('triggerEvent', data.nodeName, data.triggerEvent);

        worker.flow
          .triggerEventOnNode(data.nodeName, data.triggerEvent, data.additionalValues)
          .then((result) => {
            console.log('result after modifyFlowNode triggerEvent', result);
          })
          .catch((error) => {
            console.log('modifyFlowNode triggerEventOnNode failed', data, error);
          });
      }
    } else if (command === 'pushFlowToFlowrunner') {
      //console.log("pushFlowToFlowrunner", data);
      startFlow({ flow: data.flow }, data.pluginRegistry, !!data.autoStartNodes, data.flowId, worker);
    } else if (command === 'registerFlowNodeObserver') {
      if (worker.observables[data.nodeName]) {
        (worker.observables[data.nodeName] as any).unsubscribe();
        worker.observables[data.nodeName] = undefined;
      }

      if (!worker.flow) {
        return;
      }

      const observable = worker.flow.getObservableNode(data.nodeName);
      //console.log("registerFlowNodeObserver", data.nodeName, observable);
      if (observable) {
        let nodeName = data.nodeName;
        let subscribtion = observable.subscribe({
          complete: () => {
            console.log('COMPLETE SendObservableNodePayload', nodeName);
          },
          next: (payload: any) => {
            //console.log("command SendObservableNodePayload", payload);
            worker.postMessage('external', {
              command: 'SendObservableNodePayload',
              payload: payload.payload,
              nodeName: payload.nodeName,
            });
          },
        });
        worker.observables[data.nodeName] = subscribtion;
      }
    } else if (command === 'ResultFlowPlugin') {
      // send payload to resolve method from promise in FlowPluginTask?
      const resolve = flowPluginNodes[data.nodeName];
      if (resolve && resolve.resolve && resolve.executeId === data.payload.executeId) {
        let payload = { ...data.payload };
        resolve.resolve(payload);
        flowPluginNodes[data.nodeName] = undefined;
        payload = null;
      }
    } else if (command === 'PauseFlowrunner') {
      if (!worker.flow) {
        return;
      }
      worker.flow.pauseFlowrunner();
    } else if (command === 'ResumeFlowrunner') {
      if (!worker.flow) {
        return;
      }
      worker.flow.resumeFlowrunner();
    } else if (command === 'runTests') {
      if (!worker.flow) {
        return;
      }
      testRunner(data.flowId, worker.flow, worker);
    }

    data = null;
  }
};

const onExecuteNode = (
  result: any,
  id: any,
  title: any,
  nodeType: any,
  payload: any,
  dateTime: any,
  worker: IFlowAgent,
) => {
  worker.postMessage('external', {
    command: 'SendNodeExecution',
    result: result,
    dateTime: dateTime,
    payload: { ...payload, nodeExecutionId: uuidV4() },
    name: id,
    nodeType: nodeType,
    touchedNodes: worker.flow?.getTouchedNodes(),
  });
};

let currentFlowId: string = '';
let machine: StateChart[] = [];

export const getLastPayloadFromNode = (worker: IFlowAgent, nodeName: string) => {
  if (!worker || !worker.flow) {
    return;
  }
  return (worker.flow as any).getLastPayloadFromNode(nodeName);
};

const startFlow = (
  flowPackage: any,
  pluginRegistry: any[],
  autoStartNodes: boolean = true,
  flowId: string,
  worker: IFlowAgent,
) => {
  let isSameFlow: boolean = false;

  if (flowId == currentFlowId) {
    isSameFlow = true;
  }

  console.log('startFlow', `isSameFlow = ${isSameFlow}`, worker.flow, flowId, currentFlowId, flowPackage);

  currentFlowId = flowId;

  if (worker.flow !== undefined) {
    for (let key of Object.keys(worker.observables)) {
      worker.observables[key].unsubscribe();
    }
    worker.observables = {};

    for (let timer of Object.keys(timers)) {
      clearInterval(timers[timer]);
    }
    timers = {};

    console.log('before destroyflow', flowId, currentFlowId, isSameFlow);
    worker.flow.destroyFlow();

    if (!isSameFlow) {
      (worker.flow as any) = undefined;
    }
  }

  let reinitMiddleWare = false;
  if (!isSameFlow || !worker.flow) {
    console.log('new FlowEventRunner');
    worker.flow = new FlowEventRunner();
    reinitMiddleWare = true;
    /*
    flow.registerTask('PreviewTask', PreviewTask);
    flow.registerTask('InputTask', InputTask);
    flow.registerTask('OutputValueTask', OutputValueTask);
    
    flow.registerTask('MapPayloadTask', MapPayloadTask);
    flow.registerTask('ListTask', ListTask);
    */
    worker.flow.registerTask('OutputValueTask', OutputValueTask);

    worker.flow.registerTask('RandomTask', RandomTask);
    worker.flow.registerTask('InputTask', InputTask);
    worker.flow.registerTask('ListTask', ListTask);

    registerTasks(worker.flow);

    if (pluginRegistry) {
      pluginRegistry.map((plugin: any) => {
        console.log('pluginName', plugin.FlowTaskPluginClassName);

        /*
        worker.flow?.registerTask(
          plugin.FlowTaskPluginClassName,
          FlowPluginWrapperTask(plugin.FlowTaskPluginClassName, plugin.FlowTaskPlugin),
        );
        */
        worker.flow?.registerTask(plugin.FlowTaskPluginClassName, plugin.FlowTaskPlugin);
      });
    }
  }

  if (!isSameFlow || reinitMiddleWare) {
    worker.flow.registerMiddleware((result: any, id: any, title: any, nodeType: any, payload: any, dateTime: any) => {
      return onExecuteNode(result, id, title, nodeType, payload, dateTime, worker);
    });
  }
  let services = {
    flowEventRunner: worker.flow,
    pluginTaskExtensions: {},
    isInAutoFormStepMode: worker.isInAutoFormStepMode,
    pluginClasses: {},
    logMessage: (arg1, arg2) => {
      //console.log(arg1, arg2);
    },
    registerModel: (modelName: string, definition: any) => {},
    getWebAssembly: () => {
      return undefined;
    },
    workerContext: worker,
    getWorker: getFlowAgent,
  };
  let value: boolean = false;
  let perfstart = performance.now();

  resetVariableStore();
  createVariableStore(flowPackage.flow);

  if (!isSameFlow) {
    try {
      const flowHashmap = FlowToCanvas.createFlowHashMap(flowPackage.flow);
      console.log('pre statemachine init', flowHashmap);
      initStateMachines();
      const statemachines = getStartStateNodeName(flowPackage.flow);
      statemachines.forEach((stateMachineInfo) => {
        const stateChart = new StateChart();
        const stateMachineFlow = getFlowByStartStateNode(stateMachineInfo.startNodeName, flowPackage.flow, flowHashmap);
        console.log(
          'stateMachineFlow',
          stateMachineInfo.stateMachineName,
          stateMachineInfo.startNodeName,
          stateMachineFlow,
        );
        const machine = stateChart.createStateMachine(stateMachineFlow);
        registerStateMachine(stateMachineInfo.stateMachineName, stateChart);
        stateChart.setOnGuardEventCallback(
          (stateMachineName: string, currentState: string, eventName, node: any, payload: any) => {
            if (node && node.Expression) {
              const expression = createExpressionTree(node.Expression);
              const result = executeExpressionTree(expression, payload);
              console.log('Guard result', result);
              return result === 1;
            }
            return true;
          },
        );
      });

      console.log('Statemachine definition', getStateMachines(), initFlowCallback);

      Object.keys(initFlowCallback).forEach((name) => {
        initFlowCallback[name]();
      });
    } catch (err) {
      console.log('Statemachine creation error', err);
      //machine = emptyStateMachine;
    }
  }

  resetDebugInfo();
  worker.flow
    .start(flowPackage, services, true, !!autoStartNodes, isSameFlow)
    .then((services: any) => {
      // see above.. not needed here
      //services.logMessage = (arg1, arg2) => {
      //  console.log(arg1, arg2);
      //};

      //services.getWebAssembly = () => {
      //  return webAssembly;
      //}

      //services.getWorker = getFlowAgent;

      for (let key of Object.keys(worker.observables)) {
        const observable = worker.flow?.getObservableNode(key);
        if (observable) {
          console.log('subscribe observable after start', key);
          let subscribtion = observable.subscribe({
            next: (payload: any) => {
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

      console.log('worker.flow.start', getStateMachines());
      getStateMachines().forEach((StateMachine) => {
        StateMachine.sendCurrentState();
      });

      console.log('flow running');
    })
    .catch((error) => {
      console.log('error when starting flow', error);
    });
};

const initFlowCallback: any = {};
export const registerOnInitFlow = (name: string, callback: () => void) => {
  initFlowCallback[name] = callback;
};
export const unRegisterOnInitFlow = (name: string) => {
  if (initFlowCallback[name]) {
    delete initFlowCallback[name];
  }
};

//ctx.addEventListener('worker', onWorkerMessage);

console.log('flowrunner web-worker started');

export default null as any;
