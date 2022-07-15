import { FlowTask } from '@devhelpr/flowrunner';

export class CountTask extends FlowTask {
  public override execute(node: any, services: any) {
    let payload = { ...node.payload };
    if (node.outputProperty && node.arrayProperty && Array.isArray(payload[node.arrayProperty])) {
      payload[node.outputProperty] = payload[node.arrayProperty].length;
    }
    return payload;
  }

  public override getName() {
    return 'CountTask';
  }
}
