const mongoose = require('mongoose');
const Problem = require('./models/problem'); // adjust path if needed

async function updateFunctionSignature() {
  await mongoose.connect('mongodb://localhost:27017/yourDatabaseName');

  const problemId = 'YOUR_PROBLEM_ID'; // Replace with actual problem id
  const signature = 'int add(int a, int b)';

  await Problem.updateOne(
    { _id: problemId },
    { $set: { functionSignature: signature } }
  );

  console.log('Function signature updated');
  mongoose.disconnect();
}

updateFunctionSignature().catch(console.error);
