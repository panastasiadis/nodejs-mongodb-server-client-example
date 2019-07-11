import express from 'express';
import bodyParser from 'body-parser';
import db from './dbs/companies_db';
import path from 'path';
import fs from 'fs';

//Require mongodb database
var User = require('./dbs/mongo_db');

//specify port for server to listen
const PORT = 8000;

// Set up the express app
const app = express();

// Parse incoming requests data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


//GET request that retrieves all the companies
app.get('/api/v1/companies', (req, res) => {
  res.status(200).send({
    success: 'true',
    message: 'success',
   	companies: db
  })
});

//puts a new company into database companies
app.post('/api/v1/companies', (req, res) => {

  if(!req.body.title) {
    //when title is not specified for the new company
    return res.status(400).send({
      success: 'false',
      message: 'title is required'
    });
  } else if(!req.body.description) {
    //when description is not specified for the new company
    return res.status(400).send({
      success: 'false',
      message: 'description is required'
    });
  }

  //set new company's sections(id, title, description)
  const company = {
   id: db.length + 1,
   title: req.body.title,
   description: req.body.description
 }

 //store new company to database
 db.push(company);
 return res.status(201).send({
   success: 'true',
   message: 'company added successfully',
   company
 })
});


//request a single company with specific id
app.get('/api/v1/companies/:id', (req, res) => {  

	const id = parseInt(req.params.id, 10);  
	
	db.map((company) => {

    //if given id matches a company's id in database
		if (company.id === id) {     
			return res.status(200).send({        
				success: 'true',        
				message: 'company retrieved successfully',        
				company,      
			});    
		} 

  });
  
  //if no company's id inside db matches the given id
 	return res.status(404).send({   
 		success: 'false',   
 		message: 'company does not exist',  
 	});
});

//delete a company from the database
app.delete('/api/v1/companies/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  db.map((company, index) => {
    if (company.id === id) {

      //match found, delete the company with the given id
       db.splice(index, 1);
       return res.status(200).send({
         success: 'true',
         message: 'company was deleted successfuly',
       });    }
  });

    //no match found, return error message
    return res.status(404).send({
      success: 'false',
      message: 'company not found',
    });

 
});

//request to modify entries of the company with the given id
app.put('/api/v1/companies/:id', (req, res) => {

  const id = parseInt(req.params.id, 10);
  let companyFound;
  let itemIndex;

  db.map((company, index) => {
    
    //search for a match between given id and companies ids
    if (company.id === id) {
      companyFound = company;
      itemIndex = index;
    }
  });

  //if no match found, return error message
  if (!companyFound) {
    return res.status(404).send({
      success: 'false',
      message: 'company not found',
    });
  }

  if (!req.body.title) {

    //if no title was specified, return error message
    return res.status(400).send({
      success: 'false',
      message: 'title is required',
    }); 
  } else if (!req.body.description) {
    
    //if no description was specified, return error message
    return res.status(400).send({
      success: 'false',
      message: 'description is required',
    });
  }

  //if everything was ok, store new values to new var
  const updatedCompany = {
    id: companyFound.id,
    title: req.body.title || companyFound.title,
    description: req.body.description || companyFound.description,
  };

  //update db with the new var
  db.splice(itemIndex, 1, updatedCompany);

  //return success message
  return res.status(201).send({
    success: 'true',
    message: 'company added successfully',
    updatedCompany,
  });
});

//request for html samples1
app.get('/api/v1/sample1', function(req, res) {
    res.sendFile(path.join(__dirname + '/samples/sample1.html'));
});

//request for html samples2
app.get('/api/v1/sample2', function(req, res) {
    res.sendFile(path.join( __dirname + '/samples/sample2.html'));
});



//----------------------------------------------------- Large File Creation
// const file = fs.createWriteStream('./large_file');
// for(let i=0; i<= 1e6; i++) {
//   file.write('Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n');
// }
// file.end();
//-----------------------------------------------------


//initialize streaming for requested file
app.get('/api/v1/largefile', function(req, res) {
  res.set('Content-Type', 'octet-stream')
  const src = fs.createReadStream('./samples/sample_image.jpg');
   src.pipe(res);
});

//add new employee to db
app.post("/api/v1/new_employee", async (request, response) => {
    try {
        var employee = new User(request.body);
        var result = await employee.save();
        response.send(result);
    } catch (error) {
        response.status(500).send(error);
    }
});

//get all employees from db
app.get("/api/v1/employees", async (request, response) => {
    try {
        var result = await User.find().exec();
        response.send(result);
    } catch (error) {
        response.status(500).send(error);
    }
});

//get the employee that has the requested id
app.get("/api/v1/employees/:id", async (request, response) => {
  try {
      var result = await User.findById(request.params.id).exec();
      response.send(result);
  } catch (error) {
      response.status(500).send(error);
  }
});

//modify employee entries for a given id  
app.put("/api/v1/employees/:id", async (request, response) => {
  try {
      var employee = await User.findById(request.params.id).exec();
      employee.set(request.body);
      var result = await employee.save();
      response.send(result);
  } catch (error) {
      response.status(500).send(error);
  }
});

//delete employee whose id matches the given id from db 
app.delete("/api/v1/employees/:id", async (request, response) => {
  try {
      var result = await User.deleteOne({ _id: request.params.id }).exec();
      response.send(result);
  } catch (error) {
      response.status(500).send(error);
  }
});

//Open Home page html
app.get('/api/v1/', function(req, res) {
  res.sendFile(path.join(__dirname + '/samples/index.html'));
});

//Open side page html (Databases)
app.get('/api/v1/dbs', function(req, res) {
  res.sendFile(path.join(__dirname + '/samples/dbs.html'));
});



//listen to port 8000
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
});