import * as React from 'react';
import { connect } from "react-redux";
import fetch from 'cross-fetch';

import { Modal, Button } from 'react-bootstrap';
import { storeFlowNode } from '../../redux/actions/flow-actions';
import { selectNode } from '../../redux/actions/node-actions';

export interface NewFlowProps {
	selectedNode : any;

	onClose: (id : number) => void;
	storeFlowNode: (node : any, orgNodeName : string) => void;
	selectNode: (name: string, node : any) => void;
}

export interface NewFlowState {
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

class ContainedNewFlow extends React.Component<NewFlowProps, NewFlowState> {
	state = {
		value: "",
		orgNodeName : "",
		orgNodeValues: {},
		requiredNodeValues: {}
	}

	componentDidMount() {
		//
	}

	saveNode(e) {
		try {
			fetch('/add-flow?flow=' + this.state.value, {
				method : "post"
			}).then((response) => {
				if (response.status >= 400) {
					throw new Error("Bad response from server");
				}
				return response.json();
			}).then((result) => {
				this.props.onClose(result.id);
			});
			
		} catch (err) {
			alert("The flow couldn't be added");
		}

		e.preventDefault();
		return false;
	}

	render() {
		return <Modal show={true} centered size="sm">
		<Modal.Header>
		  <Modal.Title>Add new Flow</Modal.Title>
		</Modal.Header>
	  
		<Modal.Body>
			<div className="form-group">
				<label>Flow name</label>
				<input className="form-control"
					value={this.state.value} 
					required
					onChange={(e) => {this.setState({value: e.target.value})}}
				></input>
			</div>
		</Modal.Body>
	  
		<Modal.Footer>
		  <Button variant="secondary" onClick={this.props.onClose}>Close</Button>
		  <Button variant="primary" onClick={this.saveNode.bind(this)}>Add</Button>
		</Modal.Footer>
	  </Modal>;
	}
}

export const NewFlow = connect(mapStateToProps, mapDispatchToProps)(ContainedNewFlow);
