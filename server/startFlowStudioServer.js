const fs = require('fs');
const path = require('path');
function start(flowFileName, metaDataJson, options) {

	const metaDataInfo = metaDataJson.sort((a, b) => {
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
		
		fs.writeFileSync(flowFileName, bodyAsJsonString);
		console.log("Flow file written to:", flowFileName);
		res.send(JSON.stringify({status:true}));

		if (!!options && !!options.flowFileCopies) {
			options.flowFileCopies.map((flowFileCopy) => {
				fs.writeFileSync(flowFileCopy, bodyAsJsonString);
				console.log("Flow file copied to:", flowFileCopy);
			});
		}
	});

	app.get('/get-flow', (req, res) => {
			var flowPackage = fs.readFileSync(flowFileName).toString();

			res.send(flowPackage);
		}
	);

	app.get('/get-tasks', (req, res) => {
		res.send(JSON.stringify(metaDataInfo));
	}
);

	app.listen(port, () => console.log(`FlowCanvas web-app listening on port ${port}!`))
}

module.exports = {
	start: start
}