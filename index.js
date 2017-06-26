var express = require('express');
var app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());

const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const url = 'mongodb://localhost:27017/notebook';

const port = process.env.PORT || 3000;
let collection;

MongoClient.connect(url, (err, db) => {
	if(err) {
		console.log('Connection failed: ', err);
	} else {
		collection = db.collection('contacts');
		console.log('Connected: ', url);
	}
});

app.listen(port, () => {
	console.log('Server enabled on port ' + port);
	});

app.get('/contacts', (req, res) => {
	getContacts()
		.then(contacts => res.type('json').json(contacts))
		.catch(err => {res.status(500).send(err)});
});

app.post('/contacts', (req, res) => {
	switch (req.body.action) {
		case 'create':
			createContact({ 
				name: req.body.name,
				lastname: req.body.lastname,
				phone: req.body.phone
			})
				.then((result) => {res.type('json').send(result)})
				.catch(err => {res.status(500).send(err)});
			break;
		case 'find':
			findContact(req.body.filter)
				.then((result) => {res.type('json').send(result)})
				.catch(err => {res.status(500).send(err)});
			break;
	}
});

app.put('/contacts', (req,res) => {
	updateContact(req.body.filter, req.body.newInfo)
		.then((result) => {res.type('json').send(result)})
		.catch(err => {res.status(500).send(err)});
});

app.delete('/contacts', (req,res) => {
	deleteContact(req.body)
		.then((result) => {res.type('json').send(result)})
		.catch(err => {res.status(500).send(err)});
});

function getContacts() {
	return new Promise((done, fail) => {
		collection.find().toArray((err, result) => {
			if (err) {
				fail(err);
			} else {
				done(result);
			}
		});
	});
}

function createContact(data) {
	return new Promise((done, fail) => {
		collection.insert(data, (err, result) => {
			if (err) {
				fail(err);
			} else {
				done(result.ops);
			}
		});
	});
}

function findContact(filter) {
	return new Promise((done, fail) => {
		collection.find(filter).toArray((err, result) => {
			if (err) {
				fail(err);
			} else {
				done(result);
			}
		});
	});
}

function updateContact(filter, newInfo) {
	return new Promise((done, fail) => {
		collection.updateOne(filter, {'$set': newInfo}, (err, result) => {
			if (err) {
				fail(err);
			} else {
				done(result);
			}
		});
	});
}

function deleteContact(data) {
	return new Promise((done, fail) => {
		collection.remove(data, (err, result) => {
			if (err) {
				fail(err);
			} else {
				done(result);
			}
		});
	});
}
