import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
export class List extends React.Component {
    constructor() {
        super(...arguments);
        this.state = {};
    }
    render() {
        let payload;
        if (this.props.payloads.length > 0) {
            payload = this.props.payloads[this.props.payloads.length - 1];
        }
        const node = this.props.node;
        return _jsx("div", { className: "h-auto", children: node && node.list && node.list.map((listItem, index) => {
                return _jsxs("div", { className: "mb-1", children: [_jsx("label", { className: "font-weight-bolder mb-0", children: listItem.label }), _jsx("div", { children: payload && payload[listItem.propertyName] })] }, "index-" + index);
            }) });
    }
}
//# sourceMappingURL=list.js.map