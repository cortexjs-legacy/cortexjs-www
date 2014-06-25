## Installation

Before anything taking its part, you should install [node](http://nodejs.org) and "cortex".

#### Install Node

Visit [http://nodejs.org](http://nodejs.org), download and install the proper version of nodejs.

#### Install Cortex

```sh
npm install -g cortex
```

## Build an awesome module


#### Init the project
First, make a directory called hello-world, in the directory root path, run 'cortext init' to initialize the project:

```
cortex init
```

cortex will ask you a bunch of questions, and using the default will be fine. If everything goes well, you will find the project structure like this:

	hello-world
	|-test  // where test cases belongs to
	|-index.js	// you module's entry file
	|-cortex.json	// package info
	
#### Meet our best buddy - jquery

Install jquery as the dependency, after the command finishes, you will find jquery appears in the dependencies field in cortex.json

```
cortex install jquery --save	
```	
	
#### Write the module
Our task is simple - append some text to the html body, so edit index.js

	var $ = require('jquery');
	$('body').html('hello world');
	
	
#### Build the project
Run 'cortex build' to build the project. In development , you can use 'cortex watch' to watch the changes of files, if any file changes, cortex will rebuild the project

	cortex build
	
#### Run the code


In hello-world/test/runner.html, include your module

	facade({
		mod:'hello-world'
	});
	
Then run 'cortex server' to server the infrastructure module

	cortex server
		
Finally open the file in browser, done~


