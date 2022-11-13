import { FlowTask } from '@devhelpr/flowrunner';
import { Subject } from 'rxjs';
import { registerStateChangeHandler, unRegisterStateChangeHandler } from '../state-machine';

export class StateChangeTriggerTask extends FlowTask {
  _nodeName: string = '';
  _lastState: string = '';

  public override execute(node: any, services: any) {
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
          } else {
            observable.next({
              nodeName: node.name,
              payload: {
                ...node.payload,
                stateMachine: stateMachineName,
                currentState,
                [stateMachineName]: currentState,
                followFlow: 'isError',
              },
              isError: true,
              resetNodeState: true,
            });
          }
        } else if (currentState === node.State) {
          observable.next({
            nodeName: node.name,
            payload: {
              ...node.payload,
              stateMachine: stateMachineName,
              currentState,
              [stateMachineName]: currentState,
            },
          });
        } else {
          observable.next({
            nodeName: node.name,
            payload: {
              ...node.payload,
              stateMachine: stateMachineName,
              currentState,
              [stateMachineName]: currentState,
              followFlow: 'isError',
            },
            isError: true,
            resetNodeState: true,
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

  public override getName() {
    return 'StateChangeTriggerTask';
  }
}
