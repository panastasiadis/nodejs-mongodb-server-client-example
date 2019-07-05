import mongoose from 'mongoose';

//connect to mongodb database
mongoose.connect('mongodb://localhost/myappdatabase', {useNewUrlParser: true });

var Schema = mongoose.Schema;


// create a schema for a db of employees
var userSchema = new Schema({
  name: String,
  username: { type: String, required: true },
  password: { type: String, required: true },
});

//Connect User var with Schema
var User = mongoose.model('User', userSchema);

module.exports = User;
