const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const toDoList = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  dueDate: {
    type: Date,
    default: null
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ToDoUserRegistration', // foreign key to your user model
    required: true
  },
  tags: {
    type: [String],
    default: []
  },
  deleted: {
    type: Boolean,
    default: false // soft-delete
  }
}, {
  timestamps: true // adds createdAt and updatedAt
});

const toDoListModel = mongoose.model('toDoList',toDoList);

module.exports = {
  toDoListModel : toDoListModel
}