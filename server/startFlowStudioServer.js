const fs = require('fs');
const path = require('path');
function start(flowFileName, taskPlugins, options) {

	let flowFiles = [];
	if (typeof flowFileName == "string") {
		flowFiles.push(flowFileName);
	} else {
		flowFiles = flowFileName;
	}

	const intializeMetadataPromise = new Promise((resolve, reject) => {
		if (!taskPlugins) {
			var flowRunner = require('@devhelpr/flowrunner-redux').getFlowEventRunner();
			flowRunner.start({ flow: [] }).then(function (services) {
				let tasks = flowRunner.getTaskMetaData();
				tasks.push({className:"ModelTask", fullName:"Model"});
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
		app.use(bodyParser.json());

		app.get('/', (req, res) => res.render('./pages/index'));
		app.post('/save-flow', (req, res) => {
			const bodyAsJsonString = JSON.stringify(req.body);

			const flowFileName = req.query.flow || flowFiles[0];
			console.log(req.query.flow);

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

		app.get('/get-flow', (req, res) => {
			const flowFileName = req.query.flow || flowFiles[0];
			console.log(req.query.flow);
			var flowPackage = JSON.stringify({
				flow: []
			});
			try {
				flowPackage = fs.readFileSync(flowFileName).toString();
			} catch (err) {
				console.log("error in get-flow api: ", err);
			}
			res.send(flowPackage);
		}
		);

		app.get('/get-tasks', (req, res) => {
			res.send(JSON.stringify(taskPluginsSortedList));
		});

		app.post('/save-editor-state', (req, res) => {
			const bodyAsJsonString = JSON.stringify(req.body);

			fs.writeFileSync("./canvas-state.json", bodyAsJsonString);
			res.send(JSON.stringify({ status: true }));
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

		app.listen(port, () => console.log(`FlowCanvas web-app listening on port ${port}!`));
	});

	return intializeMetadataPromise;
}

module.exports = {
	start: start
}