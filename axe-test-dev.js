#!/usr/bin/env node

// To run this script from the command line, use the following command from the root of the project: yarn a11y

const fs = require("fs");
const http = require("http");
const path = require("path");
const os = require("os");

const AxeBuilder = require("@axe-core/webdriverjs");
const PDFDocument = require("pdfkit");
const prompt = require("prompt-sync")({ sigint: true });
const WebDriver = require("selenium-webdriver");
const testFile = new PDFDocument({ font: "Courier" });

let anotherTest = "y";
let urls;
let currentFillColor;
let startTest;

console.clear();

console.log(`


--------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------
------------------------- Welcome to the a11y testing tool! --------------------------
--------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------
------- Note: You must have firefox installed on your machine to run this tool. ------
--------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------


`);

const testName = prompt("What is the name of this test? ");
console.clear();
// create a text file with the test name
const homeDir = os.homedir();
const directory = `${homeDir}/Desktop/a11y-tests`;
const currentDate = new Date();

//format date to mm/dd/yyyyy
const date =
  currentDate.getMonth() +
  1 +
  "/" +
  currentDate.getDate() +
  "/" +
  currentDate.getFullYear();

if (!fs.existsSync(directory)) {
  fs.mkdirSync(directory);
}

testFile.pipe(
  fs.createWriteStream(
    path.join(
      directory,
      `${testName.toLowerCase().replace(/ /g, "_")}-a11y-tests.pdf`
    )
  )
);

testFile.info["Title"] = `${testName} Accessibility Tests`;
testFile.info["Subject"] = "Accessibility Testing Tool";
testFile.lineGap(8);

testFile.fontSize(22);
testFile.text(`${testName.toUpperCase()} Accessibility Tests`, {
  underline: true,
  align: "center",
});
testFile.fontSize(10);
testFile.text(`Date: ${date}`, { align: "center" });

testFile.moveDown(2);

console.log(`

------------------------------------------------------------------
------------------------------------------------------------------
------------------------------------------------------------------
Saving test results to ${testName
  .toLowerCase()
  .replace(/ /g, "_")}_a11y_tests.txt
------------------------------------------------------------------
------------------------------------------------------------------
------------------------------------------------------------------

`);

console.log(
  `------------------------------------------------------------------`
);
console.log(
  `------------------------------------------------------------------`
);
console.log(
  `------------------------------------------------------------------`
);
const liveOrDev = prompt(`Is this a live or dev test? (default: dev) `);
liveOrDev.toLowerCase();
console.clear();

if (liveOrDev === "live") {
  console.log(`
------------------------------------------------------------------
------------------------------------------------------------------
------------------------------------------------------------------
Live test selected
------------------------------------------------------------------
------------------------------------------------------------------
------------------------------------------------------------------

`);

  console.log(
    `------------------------------------------------------------------`
  );
  console.log(
    `------------------------------------------------------------------`
  );
  console.log(
    `------------------------------------------------------------------`
  );
  const enteredUrl = prompt(`What is the url you want to test? `);
  // if the url doesn't start with http, add it
  if (!enteredUrl.startsWith("http")) {
    urls = `http://${enteredUrl}`;
  } else {
    urls = enteredUrl;
  }
  console.clear();
  console.log(`

------------------------------------------------------------------
------------------------------------------------------------------
------------------------------------------------------------------
Using url ${urls}
------------------------------------------------------------------
------------------------------------------------------------------
------------------------------------------------------------------

`);
} else {
  console.log(`
------------------------------------------------------------------
------------------------------------------------------------------
------------------------------------------------------------------
Dev test selected, make sure you have a dev server running
------------------------------------------------------------------
------------------------------------------------------------------
------------------------------------------------------------------

`);

  console.log(
    `------------------------------------------------------------------`
  );
  console.log(
    `------------------------------------------------------------------`
  );
  console.log(
    `------------------------------------------------------------------`
  );
  let whatUrl = prompt(
    `What port is your dev server running on? (default: 3000) `
  );
  console.clear();
  if (whatUrl === "") {
    whatUrl = 3000;
    console.log(`

------------------------------------------------------------------
------------------------------------------------------------------
------------------------------------------------------------------
-------------   Defaulting to port 3000  -------------------------
------------------------------------------------------------------
------------------------------------------------------------------
------------------------------------------------------------------

`);
  } else {
    console.log(`
------------------------------------------------------------------
------------------------------------------------------------------
------------------------------------------------------------------
Using port ${whatUrl}
------------------------------------------------------------------
------------------------------------------------------------------
------------------------------------------------------------------

`);
  }
  urls = `http://localhost:${whatUrl}`;
}

