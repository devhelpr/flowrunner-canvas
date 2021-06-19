import { FlowTask } from '@devhelpr/flowrunner';

export class ScreenTask extends FlowTask {
  public execute(node: any, services: any) {
    console.log('ScreenTask', node);
    try {
      services.workerContext.postMessage("worker", {
        command: 'SendScreen',
        payload: {
          ...(node.payload.titleBar || {
              titleBarBackgroundcolor: node.titleBarBackgroundcolor || '#000000',
              titleBarColor: node.titleBarColor || '#ffffff',
            } ||
            {}),
        },
      });
      return node.payload;
    } catch (err) {
      console.log('ScreenTask error', err);
    }
    return false;
  }

  public getName() {
    return 'ScreenTask';
  }
}
