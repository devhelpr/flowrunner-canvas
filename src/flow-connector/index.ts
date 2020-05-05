import { IFlowrunnerConnector } from '../interfaces/IFlowrunnerConnector';
import { IWorker } from '../interfaces/IWorker';

export class FlowConnector implements IFlowrunnerConnector {
  worker?: IWorker = undefined;
  observables : any[] = [];

  registerWorker(worker: IWorker) {
    this.worker = worker;
    worker.postMessage({ a: 1 });

    worker.addEventListener('message', this.onMessage);
  }

  onMessage = (event: any) => {
    //console.log("event from worker", event);
    if (event && event.data) {
      if (event.data.command == 'SendObservableNodePayload') {

        // TODO : de eerst keer gaat dit niet goed...
        //console.log("SendObservableNodePayload", event.data);

        if (event.data.payload && event.data.payload.nodeName && 
            this.observables.filter((observable) => {
              return observable.nodeName === event.data.payload.nodeName;
            }).length > 0) {
          //this.observables[event.data.payload.nodeName]) {
          //this.observables[event.data.payload.nodeName](event.data.payload.payload);
          
          this.observables.filter((observable) => {
            return observable.nodeName === event.data.payload.nodeName;
          }).map((observable, index) => {
             observable.callback(event.data.payload.payload);
          });

        } // TODO : FIX THESE TWO ... should be the same...
        else if (event.data.nodeName && 
          this.observables.filter((observable) => {
            return observable.nodeName === event.data.nodeName;
          }).length > 0) {
            
          //this.observables[event.data.nodeName]) {
          //this.observables[event.data.nodeName](event.data.payload);

          this.observables.filter((observable) => {
            return observable.nodeName === event.data.nodeName;
          }).map((observable, index) => {
             observable.callback(event.data.payload);
          });

        }
      }
    }
    return;
  };

  registerFlowNodeObserver = (nodeName: string, observableId: string, callback: (payload: any) => void) => {
    //console.log("registerFlowNodeObserver", nodeName);
    //this.observables[nodeName] = callback;

    this.observables.push({
      nodeName : nodeName,
      callback : callback,
      id: observableId
    });

    if (this.worker) {
      this.worker.postMessage({
        command: 'registerFlowNodeObserver',
        nodeName: nodeName,
      });
    }
  };

  unregisterFlowNodeObserver = (nodeName, observableId) => {

    let indexes = this.observables.filter((observable) => {
      return observable.observableId === observableId;
    }).map((observable, index) => {
       return index;
    });

    indexes.map((indexInObservables : number) => {
      this.observables[indexInObservables] = undefined;
      delete this.observables[indexInObservables];
    });
   
  };

  updateFlowNode = () => {};
  pushFlowToFlowrunner = (flow: any) => {
    if (this.worker) {
      this.observables = [];//{};

      this.worker.postMessage({
        command: 'pushFlowToFlowrunner',
        flow: flow,
      });
    }
  };
  executeFlowNode = (nodeName: string, payload: any) => {
    if (this.worker) {
      this.worker.postMessage({
        command: 'executeFlowNode',
        nodeName: nodeName,
        payload: payload,
      });
    }
  };

  modifyFlowNode = (nodeName: string, propertyName: string, value: any, executeNode: string) => {
    if (this.worker) {
      this.worker.postMessage({
        command: 'modifyFlowNode',
        nodeName: nodeName,
        propertyName: propertyName,
        value: value,
        executeNode: executeNode,
      });
    }
  };
}
