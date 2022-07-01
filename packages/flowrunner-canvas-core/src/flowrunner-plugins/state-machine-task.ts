import { FlowTask } from '@devhelpr/flowrunner';
import { getCurrentStateMachine } from '../state-machine';
import { createExpressionTree, executeExpressionTree } from '@devhelpr/expressionrunner';

export class StateMachineTask extends FlowTask {
  public execute(node: any, services: any) {
    const promise = new Promise((resolve, reject) => {
      const payload = { ...node.payload };
      const stateMachine = getCurrentStateMachine();

      if (!node.StateMachine) {
        return reject();
      }

      if (node.Expression && stateMachine.hasStateMachine) {
        const expression = createExpressionTree(node.Expression);
        const result = executeExpressionTree(expression, node.payload);
        if (!!node.SetInitialState) {
          try {
            console.log('statemachine setInitialState via expression', result, payload);
            stateMachine.setInitialState(result);
            payload[node.StateMachine] = result;
            resolve(payload);
          } catch (_err) {
            reject();
          }
        } else {
          stateMachine
            .event(result, node.payload)
            .then(newState => {
              console.log('statemachine via expression', result, newState, payload);
              payload[node.StateMachine] = newState;
              resolve(payload);
            })
            .catch(() => {
              reject();
            });
        }
      } else if (stateMachine.hasStateMachine && node.State && !!node.SetInitialState) {
        try {
          stateMachine.setInitialState(node.State);
          payload[node.StateMachine] = node.State;
          resolve(payload);
        } catch (_err) {
          reject();
        }
      } else if (stateMachine.hasStateMachine && node.Event) {
        console.log('statemachine set Event', node.Event, payload);
        stateMachine
          .event(node.Event, node.payload)
          .then(newState => {
            console.log('statemachine after set Event', node.Event, newState);
            payload[node.StateMachine] = newState;
            resolve(payload);
          })
          .catch(() => {
            reject();
          });
      } else {
        resolve(payload);
      }
    });
    return promise;
  }

  public getName() {
    return 'StateMachine';
  }
}
