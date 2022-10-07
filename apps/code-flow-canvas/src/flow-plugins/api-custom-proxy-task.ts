import { FlowTask } from '@devhelpr/flowrunner';
import { replaceValues } from '@devhelpr/flowrunner-canvas-core';

export class ApiProxyTask extends FlowTask {
  public override execute(node: any, services: any) {
    const promise = new Promise((resolve, reject) => {
      node.payload = Object.assign({}, node.payload);

      if (Array.isArray(node.mock)) {
        resolve({ ...node.payload, result: [...node.mock] });
      } else {
        resolve({ ...node.payload, ...node.mock });
      }
      return;
    });

    return promise;
  }

  public override getName() {
    return 'ApiProxyTask';
  }
}
