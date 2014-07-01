## 1. Preparation

Before writing the code, there are some preparation work to do:

### Install Node.js

Just go to http://nodejs.org/, install the latest version of Node.js.

### Install Cortex

run the command:

```bash
npm install -g cortex
```

when the installation process finishes, run `cortex -v` to verify if cortex is successfully installed.

## 2. Initialize the project 


Make a directory called 'hello-world', in the directory root path, run `cortext init` to initialize the project:

```
cortex init
```

cortex will ask you a bunch of questions, and using the default will be fine. If everything goes well, you will find the project structure like this:

	hello-world/
	|-test/              // where test cases belongs to
	|-index.js	      // you module's entry file
	|-index.html      // runner
	|-cortex.json	 // package info
	

## 3. Install dependencies

Install jquery as the dependency:

```
cortex install jquery --save
```	

Cortex will download all the dependencies into a folder called 'neurons', and You will see the console output:

```
installing jquery@*
   GET http://r.ctx.io/jquery 200
   GET http://r.ctx.io/jquery/-/jquery-1.9.1.tgz 200
write /Users/ltebean/Desktop/hello-world/neurons/jquery/1.9.1/jquery.js
```
	
## 4. Write code
Our task is simple - append some text to the html body, so edit index.js:

	var $ = require('jquery');
	$('body').html('hello world');
	
You will find that we write code just the same way as in Node.js.

	
## 5. Build the project
Run `cortex build` to build the project. 

	cortex build
	

In development , you can use `cortex watch` to watch the changes of files, if any file changes, cortex will rebuild the project

## 6. Run the code
Open index.html in the browser, and you will find 'hello-world' is printed on the screen.

## 7. Detailed guidence
Visit http://book.ctx.io/ for more detailed guidance. 


