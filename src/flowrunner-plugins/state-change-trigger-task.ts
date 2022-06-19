import { FlowTask } from '@devhelpr/flowrunner';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { getCurrentState, registerStateChangeHandler, unRegisterStateChangeHandler } from '../state-machine';

export class StateChangeTriggerTask extends FlowTask {
  _nodeName: string = '';
  public execute(node: any, services: any) {
    const observable = new Subject<any>();
    this._nodeName = node.name;
    registerStateChangeHandler(node.name, (stateMachineName: string, currentState: string) => {
      console.log('StateChangeHandler', node.name, stateMachineName, currentState, node.State);
      if (currentState === node.State) {
        console.log('observable next');
        observable.next({
          nodeName: node.name,
          payload: {
            ...node.payload,
            stateMachine: stateMachineName,
            currentState,
          },
        });
      }
    });

    return observable;
  }

  public kill() {
    unRegisterStateChangeHandler(this._nodeName);
  }

  public isStartingOnInitFlow() {
    return true;
  }

  public getName() {
    return 'StateChangeTriggerTask';
  }
}
