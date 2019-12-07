import * as React from 'react';
import { connect } from "react-redux";

import { Modal, Button } from 'react-bootstrap';
import { storeFlowNode } from '../../redux/actions/flow-actions';
import { selectNode } from '../../redux/actions/node-actions';

export interface ISchemaNode {
	objectSchema: string;
	object: any;
	name: string;
}

export interface ShowSchemaPopupProps {
	selectedNode: any;

	onClose: () => void;
	storeFlowNode: (node: any, orgNodeName: string) => void;
	selectNode: (name: string, node: any) => void;
}

export interface ShowSchemaPopupState {
	value: string;
	orgNodeName: string;
	orgNodeValues: any;
	requiredNodeValues: any;
	node: ISchemaNode;
}

export interface ILayoutSchemaProps {
	layout: any;
	captionProperty: string;
	isColumn: boolean;
	isBordered?: boolean;
	theme?: string;
	isInForm?: boolean;
}

export const LayoutSchema = (props: ILayoutSchemaProps) => {
	let layout = props.layout.layout ? props.layout.layout : props.layout;
	console.log(layout);
	let rowClassName = "";
	let colClassName = "";

	let isColumn = props.isColumn;

	if (props.captionProperty == "fieldName") {
		rowClassName = "";
		colClassName = "";
	}

	if (props.layout.type == "2columns") {
		isColumn = true;
	}

	let themeClasses = "bg-white text-dark";
	if (props.theme == "light") {
		themeClasses = "bg-light text-dark";
	} else
		if (props.theme == "medium") {
			themeClasses = "bg-secondary text-white";
		} else
			if (props.theme == "dark") {
				themeClasses = "bg-dark text-white";
			} else
				if (props.theme == "form-control") {
					themeClasses = "bg-light text-dark";
					colClassName = "border p-2 m-2";
				}

	const layoutContent = layout.map((layoutBlock, index) => {
		let Layout = <></>;
		if (layoutBlock.type == "layout") {
			Layout = <>
				<strong><i>Layout</i> {layoutBlock[props.captionProperty] ? `${layoutBlock[props.captionProperty]}` : ""}</strong>
				<span>&nbsp;</span>
				{layoutBlock.layout.type == "2columns" && <span>{layoutBlock.layout.type ? `${layoutBlock.layout.type} (nested in layout)` : ""}</span>}
				<LayoutSchema isInForm={props.isInForm} isColumn={false} isBordered={true} captionProperty="caption" layout={layoutBlock.layout}></LayoutSchema>
			</>;
		} else
			if (layoutBlock.type == "form") {
				const headerContent = <strong>{layoutBlock[props.captionProperty] ? `${layoutBlock[props.captionProperty]}` : ""}</strong>;
				const header = props.isInForm === true ? <><strong><i>Form (nested)</i></strong> {headerContent}</> :
					<div className="rounded bg-dark text-white p-2 m-1"><strong>Form</strong> {headerContent}</div>;
				Layout = <>
					{header}
					<div className="border m-1 p-1">
						<LayoutSchema isInForm={true} isColumn={false} theme="form-control" captionProperty="fieldName" layout={layoutBlock.form}></LayoutSchema>
					</div>
				</>;
			} else
				if (layoutBlock.type == "visualelements") {
					Layout = <>
						<strong><i>Elements</i></strong>
						<LayoutSchema isInForm={props.isInForm} isColumn={false} theme="medium" captionProperty="name" layout={layoutBlock.elements}></LayoutSchema>
					</>;
				} else {
					Layout = <>
						<div>
							<strong>{layoutBlock[props.captionProperty] ? `${layoutBlock[props.captionProperty]}` : ""}</strong>
							<span>&nbsp;</span>
							<span>{layoutBlock.type ? `${layoutBlock.type}` : ""}</span>
						</div>
						{layoutBlock.layout && <LayoutSchema isInForm={props.isInForm} isBordered={true} isColumn={layoutBlock.type == "2columns"} captionProperty="caption" layout={layoutBlock.layout}></LayoutSchema>}
					</>;
				}

		if (isColumn) {
			return <td key={index} className={colClassName}>
				{Layout}
			</td>;
		} else {
			return <div key={index} className={colClassName}>
				{Layout}
			</div>;
		}
	});

	if (isColumn) {
		return <table className={"table mb-0 p-2 rounded " + themeClasses + " " + (props.isBordered ? "table-bordered" : "")}>
			<tbody>
				<tr>
					{layoutContent}
				</tr>
			</tbody>
		</table>;
	} else {
		return <div className={" mb-0 p-2 rounded " + themeClasses + " " + (props.isBordered ? "border" : "")}>
			{layoutContent}
		</div>;
	}
}

const mapStateToProps = (state: any) => {
	return {
		selectedNode: state.selectedNode
	}
}

const mapDispatchToProps = (dispatch: any) => {
	return {
		storeFlowNode: (node, orgNodeName) => dispatch(storeFlowNode(node, orgNodeName)),
		selectNode: (name, node) => dispatch(selectNode(name, node))
	}
}


class ContainedShowSchemaPopup extends React.Component<ShowSchemaPopupProps, ShowSchemaPopupState> {
	state = {
		value: "",
		orgNodeName: "",
		orgNodeValues: {},
		requiredNodeValues: {},
		node: {
			objectSchema: "",
			object: {},
			name: ""
		}
	}

	componentDidMount() {
		const node = { ...this.props.selectedNode.node };
		const requiredNodeValues = {
			_id: node._id,
			id: node.id,
			x: node.x,
			y: node.y,
			shapeType: node.shapeType
		};
		delete node._id;
		delete node.id;
		delete node.x;
		delete node.y;
		delete node.shapeType;

		this.setState({
			value: JSON.stringify(node, null, 2),
			orgNodeName: this.props.selectedNode.node.name,
			orgNodeValues: { ...this.props.selectedNode.node },
			requiredNodeValues: requiredNodeValues,
			node: node
		});
	}

	render() {
		return <Modal show={true} centered size="xl">
			<Modal.Header>
			<Modal.Title>{"Node: " + (this.state.node && this.state.node.name ? this.state.node.name : "")}</Modal.Title>
			</Modal.Header>

			<Modal.Body>
				<div className="form-group">
					{this.state.node && this.state.node.objectSchema == "layout" && <>
						<LayoutSchema isBordered={true} isColumn={false} layout={this.state.node.object} captionProperty="caption" ></LayoutSchema>
					</>}
				</div>
			</Modal.Body>

			<Modal.Footer>
				<Button variant="secondary" onClick={this.props.onClose}>Close</Button>
			</Modal.Footer>
		</Modal>;
	}
}

export const ShowSchemaPopup = connect(mapStateToProps, mapDispatchToProps)(ContainedShowSchemaPopup);
