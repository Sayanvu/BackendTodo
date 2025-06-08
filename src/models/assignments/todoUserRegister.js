const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const toDoUserRegistration = new Schema({
  FirstName: {
    type: String,
    required: true
  },
  LastName: {
    type: String,
    required: true
  },
  Password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  CreatedOn: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});



const toDoUserRegistrationModel = mongoose.model('toDoUserRegistration',toDoUserRegistration);

module.exports = {
  toDoUserRegistrationModel : toDoUserRegistrationModel
}