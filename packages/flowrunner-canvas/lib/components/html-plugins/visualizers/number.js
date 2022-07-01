import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import * as React from 'react';
export class Number extends React.Component {
    constructor() {
        super(...arguments);
        this.state = {};
    }
    render() {
        let data = "";
        if (this.props.payloads.length > 0) {
            let payload = this.props.payloads[this.props.payloads.length - 1];
            if (this.props.node.propertyName && payload[this.props.node.propertyName]) {
                if (this.props.node.format === "toFixed") {
                    try {
                        data = payload[this.props.node.propertyName].toFixed(this.props.node.fixed || 0);
                        if (this.props.node.decimalSeparator !== undefined) {
                            data = data.replace(".", this.props.node.decimalSeparator || ".");
                        }
                    }
                    catch (error) {
                        data = "";
                    }
                }
                else {
                    data = payload[this.props.node.propertyName];
                }
            }
        }
        let afterLabel = "";
        if (this.props.node.afterLabel) {
            afterLabel = this.props.node.afterLabel;
        }
        return _jsx("div", { className: "h-auto", children: _jsxs("strong", { className: "h1 font-weight-bolder", children: [data, afterLabel] }) });
    }
}
//# sourceMappingURL=number.js.map