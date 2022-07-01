import { FlowTask } from '@devhelpr/flowrunner';
export class TransformTask extends FlowTask {
    execute(node, services) {
        let payload = { ...node.payload };
        if (node.outputProperty) {
            if (node.mode && node.mode == 'indexedObjects') {
                let transformObject;
                if (node.transformProperty !== undefined && node.transformProperty == '') {
                    transformObject = payload;
                }
                else if (node.transformProperty !== undefined && payload[node.transformProperty]) {
                    transformObject = payload[node.transformProperty];
                }
                if (transformObject) {
                    const result = [];
                    for (var key of Object.keys(transformObject)) {
                        if (!isNaN(parseInt(key))) {
                            result.push(this.mapObject(node, transformObject[key]));
                            if (node.transformProperty !== undefined && node.transformProperty == '') {
                                delete payload[key];
                            }
                            else if (node.transformProperty !== undefined && payload[node.transformProperty]) {
                                delete payload[node.transformProperty][key];
                            }
                        }
                    }
                    if (!!node.clearPayload) {
                        payload = {};
                    }
                    payload[node.outputProperty] = result;
                }
            }
            else if (node.mode && node.mode == 'array') {
                let list;
                if (node.transformProperty !== undefined && node.transformProperty == '') {
                    list = payload;
                }
                else if (node.transformProperty !== undefined && payload[node.transformProperty]) {
                    list = payload[node.transformProperty];
                }
                if (list) {
                    const result = [];
                    list.map(listItem => {
                        result.push(this.mapObject(node, listItem));
                    });
                    if (!!node.clearPayload) {
                        payload = {};
                    }
                    payload[node.outputProperty] = result;
                }
            }
            else if (node.mode && (node.mode == '' || node.mode == 'default')) {
                let transformObject;
                if (node.transformProperty !== undefined && node.transformProperty == '') {
                    transformObject = payload;
                }
                else if (node.transformProperty !== undefined && payload[node.transformProperty]) {
                    transformObject = payload[node.transformProperty];
                }
                if (transformObject) {
                    if (!!node.clearPayload) {
                        payload = {};
                    }
                    payload[node.outputProperty] = this.mapObject(node, transformObject);
                }
            }
        }
        return payload;
    }
    getName() {
        return 'TransformTask';
    }
    mapObject(node, objectToMap) {
        if (node.mappings && node.mappings.length > 0) {
            let newObject = {};
            node.mappings.map((fieldMap) => {
                if (objectToMap[fieldMap.sourceProperty]) {
                    newObject[fieldMap.targetProperty] = objectToMap[fieldMap.sourceProperty];
                }
                else {
                    newObject[fieldMap.targetProperty] = '';
                }
                return true;
            });
            return newObject;
        }
        return objectToMap;
    }
}
//# sourceMappingURL=transform-task.js.map