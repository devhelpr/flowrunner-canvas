import { ObservableTask } from '@devhelpr/flowrunner';
import * as uuid from 'uuid';
const uuidV4 = uuid.v4;
export class FormTask extends ObservableTask {
    execute(node, services) {
        if (!!node.formDefinitionAsPayload) {
            const payload = { ...node.payload };
            payload['metaInfo'] = node.metaInfo || [];
            return payload;
        }
        try {
            let values = {};
            let isValid = true;
            let metaInfoDefinition = node.metaInfo;
            if (!!node.renderFormViaMetaInfoInPayload) {
                metaInfoDefinition = node.payload['metaInfo'];
            }
            (metaInfoDefinition || []).map((metaInfo, index) => {
                let currentValue;
                if (metaInfo.fieldName) {
                    currentValue = services.flowEventRunner.getPropertyFromNode(node.name, metaInfo.fieldName);
                    if (currentValue !== undefined) {
                        if (metaInfo.datasource && node.payload[metaInfo.datasource]) {
                            const datasource = node.payload[metaInfo.datasource];
                            if (datasource) {
                                let isFound = false;
                                datasource.map(item => {
                                    if (item.value !== undefined && item.value === currentValue) {
                                        isFound = true;
                                    }
                                });
                                if (!isFound) {
                                    currentValue = '';
                                }
                            }
                        }
                        values[metaInfo.fieldName] = currentValue;
                    }
                    else {
                        if (metaInfo.defaultValue) {
                            values[metaInfo.fieldName] = metaInfo.defaultValue;
                            currentValue = metaInfo.defaultValue;
                        }
                    }
                }
                if (currentValue === undefined && metaInfo.fieldName && node[metaInfo.fieldName] !== undefined) {
                    values[metaInfo.fieldName] = node[metaInfo.fieldName];
                }
                if (!!metaInfo.required && metaInfo.fieldName && values[metaInfo.fieldName] === undefined) {
                    isValid = false;
                }
            });
            console.log('form task', values);
            let payload = { ...node.payload, ...values };
            payload.debugId = uuidV4();
            super.execute({ ...node, sendNodeName: true, payload: payload }, services);
            let hasValues = Object.keys(values).length > 0;
            if (isValid && hasValues) {
                return payload;
            }
            return false;
        }
        catch (err) {
            console.log('FormTask error', err);
        }
        return false;
    }
    getName() {
        return 'FormTask';
    }
}
//# sourceMappingURL=form-task.js.map