const driver = new WebDriver.Builder().forBrowser("firefox").build();

http
  .get(urls, (res) => {
    if (res.statusCode !== 200) {
      return;
    }
  })
  .on("error", () => {
    console.clear();
    console.error(`


------------------------------------------------------------------
------------------------------------------------------------------
------------------------------------------------------------------
--------  Error: The server is not running or accessible  --------
---  Please make sure your connection is working and try again ---
------------------------------------------------------------------
------------------------------------------------------------------
------------------------------------------------------------------

    `);
    // end the script
    testFile.end();
    driver.quit();
    process.exit(1);
  });

const localHost = driver.get(urls);

console.log(
  `------------------------------------------------------------------`
);
console.log(
  `------------------------------------------------------------------`
);
console.log(
  `------------------------------------------------------------------`
);
let askLevel = prompt(
  `What level of WCAG do you want to test? A, AA, AAA (default: WCAG2AA) `
);
askLevel = askLevel.toUpperCase();
console.clear();
let currentTest;

switch (askLevel) {
  case "A":
    currentTest = new AxeBuilder(driver).withTags(["best-practice", "wcag2a"]);
    break;
  case "AA":
    currentTest = new AxeBuilder(driver).withTags([
      "best-practice",
      "wcag2a",
      "wcag2aa",
    ]);
    break;
  case "AAA":
    currentTest = new AxeBuilder(driver).withTags([
      "best-practice",
      "wcag2a",
      "wcag2aa",
      "wcag2aaa",
    ]);
    break;
  default:
    askLevel = "AA (Default)";
    currentTest = new AxeBuilder(driver).withTags([
      "best-practice",
      "wcag2a",
      "wcag2aa",
    ]);
}

console.log(`

------------------------------------------------------------------
------------------------------------------------------------------
------------------------------------------------------------------
Testing level set to WCAG${askLevel}
------------------------------------------------------------------
------------------------------------------------------------------
------------------------------------------------------------------

`);

