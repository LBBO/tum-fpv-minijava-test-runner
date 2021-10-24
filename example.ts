import { runTests, Test } from "https://raw.githubusercontent.com/LBBO/tum-fpv-minijava-test-runner/main/index.ts";

const __dirname = new URL(".", import.meta.url).pathname;

// Change the content of this array!!
const tests: Array<Test> = [
  {
    name: "Description of the first test",
    input: [1, 2],
    expectedResults: [3],
  },
  {
    name: "Description of the second test",
    input: [-1, -2],
    expectedResults: [-3],
  },
];

await runTests(tests, __dirname);
