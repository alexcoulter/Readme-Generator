const inquirer = require("inquirer");
const fs = require("fs");
const axios = require("axios");
var email;
var userImgLink;
const token = 'a3eeef9c8c7f5b607eeefb5b2be9cbc210d1a71c';
const config = {
  headers: { 'Authorization':  `token ${token}` }
}


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
  .then(function (response) {

    axios
      .get(`https://api.github.com/users/${response.username}`, config)
      .then(function (res) {

        // console.log(res.data.email);
        // console.log(res.data.avatar_url);
        email = `* Email: ${res.data.email}  \n`;
        userImgLink = `<div align="center"><img  alt="user image" src= "${res.data.avatar_url}" width="200px" /></div>`;
        userImgLink = `* User Image: \n \n${userImgLink}`;
        
      })
      
      .catch(function (error) {
        console.log("couldn't find that username on Github!");
        // console.log(error);
         userImgLink = "";
         email = "";

      })

      .then(function () {


        const title = response.projectTitle;
        const description = response.description;
        // console.log('response' + response.version);
        // console.log('license' + response.license);
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

        if (response.version.length === 0 || !response.version.trim()) {
          versionBadge = " ";
        }
        else {
          trimVersion = response.version.trim();
          var versionBadge = "![version #](https://img.shields.io/badge/version-" + trimVersion + "-blue)";

        }
        if (response.license) {
          var licenseBadge = "![license type](https://img.shields.io/badge/license-" + response.license + "-yellow)";
        }
        else {
          licenseBadge = "";
        }


        const stream = fs.createWriteStream("README.md");
        stream.once('open', function (fd) {
          stream.write(`# ${title} \n`);
          stream.write(`${licenseBadge} \t ${versionBadge} \n`);
          stream.write(`## Table of Contents  \n***\n  `);
          stream.write(`* [Link to Description](#Description)\n`);
          stream.write(`* [Link to Installation](#Installation)\n`);
          stream.write(`* [Link to Usage](#Usage)\n`);
          stream.write(`* [Link to Testing](#Testing)\n`);
          stream.write(`* [Link to License](#License)\n`);
          stream.write(`* [Link to Contributing](#Contributing)\n`);
          stream.write(`* [Link to Contact](#Contact)\n`);
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
          stream.write(`## Contact  \n***\n  `);
          stream.write(`* Username: ${response.username} \n `)
          stream.write(`${email}`);
          stream.write(`${userImgLink}`);
          stream.end();
          console.log("Readme.md for your project has been created!");
        });


      })

  });

