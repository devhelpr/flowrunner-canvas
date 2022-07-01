import { FlowTask } from '@devhelpr/flowrunner';
import { Subject } from 'rxjs';
import { registerStateChangeHandler, unRegisterStateChangeHandler } from '../state-machine';
export class StateChangeTriggerTask extends FlowTask {
    constructor() {
        super(...arguments);
        this._nodeName = '';
        this._lastState = '';
    }
    execute(node, services) {
        const observable = new Subject();
        this._nodeName = node.name;
        registerStateChangeHandler(node.name, (stateMachineName, currentState, isStateMachineStarting) => {
            console.log('StateChangeHandler', node.name, stateMachineName, isStateMachineStarting, currentState, node.State);
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
            }
            else if (currentState === node.State) {
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
        });
        return observable;
    }
    kill() {
        this._lastState = '';
        unRegisterStateChangeHandler(this._nodeName);
    }
    isStartingOnInitFlow() {
        return true;
    }
    getName() {
        return 'StateChangeTriggerTask';
    }
}
//# sourceMappingURL=state-change-trigger-task.js.map