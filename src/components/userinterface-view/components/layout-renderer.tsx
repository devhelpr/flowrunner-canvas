import React from 'react';
import { 
	FormComponent, 
	Form,
	Layout, 
	Elements, 
	IRootLayout 
} from '@devhelpr/layoutrunner';
import { FlowToCanvas } from '../../../helpers/flow-to-canvas';
import { ShapeSettings } from '../../../helpers/shape-settings';

export const renderFlowNode = (node : any, rootLayout : any) => {
	if (!!node.hideFromUI) {
		return <React.Fragment></React.Fragment>
	}

	let shapeType = FlowToCanvas.getShapeType(node.shapeType, node.taskType, node.isStartEnd);
	const settings = ShapeSettings.getShapeSettings(node.taskType, node);
	//const Shape = Shapes[shapeType];
	if (shapeType === "Html" && !!settings.hasUI) { //&& Shape
		const nodeClone = {...node};

		const isSelected = false;
		nodeClone.htmlPlugin = node.htmlPlugin || (settings as any).htmlPlugin || "";
		
		let width = undefined;
		let height = undefined;

		if (rootLayout.context.getNodeInstance) {
			const instance = rootLayout.context.getNodeInstance(node, 
				rootLayout.context.flowrunnerConnector, 
				rootLayout.context.flow, settings);
			if (instance) {
				if (instance.getWidth && instance.getHeight) {
					width = instance.getWidth(node);
					height = instance.getHeight(node);
				}
			}
		}

		return <div
			style={{																						
					width: (width || node.width || 250)+"px",
					minHeight: (height || node.height || 250)+"px",
					height: "auto",
					opacity: 1,
					position: "relative"						 
				}}
			data-node={node.name}
			data-node-type={node.taskType}
			data-node-visualizer={nodeClone.visualizer || ""}	 
			data-x={node.x} 
			data-y={node.y} 
			className="canvas__html-shape">
				<div className="canvas__html-shape-body">
				{rootLayout.context.renderHtmlNode && rootLayout.context.renderHtmlNode(nodeClone, rootLayout.context.flowrunnerConnector, rootLayout.context.nodes, rootLayout.context.flow, settings)}</div>										
				</div>;
	}
}

export const renderLayoutType = (layoutBlock : any, 
    isInForm : boolean, 
    form : FormComponent | undefined, 		
    setLayoutVisibleState : (layoutBlockName : string, isVisible : boolean) => void,
    rootLayout : IRootLayout
  ) => {

	if (layoutBlock.type === "layout2columns") {
		if (!layoutBlock.layout && layoutBlock.layout.length !== 2) {
			return <></>;
		}
		return <div className="row">
			<div className="col-12 col-md-6 ui-view-layout__container-row">
			{layoutBlock.layout[0].map((layout, index) => {
				return <React.Fragment key={"layout-" + index}>
					<div className="ui-view-layout__container d-flex flex-row justify-content-center">{renderLayoutType(
						layout,
						isInForm,
						form, 
						setLayoutVisibleState,
						rootLayout
					)}
					</div>
				</React.Fragment>})}
			</div>
			<div className="col-12 col-md-6 ui-view-layout__container-row">
			{layoutBlock.layout[1].map((layout, index) => {
				return <React.Fragment key={"layout-" + index}>
					<div className="ui-view-layout__container d-flex flex-row justify-content-center">{renderLayoutType(
						layout,
						isInForm,
						form, 
						setLayoutVisibleState,
						rootLayout
					)}
					</div>
				</React.Fragment>})}
			</div>
		</div>;
	} else
    if (layoutBlock.type === "layout") {
		if (!layoutBlock.layout) {
			return <></>;
		}
		
		return <>
			<div className="row">
				<div className="col-12 ui-view-layout__container-row">
					{layoutBlock.layout.map((layout, index) => {
						return <React.Fragment key={"layout-" + index}>
							<div className="ui-view-layout__container d-flex flex-row justify-content-center">{renderLayoutType(
								layout,
								isInForm,
								form, 
								setLayoutVisibleState,
								rootLayout
							)}
							</div>
						</React.Fragment>})}
				</div>
			</div>
		</>;

	} else
	if (layoutBlock.type === "element") {
		return <div>{layoutBlock.title || ""}</div>
	}
	else if (layoutBlock.type === "flowNode") {
		const node = rootLayout.context.flowHash[layoutBlock.subtitle];
		if (node) {
			return renderFlowNode(node, rootLayout);
		}
		return null;
	}
	
    return <></>;
}