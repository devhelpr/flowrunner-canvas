import fetch from 'cross-fetch';

export class FlowLoader {
  public getFlow = (id, doNotConvertFlowToWasm = false) => {
    return new Promise((resolve, reject) => {
      try {
        fetch('/api/flow?flow=' + id, {
          method: 'GET',
          credentials: 'include',
          mode: 'same-origin',
        })
          .then(res => {
            if (res.status >= 400) {
              throw new Error('FlowLoader load-flow status code' + res.status);
            }
            return res.json();
          })
          .then(response => {
            /*if (response.flowType !== 'rustflowrunner') {
              reject();
            }
            */
            if (!!doNotConvertFlowToWasm) {
              resolve(response.flow);
            } else {
              resolve(this.convertFlowToWasmFlow(response.flow));
            }
          })
          .catch(err => {
            console.log('FlowLoader load-flow(1)', err);
            reject('FlowLoader load-flow(1): ' + err);
          });
      } catch (err) {
        reject('FlowLoader load-flow(2): ' + err);
      }
    });
  };

  public convertFlowToWasmFlow = flow => {
    /*
			- foreach node
				if taskType != connection
					remove id/x/y/shapeType/width/height
					add node to list and instead of taskType use taskName
			
			- foreach node in new list
				get all connections from input flow
					if task == matrix
						set eventStepName to first connection
					if task == if
						get first success and first fail connections
						set next and else names for connections
					else
						wasm node can contain only one next step, set next step to name of first connection

		*/
    let wasmFlow: any[] = [];
    flow.map(node => {
      if (node.taskType !== 'connection') {
        let wasmNode = { ...node };
        delete wasmNode.id;
        delete wasmNode.x;
        delete wasmNode.y;
        delete wasmNode.shapeType;
        delete wasmNode.width;
        delete wasmNode.height;
        delete wasmNode.eventStepName;
        delete wasmNode.next;
        delete wasmNode.elseStep;
        wasmNode.taskName = node.taskType;
        delete wasmNode.taskType;
        wasmFlow.push(wasmNode);
      }
    });
    wasmFlow.map(wasmNode => {
      let connections = flow.filter(node => {
        if (node.taskType === 'connection') {
          return node.startshapeid === wasmNode.name;
        }
        return false;
      });
      if (wasmNode.taskName === 'matrix') {
        if (connections.length > 0) {
          wasmNode.eventStepName = connections[0].endshapeid;
        }
      } else if (wasmNode.taskName === 'if') {
        // followflow": "onsuccess"
        // "followflow": "onfailure",
        let onsuccessIsFound: boolean = false;
        let onfailureIsFound: boolean = false;
        connections.map(connection => {
          if (connection.followflow === 'onfailure') {
            if (!onfailureIsFound) {
              onfailureIsFound = true;
              wasmNode.elseStep = connection.endshapeid;
            }
          } else if (
            connection.followflow === undefined ||
            connection.followflow === '' ||
            connection.followflow === 'onsuccess'
          ) {
            if (!onsuccessIsFound) {
              onsuccessIsFound = true;
              wasmNode.next = connection.endshapeid;
            }
          }
        });
      } else {
        if (connections.length > 0) {
          wasmNode.next = connections[0].endshapeid;
        }
      }
    });
    return wasmFlow;
  };
}
