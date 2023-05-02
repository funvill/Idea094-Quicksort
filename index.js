// Author: Steven Smethurst
// Last Modified: 2023-05-01
// Description: 
// 
// Load a list of elements from a file, one element per line, ask the user to compare two elements, save the results to a file
// if the user has already answered the question, skip it. sort the list of elements based on the answers. Best answers first.
// 
// I am using this to rank the ideas from the https://blog.abluestar.com/projects/2023-100-ideas/

const fs = require('fs');
let { input } = require('console-input');

const FILE_ANSWERS = 'answers.txt';
const FILE_ELEMENTS = 'elements.txt';

var questionCount = 1;


// Update a file with the answers to questions. 
// This is used to skip questions that have already been asked
// Format is: "1 vs 2 == 1" or "1 vs 2 == 2" 
function SaveAnswer(answer, element1, element2) {
  fs.appendFileSync(FILE_ANSWERS, element1.index + " vs " + element2.index + " == " + (answer == 'a' ? element1.index : element2.index) + "\n");
  
}

// Search the answers file to see if we have already asked this question
// Format is: "1 vs 2 == 1" or "1 vs 2 == 2"
// Being lazy here, reload the file each time, and search for the 4 different combinations
function SearchForAnswer(element1, element2) {
  var answers = fs.readFileSync(FILE_ANSWERS).toString();

  var a = element1.index + " vs " + element2.index + " == " + element1.index
  var b = element1.index + " vs " + element2.index + " == " + element2.index
  var c = element2.index + " vs " + element1.index + " == " + element1.index
  var d = element2.index + " vs " + element1.index + " == " + element2.index

  if (answers.includes(a) || answers.includes(c)) {
    return true; // Answer is element1 
  } else if (answers.includes(b) || answers.includes(d)) {
    return false; // Answer is element2
  } else {
    return null; // We have not asked this question yet
  }
}

// Ask the user to compare two elements
// The user must enter in "a" or "b" to indicate which element is better
// Return true if element1 is better than element2
function Question(element1, element2) {
  var question = questionCount + ") Which is better? \na) (#" + element1.index + ") " + element1.value + "\nb) (#" + element2.index + ") " + element2.value + "\n";
  console.log(question);

  // Search the answers file to see if we have already asked this question
  var results = SearchForAnswer(element1, element2);
  if (results != null) {
    console.log("FYI: We have already asked this question. " + (results ? element1.index : element2.index) + " > " + (results ? element2.index : element1.index));
    return results;
  }

  var answer = input("> ");
  if (answer == 'a') {
    SaveAnswer(answer, element1, element2);
    return true;
  }
  else if (answer == 'b') {
    SaveAnswer(answer, element1, element2);
    return false;
  }
  else {
    console.log('\n\nERROR [' + answer + '] Please only enter a or b\n\n');
    return Question(element1, element2);
  }
}

// QuickSort is one of the possiable algorithms to sort the list of elements
// https://en.wikipedia.org/wiki/Quicksort
function QuickSort(array) {
  if (array.length <= 1) {
    return array;
  }

  var pivot = array[0];

  var left = [];
  var right = [];

  for (var i = 1; i < array.length; i++) {
    Question(array[i], pivot) ? left.push(array[i]) : right.push(array[i]);
    console.log("\n");
    questionCount++;
  }

  return QuickSort(left).concat(pivot, QuickSort(right));
};

// This is the sorting algorithm to sort the list of elements
// returns the sorted array.
function SortQuestions(array) {
  return QuickSort(array);
}

function WriteSortedElementsToFile(sorted) {
  var file = fs.createWriteStream(FILE_ANSWERS);
  file.on('error', function (err) { /* error handling */ });
  sorted.forEach(function (v) { file.write(v.index + ") - " + v.value + "\n"); });
  file.end();
}

function LoadElmentsFromFile(filename) {
  // Read the elements from a file
  var unsorted = fs.readFileSync(filename).toString().split("\n");

  // Before sorting the list remove empty elements
  for (var i = 0; i < unsorted.length; i++) {
    if (unsorted[i] == "") {
      unsorted.splice(i, 1);
    }

    // Remove any trailing spaces
    unsorted[i] = unsorted[i].trim();
  }

  // The string will have a "{index}) - {value}" format
  // Extract the index and value
  for (var i = 0; i < unsorted.length; i++) {
    var index = unsorted[i].split(") - ")[0].replace("(", "");
    var value = unsorted[i].split(") - ")[1].replace(" - ", "").trim();

    // Strip any non alpha numeric characters
    value = value.replace(/[^a-zA-Z0-9 \-]/g, "");
  
    unsorted[i] = { index: index, value: value };
  }
  return unsorted;
}

console.log("Version: 0.0.0 (2023-05-01)");
console.log("Sorting elements from file: " + FILE_ELEMENTS);
console.log("Saving answers to file: " + FILE_ANSWERS);

var unsorted = LoadElmentsFromFile(FILE_ELEMENTS);

console.log("Unsorted: ", unsorted);

// Tell the users the max amount of questions they will be asked based on QuickSort algorithm 
// Average case: O(n log n)
// Worst case: O(n^2)
const elment_count = unsorted.length;
var average_number_of_questions = Math.round(elment_count * Math.log(elment_count));
var worst_number_of_questions = Math.round(elment_count * Math.log2(elment_count));

console.log("You will be asked " + worst_number_of_questions + " questions at most, average of: " + average_number_of_questions + "\n");

var sorted = SortQuestions(unsorted);
console.log('Sorted: ', sorted);
console.log("\n\n\n");