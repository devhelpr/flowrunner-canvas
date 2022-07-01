import { FlowTask } from '@devhelpr/flowrunner';
export class StartStateTask extends FlowTask {
    execute(node, services) {
        return false;
    }
    getName() {
        return 'StartState';
    }
}
//# sourceMappingURL=start-state-task.js.map