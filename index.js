#!/usr/bin/env node

import { spawn } from "child_process";
import fs from "fs";
import { rmSync } from "fs";
import path from "path";
import chalk from "chalk";
import inquirer from "inquirer";
import gradient from "gradient-string";
import figlet from "figlet";
import { createSpinner } from "nanospinner";

// Ctrl+C (SIGINT)
process.on("SIGINT", () => {
  console.log(chalk.redBright.bold("\n Process interrupted (Ctrl+C)"));
  process.exit(0);
});

// Function to run shell commands and handle spinners
const runCommandWithSpinner = (command, args, successMsg, failMsg) => {
  return new Promise((resolve, reject) => {
    const spinner = createSpinner(`${successMsg}...`).start();
    const process = spawn(command, args);

    process.stdout.on("data", () => {}); // Suppress stdout
    process.stderr.on("data", () => {}); // Suppress stderr

    process.on("close", (code) => {
      if (code === 0) {
        spinner.success({ text: successMsg });
        resolve(true);
      } else {
        spinner.error({ text: `${failMsg} (exit code ${code})` });
        resolve(false);
      }
    });
  });
};

console.log(
  chalk.bgGreenBright.bold.black.italic("\n Express Backend Installer v1.0 "),
);
var projectName = process.argv[2];

const askProjectName = async () => {
  try {
    const answer = await inquirer.prompt({
      name: "name",
      type: "input",
      message: "Enter backend project name?",
    });
    return answer.name;
  } catch (error) {
    if (error.isTtyError) {
      console.log(
        chalk.red("Prompt couldn't be rendered in the current environment."),
      );
    } else {
      console.log(chalk.redBright("Prompt was interrupted (Ctrl+C)."));
      process.exit(1);
    }
  }
};

// ASKING USER TO ADD PROJECT NAME (IF NOT PROVIDED)
if (!projectName) {
  const answer = await askProjectName();

  projectName = answer;
}

if (!projectName) {
  console.log(chalk.redBright.bold(`\n Project name can not be empty. \n `));
  process.exit(1);
}

// FILE HANDLING
if (fs.existsSync(`./${projectName}`)) {
  console.log(
    chalk.redBright.bold(
      `\n Fatal Error: Directory with name '${projectName}'. Already exists! \n `,
    ),
  );
  process.exit(1);
}

const gitCheckoutCommand = `git clone https://github.com/jonace-mpelule/the-express-boilerplate.git`;
const installDepedenciesCommand = `npm install`;

// Run the git clone command with spinner
const checkedOut = await runCommandWithSpinner(
  "git",
  [
    "clone",
    "https://github.com/jonace-mpelule/the-express-boilerplate.git",
    projectName,
  ],
  "Repository cloned successfully!",
  `Failed to clone repository`,
);

if (!checkedOut) process.exit(1);
rmSync(`${projectName}/.git`, { recursive: true, force: true });

const updatePackageJsonName = (projectName) => {
  const packageJsonPath = path.join(projectName, "package.json");

  // CHECKING IF `package.json` exists
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

    // UPDATING THE FILE NAME VALUE
    packageJson.name = projectName;

    // Write the changes back to package.json
    fs.writeFileSync(
      packageJsonPath,
      JSON.stringify(packageJson, null, 2),
      "utf-8",
    );
  } else {
  }
};

updatePackageJsonName(projectName);

process.chdir(projectName);

// Change directory and install dependencies
const installDeps = await runCommandWithSpinner(
  "npm",
  ["install"],
  "Finished Installing Dependencies!",
  `Failed to install dependencies`,
);

if (!installDeps) process.exit(1);

var message = "The Next Big Thing!";
figlet(message, (err, data) => {
  console.log(gradient.pastel.multiline(data));
});

console.log(
  chalk.bold(
    "\n  Congratulations 🎉! The project is ready. Follow the following commands to get started. ",
  ),
);

console.log(
  chalk.green.bold(`
  Requirements:
  > Install Docker Desktop (https://www.docker.com/products/docker-desktop/)

  Run:
  > cd ${projectName}
  > npx prisma init (Initiate Prisma ORM: https://www.prisma.io/)
  > docker-compose up --build
  > npm run dev (optional: Testing outside the container.)

  `),
);
