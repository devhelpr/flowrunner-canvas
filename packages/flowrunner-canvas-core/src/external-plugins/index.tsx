import * as React from 'react';

interface DefaultProps {
	payload : any
}

class PluginTask {
	public execute(node: any, services : any) {	
		console.log("PluginTask execute", node);	
		return Object.assign({}, 
			node.payload, 
			{			
				value : (Math.random() * 100).toFixed(0)
			}
		);
	}
}

class PluginVisualizer extends React.Component<DefaultProps> {

	override render() { 
		console.log("PluginVisualizer render" , this.props.payload);
		return <div className="html-plugin-node" style={{			
			backgroundColor: "white"
		}}>
			<div className="w-100 h-auto text-center">
				<div style={{
					fontSize: "24px",
					marginBottom: "20px"
				}}>
					<h1>HELLO! {this.props.payload && (this.props.payload as any).value}</h1>
				</div>							
			</div>
		</div>;
	}
}

export const registerPlugins = (registerFlowRunnerCanvasPlugin? : any) => {
	registerFlowRunnerCanvasPlugin("PluginTask", PluginVisualizer, PluginTask, "PluginVisualizer");
}