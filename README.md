# Learning by Making JSLogo
A [Logo](https://en.wikipedia.org/wiki/Logo_(programming_language)) interpreter build for the browser.

## About
The Learning by Making app is a product of EdEon at Sonoma State University. Development of the app was funded primarily by the U.S. Department of Education. The source code is licensed with the Creative Commons Non-Commerical Share-Alike 4.0 license. The live version can be seen at [app.lbym.org](https://app.lbym.org). The project homepage is located at [lbym.sonoma.edu](https://lbym.sonoma.edu) and contains, among other things, links to the classroom curriculum. 


## Running Locally
This project contains folders for each component. The API is a Node.js process and handles cloud save features, logging and things like that. It isn't critical and can be skipped. If you do run it, you'll need NodeJS and MongoDB. These two components can be run together use concurrently with the start script 'dev' in /site. Note that each component has it's own package.json file.

To run the API and frontend for the first time:

```
cd api
npm install
cd ../site
npm install
npm run dev

```

## Experiment Files
The LbyM curriculum uses templates for student projects, referred to as 'experiments'. In the source code these can be found in site/src/experiments and the index can be found in site/src/data/experiments.js. To modify one, edit the .logo file in the first folder. To add a new one, create a .logo file, then add it to the experiments.js list following the pattern of the others. Import it at the top, include that import as the code item.