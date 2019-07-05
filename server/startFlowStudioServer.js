function start() {

	const express = require('express');
	const app = express();
	const port = 4000;

	app.set('view engine', 'ejs');
	app.use(express.static('lib'));
	
	app.get('/', (req, res) => res.render('pages/index'));

	app.listen(port, () => console.log(`Example app listening on port ${port}!`))
}

module.exports = {
	start: start
}