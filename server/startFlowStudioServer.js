const fs = require('fs');

function start(flowPackage, metaDataFile) {

	const express = require('express');
	const app = express();
	const port = 4000;

	app.set('view engine', 'ejs');
	app.use(express.static('lib'));
	
	app.get('/', (req, res) => res.render('pages/index'));
	app.post('/save-node', (req, res) => res.send(JSON.stringify({})));
	app.get('/get-flow', (req, res) => {
			var flowPackage = fs.readFileSync('./data/flow-package.json').toString();

			res.send(flowPackage);
		}
	);

	app.listen(port, () => console.log(`FlowStudio app listening on port ${port}!`))
}

module.exports = {
	start: start
}