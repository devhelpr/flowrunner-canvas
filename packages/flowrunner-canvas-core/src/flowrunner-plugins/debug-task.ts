import { ObservableTask } from '@devhelpr/flowrunner';
import * as uuid from 'uuid';
const uuidV4 = uuid.v4;

export class DebugTask extends ObservableTask {
  public override execute(node: any, services: any) {
    let payload = { ...node.payload };
    console.log('DebugTask', node);
    payload.debugId = uuidV4(); // use this to match between (line)graph and history sliders
    super.execute({ ...node, sendNodeName: true, payload: payload }, services);
    return payload;
  }
  public override getName() {
    return 'DebugTask';
  }

  public override isSampling(node) {
    if (node.isSampling !== undefined) {
      return node.isSampling;
    }
    return true;
  }
}
