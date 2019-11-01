import * as React from 'react';
import { connect } from "react-redux";

import { Modal, Button } from 'react-bootstrap';
import { storeFlowNode } from '../../redux/actions/flow-actions';
import { selectNode } from '../../redux/actions/node-actions';

export interface EditPopupProps {
	selectedNode : any;

	onClose: () => void;
	storeFlowNode: (node : any, orgNodeName : string) => void;
	selectNode: (name: string, node : any) => void;
}

export interface EditPopupState {
	value: string;
	orgNodeName: string;
	orgNodeValues: any;
	requiredNodeValues: any;
}

const mapStateToProps = (state : any) => {
	return {
		selectedNode : state.selectedNode
	}
}

const mapDispatchToProps = (dispatch : any) => {
	return {
		storeFlowNode: (node, orgNodeName) => dispatch(storeFlowNode(node, orgNodeName)),
		selectNode: (name, node) => dispatch(selectNode(name, node))
	}
}

class ContainedEditPopup extends React.Component<EditPopupProps, EditPopupState> {
	state = {
		value: "",
		orgNodeName : "",
		orgNodeValues: {},
		requiredNodeValues: {}
	}

	componentDidMount() {
		const node = {...this.props.selectedNode.node};
		const requiredNodeValues = {
			_id : node._id,
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
			value : JSON.stringify(node, null, 2),
			orgNodeName : this.props.selectedNode.node.name,
			orgNodeValues : {...this.props.selectedNode.node},
			requiredNodeValues : requiredNodeValues
		});
	}

	saveNode(e) {
		try {
			const changedProperties = JSON.parse(this.state.value);
			
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
			
			const node = {...changedProperties, ...this.state.requiredNodeValues};
			this.props.storeFlowNode(node, this.state.orgNodeName);
			this.props.selectNode(node.name, node);
			this.props.onClose();
		} catch (err) {
			alert("The json in the 'Node JSON' field is invalid");
		}

		e.preventDefault();
		return false;
	}

	render() {
		return <Modal show={true} centered size="lg">
		<Modal.Header>
		  <Modal.Title>Edit Node JSON</Modal.Title>
		</Modal.Header>
	  
		<Modal.Body>
			<div className="form-group">
				<label>Node JSON</label>
				<textarea className="form-control" rows={8} 
					value={this.state.value} 
					onChange={(e) => {this.setState({value: e.target.value})}}
				></textarea>
			</div>
		</Modal.Body>
	  
		<Modal.Footer>
		  <Button variant="secondary" onClick={this.props.onClose}>Close</Button>
		  <Button variant="primary" onClick={this.saveNode.bind(this)}>Save</Button>
		</Modal.Footer>
	  </Modal>;
	}
}

export const EditPopup = connect(mapStateToProps, mapDispatchToProps)(ContainedEditPopup);
