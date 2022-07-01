export const replaceValues = (content, payload, keepUnknownFields = false) => {
    let resultContent = content;
    let matches = resultContent.match(/{.+?}/g);
    if (matches) {
        matches.map(match => {
            const matchValue = match.slice(1, -1);
            const splittedValues = matchValue.split(':');
            const variableName = splittedValues[0];
            let value = payload[variableName];
            if (splittedValues.length > 1) {
                const format = splittedValues[1];
                if (format == 'currency') {
                    value = parseFloat(value)
                        .toFixed(2)
                        .replace('.', ',');
                }
                else if (format == 'integer') {
                    value = parseFloat(value).toFixed(0);
                }
            }
            else if (!!keepUnknownFields && value === undefined) {
                value = match;
            }
            const allOccurancesOfMatchRegex = new RegExp(match, 'g');
            resultContent = resultContent.replace(allOccurancesOfMatchRegex, value);
        });
    }
    return resultContent;
};
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
export const hasReplacebleValuesExistingInPayload = (content, payload) => {
    let hasValues = false;
    let resultContent = content;
    let matches = resultContent.match(/{.+?}/g);
    if (matches) {
        matches.map(match => {
            const matchValue = match.slice(1, -1);
            let value;
            let splittedValues = matchValue.split('=>');
            if (splittedValues.length > 1) {
            }
            else {
                splittedValues = matchValue.split('|');
                if (splittedValues.length > 1) {
                    const variableName1 = splittedValues[0];
                    const variableName2 = splittedValues[1];
                    if (payload[variableName1] !== undefined && payload[variableName1] != '') {
                        value = (payload[variableName1] || '').toString();
                    }
                    else if (payload[variableName2] !== undefined && payload[variableName2] != '') {
                        value = (payload[variableName2] || '').toString();
                    }
                }
                else {
                    splittedValues = matchValue.split(':');
                    const variableName = splittedValues[0];
                    value = payload[variableName];
                    if (splittedValues.length > 1) {
                        const format = splittedValues[1];
                        if (format == 'currency') {
                            value = parseFloat(value)
                                .toFixed(2)
                                .replace('.', ',');
                        }
                        else if (format == 'integer') {
                            value = parseFloat(value).toFixed(0);
                        }
                    }
                }
            }
            if (value !== undefined && value !== '' && value !== null) {
                hasValues = true;
            }
        });
    }
    return hasValues;
};
export const replaceValuesExpressions = (content, payload, noValueSet) => {
    let resultContent = content;
    let matches = resultContent.match(/{.+?}/g);
    if (matches) {
        matches.map(match => {
            const matchValue = match.slice(1, -1);
            let value;
            let splittedValues = matchValue.split('=>');
            if (splittedValues.length > 1) {
                try {
                    const json = JSON.parse('{' + splittedValues[1] + '}');
                    value = json[payload[splittedValues[0]]];
                    if (value === undefined) {
                        value = json['default'];
                    }
                }
                catch (err) {
                    console.log('replaceValuesExpressions error', err);
                }
            }
            else {
                splittedValues = matchValue.split('|');
                if (splittedValues.length > 1) {
                    const variableName1 = splittedValues[0];
                    const variableName2 = splittedValues[1];
                    if (payload[variableName1] !== undefined && payload[variableName1] != '') {
                        value = (payload[variableName1] || '').toString();
                    }
                    else if (payload[variableName2] !== undefined && payload[variableName2] != '') {
                        value = (payload[variableName2] || '').toString();
                    }
                    else {
                        value = noValueSet || '';
                    }
                }
                else {
                    splittedValues = matchValue.split(':');
                    const variableName = splittedValues[0];
                    value = payload[variableName];
                    if (splittedValues.length > 1) {
                        const format = splittedValues[1];
                        if (format == 'currency') {
                            value = parseFloat(value)
                                .toFixed(2)
                                .replace('.', ',');
                        }
                        else if (format == 'integer') {
                            value = parseFloat(value).toFixed(0);
                        }
                    }
                }
            }
            if (value === undefined) {
                value = noValueSet || '';
            }
            const allOccurancesOfMatchRegex = new RegExp(escapeRegExp(match), 'g');
            resultContent = resultContent.replace(allOccurancesOfMatchRegex, value);
        });
    }
    return resultContent;
};
//# sourceMappingURL=replace-values.js.map