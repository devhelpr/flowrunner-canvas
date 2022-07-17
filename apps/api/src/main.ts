/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
 import { readFileSync , writeFileSync, copyFileSync } from 'fs';
 import { join, dirname, basename, extname } from 'path';
 import { fetch } from 'cross-fetch';
 import { v4 } from 'uuid';
 const uuidV4 = v4;

 import { FlowEventRunner } from '@devhelpr/flowrunner';
 import { RouteEndpointTask } from './plugins/route-end-point-task';
 import { SendJsonTask } from './plugins/send-json-task';
 import { ExpressionTask } from './plugins/expression-task';
 import { HtmlViewTask } from './plugins/html-view-task';
 import * as fileUpload from 'express-fileupload';
 import { replaceValues } from './utils/replace-values';
import * as express from 'express';
import { json } from 'body-parser';

declare module 'express' {
  interface Request {
    body: unknown,
    files: unknown,
    query: unknown
  }
}

// this is needed to have the correct location
// for file storage
const getPathToLocalFile = (fileName : string) : string => {
	console.log("getPathToLocalFile", join(process.env.NX_WORKSPACE_ROOT,'/',fileName));
  return join(process.env.NX_WORKSPACE_ROOT,'/',fileName);
}

const app = express();

app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to api!' });
});

let mediaStorage = "";

