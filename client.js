const request = require('request');
const open = require('open');
var fs = require('fs');
var json = require('./instructions.json');
var http = require('http');
const program = require('commander');

//set command options: one for large file request, and one for the html samples 
program
  .option('-l, --largefile', 'request large file')
  .option('-h, --html <type>', 'request html sample 1')

//parse the arguments that were typed during execution  
program.parse(process.argv);

//if a '-l' option was typed by the user, make a request for the large file
if (program.largefile) 
{
    request.get('http://localhost:8000/api/v1/largefile/',{encoding: 'binary'}, function (error, response, body) {
        
        var wstream = fs.createWriteStream('output.jpg');
        wstream.write(body, 'binary');
        wstream.end();
        
    });
}

//if a '-h' option was typed by the user along with 'sample 1', make a request for sample1.html
if (program.html === 'sample1') {
    request('http://localhost:8000/api/v1/sample1/', function (error, response, body) {
        console.log(body);
    });
}
//if a '-h' option was typed by the user along with 'sample 2', make a request for sample2.html
else if (program.html === 'sample2') {
    request('http://localhost:8000/api/v1/sample2/', function (error, response, body) {
        console.log(body);
    });
}
 

//-----------------------------------------------------------------------------request the main html page through browser
// request('http://localhost:8000/api/v1/', function (error, response, body) {
//   console.error('error:', error); // Print the error if one occurred
//   console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was receive
// });
// //Open link using default browser
// (async () => {
//     await open('http://localhost:8000/api/v1/');
// })();
//-----------------------------------------------------------------------------------------------------------------------

//Execute the corresponding request command according to the configurations that were set by the instruction.json file
if (json.type === 'company') 
{
    if (json.method === 'POST')
        request.post('http://localhost:8000/api/v1/companies', {form:{title: json.title , description: json.description }})
    
    else if (json.method === 'PUT' ) 
        request.put('http://localhost:8000/api/v1/companies/' + json.idToModify, {form:{title: json.title , description: json.description }})
    
    else if (json.method === 'DELETE' ) 
        request.delete('http://localhost:8000/api/v1/companies/' + json.idToDelete)
    
    else if (json.method === 'GET') {
            

            //perform get request with the native http (standard libray)
            http.get({
                host: 'localhost',
                port: '8000',
                path: '/api/v1/companies/' + json.idToGet 
            }, function(response) {
                var body = '';
                response.on('data', function(d) {
                    body += d;
                    console.log(body);
                });

            });
        }
        else if (json.method === 'GETALL') {
            request('http://localhost:8000/api/v1/companies/', function (error, response, body) {
            console.log(body);
            });
        }

}
else if (json.type === 'employee')
{
    if (json.method === 'POST') 
        request.post('http://localhost:8000/api/v1/new_employee', {form:{name: json.name , username: json.username, password: json.password }})
    
    else if (json.method === 'PUT' ) 
        request.put('http://localhost:8000/api/v1/employees/' + json.idToModify, {form:{name: json.name , username: json.username, password: json.password }})
    
    else if (json.method === 'DELETE' ) 
        request.delete('http://localhost:8000/api/v1/employees/' + json.idToDelete)
    
    else if (json.method === 'GET') {
        request('http://localhost:8000/api/v1/employees/' + json.idToGet, function (error, response, body) {
        console.log(body);
        });
    }
    else if (json.method === 'GETALL') {
        request('http://localhost:8000/api/v1/employees/', function (error, response, body) {
        console.log(body);
        });
    }
    
}
