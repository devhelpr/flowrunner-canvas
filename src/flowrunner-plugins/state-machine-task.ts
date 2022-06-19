import { FlowTask } from '@devhelpr/flowrunner';
import { getCurrentStateMachine } from '../state-machine';

export class StateMachineTask extends FlowTask {
  public execute(node: any, services: any) {
    const stateMachine = getCurrentStateMachine();
    console.log('statemachine node', node);
    if (stateMachine.hasStateMachine && node.State) {
      stateMachine.event(node.State);
    }
    return node.payload;
  }

  public getName() {
    return 'StateMachine';
  }
}
