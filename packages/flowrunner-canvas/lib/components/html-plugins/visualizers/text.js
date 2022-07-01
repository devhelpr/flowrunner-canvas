import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import { replaceValues } from '../../../helpers/replace-values';
class Element extends React.Component {
    render() {
        return React.createElement(this.props.tag, {
            className: this.props.cssClassName
        }, this.props.value);
    }
}
export class Text extends React.Component {
    constructor() {
        super(...arguments);
        this.state = {};
    }
    render() {
        let data = "";
        if (this.props.payloads.length > 0) {
            let payload = this.props.payloads[this.props.payloads.length - 1];
            if (this.props.node.propertyName && payload[this.props.node.propertyName]) {
                data = payload[this.props.node.propertyName];
            }
            else if (!!this.props.node.replaceValues) {
                data = replaceValues(this.props.node.template, payload);
            }
        }
        let afterLabel = "";
        if (this.props.node.afterLabel) {
            afterLabel = this.props.node.afterLabel;
        }
        if (!!this.props.node.asElement) {
            return _jsx(Element, { cssClassName: this.props.node.cssClassName, tag: this.props.node.htmlElement, value: data + afterLabel });
        }
        return _jsx("div", { className: "h-auto d-flex align-items-center", children: this.props.node.cssClassName ? _jsxs("span", { className: this.props.node.cssClassName, children: [data, afterLabel] }) :
                _jsxs("strong", { className: "h1 font-weight-bolder text-wrap" + this.props.node.cssClassName || "", children: [data, afterLabel] }) });
    }
}
//# sourceMappingURL=text.js.map