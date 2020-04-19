const ctx: Worker = self as any;
import { FlowEventRunner, FlowTask, ObservableTask } from '@devhelpr/flowrunner';
import { Observable, Subject } from '@reactivex/rxjs';
import { ExpressionTask } from '@devhelpr/flowrunner-expression';
import fetch from 'cross-fetch';
import { replaceValues } from './helpers/replace-values';

let flow: FlowEventRunner;
let observables = {};

export class ConditionalTriggerTask extends FlowTask {
  public execute(node: any, services: any) {
    console.log('ConditionalTriggerTask', node);
    try {
      if (node.propertyName) {
        if (node.minValue && node.maxValue) {
          let value = node.payload[node.propertyName];
          console.log('ConditionalTriggerTask v', value, node.minValue, node.maxValue);
          if (!isNaN(value)) {
            if (value >= node.minValue && value < node.maxValue) {
              return Object.assign({}, node.payload);
            }
          }
        }
      }
    } catch (err) {
      console.log('ConditionalTriggerTask error', err);
    }
    return false;
  }

  public getName() {
    return 'ConditionalTriggerTask';
  }
}
export class PreviewTask extends FlowTask {
  public execute(node: any, services: any) {
    console.log('previewtask', node);
    return true;
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
      node.payload = Object.assign({}, node.payload);
      let value = services.flowEventRunner.getPropertyFromNode(node.name, node.propertyName) || node.startValue || 0;
      value += node.increment || 1;
      if (value > node.maxValue) {
        value = node.startValue;
      }
      node.payload[node.propertyName] = value;
      services.flowEventRunner.setPropertyOnNode(node.name, node.propertyName, value);

      return node.payload;
    }
    return node.payload;
  }

  public getName() {
    return 'OutputValueTask';
  }
}

export class SliderTask extends FlowTask {
  public execute(node: any, services: any) {
    if (node.propertyName) {
      node.payload = Object.assign({}, node.payload);
      let value = node.defaultValue || 0;
      try {
        value = services.flowEventRunner.getPropertyFromNode(node.name, node.propertyName);
        if (value === undefined || isNaN(value)) {
          value = node.defaultValue || 0;
        }
      } catch (err) {
        value = node.defaultValue || 0;
      }
      node.payload[node.propertyName] = value;
      return node.payload;
    }

    return node.payload;
  }

  public getName() {
    return 'SliderTask';
  }
}

export class InputTask extends FlowTask {
  public execute(node: any, services: any) {
    if (node.propertyName) {
      node.payload = Object.assign({}, node.payload);
      let value = node.defaultValue || '';
      try {
        value = services.flowEventRunner.getPropertyFromNode(node.name, node.propertyName);
        if (value === undefined) {
          value = node.defaultValue || '';
        }
        console.log('InputTask', value, node);
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

export class DebugTask extends ObservableTask {
  public execute(node: any, services: any) {
    super.execute({ ...node, sendNodeName: true }, services);
    return node.payload;
  }
  public getName() {
    return 'DebugTask';
  }
}

let timers: any = {};

export class TimerTask extends FlowTask {
  public execute(node: any, services: any) {
    if (timers[node.name]) {
      clearInterval(timers[node.name]);
      timers[node.name] = undefined;
    }
    if (node.interval) {
      let subject = new Subject<string>();
      const timer = setInterval(() => {
        subject.next(Object.assign({}, node.payload));
      }, node.interval);
      timers[node.name] = timer;
      return subject;
    }
    return false;
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
            url: replaceValues(node.url, node.payload),
            body: node.payload,
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
            resolve(response);
          })
          .catch(err => {
            console.error(err);
            reject('Api-proxy : Bad response from server (' + node.name + ') : ' + err);
          });
      } catch (err) {
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
    if (event.data.command == 'executeFlowNode' && event.data.nodeName) {
      if (!flow) {
        return;
      }

      flow
        .executeNode(event.data.nodeName, event.data.payload || {})
        .then(result => {
          console.log('result after executeNode', result);
        })
        .catch(error => {
          console.log('executeNode failed', error);
        });
    } else if (event.data.command == 'modifyFlowNode' && event.data.nodeName) {
      flow.setPropertyOnNode(event.data.nodeName, event.data.propertyName, event.data.value);

      if (event.data.executeNode !== undefined && event.data.executeNode !== '') {
        flow
          .executeNode(event.data.executeNode, {})
          .then(result => {
            console.log('result after modifyFlowNode executeNode', result);
          })
          .catch(error => {
            console.log('modifyFlowNode executeNode failed', error);
          });
      }
    } else if (event.data.command == 'pushFlowToFlowrunner') {
      startFlow({ flow: event.data.flow });
    } else if (event.data.command == 'registerFlowNodeObserver') {
      if (observables[event.data.nodeName]) {
        (observables[event.data.nodeName] as any).unsubscribe();
      }
      const observable = flow.getObservableNode(event.data.nodeName);
      if (observable) {
        let subscribtion = observable.subscribe({
          next: (payload: any) => {
            ctx.postMessage({
              command: 'SendObservableNodePayload',
              payload: payload.payload,
              nodeName: payload.nodeName,
            });
          },
        });
        observables[event.data.nodeName] = subscribtion;
      }
    }
  }
};

const startFlow = (flowPackage?: any) => {
  if (flow !== undefined) {
    for (var key of Object.keys(observables)) {
      observables[key].unsubscribe();
    }
    observables = {};

    for (var timer of Object.keys(timers)) {
      clearInterval(timers[timer]);
    }
    timers = {};

    flow.destroyFlow();
    (flow as any) = undefined;
  }

  flow = new FlowEventRunner();
  flow.registerTask('PreviewTask', PreviewTask);
  flow.registerTask('DebugTask', DebugTask);
  flow.registerTask('SliderTask', SliderTask);
  flow.registerTask('InputTask', InputTask);
  flow.registerTask('TimerTask', TimerTask);
  flow.registerTask('RandomTask', RandomTask);
  flow.registerTask('ExpressionTask', ExpressionTask);
  flow.registerTask('OutputValueTask', OutputValueTask);
  flow.registerTask('ConditionalTriggerTask', ConditionalTriggerTask);
  flow.registerTask('ApiProxyTask', ApiProxyTask);
  flow.registerTask('MapPayloadTask', MapPayloadTask);
  flow.registerTask('ListTask', ListTask);

  let value: boolean = false;
  flow
    .start(flowPackage)
    .then((services: any) => {
      services.logMessage = (arg1, arg2) => {
        console.log(arg1, arg2);
      };

      for (var key of Object.keys(observables)) {
        const observable = flow.getObservableNode(key);
        if (observable) {
          let subscribtion = observable.subscribe({
            next: (payload: any) => {
              ctx.postMessage({
                command: 'SendObservableNodePayload',
                payload: payload,
                nodeName: key,
              });
            },
          });
          observables[key] = subscribtion;
        }
      }

      console.log('flow running');
    })
    .catch(error => {
      console.log('error when starting flow', error);
    });
};

ctx.addEventListener('message', onWorkerMessage);

console.log('flow service-worker started');
