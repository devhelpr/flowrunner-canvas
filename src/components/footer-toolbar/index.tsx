import * as React from 'react';

export interface FooterProps {
	
}

export interface FooterState {

}

export class FooterToolbar extends React.Component<FooterProps, FooterState> {

	componentDidMount() {

	}

	render() {

		return <nav className="navbar fixed-bottom navbar-light bg-light">
				<span className="navbar-brand">(c) Devhelpr 2020</span>
			</nav>;
		/*	
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
		*/
	}
}