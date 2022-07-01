import { FlowTask } from '@devhelpr/flowrunner';
export class GuardTask extends FlowTask {
    execute(node, services) {
        return false;
    }
    getName() {
        return 'Guard';
    }
}
//# sourceMappingURL=guard-task.js.map