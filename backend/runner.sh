#!/bin/bash

# Save code and input from environment variables
echo "$CODE" > Main.java
echo "$INPUT" > input.txt

# Compile the Java code
javac Main.java 2> compile_error.txt
if [ $? -ne 0 ]; then
  echo "Compilation Error:"
  cat compile_error.txt
  exit 1
fi

# Run the Java program with input
output=$(timeout 5 java Main < input.txt)
echo "$output"
