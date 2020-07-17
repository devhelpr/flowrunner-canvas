import * as React from 'react';
import * as uuid from 'uuid';
const uuidV4 = uuid.v4;

interface DefaultProps {
	payload : any
}

class PieChartTask {
	public execute(node: any, services : any) {	
		console.log("PieChartTask execute", node);	
		return Object.assign({}, 
			node.payload, 
			{			
				value : (Math.random() * 100).toFixed(0)
			}
		);
	}
}

// React.FunctionComponent<DefaultProps> = (props : DefaultProps)
class PieChartVisualizer extends React.Component<DefaultProps> {

	render() { 
		console.log("PieChartVisualizer render" , this.props.payload);
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

const LineChartVisualizer : React.FunctionComponent<DefaultProps> = (props : DefaultProps) => {
	return <div className="html-plugin-node" style={{			
		backgroundColor: "white"
	}}>
		<div className="w-100 h-auto text-center">
			<div style={{
				fontSize: "24px",
				marginBottom: "20px"
			}}>
				<h1>LineChartVisualizer</h1>
			</div>							
		</div>
	</div>;
}

console.log("PieChartVisualizer", PieChartVisualizer,(window as any).registerFlowRunnerCanvasPlugin);

if ((window as any).registerFlowRunnerCanvasPlugin) {
	(window as any).registerFlowRunnerCanvasPlugin("piechart", PieChartVisualizer, PieChartTask, "PieChartVisualizer");
	(window as any).registerFlowRunnerCanvasPlugin("linechart", LineChartVisualizer, PieChartTask, "LineChartVisualizer");
}