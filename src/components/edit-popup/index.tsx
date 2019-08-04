import * as React from 'react';
import { connect } from "react-redux";

import { Modal, Button } from 'react-bootstrap';

export interface EditPopupProps {
	selectedNode : any;
}

const mapStateToProps = (state : any) => {
	return {
		selectedNode : state.selectedNode
	}
}

class ContainedEditPopup extends React.Component<EditPopupProps> {
	render() {
		return <Modal show={true} centered size="lg">
		<Modal.Header closeButton>
		  <Modal.Title>Edit Node JSON</Modal.Title>
		</Modal.Header>
	  
		<Modal.Body>
			<div className="form-group">
				<label>Node JSON</label>
				<textarea className="form-control" rows={8}>{JSON.stringify(this.props.selectedNode, null, 2)}</textarea>
			</div>
		</Modal.Body>
	  
		<Modal.Footer>
		  <Button variant="secondary">Close</Button>
		  <Button variant="primary">Save</Button>
		</Modal.Footer>
	  </Modal>;
	}
}

export const EditPopup = connect(mapStateToProps)(ContainedEditPopup);
