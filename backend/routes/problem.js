const express = require("express");
const router = express.Router();
const Problem = require("../models/problem"); // Make sure the model path is correct

// POST /api/problems - Create a new coding problem
router.post('/create', async (req, res) => {
  try {
    const {
      title,
      description,
      difficulty,
      constraints,
      sampleInput,
      sampleOutput,
      testCases,
      tags,
    } = req.body;

    // Validate required fields
    if (!title || !description || !difficulty || !sampleInput || !sampleOutput) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    // Create new problem
    const newProblem = new Problem({
      title,
      description,
      difficulty,
      constraints,
      sampleInput,
      sampleOutput,
      testCases,
      tags,
    });

    await newProblem.save();

    res.status(201).json({ message: 'Problem created successfully', problem: newProblem });
  } catch (error) {
    console.error('Error creating problem:', error);
    res.status(500).json({ error: 'Server error while creating problem' });
  }
});


// GET: Get all problems
router.get('/', async (req, res) => {
  try {
    const problems = await Problem.find().sort({ createdAt: -1 });
    res.json(problems);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch problems' });
  }
});

// GET: Get a single problem by ID
router.get('/:id', async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    res.json(problem);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT: Update problem by ID
router.put('/edit/:id', async (req, res) => {
  try {
    const {
      tags,
      functionSignature,
      ...restFields
    } = req.body;

    // Normalize tags if needed
    const tagsArray = Array.isArray(tags)
      ? tags
      : typeof tags === 'string'
      ? tags.split(',').map(t => t.trim()).filter(t => t !== '')
      : undefined; // undefined means no change if not sent

    const updateData = {
      ...restFields,
    };

    if (tagsArray !== undefined) updateData.tags = tagsArray;
    if (functionSignature !== undefined) updateData.functionSignature = functionSignature;

    const updatedProblem = await Problem.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedProblem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    res.status(200).json({ message: 'Problem updated successfully', updatedProblem });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update problem' });
  }
});

// DELETE: Delete a problem by ID
router.delete('/delete/:id', async (req, res) => {
  try {
    const deletedProblem = await Problem.findByIdAndDelete(req.params.id);
    if (!deletedProblem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    res.json({ message: 'Problem deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete problem' });
  }
});

module.exports = router;
