const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", "");

const MongoClient = require("mongodb").MongoClient;
MongoClient.connect(
	"mongodb+srv://mongodb:123abc123abc123abc098@basiccluster.kc7cumg.mongodb.net/?retryWrites=true&w=majority",
	{ useUnifiedTopology: true }
).then((client) => {
	console.log("Connected to mongo_database");
	const db = client.db("test_database");
	app.locals.db = db;
});

// Post new users to mongodb database
app.post("/insert-user", function (req, res) {
	const db = req.app.locals.db;
	db.collection("test")
		// .insertOne(req.body)
		.insertMany(req.body)
		.then((result) => {
			return res.json("Success");
		})
		.catch((error) => {
			console.log(error);
		});
});

// Show users from mongodb database
// app.get("/", (req, res) => {
// 	// res.send("Hello");

// 	const db = req.app.locals.db;
// 	db.collection("test")
// 		.find()
// 		.toArray()
// 		.then((results) => res.render("pages/index", { users: results }))
// 		.catch((error) => {
// 			console.log(error);
// 		});
// });

// Show users from mongodb database with comments
app.get("/", (req, res) => {
	// res.send("Hello");

	const db = req.app.locals.db;
	db.collection("test")
		.aggregate([
			{
				$lookup: {
					from: "comments",
					localField: "_id",
					foreignField: "user",
					as: "comments",
				},
			},
		])
		.toArray()
		.then((results) => {
			console.log(results);
			res.render("pages/index", { users: results });
		})
		.catch((error) => {
			console.log(error);
		});
});

// Update user in mongodb database
app.put("/update-user/:id", function (req, res) {
	const db = req.app.locals.db;
	let id = req.params.id;
	// console.log(id);
	const ObjectId = require("mongodb").ObjectId;
	db.collection("test")
		.findOneAndUpdate({ _id: ObjectId(id) }, { $set: { name: req.body.name } })
		.then((result) => {
			res.json("Update successful");
		})
		.catch(() => {
			res.json("Update failed");
		});
});

// Delete user in mongodb database
app.delete("/delete-user/:id", function (req, res) {
	const db = req.app.locals.db;
	let id = req.params.id;
	// console.log(id);
	const ObjectId = require("mongodb").ObjectId;
	db.collection("test")
		.deleteOne({ _id: ObjectId(id) })
		.then((result) => {
			if (result.deletedCount === 0) {
				return res.json("No user to delete");
			}
			return res.json("User deleted");
		})
		.catch(() => {
			return res.json("Delete failed");
		});
});

app.listen(3000);
