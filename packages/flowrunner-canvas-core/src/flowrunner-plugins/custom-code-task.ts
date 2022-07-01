import { FlowTask } from '@devhelpr/flowrunner';

/*

  - mode:
    - custom
    - matrix

  - code
  - parameters, used when mode == custom

*/

export class CustomCodeTask extends FlowTask {
  functionInstance?: any;
  code?: string;
  public execute(node: any, services: any) {
    let payload = { ...node.payload };
    if (node.code && (!this.code || this.code !== node.code)) {
      if (node.mode === 'matrix') {
        this.functionInstance = new Function('t', 'i', 'x', 'y', node.code);
      } else {
        if (node.parameters) {
          this.functionInstance = new Function(...node.parameters, node.code);
        }
      }
    }

    if (this.functionInstance && node.outputProperty) {
      if (node.mode === 'matrix') {
        let result = this.functionInstance(payload.t, payload.i, payload.x, payload.y);
        payload[node.outputProperty] = result;
      } else {
      }
    }
    return payload;
  }

  public getName() {
    return 'CustomCodeTask';
  }
}