function tester() {
  console.log(
    `------------------------------------------------------------------`
  );
  console.log(
    `------------------------------------------------------------------`
  );
  prompt("Navigate to the section you want to test. Press enter when ready. ");
  console.clear();
  console.log(
    `------------------------------------------------------------------`
  );
  console.log(
    `------------------------------------------------------------------`
  );
  let sectionName = prompt("What is the name of the section you are testing? ");
  console.log(
    `------------------------------------------------------------------`
  );
  console.log(
    `------------------------------------------------------------------`
  );
  startTest = prompt(
    'Press enter to start the test... (type "q" to choose a different section.) '
  );
  if (startTest === "q") {
    console.clear();
    return;
  }
  console.clear();
  console.log(`

------------------------------------------------------------------
------------------------------------------------------------------
------------------------------------------------------------------
Running tests on ${sectionName}...
------------------------------------------------------------------
------------------------------------------------------------------
------------------------------------------------------------------

`);
  testFile.fontSize(16);

  testFile.text(`Test results for ${sectionName.toUpperCase()}`, {
    underline: true,
    align: "center",
  });

  testFile.moveDown();

  return new Promise((res, rej) => {
    if (rej) {
      console.error(rej);
    }
    localHost.then(() => {
      currentTest.analyze((err, results) => {
        if (err) {
          console.error(err);
          return;
        }
        const result = results.violations;

        if (result[0] === undefined) {
          testFile.text(
            `--- No violations found on ${sectionName.toUpperCase()} ---`
          );
          res();
        } else {
          let violationCount = 1;
          result.forEach((violation) => {
            testFile.fontSize(12);
            testFile.fillColor("red").text(`Violation #${violationCount}\n`);
            violationCount++;
            testFile.fillColor("black");
            testFile.fontSize(14);
            const violationDesc = violation.nodes[0].failureSummary
              .substring(27)
              .replace(/ {2}/g, "")
              .trim();
            testFile.text(`${violationDesc}\n\n`, { underline: true });
            testFile.fontSize(12);
            testFile.text(`Location:`);
            testFile.text(`${violation.nodes[0].html}\n\n`, {
              lineGap: 5,
            });
            testFile.fontSize(10);
            testFile.text(`How to fix: ${violation.help}\n`);
            const violationImpact = violation.impact;
            switch (violationImpact) {
              case "critical":
                currentFillColor = `red`;
                break;
              case "serious":
                currentFillColor = "orange";
                break;
              case "moderate":
                currentFillColor = "green";
                break;
              default:
                currentFillColor = "blue";
            }
            testFile
              .text(`Impact: `, { continued: true })
              .fillColor(currentFillColor)
              .text(`${violationImpact}\n`);
            testFile.fillColor("black");
            let violationTags = violation.tags;
            violationTags = violationTags.slice(1);
            if (violationTags.length > 1) {
              violationTags = violationTags.join(", ");
            }
            testFile.text(`WCAG Violations: ${violationTags}\n`);

            testFile.fillColor("green").text(`Helpful Documentation Link\n\n`, {
              link: violation.helpUrl,
              underline: true,
            });
            testFile.fontSize(12);
            testFile.fillColor("black");
            testFile.moveDown();
          });
          res();
        }
      });
    });
  });
}

setTimeout(() => {
  (async function () {
    while (anotherTest === "y") {
      console.clear();
      try {
        await tester();
      } catch (err) {
        console.error(`error: ${err}`);
      }
      console.clear();
      if (startTest !== "q") {
        console.log(`

------------------------------------------------------------------
------------------------------------------------------------------
------------------------------------------------------------------
----------------------   Test complete!   ------------------------
------------------------------------------------------------------
------------------------------------------------------------------
------------------------------------------------------------------

            `);
      }
      anotherTest = prompt("Do you want to run another test? (y/n) ");
      anotherTest = anotherTest.toLowerCase();
      console.clear();

      // check if the user entered anything other than y or n
      while (anotherTest !== "y" && anotherTest !== "n") {
        console.log(`

------------------------------------------------------------------
------------------------------------------------------------------
------------------------------------------------------------------
-------------   Please enter "y" or "n"  -------------------------
------------------------------------------------------------------
------------------------------------------------------------------
------------------------------------------------------------------

`);
        console.log(
          `------------------------------------------------------------------`
        );
        console.log(
          `------------------------------------------------------------------`
        );
        anotherTest = prompt("Do you want to run another test? (y/n) ");
        anotherTest = anotherTest.toLowerCase();
        console.clear();
      }
    }
    console.clear();
    console.log(`

------------------------------------------------------------------
------------------------------------------------------------------
------------------------------------------------------------------
----------------------   Test complete!   ------------------------
------------------------------------------------------------------
------------------------------------------------------------------
-------------  Thanks for using the a11y test tool! --------------
------------------------------------------------------------------
------------------------------------------------------------------
------------------------------------------------------------------


Test results saved to ${testName
      .toLowerCase()
      .replace(/ /g, "_")}_a11y_tests.txt...



`);
    testFile.end();
    driver.quit();
  })();
}, 5000);

