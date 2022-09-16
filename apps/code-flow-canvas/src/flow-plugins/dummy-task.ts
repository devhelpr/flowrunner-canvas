import { FlowTask } from '@devhelpr/flowrunner';

export class DummyTestTask extends FlowTask {
  public override execute(node: any, services: any) {
    const payload = { ...node.payload };
    return payload;
  }

  public override getName() {
    return 'DummyTestTask';
  }
}
