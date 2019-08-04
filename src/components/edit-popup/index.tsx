import * as React from 'react';
import { connect } from "react-redux";

import { Modal, Button } from 'react-bootstrap';
import { StringLiteral } from '@babel/types';

export interface EditPopupProps {
	selectedNode : any;
	onClose: () => void
}

export interface EditPopupState {
	value: string;
}

const mapStateToProps = (state : any) => {
	return {
		selectedNode : state.selectedNode
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
		  <Button variant="primary">Save</Button>
		</Modal.Footer>
	  </Modal>;
	}
}

export const EditPopup = connect(mapStateToProps)(ContainedEditPopup);
