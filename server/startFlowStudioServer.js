const fs = require('fs');
const path = require('path');
function start(flowFileName, metaDataJson) {

	const express = require('express');
	const bodyParser = require('body-parser');
	const app = express();
	const port = 4000;

	app.set('views', path.join(__dirname, '../views'));
	app.set('view engine', 'ejs');
	app.use(express.static(path.join(__dirname, '../lib')));
	app.use(bodyParser.json());
	
	app.get('/', (req, res) => res.render('./pages/index'));
	app.post('/save-flow', (req, res) => {

		fs.writeFileSync(flowFileName, JSON.stringify(req.body));
		res.send(JSON.stringify({status:true}));
	});

	app.get('/get-flow', (req, res) => {
			var flowPackage = fs.readFileSync(flowFileName).toString();

			res.send(flowPackage);
		}
	);

	app.get('/get-tasks', (req, res) => {
		res.send(JSON.stringify(metaDataJson));
	}
);

	app.listen(port, () => console.log(`FlowStudio app listening on port ${port}!`))
}

module.exports = {
	start: start
}