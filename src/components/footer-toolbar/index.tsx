import * as React from 'react';
import { connect } from "react-redux";
import { ICanvasMode } from '../../redux/reducers/canvas-mode-reducers';

export interface FooterProps {
	canvasMode: ICanvasMode;
	selectedNode: any;
}

export interface FooterState {

}

const mapStateToProps = (state: any) => {
	return {
		selectedNode: state.selectedNode,
		canvasMode: state.canvasMode	
	}
}

class ContainedFooter extends React.Component<FooterProps, FooterState> {

	componentDidMount() {

	}

	render() {
		if (!this.props.selectedNode || !this.props.selectedNode.name) {
			return <nav className="navbar fixed-bottom navbar-light bg-light">
				<span className="navbar-brand">(c) Devhelpr 2020</span>
			</nav>;
		}
		if (this.props.selectedNode.node.taskType == "connection") {
			let additionalInfo = "";
			const node = this.props.selectedNode.node;
			if (node.tag) {
				additionalInfo = " - tag : " + node.tag;
			}
			if (node.flowPath) {
				additionalInfo = additionalInfo + " - " + "flowPath : " + node.flowPath; 
			}
			return <nav className="navbar fixed-bottom navbar-light bg-light">
				<a className="navbar-brand" href="#">{this.props.selectedNode.node && this.props.selectedNode.node.taskType ? this.props.selectedNode.node.taskType : ""}{additionalInfo}</a>
			</nav>;
		}
		let additionalInfo = "";
		if (this.props.selectedNode.node) {
			const node = this.props.selectedNode.node;
			if (node.getVariable) {
				additionalInfo = " - getVariable " + node.getVariable;
			} else
			if (node.setVariable) {
				additionalInfo = " - setVariable " + node.setVariable;
			} else			
			if (node.expression) {
				additionalInfo = " - expression " + node.expression;
			} else		
			if (node.variableName) {
				additionalInfo = " - variableName " + node.variableName;
			} else		
			if (node.node) {
				additionalInfo = " - node " + node.node;
			} else		
			if (node.objectSchema) {
				additionalInfo = " - objectSchema " + node.objectSchema;
			} else		
			if (node.url) {
				additionalInfo = " - url " + node.url;
			}		
		}
		return <nav className="navbar fixed-bottom navbar-light bg-light">
			<a className="navbar-brand" href="#">{this.props.selectedNode.node && this.props.selectedNode.node.taskType ? this.props.selectedNode.node.taskType + " - " : ""}{this.props.selectedNode.name}{additionalInfo}</a>
		</nav>;
	}
}

export const FooterToolbar = connect(mapStateToProps)(ContainedFooter);