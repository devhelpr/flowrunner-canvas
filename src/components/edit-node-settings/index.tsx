import * as React from 'react';
import { connect } from "react-redux";

import { Modal, Button } from 'react-bootstrap';
import { storeFlowNode } from '../../redux/actions/flow-actions';
import { selectNode } from '../../redux/actions/node-actions';
import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';
import { FormNodeHtmlPlugin } from '../html-plugins/form-node';

export interface EditNodeSettingsProps {
	node : any;
	settings: any;
	flowrunnerConnector : IFlowrunnerConnector;
	
	onClose: (pushFlow? : boolean) => void;
	storeFlowNode: (node : any, orgNodeName : string) => void;
	selectNode: (name: string, node : any) => void;
}

export interface EditNodeSettingsState {
	value: any;
	orgNodeName: string;
	orgNodeValues: any;
	requiredNodeValues: any;
}

const mapStateToProps = (state : any) => {
	return {

	}
}

const mapDispatchToProps = (dispatch : any) => {
	return {
		storeFlowNode: (node, orgNodeName) => dispatch(storeFlowNode(node, orgNodeName)),
		selectNode: (name, node) => dispatch(selectNode(name, node)),
	}
}

// 

class ContainedEditNodeSettings extends React.Component<EditNodeSettingsProps, EditNodeSettingsState> {
	
	constructor(props : any) {
		super(props);
		this.ref = React.createRef();
	}
	ref;

	state = {
		value: {},
		orgNodeName : "",
		orgNodeValues: {},
		requiredNodeValues: {}
	}

	componentDidMount() {
		const node = {...this.props.node};
		let requiredNodeValues;
		if (node.shapeType !== "Line") {
			requiredNodeValues = {
				_id : node._id,
				id: node.id,
				x: node.x,
				y: node.y,
				shapeType: node.shapeType
			};
		
			delete node.x;
			delete node.y;
		} else {
			requiredNodeValues = {
				_id : node._id,
				id: node.id,
				startshapeid: node.startshapeid,
				endshapeid: node.endshapeid,
				xstart: node.xstart,
				ystart: node.ystart,
				xend: node.xend,
				yend: node.yend,
				shapeType: node.shapeType,
				taskType: node.taskType
			};

			delete node.startshapeid;
			delete node.endshapeid;
			delete node.xstart;
			delete node.ystart;
			delete node.xend;
			delete node.yend;
			delete node.taskType;
		}
		
		delete node._id;
		delete node.id;
		delete node.shapeType;

		this.setState({
			value : node,
			orgNodeName : this.props.node.name,
			orgNodeValues : {...this.props.node},
			requiredNodeValues : requiredNodeValues
		});
	}

	saveNode(e) {
		try {
			const changedProperties : any = this.state.value;
			
			//delete changedProperties.name;
			if (changedProperties.id !== undefined) {
				delete changedProperties.id;
			}
			/*
			const orgNode = {...this.state.orgNodeValues};
			for (var property in orgNode) {
				if (orgNode.hasOwnProperty(property)) {
					if (!changedProperties[property]) {
						delete orgNode[property];
					}
				}
			}
			*/

			const node = {...this.state.requiredNodeValues, ...changedProperties};
			this.props.storeFlowNode(node, this.state.orgNodeName);
			
			this.props.selectNode(node.name, node);
			this.props.onClose(true);
		} catch (err) {
			alert("The json in the 'Node JSON' field is invalid");
		}

		e.preventDefault();
		return false;
	}

	onCloseClick = (event) => {
		event.preventDefault();
		this.props.onClose();
		return false;
	}

	onSetValue = (value, fieldName) => {
		this.setState({value : {...this.state.value, [fieldName]: value}});
	}

	render() {
		return <div className="edit-node-settings" ref={this.ref}>
			<Modal show={true} centered size="lg" container={this.ref.current}>
				<Modal.Header>
					<Modal.Title>Edit {this.props.node.name}</Modal.Title>
				</Modal.Header>
			
				<Modal.Body>
					<div className="form-group">
						<FormNodeHtmlPlugin 
							isNodeSettingsUI={true} 
							node={this.props.node} 
							taskSettings={this.props.settings}
							onSetValue={this.onSetValue}
							flowrunnerConnector={this.props.flowrunnerConnector}
							></FormNodeHtmlPlugin>
					</div>
				</Modal.Body>
			
				<Modal.Footer>
				<Button variant="secondary" onClick={this.onCloseClick}>Close</Button>
				<Button variant="primary" onClick={this.saveNode.bind(this)}>Save</Button>
				</Modal.Footer>
			</Modal>
	  	</div>;
	}
}

export const EditNodeSettings = connect(mapStateToProps, mapDispatchToProps)(ContainedEditNodeSettings);
