#!/bin/bash
echo "$1" > main.cpp
g++ main.cpp -o main
echo "$2" | ./main
