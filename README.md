# Idea094-Quicksort

Implementation of Idea 094 - Quickest way to rank a list of ideas https://blog.abluestar.com/idea094-quickest-way-to-rank-a-list-of-ideas/

QuickSort is used to sort the elements. It took ~1213 comparisons to sort 94 ideas.

`elements.txt` contains a different idea on each line. Format is `{index}) - {text}`

Example:

```txt
25) - Skull card game
92) - Command line tools as desktop applications
63) - RootedIn
46) - Cherry Blossom Timelapse
30) - Chatbot Journaling
85) - Carved wooden postcards
```

When you answer a question the `answers.txt` will be updated with your answer. This is used if you ever restart the testing to skip already answered questions.

Example:

```txt
9 vs 1 == 9
50 vs 45 == 50
16 vs 45 == 45
17 vs 45 == 45
33 vs 45 == 33
39 vs 45 == 45
34 vs 45 == 34
46 vs 45 == 46
51 vs 45 == 45
77 vs 45 == 77
27 vs 45 == 45
```

Tips:

- If you are updating the `elements.txt` with new items, add them to the bottom. They will get sorted quicker.
- If you think something is ordered incorectly, remove all the rows with that number from the `answer.txt` to reprocess it.

## How to run

```cmd
npm install 
npm run run
```
