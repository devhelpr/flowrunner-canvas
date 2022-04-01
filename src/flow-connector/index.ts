import { IFlowrunnerConnector, IExecutionEvent, ApplicationMode } from '../interfaces/FlowrunnerConnector';
import { IFlowAgent } from '../interfaces/IFlowAgent';
import { IStorageProvider } from '../interfaces/IStorageProvider';

export class EmptyFlowConnector implements IFlowrunnerConnector {
  storageProvider: IStorageProvider | undefined = undefined;
  hasStorageProvider = false;
  flowView = '';
  forcePushToFlowRunner = false;

  getNodeExecutions() {
    return [];
  }

  getNodeExecutionsByNodeName(nodeName) {
    return [];
  }

  registerWorker(worker: IFlowAgent) {}

  onMessage = (event: any) => {};

  registerNodeStateObserver = (
    observableId: string,
    callback: (nodeName: string, nodeState: string, touchedNodes: any) => void,
  ) => {};

  unregisterNodeStateObserver = (observableId: string) => {};

  registerFlowNodeObserver = (nodeName: string, observableId: string, callback: (payload: any) => void) => {};

  unregisterFlowNodeObserver = (nodeName, observableId) => {};

  registerFlowExecutionObserver = (observableId: string, callback: (executionEvent: IExecutionEvent) => void) => {};

  unregisterFlowExecuteObserver = observableId => {};

  updateFlowNode = () => {};

  resetCurrentFlow = () => {};
  pushFlowToFlowrunner = (flow: any, autoStartNodes: boolean = true, flowId: string) => {};

  executeFlowNode = (nodeName: string, payload?: any) => {};

  modifyFlowNode = (
    nodeName: string,
    propertyName: string,
    value: any,
    executeNode?: string,
    eventName?: string,
    additionalValues?: any,
  ) => {};

  isActiveFlowRunner = () => {
    return false;
  };

  setPluginRegistry = (pluginRegistry: any) => {};

  getPluginRegistry = () => {
    return {};
  };

  pauseFlowrunner = () => {};

  resumeFlowrunner = () => {};

  setFlowType = (flowType: string) => {};

  setAppMode = (mode: ApplicationMode) => {};

  getAppMode = () => {
    return ApplicationMode.Canvas;
  };

  registerScreenUICallback = (callback: (action: any) => void) => {};

  registerDestroyAndRecreateWorker = (onDestroyAndRecreateWorker: any) => {};

  killAndRecreateWorker = () => {};

  registerOnReceiveFlowNodeExecuteResult = (onReceiveFlowNodeExecuteResult: any) => {};

  runTests = (flowId: string) => {};

  getTasksFromPluginRegistry = () => {
    return [];
  };
}

export class FlowConnector implements IFlowrunnerConnector {
  storageProvider: IStorageProvider | undefined = undefined;
  hasStorageProvider = false;

  worker?: IFlowAgent = undefined;
  observables: any[] = [];

  nodeExecutions: any[] = [];
  nodeExecutionsByNode: any = {};

  pluginRegistry: any = {};

  flowType: string = 'playground';

  applicationMode: ApplicationMode = ApplicationMode.Canvas;
  flowView = '';

  nodeState: any = {};
  forcePushToFlowRunner = false;

  screenUICallback: (action: any) => void = action => {
    return;
  };

  getNodeExecutions() {
    return this.nodeExecutions;
  }

  getNodeExecutionsByNodeName(nodeName) {
    if (this.nodeExecutionsByNode[nodeName]) {
      return this.nodeExecutionsByNode[nodeName];
    }
    return [];
  }

  registerWorker(worker: IFlowAgent) {
    this.worker = worker;
    worker.postMessage('worker', { a: 1 });
    console.log('registerWorker');
    worker.addEventListener('external', this.onMessage);
    worker.addEventListener('externalerror', this.onError);
  }

  onReceiveFlowNodeExecuteResult: any;
  registerOnReceiveFlowNodeExecuteResult = (onReceiveFlowNodeExecuteResult: any) => {
    this.onReceiveFlowNodeExecuteResult = onReceiveFlowNodeExecuteResult;
  };

  onError = (error: any) => {
    console.log('WORKER ERROR!!!', error);
  };

