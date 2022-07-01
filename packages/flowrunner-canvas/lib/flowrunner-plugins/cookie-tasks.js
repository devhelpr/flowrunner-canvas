import { FlowTask } from '@devhelpr/flowrunner';
function getCookie(name) {
    let value = `; ${document.cookie}`;
    let parts = value.split(`; ${name}=`);
    if (parts && parts.length === 2) {
        return (parts.pop() || '').split(';').shift();
    }
    return '';
}
export class GetCookie extends FlowTask {
    execute(node, services) {
        const payload = { ...node.payload };
        if (node.cookieName) {
            let cookie = getCookie(node.cookieName) || '';
            if (!cookie) {
                if (node.defaultValue) {
                    cookie = node.defaultValue;
                }
                if (node.defaultValueFromProperty) {
                    cookie = node.payload[node.defaultValueFromProperty];
                }
            }
            payload[node.cookieName] = cookie;
            return payload;
        }
        return payload;
    }
    getName() {
        return 'GetCookie';
    }
}
export class SetCookie extends FlowTask {
    execute(node, services) {
        if (node.cookieName) {
            let value = node.value;
            if (!value && node.valueFromProperty) {
                value = node.payload[node.valueFromProperty];
            }
            console.log('SetCookie', node.cookieName, value);
            document.cookie = `${node.cookieName}=${value};`;
        }
        return true;
    }
    getName() {
        return 'SetCookie';
    }
}
//# sourceMappingURL=cookie-tasks.js.map