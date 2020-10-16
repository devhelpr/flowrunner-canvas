import * as React from 'react';
import { renderFlowNode } from '../../userinterface-view/components/layout-renderer';

export interface LayoutWithDropAreaProps {
	//onStoreLayout : (layoutName, layoutIndex, layoutIndexLevel, layout : any[]) => void;
	onStoreLayout : (level, index, subIndex, layout : any) => void;
	onGetLayout : (level, index, subIndex) => any;
	level : number;
	name : string;
	layoutIndex: number;
	layoutIndexLevel? : number;
	tree? : any;
	getNodeInstance : any;
	flowrunnerConnector : any;
	flow : any;
	renderHtmlNode : any;
	flowHash: any;
}

export interface LayoutWithDropAreaState {
	layout : any[];
}

export class LayoutWithDropArea extends React.Component<LayoutWithDropAreaProps, LayoutWithDropAreaState> {
	

	dropZone : any = undefined;

	constructor(props) {
		super(props);
		this.dropZone = React.createRef();

		let layout = [];
		let initialLayout : any = props.onGetLayout(props.level, props.layoutIndex, props.layoutIndexLevel || 0);
		if (initialLayout !== false) {
			layout = initialLayout;
		} 
		this.state = {
			layout : layout,
		}
	}
	
	componentDidUpdate(prevProps) {
		if (this.props.tree !== undefined && this.props.tree !== null &&
			prevProps.tree !== this.props.tree) {
			let layout = [];
			let initialLayout : any = this.props.onGetLayout(this.props.level, this.props.layoutIndex, this.props.layoutIndexLevel || 0);
			if (initialLayout !== false) {
				layout = initialLayout;
			} 
			this.setState({
				layout : layout,
			});		
		}
	}

	onAllowDrop = (event) => {
		event.preventDefault();
		if (this.dropZone && this.dropZone.current) {
			// TODO : check here if drop is allowed
			(this.dropZone.current).classList.add("hovering");
		}
	}	

	onDragLeave = (event) => {
		if (this.dropZone && this.dropZone.current) {
			(this.dropZone.current).classList.remove("hovering");
		}
	}

	onDropTask = (event) => {
		event.preventDefault();

		if (this.dropZone && this.dropZone.current) {
			(this.dropZone.current).classList.remove("hovering");
		}
		try {
			let draggable = JSON.parse(event.dataTransfer.getData("data-draggable"));
			if (!!draggable.isElement) {
				return;
			}

			if (!!draggable.isElement && draggable.layout === this.props.name) {
				return false;
			}

			console.log("draggable", draggable);
			this.setState(state => {
				let layout = [...state.layout];
				layout.push({
					title: draggable.title,
					subtitle: draggable.subtitle || "",
					name: this.props.name + "-" + this.props.level + "-" + (layout.length + 1) + draggable.title.replace(/\s/g, '')
				});
				/*
				call store prop method on parent
					parameters					
						layout
						component props level, layoutIndex, layoutIndexLevel

					parent calls its parent with same paremeters until root is reached
					parent has hashed list
						where key = level.layoutIndex.layoutIndexLevel

					
				*/
				return {
					layout: layout
				}
			}, () => {
				this.props.onStoreLayout(this.props.level, this.props.layoutIndex, this.props.layoutIndexLevel || 0, this.state.layout);
			});
		} catch(err) {

		}
		return true;
	}

	onDragStartOther = (event) => {	
		console.log("onDragStartOther", event.target.getAttribute("data-layout-parent"));
		event.dataTransfer.setData("data-draggable", 
			JSON.stringify({
				layout:event.target.getAttribute("data-layout-parent"),
				isElement :true,
				id : event.target.id
			})
		)
	}

	onAllowDropOther = (event) => {
		event.preventDefault();
		const id = event.target.id;
		// TODO : check here if drop is allowed
		// - if layout parent of current element OR child layout is dropped .. is not allowed 
		const domElement = document.getElementById(id);
		if (domElement) {
			domElement.classList.add("hovering");			
		}
	}

	onDropTaskOther = (event) => {
		event.preventDefault();
		const id = event.target.id;
		const domElement = document.getElementById(id);
		if (domElement) {
			domElement.classList.remove("hovering");

			try {
				let draggable = JSON.parse(event.dataTransfer.getData("data-draggable"));
				if (!!draggable.isElement && draggable.layout === this.props.name && draggable.id !== id) {
					return false;
				}
			} catch(err) {

			}
		}
	}

