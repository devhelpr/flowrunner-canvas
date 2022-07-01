import { jsx as _jsx } from "react/jsx-runtime";
import * as React from 'react';
import { replaceValues } from '../../../helpers/replace-values';
import DOMPurify from 'dompurify';
class Element extends React.Component {
    render() {
        return React.createElement(this.props.tag, {
            className: this.props.cssClassName
        }, this.props.value);
    }
}
export class RichText extends React.Component {
    constructor() {
        super(...arguments);
        this.state = {};
        this.createMarkup = (html) => {
            return {
                __html: DOMPurify.sanitize(html)
            };
        };
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
        return _jsx("div", { className: "h-auto d-flex align-items-center justify-content-center", children: _jsx("div", { className: "richtext-visualizer " + this.props.node.cssClassName || "", dangerouslySetInnerHTML: this.createMarkup((data || "").trim() + afterLabel) }) });
    }
}
//# sourceMappingURL=richtext.js.map