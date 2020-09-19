import * as React from 'react';
import { connect } from "react-redux";
import fetch from 'cross-fetch';

import { Modal, Button } from 'react-bootstrap';
import { storeFlowNode } from '../../redux/actions/flow-actions';
import { selectNode } from '../../redux/actions/node-actions';

export interface NewFlowProps {
	selectedNode : any;
	onClose : () => void;
	onSave: (id : number, flowType : string) => void;
	storeFlowNode: (node : any, orgNodeName : string) => void;
	selectNode: (name: string, node : any) => void;
}

export interface NewFlowState {
	value: string;
	orgNodeName: string;
	orgNodeValues: any;
	requiredNodeValues: any;
	flowType: string;
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
		requiredNodeValues: {},
		flowType: "playground"
	}

	componentDidMount() {
		//
	}

	saveNode(e) {
		try {
			fetch('/flow?flow=' + this.state.value + "&flowType=" + this.state.flowType, {
				method : "post"
			}).then((response) => {
				if (response.status >= 400) {
					throw new Error("Bad response from server");
				}
				return response.json();
			}).then((result) => {
				this.props.onSave(result.id, this.state.flowType);
			});
			
		} catch (err) {
			alert("Error while adding flow");
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
			<div className="form-group">
				<label>Flow type</label>
				<select className="form-control" value={this.state.flowType}
					onChange={(e) => {this.setState({flowType: e.target.value})}}
				>
					<option value="playground">Playground</option>
					<option value="rustflowrunner">Rust flowrunner</option>
					<option value="mobile-app">Mobile app</option>
					<option value="backend">Backend</option>
				</select>
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
