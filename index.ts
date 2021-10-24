import { assertEquals } from "https://deno.land/std@0.112.0/testing/asserts.ts";
import { readLines } from "https://deno.land/std@0.104.0/io/mod.ts";
import { writeAll } from "https://deno.land/std@0.104.0/io/util.ts";
const encoder = new TextEncoder();

export type Test = {
  name: string;
  input: number[];
  expectedResults: number[];
};

const runTest = async (
  test: Test,
  outputsPromise: Promise<string[]>,
  writeValueToProgram: (value: unknown) => Promise<void>,
) => {
  // Write all inputs to the program
  for (const value of test.input) {
    await writeValueToProgram(value);
  }
  await writeValueToProgram("");

  // Wait until all outputs have been read
  const outputs = await outputsPromise;
  const outputsAsNumbers = outputs.map((line) => parseInt(line));

  Deno.test({
    name: test.name,
    fn: () => {
      assertEquals(test.expectedResults, outputsAsNumbers);
    },
  });
};

const killProcessAfterTimeout = (process: Deno.Process, duration: number) => {
  setTimeout(() => {
    process.stdin?.close();
  }, duration);
};

const startMinijavaProcess = (__dirname: string) => {
  const minijavaProcess = Deno.run({
    cmd:
      `docker run --rm -i -v ${__dirname}/assignment.minijava:/minijava/assignment.minijava ghcr.io/bottbenj/fpv:minijava`
        .split(" "),

    // Needed to communicate with the minijava program
    stdout: "piped",
    stdin: "piped",
  });
  // Fallback in case a test is written incorrectly
  killProcessAfterTimeout(minijavaProcess, 60 * 1_000);

  const writeValueToProgram = async (value: unknown) => {
    await writeAll(minijavaProcess.stdin, encoder.encode(`${value}\n`));
  };

  return { minijavaProcess, writeValueToProgram };
};

export const runTests = async (tests: Array<Test>, __dirname: string) => {
  const { minijavaProcess, writeValueToProgram } = startMinijavaProcess(__dirname);

  // Save all lines of output until the next "Please enter your inputs" line comes.
  // Those outputs are then passed to the already running test by resolving a promise.
  // This promise has to be created before the test is called and the resolve function
  // is saved until it's called.
  let linesOfCurrentTest: string[] = [];
  let currResolveFunction: ((lines: string[]) => void) | undefined;
  let currTestIndex = 0;
  for await (const line of readLines(minijavaProcess.stdout)) {
    // Start each test once the user is prompted for input
    if (
      line.trim() ===
        "Enter all values you program should read, one per line, followed by an empty line"
    ) {
      // Pass previous outputs to the previous test
      if (currResolveFunction) {
        currResolveFunction(linesOfCurrentTest);
      }
      // Clear the array that caches the outputs
      linesOfCurrentTest = [];

      const currTest = tests[currTestIndex];

      if (currTest) {
        // Create promise that will later be resolved with all generated outputs
        const promise = new Promise<string[]>((resolve) => {
          currResolveFunction = resolve;
        });

        const testPromise = runTest(currTest, promise, writeValueToProgram);

        // If this is the last test, kill the minijava process after it finishes.
        if (currTestIndex >= tests.length - 1) {
          testPromise.then(() => {
            minijavaProcess.stdin.close();
          });
        }
      }

      currTestIndex++;
    } else {
      linesOfCurrentTest.push(line.trim());
    }
  }
};
