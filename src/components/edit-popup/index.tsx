import * as React from 'react';
import { Modal, Button } from 'react-bootstrap';

export class EditPopup extends React.Component {
	render() {
		return <Modal show={true} centered size="lg">
		<Modal.Header closeButton>
		  <Modal.Title>Edit Node JSON</Modal.Title>
		</Modal.Header>
	  
		<Modal.Body>
			<div className="form-group">
				<label>Node JSON</label>
				<textarea className="form-control" rows={8}></textarea>
			</div>
		</Modal.Body>
	  
		<Modal.Footer>
		  <Button variant="secondary">Close</Button>
		  <Button variant="primary">Save</Button>
		</Modal.Footer>
	  </Modal>;
	}
}