// Author: Steven Smethurst
// Last Modified: 2023-05-01
// Description: 
// 
// Load a list of elements from a file, one element per line, ask the user to compare two elements, save the results to a file
// if the user has already answered the question, skip it. sort the list of elements based on the answers. Best answers first.
// The elements file is updated after each question is asked with the new sorting order.
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
  if (element1.index == element2.index) { return true; } // Same element
  try {
    var answers = fs.readFileSync(FILE_ANSWERS).toString();
  } catch (e) {
    // If the file doesn't exist then we have not asked this question yet
    return null;
  }

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
  var question = "\n" + questionCount + ") Which is better? \na) (#" + element1.index + ") " + element1.value + "\nb) (#" + element2.index + ") " + element2.value;
  console.log(question);

  // Search the answers file to see if we have already asked this question
  var results = SearchForAnswer(element1, element2);
  if (results != null) {
    console.log("FYI: We have already asked this question. " + (results ? element1.index : element2.index) + " > " + (results ? element2.index : element1.index) + "\n");
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

function swap(array, i, j) {
  if (i == j) { return; }
  console.log("FYI: Swap Idea #" + array[i].index + " (Pos: " + i + ")" + " <=> Idea #" + array[j].index + " (Pos: " + j + ")");

  var temp = array[i];
  array[i] = array[j];
  array[j] = temp;

  WriteSortedElementsToFile(array);
}

// Bubble sort the array, worse case O(n^2), best case O(n)
// This is the easist to implement, but not the most efficient, used it to 
// get the project started
function BubbleSort(array, stopOnFirstSwap = false) {
  var swapped;
  do {
    swapped = false;
    for (var i = 0; i < array.length - 1; i++) {
      questionCount++;
      if (!Question(array[i], array[i + 1])) {
        swap(array, i, i + 1);
        swapped = true;
        console.log("\n");
        if (stopOnFirstSwap) { return array; }
      }
    }
  } while (swapped);
  return array;
}

// HeapSort of the array using swap to change values in the array.
// No memory is allocated, the array is sorted in place.
// Worse case O(n log n)
// Average case O(n log n)
function HeapSort(array) {

  // Build the heap in array so that largest value is at the root
  for (var i = Math.floor(array.length / 2) - 1; i >= 0; i--) {
    Heapify(array, array.length, i);
  }

  // Move the root to the end of the array
  for (var i = array.length - 1; i >= 0; i--) {
    swap(array, 0, i);

    // Heapify the reduced heap
    Heapify(array, i, 0);
  }
  return array;
}

// Heapify the array
// n is the size of the heap
// i is the index of the root
function Heapify(array, n, i) {
  var largest = i; // Initialize largest as root
  var l = 2 * i + 1; // left = 2*i + 1
  var r = 2 * i + 2; // right = 2*i + 2

  // If left child is larger than root
  questionCount++;
  if (l < n && Question(array[largest], array[l])) {
    largest = l;
  }

  // If right child is larger than largest so far
  questionCount++;
  if (r < n && Question(array[largest], array[r])) {
    largest = r;
  }

  // If largest is not root
  if (largest != i) {
    swap(array, i, largest);

    // Recursively heapify the affected sub-tree
    Heapify(array, n, largest);
  }
}

// Average case O(n log n)
// Worse case O(n^2)
function QuickSort(array) {
  return QuickSortRecursive(array, 0, array.length - 1);
}

function QuickSortRecursive(array, low, high) {
  if (low < high) {
    var pi = Partition(array, low, high);
    QuickSortRecursive(array, low, pi - 1);
    QuickSortRecursive(array, pi + 1, high);
  }
  return array;
}

function Partition(array, low, high) {
  var pivot = array[high];
  var i = low - 1;
  for (var j = low; j <= high - 1; j++) {
    questionCount++;
    if (Question(array[j], pivot)) {
      i++;
      swap(array, i, j);
    }
  }
  swap(array, i + 1, high);
  return i + 1;
}


// This is the sorting algorithm to sort the list of elements
// returns the sorted array.
function SortQuestions(array) {
  // return HeapSort(array);
  // return BubbleSort(array);
  return QuickSort(array);
}

function WriteSortedElementsToFile(sorted) {

  var fileoutput = "";
  for (var i = 0; i < sorted.length; i++) {
    fileoutput += sorted[i].index + ") - " + sorted[i].value + "\n";
  }
  fs.writeFileSync(FILE_ELEMENTS, fileoutput);
}

function LoadElmentsFromFile(filename) {
  // Read the elements from a file
  var unsorted = fs.readFileSync(filename).toString().split("\n");

  // Before sorting the list remove empty elements
  for (var i = 0; i < unsorted.length; i++) {
    if (unsorted[i] == "") {
      unsorted.splice(i, 1);
    }
  }

  // The string will have a "{index}) - {value}" format
  // Extract the index and value
  for (var i = 0; i < unsorted.length; i++) {
    var index = unsorted[i].split(") - ")[0].replace("(", "");
    var value = "" + unsorted[i].split(") - ")[1];
    value.trim();

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
// Average case O(n log n)
// Worse case O(n^2)
const elment_count = unsorted.length;
var average_number_of_questions = Math.round(elment_count * Math.log(elment_count));
var worst_number_of_questions = Math.round(elment_count * Math.log2(elment_count));

console.log("You will be asked " + worst_number_of_questions + " questions at most, average of: " + average_number_of_questions);

// Count the number of lines in the answers file
try {
  var answer_count = fs.readFileSync(FILE_ANSWERS).toString().split("\n").length;
  console.log("You have already answered " + answer_count + " questions");
} catch (e) {
  console.log("You have not answered any questions yet");
}


// Because of the way that QuickSort works. 
// If the list is already sorted then the number of questions asked will be the worst case.
// So we try and do a bubble sort first to see if the list is already sorted.
// If it is then we can skip the questions.
var sorted = BubbleSort(unsorted, true);
if (sorted == unsorted) {
  console.log("The list is already sorted");
  console.log("No questions will be asked");
  console.log("Saving sorted list to file: " + FILE_ELEMENTS);
  WriteSortedElementsToFile(sorted);
  return;
}

var sorted = SortQuestions(unsorted);
console.log('Sorted: ', sorted);
console.log("\n\n\n");