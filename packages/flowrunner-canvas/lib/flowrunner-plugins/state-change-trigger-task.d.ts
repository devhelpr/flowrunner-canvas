import { FlowTask } from '@devhelpr/flowrunner';
import { Subject } from 'rxjs';
export declare class StateChangeTriggerTask extends FlowTask {
    _nodeName: string;
    _lastState: string;
    execute(node: any, services: any): Subject<any>;
    kill(): void;
    isStartingOnInitFlow(): boolean;
    getName(): string;
}
