import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import * as React from 'react';
import { renderFlowNode } from '../../userinterface-view/components/layout-renderer';
export class LayoutWithDropArea extends React.Component {
    constructor(props) {
        super(props);
        this.dropZone = undefined;
        this.onAllowDrop = (event) => {
            event.preventDefault();
            if (this.dropZone && this.dropZone.current) {
                (this.dropZone.current).classList.add("hovering");
            }
        };
        this.onDragLeave = (event) => {
            if (this.dropZone && this.dropZone.current) {
                (this.dropZone.current).classList.remove("hovering");
            }
        };
        this.onDropTask = (event) => {
            event.preventDefault();
            if (this.dropZone && this.dropZone.current) {
                (this.dropZone.current).classList.remove("hovering");
            }
            try {
                let draggable = JSON.parse(event.dataTransfer.getData("data-draggable"));
                if (!!draggable.isElement) {
                    return;
                }
                if (!!draggable.isElement && draggable.layout === this.props.name) {
                    return false;
                }
                console.log("draggable", draggable);
                this.setState(state => {
                    let layout = [...state.layout];
                    layout.push({
                        title: draggable.title,
                        subtitle: draggable.subtitle || "",
                        name: this.props.name + "-" + this.props.level + "-" + (layout.length + 1) + draggable.title.replace(/\s/g, '')
                    });
                    return {
                        layout: layout
                    };
                }, () => {
                    this.props.onStoreLayout(this.props.level, this.props.layoutIndex, this.props.layoutIndexLevel || 0, this.state.layout);
                });
            }
            catch (err) {
            }
            return true;
        };
        this.onDragStartOther = (event) => {
            console.log("onDragStartOther", event.target.getAttribute("data-layout-parent"));
            event.dataTransfer.setData("data-draggable", JSON.stringify({
                layout: event.target.getAttribute("data-layout-parent"),
                isElement: true,
                id: event.target.id
            }));
        };
        this.onAllowDropOther = (event) => {
            event.preventDefault();
            const id = event.target.id;
            const domElement = document.getElementById(id);
            if (domElement) {
                domElement.classList.add("hovering");
            }
        };
        this.onDropTaskOther = (event) => {
            event.preventDefault();
            const id = event.target.id;
            const domElement = document.getElementById(id);
            if (domElement) {
                domElement.classList.remove("hovering");
                try {
                    let draggable = JSON.parse(event.dataTransfer.getData("data-draggable"));
                    if (!!draggable.isElement && draggable.layout === this.props.name && draggable.id !== id) {
                        return false;
                    }
                }
                catch (err) {
                }
            }
        };
        this.onDragLeaveOther = (event) => {
            const id = event.target.id;
            const domElement = document.getElementById(id);
            if (domElement) {
                domElement.classList.remove("hovering");
            }
        };
        this.dropZone = React.createRef();
        let layout = [];
        let initialLayout = props.onGetLayout(props.level, props.layoutIndex, props.layoutIndexLevel || 0);
        if (initialLayout !== false) {
            layout = initialLayout;
        }
        this.state = {
            layout: layout,
        };
    }
    componentDidUpdate(prevProps) {
        if (this.props.tree !== undefined && this.props.tree !== null &&
            prevProps.tree !== this.props.tree) {
            let layout = [];
            let initialLayout = this.props.onGetLayout(this.props.level, this.props.layoutIndex, this.props.layoutIndexLevel || 0);
            if (initialLayout !== false) {
                layout = initialLayout;
            }
            this.setState({
                layout: layout,
            });
        }
    }
    render() {
        const { level, name } = this.props;
        return _jsxs(_Fragment, { children: [this.state.layout.map((layout, index) => {
                    if (layout.title == "element") {
                        return _jsx(React.Fragment, { children: _jsx("div", { draggable: true, "data-layout-parent": this.props.name, id: this.props.name + "-element" + index, onDragOver: this.onAllowDropOther, onDragStart: this.onDragStartOther, onDrop: this.onDropTaskOther, onDragLeave: this.onDragLeaveOther, className: "draggable-element font-weight-bold", children: layout.title }) }, index);
                    }
                    if (layout.title == "flowNode") {
                        const flowNode = this.props.flowHash[layout.subtitle];
                        if (flowNode === undefined) {
                            return _jsx(React.Fragment, {}, index);
                        }
                        return _jsx(React.Fragment, { children: _jsxs("div", { draggable: true, onDragOver: this.onAllowDropOther, onDragStart: this.onDragStartOther, onDrop: this.onDropTaskOther, onDragLeave: this.onDragLeaveOther, "data-layout-parent": this.props.name, className: "draggable-element ui-view-layout__container", id: this.props.name + "-flownode" + index, children: [_jsx("div", { className: "font-weight-bold", children: layout.title }), _jsx("div", { className: "text-secondary", children: layout.subtitle }), renderFlowNode(flowNode, {
                                        context: {
                                            getNodeInstance: this.props.getNodeInstance,
                                            flowrunnerConnector: this.props.flowrunnerConnector,
                                            flow: this.props.flow,
                                            renderHtmlNode: this.props.renderHtmlNode
                                        }
                                    }, true)] }) }, index);
                    }
                    if (layout.title == "layout2columns") {
                        return _jsx(React.Fragment, { children: _jsxs("div", { className: "layout-container layout-container__layout2columns", children: [_jsx("div", { className: "font-weight-bold", children: layout.title }), _jsxs("div", { className: "row", children: [_jsx("div", { className: "col-6 layout-container__layout2columns-col-1", children: _jsx(LayoutWithDropArea, { onGetLayout: this.props.onGetLayout, onStoreLayout: this.props.onStoreLayout, layoutIndex: index, name: layout.name + "c0-" + index + "c", level: level + 1, getNodeInstance: this.props.getNodeInstance, flowrunnerConnector: this.props.flowrunnerConnector, flow: this.props.flow, renderHtmlNode: this.props.renderHtmlNode, flowHash: this.props.flowHash }) }), _jsx("div", { className: "col-6 layout-container__layout2columns-col-2", children: _jsx(LayoutWithDropArea, { onGetLayout: this.props.onGetLayout, onStoreLayout: this.props.onStoreLayout, layoutIndex: index, layoutIndexLevel: 1, name: layout.name + "c1-" + index + "c", level: level + 1, getNodeInstance: this.props.getNodeInstance, flowrunnerConnector: this.props.flowrunnerConnector, flow: this.props.flow, renderHtmlNode: this.props.renderHtmlNode, flowHash: this.props.flowHash }) })] })] }) }, index);
                    }
                    return _jsx(React.Fragment, { children: _jsx(_Fragment, { children: _jsxs("div", { className: "layout-container", children: [_jsx("div", { className: "font-weight-bold", children: layout.title }), _jsx(LayoutWithDropArea, { onGetLayout: this.props.onGetLayout, onStoreLayout: this.props.onStoreLayout, layoutIndex: index, name: layout.name + "l" + index + "l", level: level + 1, getNodeInstance: this.props.getNodeInstance, flowrunnerConnector: this.props.flowrunnerConnector, flow: this.props.flow, renderHtmlNode: this.props.renderHtmlNode, flowHash: this.props.flowHash })] }) }) }, index);
                }), _jsx("div", { ref: this.dropZone, className: "layout__droparea", onDragOver: this.onAllowDrop, onDrop: this.onDropTask, onDragLeave: this.onDragLeave })] });
    }
}
//# sourceMappingURL=layout-with-droparea.js.map