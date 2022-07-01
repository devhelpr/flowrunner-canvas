import { ObservableTask } from '@devhelpr/flowrunner';
import * as uuid from 'uuid';
const uuidV4 = uuid.v4;
export class ImageTask extends ObservableTask {
    execute(node, services) {
        let payload = { ...node.payload };
        console.log('DebugTask', node);
        payload.debugId = uuidV4();
        super.execute({ ...node, sendNodeName: true, payload: payload }, services);
        return payload;
    }
    getName() {
        return 'ImageTask';
    }
}
//# sourceMappingURL=image-task.js.map