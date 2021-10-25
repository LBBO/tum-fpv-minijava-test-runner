# TUM FPV MiniJava Test runner library
This library allows you to run automatic tests on your FPV MiniJava Programs.

First, you'll have to install Deno by following the instructions [here](https://deno.land/manual@v1.15.2/getting_started/installation). You'll also need to have [Docker](https://docs.docker.com/get-docker/) installed.

Next, you create a `test.ts` file in your homework assignment's git repo. You can change the file name, but make sure it name follows [these specifications](https://deno.land/manual/testing). Optionally, you can set up editor support in VS Code as described [here](https://deno.land/manual@v1.15.2/getting_started/setup_your_environment#visual-studio-code). Next, copy the contents from the [`example.ts`](https://github.com/LBBO/tum-fpv-minijava-test-runner/blob/main/example.ts) and paste them into your `test.ts`.

Write as many tests as you'd like. A test consists of a name that should be unique and describes what the test covers, an array of integers that are given to your MiniJava program (= calls to `read()`), and an array of outputs (= calls to `write()` in your program).

You can now execute your tests by running `deno test --allow-run test.ts`. The `--allow-run` flag is needed to run your minijava program.
