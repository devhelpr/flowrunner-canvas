const fs = require('fs');

function start(flowPackage, metaDataFile) {

	const express = require('express');
	const bodyParser = require('body-parser');
	const app = express();
	const port = 4000;

	app.set('view engine', 'ejs');
	app.use(express.static('lib'));
	app.use(bodyParser.json());
	
	app.get('/', (req, res) => res.render('pages/index'));
	app.post('/save-flow', (req, res) => {

		fs.writeFileSync('./data/stored-flow.json', JSON.stringify(req.body));
		res.send(JSON.stringify({status:true}));
	});

	app.get('/get-flow', (req, res) => {
			var flowPackage = fs.readFileSync('./data/stored-flow.json').toString();

			res.send(flowPackage);
		}
	);

	app.listen(port, () => console.log(`FlowStudio app listening on port ${port}!`))
}

module.exports = {
	start: start
}