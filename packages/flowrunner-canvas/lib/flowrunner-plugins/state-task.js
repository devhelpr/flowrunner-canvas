import { FlowTask } from '@devhelpr/flowrunner';
export class StateTask extends FlowTask {
    execute(node, services) {
        return false;
    }
    getName() {
        return 'State';
    }
}
//# sourceMappingURL=state-task.js.map