import { FlowTask } from '@devhelpr/flowrunner';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { getCurrentState, registerStateChangeHandler, unRegisterStateChangeHandler } from '../state-machine';

export class StateChangeTriggerTask extends FlowTask {
  _nodeName: string = '';
  _lastState: string = '';

  public execute(node: any, services: any) {
    const observable = new Subject<any>();
    this._nodeName = node.name;
    registerStateChangeHandler(
      node.name,
      (stateMachineName: string, currentState: string, isStateMachineStarting?: boolean) => {
        console.log(
          'StateChangeHandler',
          node.name,
          stateMachineName,
          isStateMachineStarting,
          currentState,
          node.State,
        );
        if (!!isStateMachineStarting) {
          return;
        }

        if (!node.State) {
          if (currentState !== this._lastState || !this._lastState) {
            console.log('observable next state change', currentState);
            this._lastState = currentState;
            observable.next({
              nodeName: node.name,
              payload: {
                ...node.payload,
                stateMachine: stateMachineName,
                currentState,
                [stateMachineName]: currentState,
              },
            });
          }
        } else if (currentState === node.State) {
          console.log('observable next');
          observable.next({
            nodeName: node.name,
            payload: {
              ...node.payload,
              stateMachine: stateMachineName,
              currentState,
              [stateMachineName]: currentState,
            },
          });
        }
      },
    );

    return observable;
  }

  public kill() {
    this._lastState = '';
    unRegisterStateChangeHandler(this._nodeName);
  }

  public isStartingOnInitFlow() {
    return true;
  }

  public getName() {
    return 'StateChangeTriggerTask';
  }
}
