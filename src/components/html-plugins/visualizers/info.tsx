export class AnimatedGridCanvasInfo {
	getWidth(node) {
		//return ((node.columns || 8) * 16);
		return ((node.width || 256) + 20) || ((node.columns || 8) * 16) + 20 + 80;
	}

	getHeight(node) {
		//return ((node.rows || 8) * 16);
		return ((node.height || 256) + 16) ||  ((node.rows || 8) * 16) + (3 * 16) + 4;
	}
}

export class GridCanvasInfo {
	getWidth(node) {
		//return ((node.columns || 8) * 16);
		return ((node.columns || 8) * 16) + 20 + 80;
	}

	getHeight(node) {
		//return ((node.rows || 8) * 16);
		return ((node.rows || 8) * 16) + (3 * 16) + 4;
	}
}


export class XYCanvasInfo {
	getWidth(node) {
		return (node.width || 250) + 20 + 80;
	}

	getHeight(node) {
		return (node.height || 250) + (3 * 16) + 4;
	}
}

export class DebugNodeHtmlPluginInfo {
	getWidth = (node) => {

		if (node && node.visualizer && node.visualizer == "xycanvas") {
			const visualizerInfo = new XYCanvasInfo();
			return visualizerInfo.getWidth(node);
		} else
		if (node && node.visualizer && node.visualizer == "gridcanvas") {
			const visualizerInfo = new GridCanvasInfo();
			return visualizerInfo.getWidth(node);
		} else
		if (node && node.visualizer && node.visualizer == "animatedgridcanvas") {
			const visualizerInfo = new AnimatedGridCanvasInfo();
			return visualizerInfo.getWidth(node);
		}
		return;
	}

	getHeight(node) {
		if (node && node.visualizer && node.visualizer == "xycanvas") {
			const visualizerInfo = new XYCanvasInfo();
			return visualizerInfo.getHeight(node);
		} else
		if (node && node.visualizer && node.visualizer == "gridcanvas") {
			const visualizerInfo = new GridCanvasInfo();
			return visualizerInfo.getHeight(node);
		} else
		if (node && node.visualizer && node.visualizer == "animatedgridcanvas") {
			const visualizerInfo = new AnimatedGridCanvasInfo();
			return visualizerInfo.getHeight(node);
		} 
		return;
	}
}

export class GridEditNodeHtmlPluginInfo {
	getWidth(node) {
		return (((node && node.columns) || 8) * 16) + 20 + 60;
	}

	getHeight(node) {
		return (((node && node.rows) || 8) * 16) + (3 * 16) + 4 + 150;
	}
}
