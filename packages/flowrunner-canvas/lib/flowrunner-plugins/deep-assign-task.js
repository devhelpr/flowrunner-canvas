import { FlowTask } from '@devhelpr/flowrunner';
export class DeepAssignTask extends FlowTask {
    constructor() {
        super(...arguments);
        this.getSource = (source, payload, mappings) => {
            let splittedSource = source.split('.');
            let data = payload;
            let error = false;
            const result = splittedSource
                .map((propertyKey) => {
                if (!error) {
                    const arrayIndex = this.getArrayIndexFromPropertyPathPart(propertyKey);
                    if (arrayIndex !== false) {
                        if (Array.isArray(data) && data.length > 0 && arrayIndex < data.length) {
                            data = data[arrayIndex];
                            return true;
                        }
                        error = true;
                        return false;
                    }
                    else if (data[propertyKey] !== undefined) {
                        data = data[propertyKey];
                        return true;
                    }
                }
                error = true;
                return false;
            })
                .filter(result => !result);
            if (error || (result && result.length > 0)) {
                return false;
            }
            if (mappings) {
                if (Array.isArray(data)) {
                    let newData = [];
                    data.map(dataItem => {
                        let newItem = {};
                        mappings.map((fieldMap) => {
                            if (dataItem[fieldMap.sourceProperty]) {
                                if (fieldMap.targetProperty !== undefined) {
                                    newItem[fieldMap.targetProperty] = dataItem[fieldMap.sourceProperty];
                                }
                                else {
                                    newItem = dataItem[fieldMap.sourceProperty];
                                }
                            }
                            else {
                                if (fieldMap.targetProperty !== undefined) {
                                    newItem[fieldMap.targetProperty] = fieldMap.defaultValue || '';
                                }
                                else {
                                    newItem = fieldMap.defaultValue || '';
                                }
                            }
                        });
                        newData.push(newItem);
                    });
                    data = newData;
                }
                else {
                    let newData = {};
                    mappings.map((fieldMap) => {
                        if (data[fieldMap.sourceProperty] !== undefined) {
                            newData[fieldMap.targetProperty] = data[fieldMap.sourceProperty];
                        }
                        else {
                            newData[fieldMap.targetProperty] = fieldMap.defaultValue || '';
                        }
                    });
                    data = newData;
                }
            }
            return data;
        };
        this.setData = (target, data, payload) => {
            let splittedTarget = target.split('.');
            let error = false;
            const result = splittedTarget
                .map((propertyKey, index) => {
                if (!error) {
                    const arrayIndex = this.getArrayIndexFromPropertyPathPart(propertyKey);
                    if (arrayIndex !== false) {
                        if (Array.isArray(payload) && payload.length > 0 && arrayIndex < payload.length) {
                            if (index == splittedTarget.length - 1) {
                                payload[arrayIndex] = data;
                            }
                            else {
                                payload = payload[arrayIndex];
                            }
                            return true;
                        }
                        error = true;
                        return false;
                    }
                    else if (payload[propertyKey] !== undefined) {
                        if (index == splittedTarget.length - 1) {
                            payload[propertyKey] = data;
                        }
                        else {
                            payload = payload[propertyKey];
                        }
                        return true;
                    }
                    else if (splittedTarget.length == 1) {
                        payload[propertyKey] = data;
                        return true;
                    }
                }
                error = true;
                return false;
            })
                .filter(result => !result);
            if (error || (result && result.length > 0)) {
                return false;
            }
            return true;
        };
        this.getArrayIndexFromPropertyPathPart = (propertyPathPart) => {
            const matches = propertyPathPart.match(/^\[(\d+)\]$/g);
            if (matches && matches.length > 0) {
                let result = parseInt(matches[0].replace('[', '').replace(']', ''));
                if (!isNaN(result)) {
                    return result;
                }
            }
            return false;
        };
    }
    execute(node, services) {
        let payload = { ...node.payload };
        try {
            if (node.rules) {
                node.rules.map((rule) => {
                    let sourceData = this.getSource(rule.source, payload, rule.mappings);
                    if (sourceData !== false) {
                        this.setData(rule.target, sourceData, payload);
                    }
                });
                payload = { ...node.payload, ...payload };
            }
        }
        catch (err) {
            console.error('DeepAssignTask', err);
        }
        return payload;
    }
    getName() {
        return 'DeepAssignTask';
    }
}
//# sourceMappingURL=deep-assign-task.js.map