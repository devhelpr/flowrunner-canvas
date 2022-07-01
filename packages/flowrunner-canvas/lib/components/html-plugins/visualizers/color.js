import { jsx as _jsx } from "react/jsx-runtime";
import * as React from 'react';
export class Color extends React.Component {
    constructor() {
        super(...arguments);
        this.state = {};
    }
    render() {
        let background = "#ffffff";
        if (this.props.payloads.length > 0) {
            let payload = this.props.payloads[this.props.payloads.length - 1];
            if (payload.color !== undefined) {
                background = payload.color;
            }
        }
        return _jsx("div", { className: "h-100 w-100", style: {
                backgroundColor: background,
                minHeight: "100px",
                transition: "background-color ease-in-out .1s"
            } });
    }
}
//# sourceMappingURL=color.js.map