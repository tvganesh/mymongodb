/**************************************************************************************************
 * 
 * IBM Bluemix app with Mongodb service using Node.js
 * Name: Tinniam V Ganesh                                               Date:27 Jul 2014
 * 
 */

// Obtain the mongodb interface from VCAP_SERVICES
var mongodb = require('mongodb');
if (process.env.VCAP_SERVICES) {
  var env = JSON.parse(process.env.VCAP_SERVICES);
  if (env['mongodb-2.2']) {
	var mongo = env['mongodb-2.2'][0]['credentials'];
  }
} else {
	   var mongo = {
	      "username" : "user1",
	      "password" : "secret",
	      "url" : "mongodb://user1:secret@localhost:27017/test"
 }
}

// Callback function
var mycallback = function(err,results) {
    console.log("mycallback");
    if(err) throw err;
};

//Insert records into the books DB
var insert_records = function(req, res) {
 var MongoClient = require('mongodb').MongoClient;
 // Connect to the db
 MongoClient.connect (mongo.url, function(err, db)   {
  if(!err) {
    console.log("We are connected to DB");
  }
  else {
	  console.dir(err);
  }
     //Create a collection test
   console.log("Creating a collection books");
   var collection = db.collection('books', function(err, collection) {
	   if(err) {
		   console.log("Could not create collection");
	   }
	   else{
		   console.log("Collection created");
	   }
   //Create a set of documents to insert
   var book1 = { book: "The Firm", author: "John Grisham", qty: 3 };
   var book2 = { book: "Foundation", author: "Isaac Asimov", qty: 5 };
   var book3 = { book: "Fountainhead", author: "Ayn Rand", qty: 8 };
   var book4 = {book:"Animal Farm", author:"James Orwell",qty:4};
   var book5 = {book:"The Da Vinci Code", author:"Dan Brown",qty:10};

   collection.remove(mycallback);
   //Insert the books
   console.log("Insert the books");
   collection.insert(book1,function(err,result){});
   collection.insert(book2, {w:1}, function(err, result) {
	   if(err) {
	          console.log(err.stack);
	       }
	   else {
		   console.log("inserted successfully");
	   }
   });
   collection.insert(book3, {safe:true}, function(err, result) {
	  if(err) {
		  console.log(err.stack);
	  }
   });
  collection.insert(book4,{w:1},function(err,result) {
      if(err) {
          console.log(err.stack);
       }
      else {
    	  console.log("Inserted successfully");
      }
    });
  
   collection.insert(book5, {w:1}, function(err, result) {});
   console.log('Inserted 5 books');
   
   }); //var collection
  }); // End MongoClient.connect
 // Send HTML response back
 res.writeHead(200, {'Content-Type': 'text/plain'});
 res.write("2 records is inserted");
 res.end();
}; // End insert_records


// Update records in the books DB
var update_records = function(req, res) {
	var MongoClient = require('mongodb').MongoClient;
	MongoClient.connect (mongo.url, function(err, db)   {
		  if(!err) {
		    console.log("We are connected to DB");
		  }
		  else {
			  console.dir(err);
		  }
         // Update 
		 var collection = db.collection('books', function(err, collection) {
			 collection.update({book:"Fountainhead"},{$set:{qty:2}},   {w:1},function(err,result) {});
			 collection.update({book:"Animal Farm"},{$set:{author:"George Orwell"}},   {w:1},function(err,result) {});
			 console.log("Updated 2 books");
			 
		 }); // var collection
    }); //End MongoClient.connect
	res.writeHead(200, {'Content-Type': 'text/plain'});
 	res.write("Updated 2 records");
 	res.end();

}; //End update-records

//Delete records from the books DB
var delete_record = function(req, res) {
	var MongoClient = require('mongodb').MongoClient;
	MongoClient.connect (mongo.url, function(err, db)   {
		  if(!err) {
		    console.log("We are connected to DB");
		  }
		  else {
			  console.dir(err);
		  }
		  //Deleting documents
		  var collection = db.collection('books', function(err, collection) {
			  console.log("The delete operation");
			  collection.remove({book:"Foundation"},mycallback); 
			  collection.remove({book:"The Da Vinci Code"},{w:1},mycallback); 
			  console.log('Deleted 2 books');
			  
		  });
	}); //End MongoClient.connect
	res.writeHead(200, {'Content-Type': 'text/plain'});
 	res.write("Deleted 2 records");
 	res.end();
}; //End delete-records


// List Records from the books DB
var list_records = function(req, res) {
	var MongoClient = require('mongodb').MongoClient;
	MongoClient.connect (mongo.url, function(err, db)   {
		  if(!err) {
		    console.log("We are connected to DB");
		  }
		  else {
			  console.dir(err);
		  }
		  console.log('In Display');
		  //Retrieve documents
		  var collection = db.collection('books', function(err, collection) {
			  var stream = collection.find().stream();
			  console.log("Printing values...");
			  res.writeHead(200, {'Content-Type': 'text/plain'});
			  stream.on('error', function (err) {
				  console.error(err.stack)
			  });
			  
			  stream.on("data", function(item) {
				  console.log(item);
				  res.write(JSON.stringify(item) + "\n");	
			  });
			 
			  stream.on("end", function() {
				  console.log("End");		    
				  res.end();
				});
			  
  
		  }); //var collection
	}); //End MongoClient.connect
	
 }

var port = (process.env.VCAP_APP_PORT || 1337);
var host = (process.env.VCAP_APP_HOST || '0.0.0.0');

// Create a Webserver and wait for REST API CRUD calls
require('http').createServer(function(req, res) {
  if ( typeof mongodb !== 'undefined' && mongodb ) {
	// Perform CRUD operations through REST APIs
	  if(req.method == 'POST') {
	             insert_records(req,res);
	             
	      }
	      else if(req.method == 'GET') {
	          list_records(req,res);
	      }
	      else if(req.method == 'PUT') {
	          update_records(req,res);
	      }
	      else if(req.method == 'DELETE') {
	          delete_record(req,res);
	      }
  } else {
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.write("No MongoDB service instance is bound.\n");
	  res.end();
  }
}).listen(port, host);
console.log("Connected to port =" + port + " host =  " + host);