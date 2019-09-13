import * as React from 'react';
import { connect } from "react-redux";

import { Modal, Button } from 'react-bootstrap';
import { storeFlowNode } from '../../redux/actions/flow-actions';
import { selectNode } from '../../redux/actions/node-actions';

export interface EditPopupProps {
	selectedNode : any;

	onClose: () => void;
	storeFlowNode: (node : any) => void;
	selectNode: (name: string, node : any) => void;
}

export interface EditPopupState {
	value: string;
}

const mapStateToProps = (state : any) => {
	return {
		selectedNode : state.selectedNode
	}
}

const mapDispatchToProps = (dispatch : any) => {
	return {
		storeFlowNode: (node) => dispatch(storeFlowNode(node)),
		selectNode: (name, node) => dispatch(selectNode(name, node))
	}
}

class ContainedEditPopup extends React.Component<EditPopupProps, EditPopupState> {
	state = {
		value: ""
	}

	componentDidMount() {
		const node = {...this.props.selectedNode.node};
		
		delete node._id;
		delete node.id;
		delete node.x;
		delete node.y;
		delete node.shapeType;

		this.setState({value : JSON.stringify(node, null, 2)})
	}

	saveNode(e) {
		try {
			const changedProperties = JSON.parse(this.state.value);
			
			delete changedProperties.name;
			if (changedProperties.id !== undefined) {
				delete changedProperties.id;
			}
			
			const node = {...this.props.selectedNode.node, ...changedProperties};
			this.props.storeFlowNode(node);
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
