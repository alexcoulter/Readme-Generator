//makes sure necessary npm packages can be used
const inquirer = require("inquirer");
const fs = require("fs");
const axios = require("axios");
var email;
var userImgLink;
//Github Token is us to access email from the Github API
//I removed mine before pushing for security reasons
const token = '';
const config = {
  headers: { 'Authorization': `token ${token}` }
}

//Asks the user questions from the command line
inquirer
  .prompt([
    {
      type: "input",
      message: "What is your Github Username?",
      name: "username"
    },
    {
      type: "input",
      message: "What is your Project's title?",
      name: "projectTitle"
    },
    {
      type: "input",
      message: "What version is this?",
      name: "version",
      default: "1.0"
    },
    {
      type: "input",
      message: "Write a description of your project:",
      name: "description"
    },

    {
      type: "input",
      message: "How do you install this project?",
      name: "install",
      default: "npm install"
    },
    {
      type: "input",
      message: "How can this project be used?",
      name: "usage"
    },
    {
      type: "input",
      message: "How do you test this project?",
      name: "test",
      default: "npm run test"
    },
    {
      type: "input",
      message: "How would someone contribute to this project?",
      name: "contributing"
    },
    {
      type: "list",
      message: "What license do you want to use?",
      choices: ["Apache_2.0", "GNU_GPL_v3", "MIT", "None"],
      name: "license",
    }
  ])
  //waits for the user to answer questions then uses those answers to make a Github API call
  .then(function (response) {
    axios
      .get(`https://api.github.com/users/${response.username}`, config)
      .then(function (res) {

        email = `* Email: ${res.data.email}  \n`;
        userImgLink = `<div align="center"><img  alt="user image" src= "${res.data.avatar_url}" width="200px" /></div>`;
        userImgLink = `* User Image: \n \n${userImgLink}`;
      })
      //Used for error handling
      .catch(function (error) {
        console.log("couldn't find that username on Github!");
        // console.log(error);
        userImgLink = "";
        email = "";
      })
      //waits for the api call to finish and then formats the responses needed to write readme file
      .then(function () {
        const title = response.projectTitle;
        const description = response.description;

        //Creates links depending on which license was selected
        let license = `This project uses the ${response.license} license.  To find more information about this license follow this link:`;
        if (response.license === "Apache_2.0") {
          license = `${license} https://www.apache.org/licenses/LICENSE-2.0`;
        }
        else if (response.license === "GNU_GPL_v3") {
          license = `${license} https://www.gnu.org/licenses/gpl-3.0.en.html`;
        }
        else if (response.license === "MIT") {
          license = `${license} https://opensource.org/licenses/MIT`;
        }
        else if (response.license === "None") {
          license = "This project has not been licensed."
        }
        //creates license badge
        if (response.license) {
          var licenseBadge = `[![license type](https://img.shields.io/badge/License-${response.license}-yellow)](#License)`;
        }
        else {
          licenseBadge = "";
        }
        //if the user inputs nothing or blank spaces then we don't create a badge for version #
        if (response.version.length === 0 || !response.version.trim()) {
          versionBadge = " ";
        }
        //Else Creates version badge
        else {
          trimVersion = response.version.trim();
          var versionBadge = "![version #](https://img.shields.io/badge/Version-" + trimVersion + "-blue)";
        }

        //Creates a readme.md with all of our relevant information
        const stream = fs.createWriteStream("README.md");
        stream.once('open', function (fd) {
          stream.write(`# ${title} \n`);
          stream.write(`${licenseBadge} \t ${versionBadge} \t ![Node.js](https://img.shields.io/badge/Built_with-Node.js-green) \n`);
          stream.write(`## Table of Contents  \n***\n  `);
          stream.write(`* [Description](#Description)\n`);
          stream.write(`* [Installation](#Installation)\n`);
          stream.write(`* [Usage](#Usage)\n`);
          stream.write(`* [Testing](#Testing)\n`);
          stream.write(`* [License](#License)\n`);
          stream.write(`* [Contributing](#Contributing)\n`);
          stream.write(`* [Questions](#Questions)\n`);
          stream.write(`## Description  \n***\n  `);
          stream.write(`* ${description} \n \n`);
          stream.write(`## Installation  \n***\n  `);
          stream.write(`* ${response.install} \n \n`);
          stream.write(`## Usage  \n***\n  `);
          stream.write(`* ${response.usage} \n \n`)
          stream.write(`## Testing  \n***\n  `);
          stream.write(`* ${response.test} \n \n`)
          stream.write(`## License  \n***\n  `);
          stream.write(`* ${license} \n \n`)
          stream.write(`## Contributing  \n***\n  `);
          stream.write(`* ${response.contributing} \n \n`)
          stream.write(`## Questions  \n***\n  `);
          stream.write(`If you have any questions feel free to contact me: \n\n  `);
          stream.write(`* Github Username: ${response.username} \n `)
          stream.write(`* Github Link: https://github.com/${response.username} \n `)
          stream.write(`${email}`);
          stream.write(`${userImgLink}`);
          stream.end();
          console.log("Readme.md for your project has been created!");
        });
      })
  });

