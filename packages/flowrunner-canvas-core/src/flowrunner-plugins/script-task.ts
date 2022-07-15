import { FlowTask } from '@devhelpr/flowrunner';

export class ScriptTask extends FlowTask {
  public override execute(node: any, services: any) {
    let payload = { ...node.payload };
    if (node.outputProperty && node.script) {
      payload[node.outputProperty] = node.script;
    }
    return payload;
  }

  public override getName() {
    return 'ScriptTask';
  }
}
