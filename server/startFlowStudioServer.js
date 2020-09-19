const fs = require('fs');
const path = require('path');
const fetch = require('cross-fetch');

function start(flowFileName, taskPlugins, options) {

	/*
		taskPlugins : ITaskPlugin[]

		ITaskPlugin interface
			fullName
			className
			config? : any

	*/	
	let flowsFileName = "";

	let flowFiles = [];
	if (typeof flowFileName == "string") {
		let flows = JSON.parse(fs.readFileSync(flowFileName));
		flowsFileName = flowFileName;
		//flowFiles.push({name:flowFileName,id:0});
		flowFiles = flows;
	} else {
		flowFiles = flowFileName.map((flow, index) => {
			return {
				name: flow,
				id: index,
				flowType : "playground"
			}
		});
	}

	let hasPreviewPlugin = false;
	if (!!options && !!options.hasPreviewPlugin) {
		hasPreviewPlugin = true;
	}

	let isStandalone = false;
	if (!!options && !!options.isStandalone) {
		isStandalone = true;
	}

	let defaultPlugins = false;
	if (!!options && !!options.defaultPlugins) {
		defaultPlugins = true;
	}

	const intializeMetadataPromise = new Promise((resolve, reject) => {
		if (defaultPlugins) {
			var flowRunner = require('@devhelpr/flowrunner-redux').getFlowEventRunner();
			flowRunner.start({ flow: [] }).then(function (services) {
				let tasks = flowRunner.getTaskMetaData();

				tasks = tasks.map((task) => {
					task.flowType = "playground";
					return task;
				});

				tasks.push({className:"ModelTask", fullName:"Model", flowType:"backend"});
				
				if (hasPreviewPlugin) {
					/*

						TODO:

						- implement presets
						- implement plugin/task help

						- why are there 2 parallel tasks? bug in flowrunner-redux??

						- rename previewtask to htmltask

					*/
					tasks.push({className:"PreviewTask", fullName:"PreviewTask", flowType:"playground"});
				}

				if (isStandalone) {
					tasks.push({className:"DebugTask", fullName:"DebugTask", flowType:"playground"});
					tasks.push({className:"SliderTask", fullName:"SliderTask", flowType:"playground"});
					tasks.push({className:"RandomTask", fullName:"RandomTask", flowType:"playground"});
					tasks.push({className:"TimerTask", fullName:"TimerTask", flowType:"playground"});
					tasks.push({className:"ExpressionTask", fullName:"ExpressionTask", flowType:"playground"});
					tasks.push({className:"OutputValueTask", fullName:"OutputValueTask", flowType:"playground"});
					tasks.push({className:"ConditionalTriggerTask", fullName:"ConditionalTriggerTask", flowType:"playground"});
					tasks.push({className:"ApiProxyTask", fullName: "ApiProxyTask", flowType:"playground"});
					tasks.push({className:"MapPayloadTask", fullName: "MapPayloadTask", flowType:"playground"});
					tasks.push({className:"InputTask", fullName: "InputTask", flowType:"playground"});
					tasks.push({className:"ListTask", fullName: "ListTask", flowType:"playground"});					
					tasks.push({className:"MatrixTask", fullName: "MatrixTask", flowType:"playground"});
					tasks.push({className:"GridEditTask", fullName: "GridEditTask", flowType:"playground"});
					tasks.push({className:"DataGridTask", fullName: "DataGridTask", flowType:"playground"});
					tasks.push({className:"RunWasmFlowTask", fullName: "RunWasmFlowTask", flowType:"playground"});

					tasks.push({className:"assign", fullName: "Assign", flowType:"rustflowrunner"});
					tasks.push({className:"operation", fullName: "Operation", flowType:"rustflowrunner"});
					tasks.push({className:"if", fullName: "If", flowType:"rustflowrunner"});
					tasks.push({className:"matrix", fullName: "Matrix", flowType:"rustflowrunner"});
					tasks.push({className:"getParameter", fullName: "GetParameter", flowType:"rustflowrunner"});
					tasks.push({className:"getVariable", fullName: "GetVariable", flowType:"rustflowrunner"});
					tasks.push({className:"setVariable", fullName: "SetVariable", flowType:"rustflowrunner"});
					tasks.push({className:"operationVariable", fullName: "OperationVariable", flowType:"rustflowrunner"});

					//tasks.push({className:"PieChartVisualizer", fullName:"PieChartVisualizer"});
					//tasks.push({className:"LineChartVisualizer", fullName:"LineChartVisualizer"});
				}

				if (taskPlugins) {
					tasks = [...tasks, ...taskPlugins];
				}
				resolve(tasks);
			}).catch((err) => {
				console.log("Flowrunner-canvas couldn't be started because of problem with flowRunner getting default task-plugins");
				reject();
			})
		} else {
			resolve(taskPlugins);
		}
	}).then((resolvedTaskPlugins) => {
		const taskPluginsSortedList = resolvedTaskPlugins.sort((a, b) => {
			if (a.fullName < b.fullName) {
				return -1;
			}
			if (a.fullName > b.fullName) {
				return 1;
			}
			return 0;
		});

		const express = require('express');
		const bodyParser = require('body-parser');
		const app = express();
		const port = !!options && !!options.port ? options.port : 4000;

		app.set('views', path.join(__dirname, '../views'));
		app.set('view engine', 'ejs');
		app.use(express.static(path.join(__dirname, '../lib')));
		app.use(express.static(path.join(__dirname, '../assets')));
		app.use(bodyParser.json());

		let hasLogin = false;
		if (!!options && !!!options.hasLogin) {
			hasLogin = true;
		}
		app.locals.hasLogin = hasLogin;

		app.get('/', (req, res) => res.render('./pages/index'));
		app.get('/ui/:flowId', (req, res) => res.render('./pages/index'));
		app.post('/save-flow', (req, res) => {
			const bodyAsJsonString = JSON.stringify(req.body.flow);

			//const flowFileName = flowFiles[req.query.id].name || flowFiles[0].name;
			console.log(req.query.id);
			const flowFilesFound = flowFiles.filter((flowFile) => {
				return flowFile.id == req.query.id;
			});

			if (flowFilesFound.length == 0) {
				throw new Error("flow not found");
			}

			//const flowFileName = flowFiles[req.query.flow].name || flowFiles[0].name;
			const flowFileName = flowFilesFound[0].fileName;

			fs.writeFileSync(flowFileName, bodyAsJsonString);
			console.log("Flow file written to:", flowFileName);
			res.send(JSON.stringify({ status: true }));

			if (!!options && !!options.flowFileCopies) {
				options.flowFileCopies.map((flowFileCopy) => {
					fs.writeFileSync(flowFileCopy, bodyAsJsonString);
					console.log("Flow file copied to:", flowFileCopy);
				});
			}
		});


		app.get('/get-flows', (req, res) => {			
			res.send(flowFiles);
		});

		app.get('/flow', (req, res) => {
			const flowFilesFound = flowFiles.filter((flowFile) => {
				return flowFile.id == req.query.flow;
			});

			if (flowFilesFound.length == 0) {
				throw new Error("flow not found");
			}

			const flowFileName = flowFilesFound[0].fileName;
			var flowPackage = {
				flow: [],
				flowType : flowFilesFound[0].flowType,
				name: path.basename(flowFileName, path.extname(flowFileName))
			};
			try {
				flowPackage.flow = JSON.parse(fs.readFileSync(flowFileName));
			} catch (err) {
				console.log("error in get-flow api: ", err);
			}
			res.send(JSON.stringify(flowPackage));
		}
		);

		/*
		
		structure:

		let presets = {
			"SmallGameOfLiveGridEditTask":[
				{"name":"spaceship1","id":"1111-2222","data":[]},
				{"name":"spaceship2","id":"1111-3333","data":[]},
				{"name":"spaceship3","id":"1111-4444","data":[]}]
		};

		*/

		app.get('/get-presets', (req, res) => {
			let presets = JSON.parse(fs.readFileSync("./presets.json"));		
			let list = [];	
			list = (presets[req.query.nodeName] || []).map((presetItem) => {
				return {
					name: presetItem.name,
					preset: presetItem.preset
				}
			})
			res.send(JSON.stringify({data:list}));
		});
		app.get('/get-preset', (req, res) => {			
			let presets = JSON.parse(fs.readFileSync("./presets.json"));
			let foundPresets = (presets[req.query.nodeName] || []).filter((presetItem) => {
				return presetItem.preset == req.query.preset;
			});
			if (foundPresets.length > 0) {
				res.send(JSON.stringify(foundPresets[0]));
			} else {
				res.send(JSON.stringify({}));
			}
		});
		app.post('/save-preset', (req, res) => {
			let presets = JSON.parse(fs.readFileSync("./presets.json"));			
			presets[req.query.nodeName] = presets[req.query.nodeName] || [];
			let found  = false;
			presets[req.query.nodeName] = presets[req.query.nodeName].map((presetItem, index) => {
				if (presetItem.preset == req.query.preset) {
					found = true;
					presetItem.data = JSON.stringify(req.body.data);
				}
				return presetItem;
			});
			if (!found) {
				presets[req.query.nodeName].push({
					data: JSON.stringify(req.body.data),
					preset: req.query.preset,
					name: req.query.nodeName
				});
			}			
			fs.writeFileSync("./presets.json",JSON.stringify(presets));
			res.send(JSON.stringify({}));
		});


		app.get('/tasks', (req, res) => {
			res.send(JSON.stringify(taskPluginsSortedList));
		});

		app.post('/save-editor-state', (req, res) => {
			const bodyAsJsonString = JSON.stringify(req.body.state);

			fs.writeFileSync("./canvas-state.json", bodyAsJsonString);
			res.send(JSON.stringify({ status: true }));
		});

		app.post('/api/login', (req, res) => {
			//const bodyAsJsonString = JSON.stringify(req.body);

			res.send(JSON.stringify({ hasAuthenticated: true, hasAuthorized: true, jwt: "dummy" }));
		});

		app.get('/get-editor-state', (req, res) => {
			var editorState = JSON.stringify({});
			try {
				editorState = fs.readFileSync("./canvas-state.json").toString();
			} catch (err) {
				console.log("error in get-editor-state api: ", err);
			}
			res.send(editorState);
		});

		app.post('/flow', (req, res) => {
			if (flowsFileName == "") {
				throw new Error("no flows-file specified");
			}
			let newId = -1;			
			flowFiles.map((flowFile) => {
				if (flowFile.id > newId) {
					newId = flowFile.id;
				}
			});
			
			newId++;
			const fileName = "./data/" + req.query.flow + ".json";
			flowFiles.push({
				id: newId,
				name: req.query.flow,
				fileName:fileName,
				flowType: req.query.flowType || "playground"
			});

			fs.writeFileSync(fileName, "[]");
			fs.writeFileSync(flowsFileName, JSON.stringify(flowFiles));

			res.send(JSON.stringify({ status: true, id: newId }));
		});

		app.all('/api/proxy', (req, res) => {
			fetch(req.body.url, {
				method: req.body.httpMethod	|| "get"
			}).then((response) => {
			
				// TODO make this configurable and also check non-happy path
				return response.json();
				
			}).then(json => {
				console.log("api proxy", json);
				res.send(json);
			})
			
		});

		app.get('/api/taskdoc/:taskname', (request, response) => {
			
			if (!request.params.taskname) {
				response.send(JSON.stringify({
					"content":"",
					"taskname":""
				}));
				return;
			}

			var taskname = request.params.taskname;
			response.send(JSON.stringify({
				"content":"Task documentation",
				"taskname":taskname
			}));
		});		

		app.listen(port, () => console.log(`FlowCanvas web-app listening on port ${port}!`));
	});

	return intializeMetadataPromise;
}

module.exports = {
	start: start
}