let secrets = {};
try {
	secrets = JSON.parse(readFileSync("./secrets.json").toString());
} catch(err) {
	secrets = {};
}

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
		const flows = JSON.parse(readFileSync(flowFileName).toString());
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

	let config = {};
	if (!!options && options.config) {
		config = options.config;
	}

	const intializeMetadataPromise = new Promise((resolve, reject) => {
		if (defaultPlugins) {
			let tasks = [];//flowRunner.getTaskMetaData();

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

			// if something is added here .. also check out index.ejs for the storageprovider
			if (isStandalone) {





				tasks.push({className:"assign", fullName: "Assign", flowType:"rustflowrunner"});
				tasks.push({className:"operation", fullName: "Operation", flowType:"rustflowrunner"});
				tasks.push({className:"if", fullName: "If", flowType:"rustflowrunner"});
				tasks.push({className:"matrix", fullName: "Matrix", flowType:"rustflowrunner"});
				tasks.push({className:"getParameter", fullName: "GetParameter", flowType:"rustflowrunner"});
				tasks.push({className:"getVariable", fullName: "GetVariable", flowType:"rustflowrunner"});
				tasks.push({className:"setVariable", fullName: "SetVariable", flowType:"rustflowrunner"});
				tasks.push({className:"operationVariable", fullName: "OperationVariable", flowType:"rustflowrunner"});

				tasks.push({className:"RouteEndpointTask", fullName: "RouteEndpointTask", flowType:"backend"});
				tasks.push({className:"SendJsonTask", fullName: "SendJsonTask", flowType:"backend"});
				tasks.push({className:"HtmlViewTask", fullName: "HtmlViewTask", flowType:"backend"});
				
				tasks.push({className:"AssignTask", fullName: "AssignTask", flowType: "backend"});
				tasks.push({className:"ClearTask", fullName: "ClearTask", flowType: "backend"});
				tasks.push({className:"InjectIntoPayloadTask", fullName: "InjectIntoPayloadTask", flowType: "backend"});
				tasks.push({className:"IfConditionTask", fullName: "IfConditionTask", flowType: "backend"});
				tasks.push({className:"ExpressionTask", fullName: "ExpressionTask", flowType: "backend"});
				
				tasks.push({className:"CustomNodeTask", fullName: "CustomNodeTask", flowType:"backend"});				

				//tasks.push({className:"PieChartVisualizer", fullName:"PieChartVisualizer"});
				//tasks.push({className:"LineChartVisualizer", fullName:"LineChartVisualizer"});
			}

			if (taskPlugins) {
				tasks = [...tasks, ...taskPlugins];
			}
			resolve(tasks);
		} else {
			resolve(taskPlugins);
		}
	}).then((resolvedTaskPlugins) => {
		const taskPluginsSortedList = (resolvedTaskPlugins as any).sort((a, b) => {
			if (a.fullName < b.fullName) {
				return -1;
			}
			if (a.fullName > b.fullName) {
				return 1;
			}
			return 0;
		});

		//const express = require('express');
		//const app = express();
		//const port = !!options && !!options.port ? options.port : 4000;

		app.set('views', join(__dirname, '../views'));
		app.set('view engine', 'ejs');

		if (!options || (!!options && !options.removeLibStaticRoute)) {
			app.use(express.static(join(__dirname, '../bundle')));
		}
		
		app.use(express.static(join(__dirname, '../assets')));
		app.use(express.static(join(__dirname, '../rust')));
		
		if (!!options && options.assetsPath) {
			app.use(express.static(options.assetsPath));
		}

		if (!!options && options.mediaUrl && options.mediaPath) {
			mediaStorage = options.mediaPath;
			app.use(options.mediaUrl, express.static(options.mediaPath));
		}
		
		app.use(fileUpload({
			createParentPath: true
		}));
		app.use(json());

		let hasLogin = false;
		if (!!options && !options.hasLogin) {
			hasLogin = true;
		}
		app.locals.hasLogin = hasLogin;

		/*
    app.get('/', (req, res) => res.render('./pages/index', {
			assetsRootPath: options.assetsRootPath || "/" 
		}));
		app.get('/flow-editor-only', (req, res) => res.render('./pages/flow-editor-only', {
			assetsRootPath: options.assetsRootPath || "/" 
		}));
		app.get('/ui/:flowId', (req, res) => res.render('./pages/ui', {
			assetsRootPath: options.assetsRootPath || "/"
		}));
    */
		app.post('/api/save-flow', (req, res) => {
			const bodyAsJsonString = JSON.stringify(req.body.flow);
			const layoutAsJsonString = JSON.stringify(req.body.layout);

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
			const layoutFileName = dirname(flowFileName) + "/layout-" + basename(flowFileName, extname(flowFileName)) + ".json";

			writeFileSync(getPathToLocalFile("data/"+flowFileName), bodyAsJsonString);
			writeFileSync(getPathToLocalFile("data/"+layoutFileName), layoutAsJsonString);
			console.log("Flow file written to:", flowFileName);
			res.send(JSON.stringify({ status: true }));

			if (!!options && !!options.copyFlowLayoutJsonTo) {
				console.log("copyFlowLayoutJsonTo", options.copyFlowLayoutJsonTo);
				options.copyFlowLayoutJsonTo.map((folderName) => {
					console.log("folderName", folderName);
					const layoutCopyFileName = folderName + "/layout-" + basename(flowFileName, extname(flowFileName)) + ".json";
					const flowCopyFileName = folderName + "/" + basename(flowFileName, extname(flowFileName)) + ".json";
					console.log("flowCopyFileName", flowCopyFileName);
					console.log("layoutCopyFileName", layoutCopyFileName);
					writeFileSync(flowCopyFileName, bodyAsJsonString);
					writeFileSync(layoutCopyFileName, layoutAsJsonString);
				});
			}

			if (!!options && !!options.flowFileCopies) {

				// TODO : flowFileCopies should be list of maps
				// .. and then copy bodyAsJsonString and layoutAsJsonString to that folder
				options.flowFileCopies.map((flowFileCopy) => {
					writeFileSync(flowFileCopy, bodyAsJsonString);
					console.log("Flow file copied to:", flowFileCopy);
				});
			}

			if (req.body.flowType == "backend") {
				// RESET BACKEND FLOW
				setupFlowRouteTable();
			}
		});


		app.get('/api/get-flows', (req, res) => {			
			res.send(flowFiles);
		});

		app.get('/api/get-config', (req, res) => {			
			res.send(JSON.stringify(config));
		});

		const flowRouteHandler = (req, res) => {
			const flowFilesFound = flowFiles.filter((flowFile) => {
				return flowFile.id == req.query.flow;
			});

			if (flowFilesFound.length == 0) {
				throw new Error("flow not found");
			}

			let flowFileName = flowFilesFound[0].fileName;
			flowFileName = basename(flowFileName);
			const layoutFileName = "layout-" + basename(flowFileName);
			
		
      		const flowPackage = {
				flow: [],
				flowType : flowFilesFound[0].flowType,
				layout : {},
				name: basename(flowFileName, extname(flowFileName))
			};

			try {
				flowPackage.layout = JSON.parse(readFileSync(getPathToLocalFile('data/'+layoutFileName)).toString()) || {};
			} catch (err) {
				console.log("error in get-flow api: ", err);
				flowPackage.layout = {};
			}

			try {				
				flowPackage.flow = JSON.parse(readFileSync(getPathToLocalFile('data/'+flowFileName)).toString());
			} catch (err) {
				console.log("error in get-flow api: ", err);
				flowPackage.flow = [];
			}
			res.send(JSON.stringify(flowPackage));
		};

		app.get('/api/flow', flowRouteHandler);
		app.get('/api/flowui', flowRouteHandler);


		const testRouteHandler = (req, res) => {
			const flowFilesFound = flowFiles.filter((flowFile) => {
				return flowFile.id == req.query.flow;
			});

			if (flowFilesFound.length == 0) {
				throw new Error("flow not found");
			}

			const flowFileName = flowFilesFound[0].fileName;
			const testFileName = "/data/test-" + basename(flowFileName, extname(flowFileName)) + ".json";
			
			res.send(JSON.stringify(JSON.parse(readFileSync(getPathToLocalFile(testFileName)).toString())));
		};

		app.get('/test', testRouteHandler);

		/*
		
		structure:

		let presets = {
			"1111-2222-3333-4444" : {
				"SmallGameOfLiveGridEditTask":[
					{"name":"spaceship1","id":"1111-2222","data":[]},
					{"name":"spaceship2","id":"1111-3333","data":[]},
					{"name":"spaceship3","id":"1111-4444","data":[]}]
			}
		};

		*/

		app.get('/api/get-presets', (req, res) => {
			const presets = JSON.parse(readFileSync(getPathToLocalFile("presets.json")).toString());		
			let list = [];
			if (!req.query.flowId || !req.query.nodeName) {
				throw new Error("Required parameters not specified.");
			}
			if (!presets || !presets[req.query.flowId.toString()]) {
				res.send(JSON.stringify({data:[]}));
				return;
			}			
			list = (presets[req.query.flowId.toString()][req.query.nodeName.toString()] || []).map((presetItem) => {
				return {
					name: presetItem.name,
					preset: presetItem.preset
				}
			})
			res.send(JSON.stringify({data:list}));
		});
		app.get('/api/get-preset', (req, res) => {			
			const presets = JSON.parse(readFileSync(getPathToLocalFile("presets.json")).toString());
			if (!req.query.flowId || !req.query.nodeName) {
				throw new Error("Required parameters not specified.");
			}
			if (!presets[req.query.flowId.toString()]) {
				presets[req.query.flowId.toString()] = {};
			}
			const foundPresets = (presets[req.query.flowId.toString()][req.query.nodeName.toString()] || []).filter((presetItem) => {
				return presetItem.preset == req.query.preset;
			});
			if (foundPresets.length > 0) {
				res.send(JSON.stringify(foundPresets[0]));
			} else {
				res.send(JSON.stringify({}));
			}
		});
		app.post('/api/save-preset', (req, res) => {
			const presets = JSON.parse(readFileSync(getPathToLocalFile("presets.json")).toString());
			if (!req.query.flowId || !req.query.nodeName) {
				throw new Error("Required parameters not specified.");
			}
			if (!presets[req.query.flowId.toString()]) {
				presets[req.query.flowId.toString()] = {};
			}			
			presets[req.query.flowId.toString()][req.query.nodeName.toString()] = presets[req.query.flowId.toString()][req.query.nodeName.toString()] || [];
			let found  = false;
			presets[req.query.flowId.toString()][req.query.nodeName.toString()] = presets[req.query.flowId.toString()][req.query.nodeName.toString()].map((presetItem, _index) => {
				if (presetItem.preset == req.query.preset) {
					found = true;
					presetItem.data = JSON.stringify(req.body.data);
				}
				return presetItem;
			});
			if (!found) {
				presets[req.query.flowId.toString()][req.query.nodeName.toString()].push({
					data: JSON.stringify(req.body.data),
					preset: req.query.preset,
					name: req.query.name
				});
			}			
			writeFileSync(getPathToLocalFile("presets.json"),JSON.stringify(presets));
			res.send(JSON.stringify({}));
		});


		app.get('/api/tasks', (req, res) => {
			res.send(JSON.stringify(taskPluginsSortedList));
		});

		app.post('/api/save-editor-state', (req, res) => {
			const bodyAsJsonString = JSON.stringify(req.body.state);

			writeFileSync(getPathToLocalFile("canvas-state.json"), bodyAsJsonString);
			res.send(JSON.stringify({ status: true }));
		});

		app.post('/api/login', (req, res) => {
			//const bodyAsJsonString = JSON.stringify(req.body);

			res.send(JSON.stringify({ hasAuthenticated: true, hasAuthorized: true, jwt: "dummy" }));
		});

		app.get('/api/get-editor-state', (req, res) => {
			let editorState = JSON.stringify({});
			try {
				editorState = readFileSync("./canvas-state.json").toString();
			} catch (err) {
				console.log("error in get-editor-state api: ", err);
			}
			res.send(editorState);
		});

		app.post('/api/flow', (req, res) => {
			if (flowsFileName == "") {
				throw new Error("no flows-file specified");
			}
			
			const newId = uuidV4();
			const fileName = getPathToLocalFile(`data/${req.query.flow}.json`);
			flowFiles.push({
				id: newId,
				name: req.query.flow,
				fileName: `${req.query.flow}.json`,
				flowType: req.query.flowType || "playground"
			});

			if (req.query.addJSONFlow) {
				console.log("nodes", req.body);
				writeFileSync(fileName, JSON.stringify(req.body.nodes));
			} else {
				writeFileSync(fileName, "[]");
			}
			writeFileSync(flowsFileName, JSON.stringify(flowFiles));

			res.send(JSON.stringify({ status: true, id: newId }));
		});

		app.all('/api/proxy', (req, res) => {

			const url = req.body.url;
			const urlWithSecrets = replaceValues(url, secrets);
			fetch(urlWithSecrets, {
				method: req.body.httpMethod	|| "get"
			}).then((response) => {
			
				// TODO make this configurable and also check non-happy path
				return response.json();
				
			}).then(json => {
				console.log("api proxy", json);
				res.send(json);
			}).catch(() => {
				res.send({});
			});
			
		});

		app.get('/api/taskdoc/:taskname', (request, response) => {
			
			if (!request.params.taskname) {
				response.send(JSON.stringify({
					"content":"",
					"taskname":""
				}));
				return;
			}

			const taskname = request.params.taskname;
			response.send(JSON.stringify({
				"content":"Task documentation",
				"taskname":taskname
			}));
		});		

		app.get('/api/managable-entities', (req, res) => {			
			res.send(JSON.stringify([]));
		});	
		
		app.get('/api/modules', (req, res) => {		
			// get modules	
			const modules = JSON.parse(readFileSync(getPathToLocalFile("data/modules/modules.json")).toString());
			res.send(JSON.stringify(modules));
		});	
		app.get('/api/module', (req, res) => {		
			// get module
			if (!req.query.id && !req.query.codeName) {
				res.status(422).send(JSON.stringify({}));
				return;
			}
			let isFound = false;
			const modules = JSON.parse(readFileSync(getPathToLocalFile("data/modules/modules.json")).toString());
			modules.map((module) => {
				if ((
					(req.query.codeName && module.codeName == req.query.codeName) ||
					(req.query.id && module.id == req.query.id))
					&& !isFound) {
					if (module.moduleType == "object-model") {
						const moduleContent = JSON.parse(readFileSync(getPathToLocalFile("data/modules/" + module.fileName)).toString());
						res.send(JSON.stringify({
							...module,
							items:moduleContent
						}));
					} else
					if (module.moduleType == "crud-model") {
						if (module.datasource && module.datasource == "flows") {
							res.send(JSON.stringify({
								...module,
								"fields" : [
									{
										"fieldName": "id",
										"visibilityCondition": "false"
									},
									{
										"fieldName": "name"
									}
								],
								items:flowFiles
							}));
						} else {
							const moduleContent = JSON.parse(readFileSync(getPathToLocalFile("data/modules/" + module.fileName)).toString());
							res.send(JSON.stringify({
								...module,
								items:moduleContent
							}));
						}
					} else {
						res.status(422).send(JSON.stringify({}));
					}
					isFound = true;
					return;
				}
			});
			if (!isFound) {
				res.status(404).send(JSON.stringify({}));
			}
		});	
		app.get('/api/modulecontent', (req, res) => {		
			// get module content item

			let isSend = false;
			if (req.query.moduleId && req.query.id) {
				let isFound = false;
				
				const modules = JSON.parse(readFileSync(getPathToLocalFile("data/modules/modules.json")).toString());
				modules.map((module) => {
					if ((module.id === req.query.moduleId ||
						 module.codeName === req.query.moduleId)
						&& !isFound) {
						isFound = true;
						if (module.moduleType == "crud-model") {
							const moduleContent = JSON.parse(readFileSync(getPathToLocalFile("data/modules/" + module.fileName)).toString());							
							
							console.log("moduleContent", moduleContent);
							if (!isSend && moduleContent && moduleContent.length > 0) {
								moduleContent.forEach((contentItem) => {
									console.log("contentItem", contentItem.id);
									if (contentItem.id === req.query.id) {
										res.send(JSON.stringify(contentItem));
										isSend = true;
									}
								});
							}														
						}
					}
				});
			}

			if (!isSend) {
				res.status(404).send(JSON.stringify({}));
			}
		});
		app.put('/api/modulecontent', (req, res) => {	
			// save/update existing module content item	
			if (req.query.moduleId) {
				let isFound = false;
				let isChanged = false;
				const modules = JSON.parse(readFileSync(getPathToLocalFile("data/modules/modules.json")).toString());
				modules.map((module) => {
					if (module.id == req.query.moduleId && !isFound) {
						isFound = true;

						if (module.moduleType == "object-model") {
							
							const content = JSON.stringify(req.body.data);
							writeFileSync(getPathToLocalFile("data/modules/" + module.fileName), content);

							if (!!options && !!options.copyFlowLayoutJsonTo) {
								console.log("copyFlowLayoutJsonTo", options.copyFlowLayoutJsonTo);
								options.copyFlowLayoutJsonTo.map((folderName) => {
									console.log("folderName", folderName);
									const contentCopyFileName = folderName + "/modules/" + module.fileName;
									console.log("contentCopyFileName", contentCopyFileName);
									writeFileSync(contentCopyFileName, content);
								});
							}

							res.send(JSON.stringify([]));
						} else
						if (module.moduleType == "crud-model") {
							if (module.datasource && module.datasource == "flows") {
								if (req.body.data && !req.body.data.name) {
									res.status(422).send(JSON.stringify([]));
									return;
								}
								let flowIndex = -1;
								flowFiles.map((flow, index) => {
									if (flow.id === req.query.id) {
										flowIndex = index;
									}
								});
								if (flowIndex >= 0) {
									flowFiles[flowIndex].name = req.body.data.name;

									if (typeof flowFileName == "string") {
										writeFileSync(flowFileName, JSON.stringify(flowFiles));
										res.send(JSON.stringify([]));
										isChanged = true;
									}
								}
							} else {
								const moduleContent = JSON.parse(readFileSync(getPathToLocalFile("data/modules/" + module.fileName)).toString());
								moduleContent.map((content, index) => {
									if (content.id == req.query.id) {
										moduleContent[index] = {...req.body.data};
									}
								})
								const content = JSON.stringify(moduleContent);
								writeFileSync(getPathToLocalFile(getPathToLocalFile("data/modules/" + module.fileName)), content);

								if (!!options && !!options.copyFlowLayoutJsonTo) {
									console.log("copyFlowLayoutJsonTo", options.copyFlowLayoutJsonTo);
									options.copyFlowLayoutJsonTo.map((folderName) => {
										console.log("folderName", folderName);
										const contentCopyFileName = folderName + "/modules/" + module.fileName;
										console.log("contentCopyFileName", contentCopyFileName);
										writeFileSync(contentCopyFileName, content);
									});
								}

								res.send(JSON.stringify([]));
							}
						}												
					}
				});
			}				
			setupContentRoutes();
		});
		app.post('/api/modulecontent', (req, res) => {	
			// new module content item
			console.log("post modulecontent", req.query.moduleId);
			if (req.query.moduleId) {
				let isFound = false;
				const modules = JSON.parse(readFileSync(getPathToLocalFile("data/modules/modules.json")).toString());
				modules.map((module) => {
					if ((module.id == req.query.moduleId ||
						 module.codeName === req.query.moduleId 
						) && !isFound) {
						const moduleContent = JSON.parse(readFileSync(getPathToLocalFile("data/modules/" + module.fileName)).toString());
						const newId = uuidV4();
						moduleContent.push({...req.body.data, id: newId});
						console.log("New moduleContent", moduleContent);

						const content = JSON.stringify(moduleContent);
						writeFileSync(getPathToLocalFile("data/modules/" + module.fileName), content);

						if (!!options && !!options.copyFlowLayoutJsonTo) {
							console.log("copyFlowLayoutJsonTo", options.copyFlowLayoutJsonTo);
							options.copyFlowLayoutJsonTo.map((folderName) => {
								console.log("folderName", folderName);
								const contentCopyFileName = folderName + "/modules/" + module.fileName;
								console.log("contentCopyFileName", contentCopyFileName);
								writeFileSync(contentCopyFileName, content);
							});
						}
						isFound = true;
						return;
					}
				});
			}	

			res.send(JSON.stringify([]));
			setupContentRoutes();
		});
		app.delete('/api/modulecontent', (req, res) => {	
			// delete module content item		
			
			if (req.query.moduleId) {
				let isDeteled = false;
				let isFound = false;
				const modules = JSON.parse(readFileSync(getPathToLocalFile("data/modules/modules.json")).toString());
				modules.map((module) => {
					if (module.id == req.query.moduleId && !isFound) {
						if (module.moduleType == "crud-model") {
							if (module.datasource && module.datasource == "flows") {
								let flowIndex = -1;
								flowFiles.map((flow, index) => {
									if (flow.id === req.query.id) {
										flowIndex = index;
									}
								});
								if (flowIndex >= 0) {
									flowFiles.splice(flowIndex, 1);

									if (typeof flowFileName == "string") {
										writeFileSync(flowFileName, JSON.stringify(flowFiles));
										res.send(JSON.stringify([]));
										isDeteled = true;
									}
								}
							} else {
								const moduleContent = JSON.parse(readFileSync(getPathToLocalFile("data/modules/" + module.fileName)).toString());
								let itemIndex = -1;
								moduleContent.map((moduleContent, index) => {
									if (moduleContent.id === req.query.id) {
										itemIndex = index;
									}
								});
								if (itemIndex >= 0) {
									moduleContent.splice(itemIndex, 1);
									writeFileSync(getPathToLocalFile(getPathToLocalFile("data/modules/" + module.fileName)), JSON.stringify(moduleContent));
									res.send(JSON.stringify([]));
									isDeteled = true;
								}
								
							}
						} else {
							res.status(422).send(JSON.stringify({}));
						}
						isFound = true;
						return;
					}
				});
				if (!isDeteled) {
					res.status(404).send(JSON.stringify({}));
				} else {
					setupContentRoutes();
				}
			} else {
				res.status(422).send(JSON.stringify({}));
			}								
		});	
		
		function setupContentRoutes() {
			const routes = app._router.stack;
			
			let wasRemoved = false;

			function removeMiddlewares(route, i, routes) {
				switch (route.handle.name) {
					case 'bound contentRouteHandler': {
						//console.log("removed contentRouteHandler");
						routes.splice(i, 1);
						wasRemoved = true;
					}
				}
				if (route.route)
					route.route.stack.forEach(removeMiddlewares);
			}

			let doLoop = true;
			while (doLoop) {
				routes.forEach(removeMiddlewares);
				doLoop = wasRemoved;
				wasRemoved = false;
			}

			try {
				const modules = JSON.parse(readFileSync(getPathToLocalFile("data/modules/modules.json")).toString());

				const menus = modules.filter((module) => {
					return module.codeName == "menu";
				});
				const menu = menus.length > 0 ? menus[0] : {};
				const menuContent = JSON.parse(readFileSync(getPathToLocalFile("data/modules/"+ menu.fileName)).toString());
				console.log("menu", menuContent);
				modules.map((module) => {
					const urlProperty = module["urlProperty"];
					if (urlProperty && urlProperty != "") {
						const moduleContent = JSON.parse(readFileSync(getPathToLocalFile("data/modules/" + module.fileName)).toString());
						moduleContent.map((moduleContentItem) => {
							app.get(moduleContentItem[urlProperty], function contentRouteHandler (req, res) {	
								let primaryMenu = [];
								Object.keys(menuContent.menus).map((menuKeyName) => {
									
									const menu = menuContent.menus[menuKeyName];
									
									if (menu && menu.codeName == "primaryMenu" && menu.language == moduleContentItem.language) {
										primaryMenu = menu.options || [];
									}
								});
								const primaryMenuOptions = [];
								primaryMenu.map((menuOption) => {
									moduleContent.map((moduleContentItem) => {
										if (menuOption.page === moduleContentItem.id) {
											primaryMenuOptions.push({
												url: moduleContentItem.url || "",
												title: moduleContentItem.title || "",
											});
										}
									});
								});

								res.render('./pages/content', {
									assetsRootPath: options.assetsRootPath || "/",
									id: "",
									url: "",
									title: "",
									subtitle: "",
									intro: "",
									content: "",
									windowtitle: "",
									metadescription: "",
									metakeywords: "",
									primaryMenu: primaryMenuOptions,
									...moduleContentItem 
								});
							}.bind(this));	
						})	
					}					
				});
			} catch (err) {
				console.log(`Exception in setupContentRoutes ${err}`);
			}
		}

		setupContentRoutes();
		
		let flowRoutes = {};
		let flowRunners = {};		

		function setupFlowRouteTable() {
			
			flowRoutes = {};
			flowRunners = {};

			const routes = app._router.stack;
			
			let wasRemoved = false;

			function removeMiddlewares(route, i, routes) {
				switch (route.handle.name) {
					case 'bound routeHandler': {
						//console.log("removed routeHandler");
						routes.splice(i, 1);
						wasRemoved = true;
					}
				}
				if (route.route)
					route.route.stack.forEach(removeMiddlewares);
			}

			let doLoop = true;
			while (doLoop) {
				routes.forEach(removeMiddlewares);
				doLoop = wasRemoved;
				wasRemoved = false;
			}

			const backendFlows = flowFiles.filter((flowFile) => {
				return flowFile.flowType == "backend";
			});

			backendFlows.map((flowFile) => {
				try {
					const flow = JSON.parse(readFileSync(flowFile.fileName).toString());
					if (flow) {
						const runner = new FlowEventRunner();
						flowRunners[flowFile.id] = runner;						

						runner.registerTask('RouteEndpointTask', RouteEndpointTask);
						runner.registerTask('SendJsonTask', SendJsonTask);
						runner.registerTask('ExpressionTask', ExpressionTask);
						runner.registerTask('HtmlViewTask', HtmlViewTask);
								
						/*

							TODO : make endpoints needing authentication
								(user/apiclient/token etc)

						*/

						const services = {
							flowEventRunner: flow,
							pluginClasses: {},
							logMessage: (arg1, arg2) => {
							  //console.log(arg1, arg2);
							},
							// eslint-disable-next-line @typescript-eslint/no-empty-function
							registerModel: (modelName, definition) => {},							
						};

						runner.start({
							flow:flow,
							name: flowFile.fileName,
							id: flowFile.id
						}, services,true,false,false);

						flow.map((node) => {
							if (node.taskType == "RouteEndpointTask") {
								flowRoutes[node.name] = app.get(node.url, function routeHandler (req, res) {			
									runner.executeNode(node.name, {
										...req.query,
										...req.body
									}, {
										response: res,
										request: req
									});
								}.bind(this));	
							}
						});
					}
				} catch (err) {
					console.log(`error in setupFlowRouteTable: ${err}`);
				}
			});
		}
		setupFlowRouteTable();

		app.post('/api/media', (req, res) => {	
			console.log("api media", (req as unknown as any).files);
			const media = (req as unknown as any).files.image;
            try {
            	media.mv('../media/' + media.name, function(err) {
					if (err) {
						return res.status(500).send(err);
					}

					if (mediaStorage) {	
						console.log("copy media to", mediaStorage);			
						copyFileSync('../media/' + media.name, mediaStorage + '/' + media.name);
					}
					
					res.send({
						status: true,
						message: 'File is uploaded',
						data: {
							name: media.name,
							mimetype: media.mimetype,
							size: media.size
						}
					});
				});
				
			} catch (err) {
				console.log("api media error", err);
			}
            //send response
            
		});	

		//app.listen(port, () => console.log(`FlowCanvas web-app listening on port ${port}!`));
	});

	return intializeMetadataPromise;
}

start(getPathToLocalFile('data/flows.json'), 
  [{
    className: "TestCustomConfigTask",
    fullName:"TestCustomConfigTask",
    flowType:"playground",    
    config: {
      presetValues: {
        "hello" : "custom"
      }
    }
  }], 
  {
    hasPreviewPlugin: true,
    isStandalone: true,
    defaultPlugins: true,
    mediaPath: getPathToLocalFile('media'),
    mediaUrl:"/media",
    config: {
      "TestCustomConfigTask": {
        shapeType: "Html",
        htmlPlugin: "formNode",
        presetValues: {
          "test" : "hello config"
        },
        constraints: {
          input: {
            allowedInputs: 1,
            notAllowed: [],
            allowed: []
          },
          output: {
            allowedOutputs: 1,
            notAllowed: [],
            allowed: []
          }
        },
      }
    }
  }).then(() => {

    const port = process.env.port || 3333;
    const server = app.listen(port, () => {
      console.log(`Listening at http://localhost:${port}/api`);
    });
    server.on('error', console.error);

  }).catch((err) => {
    console.log("ERROR when starting express server", err);
  })