  onMessage = (event: any, flowAgent: IFlowAgent) => {
    //console.log("event from worker", event);
    if (event && event.data) {
      if (event.data.command == 'ExecuteFlowNodeResult') {
        if (this.onReceiveFlowNodeExecuteResult) {
          if (!event.data.result) {
            this.onReceiveFlowNodeExecuteResult(false);
          } else {
            this.onReceiveFlowNodeExecuteResult(event.data.payload);
          }
        }
      } else if (event.data.command == 'SendNodeExecution') {
        if (event.data) {
          //if (this.nodeState[event.data.name] === undefined || this.nodeState[event.data.name] != event.data.result) {
          this.nodeStateObservables.map((callbackInfo, index) => {
            callbackInfo.callback(event.data.name, event.data.result, event.data.touchedNodes);
          });
          //}
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
      } else if (event.data.command == 'SendObservableNodePayload') {
        // TODO : de eerst keer gaat dit niet goed...
        //console.log('SendObservableNodePayload', event.data);
        if (
          event.data.payload &&
          event.data.payload.nodeName &&
          this.observables.filter(observable => {
            return observable.nodeName === event.data.payload.nodeName;
          }).length > 0
        ) {
          //this.observables[event.data.payload.nodeName]) {
          //this.observables[event.data.payload.nodeName](event.data.payload.payload);

          this.observables
            .filter(observable => {
              return observable.nodeName === event.data.payload.nodeName;
            })
            .map((observable, index) => {
              observable.callback(event.data.payload.payload);
            });
        } // TODO : FIX THESE TWO ... should be the same...
        else if (
          event.data.nodeName &&
          this.observables.filter(observable => {
            return observable.nodeName === event.data.nodeName;
          }).length > 0
        ) {
          //this.observables[event.data.nodeName]) {
          //this.observables[event.data.nodeName](event.data.payload);

          this.observables
            .filter(observable => {
              return observable.nodeName === event.data.nodeName;
            })
            .map((observable, index) => {
              observable.callback(event.data.payload);
            });
        }
      } else if (event.data.command == 'ExecuteFlowPlugin') {
        /*
          event.data.nodeName
          event.data.payload
          event.data.pluginName

          // return ResultFlowPlugin with the same data properties
        */
        //console.log("ExecuteFlowPlugin", event);

        let pluginInfo = this.pluginRegistry[event.data.pluginName];
        if (pluginInfo) {
          let pluginInstance = new pluginInfo.FlowTaskPlugin();
          let result = pluginInstance.execute(
            { payload: { ...event.data.payload } },
            {
              flowrunnerConnector: this,
            },
          );
          if (this.worker) {
            this.worker.postMessage('worker', {
              command: 'ResultFlowPlugin',
              nodeName: event.data.nodeName,
              payload: result,
              pluginName: event.data.pluginName,
            });
          }
        }
      } else if (event.data.command == 'SendScreen') {
        if (this.screenUICallback) {
          this.screenUICallback({
            action: 'SendScreen',
            payload: event.data.payload,
          });
        }
        //
      } else if (event.data.command == 'RegisterFlowNodeObservers') {
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

  registerFlowNodeObserver = (nodeName: string, observableId: string, callback: (payload: any) => void) => {
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

    //console.log('registerFlowNodeObserver pre', nodeName, [...this.observables]);

    if (this.worker) {
      this.worker.postMessage('worker', {
        command: 'registerFlowNodeObserver',
        nodeName: nodeName,
      });
    }
  };

  unregisterFlowNodeObserver = (nodeName, observableId) => {
    let indexes: number[] = [];

    // TODO : refactor this to a better way !!
    this.observables.map((observable, index) => {
      if (observable.id === observableId) {
        if (indexes.length === 0) {
          indexes.push(index);
        }
      }
    });

    //console.log("unregisterFlowNodeObserver pre", [...this.observables]);
    indexes.map((indexInObservables: number) => {
      this.observables[indexInObservables] = undefined;
      delete this.observables[indexInObservables];
      this.observables.splice(indexInObservables, 1);
    });
    //console.log('unregisterFlowNodeObserver post', [...this.observables]);
  };

  executionObservables: any[] = [];

  registerFlowExecutionObserver = (observableId: string, callback: (executionEvent: IExecutionEvent) => void) => {
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

  unregisterFlowExecuteObserver = observableId => {
    let indexes: number[] = [];

    // TODO : refactor this to a better way !!
    this.executionObservables.map((observable, index) => {
      if (observable.id === observableId) {
        if (indexes.length === 0) {
          indexes.push(index);
        }
      }
    });

    indexes.map((indexInObservables: number) => {
      this.executionObservables[indexInObservables] = undefined;
      delete this.executionObservables[indexInObservables];
      this.executionObservables.splice(indexInObservables, 1);
    });
  };

  currentFlowId: string = '';

  resetCurrentFlow = () => {
    this.currentFlowId = '';
  };

  updateFlowNode = () => {};
  pushFlowToFlowrunner = (flow: any, autoStartNodes: boolean = true, flowId: string) => {
    this.forcePushToFlowRunner = false;

    let flowToFlowRunner = [
      ...flow.map(node => {
        return { ...node };
      }),
    ];

    this.nodeState = {};

    if (this.worker) {
      console.log('should destroy?', this.currentFlowId, flowId);
      if (this.onDestroyAndRecreateWorker && this.currentFlowId != flowId) {
        this.onDestroyAndRecreateWorker();
      }

      this.currentFlowId = flowId;

      console.log('AFTER onDestroyAndRecreateWorker');
      //previously this.observables was cleared here,
      // that causes side effects and is actually not needed because
      // unregistrating and registration is done from within lifecycle events

      this.nodeExecutions = [];
      this.nodeExecutionsByNode = {};

      let pluginRegistryTasks: string[] = [];
      for (var pluginName of Object.keys(this.pluginRegistry)) {
        let plugin: any = this.pluginRegistry[pluginName];
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
      } else {
        this.worker.postMessage('worker', {
          command: 'pushFlowToFlowrunner',
          flow: [],
          pluginRegistry: pluginRegistryTasks,
          autoStartNodes: autoStartNodes,
        });
      }
    }
  };
  executeFlowNode = (nodeName: string, payload?: any) => {
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

  modifyFlowNode = (
    nodeName: string,
    propertyName: string,
    value: any,
    executeNode?: string,
    eventName?: string,
    additionalValues?: any,
  ) => {
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
        });
      }
    }
  };

  isActiveFlowRunner = () => {
    return true;
  };

  setPluginRegistry = (pluginRegistry: any) => {
    this.pluginRegistry = pluginRegistry;
  };

  getPluginRegistry = () => {
    return this.pluginRegistry;
  };

  getTasksFromPluginRegistry = () => {
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

  pauseFlowrunner = () => {
    if (this.worker) {
      this.worker.postMessage('worker', {
        command: 'PauseFlowrunner',
      });
    }
  };

  resumeFlowrunner = () => {
    if (this.worker) {
      this.worker.postMessage('worker', {
        command: 'ResumeFlowrunner',
      });
    }
  };

  setFlowType = (flowType: string) => {
    this.flowType = flowType || 'playground';
  };
  setAppMode = (mode: ApplicationMode) => {
    this.applicationMode = mode;
  };

  getAppMode = () => {
    return this.applicationMode;
  };

  registerScreenUICallback = (callback: (action: any) => void) => {
    this.screenUICallback = callback;
  };

  onDestroyAndRecreateWorker: any;
  registerDestroyAndRecreateWorker = (onDestroyAndRecreateWorker: any) => {
    this.onDestroyAndRecreateWorker = onDestroyAndRecreateWorker;
  };

  killAndRecreateWorker = () => {
    this.onDestroyAndRecreateWorker();
  };

  nodeStateObservables: any[] = [];

  registerNodeStateObserver = (
    observableId: string,
    callback: (nodeName: string, nodeState: string, touchedNodes: any) => void,
  ) => {
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

  unregisterNodeStateObserver = (observableId: string) => {
    console.log('unregisterNodeStateObserver', observableId);
    let indexes: number[] = [];

    // TODO : refactor this to a better way !!
    this.nodeStateObservables.map((observable, index) => {
      if (observable.id === observableId) {
        if (indexes.length === 0) {
          indexes.push(index);
        }
      }
    });

    indexes.map((indexInObservables: number) => {
      this.nodeStateObservables[indexInObservables] = undefined;
      delete this.nodeStateObservables[indexInObservables];
      this.nodeStateObservables.splice(indexInObservables, 1);
    });
  };

  runTests = (flowId: string) => {
    if (this.worker) {
      this.worker.postMessage('worker', {
        command: 'runTests',
        flowId: flowId,
      });
    }
  };
}
