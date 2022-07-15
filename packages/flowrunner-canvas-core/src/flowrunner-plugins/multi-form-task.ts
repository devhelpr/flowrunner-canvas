import { FlowTask } from '@devhelpr/flowrunner';

/*


  - groupProperty (should be an array property in the payload)
  - outputProperty (can be the same as groupProperty)

  - groupBy : string[] 
  - sumProperties : string[]

*/

export class MultiFormTask extends FlowTask {
  public override execute(node: any, services: any) {
    let payload = { ...node.payload };
    return payload;
  }

  public override getName() {
    return 'MultiFormTask';
  }
}
