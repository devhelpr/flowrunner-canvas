import { FlowTask } from '@devhelpr/flowrunner';
import { getVariable } from '../flow-variables';

export class GetVariableTask extends FlowTask {
  public override execute(node: any, services: any) {
    if (node.assignToProperty && node.variableName) {
      const payload = { ...node.payload };
      payload[node.assignToProperty] = structuredClone(getVariable(node.variableName));
      return payload;
    }
    return node.payload;
  }

  public override getName() {
    return 'GetVariable';
  }
}
