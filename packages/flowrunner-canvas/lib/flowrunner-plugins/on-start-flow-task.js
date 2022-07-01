import { FlowTask } from '@devhelpr/flowrunner';
export class OnStartFlowTask extends FlowTask {
    execute(node, services) {
        return true;
    }
    getName() {
        return 'OnStartFlow';
    }
    isStartingOnInitFlow() {
        return true;
    }
}
//# sourceMappingURL=on-start-flow-task.js.map