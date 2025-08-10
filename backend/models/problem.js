const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  input: {
    type: String,
    required: true,
  },
  expectedOutput: {
    type: String,
    required: true,
  },
  isHidden: {
    type: Boolean,
    default: false,
  },
});

const problemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  constraints: { type: String, default: '' },
  sampleInput: { type: String, required: true },
  sampleOutput: { type: String, required: true },
  testCases: {
    type: [testCaseSchema],
    default: [],
  },
  tags: {
    type: [String],
    default: [],
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Problem', problemSchema);
