#!/bin/bash
echo "$1" > Main.java
javac Main.java
echo "$2" | java Main
