import * as React from 'react';
import { connect } from "react-redux";
import { ShapeSettings } from '../../helpers/shape-settings';
import { FlowToCanvas } from '../../helpers/flow-to-canvas';
import { IFlowrunnerConnector, IExecutionEvent } from '../../interfaces/IFlowrunnerConnector';

export interface DebugInfoProps {
	//nodes : any[];
	flow: any[];

	selectedNode : any;
	canvasMode : any;
	flowrunnerConnector : IFlowrunnerConnector;
}

export interface DebugInfoState {
	payload : any;
	fullscreen: boolean;
}

const mapStateToProps = (state : any) => {
	return {
		flow: state.flow,
		//nodes: state.rawFlow,
		selectedNode : state.selectedNode,
		canvasMode : state.canvasMode		
	}
}


class ContainedDebugInfo extends React.Component<DebugInfoProps, DebugInfoState> {
	constructor(props) {
		super(props);

		this.htmlElement = React.createRef();
	}

	state = {
		payload : undefined,
		fullscreen: false
	}

	htmlElement : any;
	timer : any;
	componentDidMount() {
		this.props.flowrunnerConnector.registerFlowExecutionObserver("ContainedDebugInfo" , (executionEvent : IExecutionEvent) => {

			if (this.timer) {
				clearTimeout(this.timer);
			}

			this.timer = setTimeout(() => {
				if (!this.unmounted) {
					// TODO : fix this nasty workaround
					//this.forceUpdate();
				}

				if (executionEvent) {
					this.setState({payload: executionEvent.payload});
				}

			}, 50);
		});
	}

	unmounted : boolean = false;
	componentWillUnmount() {
		this.unmounted = true;
		if (this.timer) {
			clearTimeout(this.timer);
		}
		
		this.props.flowrunnerConnector.unregisterFlowExecuteObserver("ContainedDebugInfo");

	}

	onToggleFullscreen = () => {
		this.setState({fullscreen: !this.state.fullscreen})
	}

	render() {

		if (this.props.canvasMode.flowType !== "playground") {
			return <></>;
		}
		
		let fullscreenCss = "";
		let iconCss = "debug-info__window-maximize far fa-window-maximize";
		if (this.state.fullscreen) {
			fullscreenCss = " debug-info--fullscreen";
			iconCss = "debug-info__window-maximize far fa-window-minimize";
		}
		if (this.props.selectedNode && this.props.selectedNode.name) {
			
			if (this.props.selectedNode.payload) {
				const debugInfo = JSON.stringify(this.props.selectedNode.payload, null, 2);
				return <div className={"debug-info" + fullscreenCss}>
					<div className="debug-info__debug-info">
						<a href="#" onClick={this.onToggleFullscreen} className={iconCss}></a> 
						<div className="debug-info__debug-info-content">
							<strong>{this.props.selectedNode.name}</strong><br />
							{debugInfo}
						</div>
					</div>
				</div>
			} else {
				let list = this.props.flowrunnerConnector.getNodeExecutionsByNodeName(this.props.selectedNode.name);

				if (list && list.length > 0) {
					const debugInfo = JSON.stringify(list[list.length - 1], null, 2);
					return <div className={"debug-info" + fullscreenCss}>
						<div className="debug-info__debug-info">
							<a href="#" onClick={this.onToggleFullscreen} className={iconCss}></a> 
							<div className="debug-info__debug-info-content">
								<strong>{this.props.selectedNode.name}</strong><br />
								{debugInfo}
							</div>
						</div>
					</div>
				}
			}
		}

		return null;
		
	}
}

export const DebugInfo = connect(mapStateToProps, )(ContainedDebugInfo);