import { ObservableTask } from '@devhelpr/flowrunner';
import * as uuid from 'uuid';
const uuidV4 = uuid.v4;
export class DebugTask extends ObservableTask {
    execute(node, services) {
        let payload = { ...node.payload };
        console.log('DebugTask', node);
        payload.debugId = uuidV4();
        super.execute({ ...node, sendNodeName: true, payload: payload }, services);
        return payload;
    }
    getName() {
        return 'DebugTask';
    }
    isSampling(node) {
        if (node.isSampling !== undefined) {
            return node.isSampling;
        }
        return true;
    }
}
//# sourceMappingURL=debug-task.js.map