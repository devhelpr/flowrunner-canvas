import { FlowTask } from '@devhelpr/flowrunner';
export class EventTask extends FlowTask {
    execute(node, services) {
        return false;
    }
    getName() {
        return 'Event';
    }
}
//# sourceMappingURL=event-task.js.map