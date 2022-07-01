/*import * as React from 'react';
import { IFlowrunnerConnector, IExecutionEvent } from '../../interfaces/IFlowrunnerConnector';

import Slider from '@material-ui/core/Slider';

export interface UIControlsBarProps {
	//nodes : any[];
	flow: any[];

	canvasMode : any;
	selectedNode : any;
	selectNode : (name, node) => void;
	setPayload : (name, payload) => void;
	renderHtmlNode?: (node: any, flowrunnerConnector : IFlowrunnerConnector, nodes: any, flow: any, taskSettings: any) => any;
	flowrunnerConnector : IFlowrunnerConnector;

}

export interface UIControlsBarState {
	
}

const mapStateToProps = (state : any) => {
	return {
		flow: state.flow,
		//nodes: state.rawFlow,
		selectedNode : state.selectedNode,		
		setPayload: state.setPayload,
		canvasMode : state.canvasMode
	}
}

const mapDispatchToProps = (dispatch : any) => {
	return {
		selectNode: (name, node) => dispatch(selectNode(name, node)),
		setPayload: (name, payload) => dispatch(setPayload(name, payload))
	}
}

class ContainedUIControlsBar extends React.Component<UIControlsBarProps, UIControlsBarState> {
	constructor(props) {
		super(props);

		this.htmlElement = React.createRef();
	}

	htmlElement : any;
	componentDidMount() {
		this.props.flowrunnerConnector.registerFlowExecutionObserver("ContainedUIControlsBar" , (executionEvent : IExecutionEvent) => {
			if (!this.unmounted) {
				// TODO : fix this nasty workaround
				this.forceUpdate();
				//this.setState({payload: executionEvent.payload});
			}
		});
	}

	unmounted : boolean = false;
	componentWillUnmount() {
		this.unmounted = true;
		this.props.flowrunnerConnector.unregisterFlowExecuteObserver("ContainedUIControlsBar");

	}

	onChange = (event: object, value: number | number[]) => {
		let list = this.props.flowrunnerConnector.getNodeExecutions();
		if (value < list.length) {

			const root = document.getElementById("flowstudio-root");
			let maxHeight = (root?.clientHeight || 0) - (72 + 56);
			const maxValue = Math.min(list.length - 1 , maxHeight);

			const nodeInfo = list[(list.length - 1 - maxValue) + (value as number)];
			let nodes = this.props.flow.filter(node => {
				return node.name == nodeInfo.name;
			});
			if (nodes.length > 0) {
				this.props.selectNode(nodeInfo.name, nodes[0]);
				this.props.setPayload(nodeInfo.name, nodeInfo.payload);
			}

		}
		(list as any) = null;
	}

	render() {
		if (this.props.canvasMode.flowType !== "playground") {
			return <></>;
		}
		return <></>;
		
		let list = this.props.flowrunnerConnector.getNodeExecutions();
		let listLength = list.length;
		(list as any) = null;
		const root = document.getElementById("flowstudio-root");
		let maxHeight = (root?.clientHeight || 0) - (72 + 56);
		return <div className="ui-controls-bar ui-controls-bar__small-width">
			<Slider 
					valueLabelDisplay="auto"
					max={Math.min(listLength - 1 , maxHeight)} 
					defaultValue={0} 
					orientation="vertical"
					onChange={this.onChange} 
				/>
		</div>;
	
	}
}

export const UIControlsBar = connect(mapStateToProps, mapDispatchToProps)(ContainedUIControlsBar);

*/