	onDragLeaveOther = (event) => {
		const id = event.target.id;
		const domElement = document.getElementById(id);
		if (domElement) {
			domElement.classList.remove("hovering");
		}
	}

	render() {
		const { level , name } = this.props;
		return <>{this.state.layout.map((layout : any, index) => {
				if (layout.title == "element") {
					return <React.Fragment key={index}>
						<div draggable={true}
							data-layout-parent={this.props.name} 
							id={this.props.name + "-element" + index}
							onDragOver={this.onAllowDropOther}
							onDragStart={this.onDragStartOther}
							onDrop={this.onDropTaskOther}
							onDragLeave={this.onDragLeaveOther}
							className="draggable-element font-weight-bold">{layout.title}</div>
					</React.Fragment>;
				}

				if (layout.title == "flowNode") {
					const flowNode = this.props.flowHash[layout.subtitle];
					if (flowNode === undefined) {
						return <></>;
					}
					return <React.Fragment key={index}>
						<div draggable={true}
							onDragOver={this.onAllowDropOther}
							onDragStart={this.onDragStartOther}
							onDrop={this.onDropTaskOther}
							onDragLeave={this.onDragLeaveOther}
							data-layout-parent={this.props.name}
							className="draggable-element ui-view-layout__container"
							id={this.props.name + "-flownode" + index}
						>
							<div className="font-weight-bold">{layout.title}</div>
							<div className="text-secondary">{layout.subtitle}</div>
							{renderFlowNode(flowNode, {
								context : {
									getNodeInstance: this.props.getNodeInstance,
									flowrunnerConnector: this.props.flowrunnerConnector,
									flow: this.props.flow,
									renderHtmlNode: this.props.renderHtmlNode
								}
							})}
						</div>
					</React.Fragment>;
				}

				if (layout.title == "layout2columns") {
					return <React.Fragment key={index}>
						<div className="layout-container">
							<div className="font-weight-bold">{layout.title}</div>
							<div className="row">
								<div className="col-6">								
									<LayoutWithDropArea 
										onGetLayout={this.props.onGetLayout}
										onStoreLayout={this.props.onStoreLayout} 
										layoutIndex={index} 
										name={layout.name + "c0-" + index +"c"} 
										level={level+1}
										getNodeInstance={this.props.getNodeInstance}
										flowrunnerConnector={this.props.flowrunnerConnector}
										flow={this.props.flow}
										renderHtmlNode={this.props.renderHtmlNode}
										flowHash={this.props.flowHash}									
										></LayoutWithDropArea>
								</div>
								<div className="col-6">
									<LayoutWithDropArea
										onGetLayout={this.props.onGetLayout}
										onStoreLayout={this.props.onStoreLayout} 
										layoutIndex={index} 
										layoutIndexLevel={1} 
										name={layout.name + "c1-" + index +"c"} 
										level={level+1}
										getNodeInstance={this.props.getNodeInstance}
										flowrunnerConnector={this.props.flowrunnerConnector}
										flow={this.props.flow}
										renderHtmlNode={this.props.renderHtmlNode}
										flowHash={this.props.flowHash}		
										></LayoutWithDropArea>
								</div>
							</div>
						</div>
					</React.Fragment>
				}

				return <React.Fragment key={index}>
					<>
						<div className="layout-container">
							<div className="font-weight-bold">{layout.title}</div>
							<LayoutWithDropArea 
								onGetLayout={this.props.onGetLayout}
								onStoreLayout={this.props.onStoreLayout} 
								layoutIndex={index} 
								name={layout.name + "l" + index +"l" } 
								level={level+1}
								getNodeInstance={this.props.getNodeInstance}
								flowrunnerConnector={this.props.flowrunnerConnector}
								flow={this.props.flow}
								renderHtmlNode={this.props.renderHtmlNode}
								flowHash={this.props.flowHash}								
								></LayoutWithDropArea>
						</div>
					</>
				</React.Fragment>
			})}
			<div ref={this.dropZone}
				className="layout__droparea" 
				onDragOver={this.onAllowDrop}
				onDrop={this.onDropTask}
				onDragLeave={this.onDragLeave}
				>				
			</div>
		</>;
	}
}