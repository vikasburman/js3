JavaScript StyleSheet - JS3
=== 
> Instead of putting programming in CSS, it puts CSS in a programming language. 


Introduction
---

As more and more development is moving towards client side, different opportunities are opening up and traditional styles of doing everything are undergoing drastic changes. CSS is one such case.

CSSes used to be static style definitions, but with pre-processors like LESS and SASS, CSS management becomes much easier. With pre-processors, static stylesheets get some life in form of variables, mixins, inheritance, etc. However once processed, they again become static CSS files. Therefore all that liveliness remained inside the xxSS execution engine where xxSS processing happens.

**This is where JS3 brings the difference.** It creates *live* CSS. A *live* CSS is a javascript object that transparently writes/updates CSS (in browser) in real-time, as you play with this object. 

You no longer need to think in terms of having different class for different scenarios and using javascript switch classes. JS3 gives access to each style rule, collections, selectors, etc. as an object which you can play around with directly or indirectly with embedded javascript functions.

JS3 can load predefined *.js3 files (comparable to *.css files) or can even define a new CSS on the fly using pure javascript. 

Features
---
* Pure JavaScript
* No external dependencies
* Supports *all* CSS features *as-is* (including experimental ones)
* Future proof syntax, anything that comes in future CSS structure, when not supported directly can be written-to as is
* Almost zero learning curve (if you know JavaScript and know how to write CSS, you already know 99% of JS3)
* No build steps (its not a pre-processor)
* Live CSS (updates CSS transparently in DOM, without any flicker)
* Open extension model to extend JS3 objects for further ease
* All client-side processing, no server trips
* No need to create additional CSS classes, and then switching them at runtime using jQuery or otherwise to see desired behavior. Instead directly play with style rules, styles, selectors,  or variables and see the effect instantly 
* Define selector, styles, rules and variables, etc. only once and then share them across files
* Give friendly names to regions, styles and rules etc., instead of juggling with IDs or Class selectors 
* Cross-reference JS3 files and let changes cascade in dependencies
* MIT License

Getting Started
---

**1. Install**

Install using `bower install JS3` or download [latest release](https://github.com/vikasburman/js3/releases). All you need is to have `JS3.min.js` available, choose however you want to get it.

**2. Include**

Include JS3 engine in your html page. 

> There are no external dependencies of this library, therefore feel free to include in whatever order required. However this must be included before any `*.js3` file or any JS3 extension is being included.  

```html
<script type="text/javascript" src="path/JS3.min.js"></script>
```
You may choose to include `JS3.core.js` instead, if you don't plan to use all extensions which otherwise are bundled into `JS3.min.js` file. When using `JS3.core.js`, you can choose to include individual extensions as per your requirement.

Loading this file will create one global variable named `JS3`, that will serve as the anchor for all JS3 operations.

**3. Load `*.js3` files**

A `*.js3` file can be seen as a javascript counterpart of a `*.css` file. With JS3, instead of writing `.css` you would be writing `.js3` files, which are pure javascript files. These can be loaded like any other javascript file (including using any loader such as yepnope).

```html
<script type="text/javascript" src="path/styles1.js3"></script>
<script type="text/javascript" src="path/styles2.js3"></script>
```

> Although creating a `.js3` file is recommended for clean code separation, it is possible that you write your stylesheet code directly in any javascript file of yours. 

> No matter how they are defined or loaded, all stylesheet objects will be able to see each other and can share style information at runtime.

That's all is needed to start using the power of JS3.

Create your first `.js3` file
---
Creating a `.js3` file is simply writing bunch of javascript code lines. Each `js3` file resides in its own closure and gets loaded (read attached) on global `JS3` object by its name. Here is a quick example:

```javascript
(function() { 
	this
	
	// define variables
	.vars('myColor', 'yellow') 

	// define named rules
	.rules('allPadding', 'padding', 100, 'px !important')
	.rules('background', 'background-color', this.vars.myColor)
	
	// define named styles
	.styles('basic', [
		this.rules.allPadding
	])
	
	// define selectors
	.sel('Everywhere', 'body')
	
	// write styles
	.write(this.sel.Everywhere, [
		this.styles.basic
	])

	// done
	.end(); 
}.apply(JS3.css('styles1')));
```

Check [Creating your first .js3 file](https://github.com/vikasburman/js3/wiki/Creating-your-first-.js3-file) guide for  detailed and step-by-step rundown of key concepts shown here and more.

Using the power of JS3
---

`JS3` global object provides access to all core functionalists as well as all loaded stylesheets. Some quick samples to give you an idea of various possibilities are:

> **Change variable's value:** 

```javascript
JS3.styles1.vars.backgroundColor('green');
```

> **Turn a style rule off:**

```javascript
JS3.styles1.rules.allPadding.off();
```

> **Add new style rule:** 

```javascript
JS3.styles1.styles.basic.rules.add(
	this.rule('background-color', 'red')
);
```

> **Add new style to a selector:** 

```javascript
JS3.styles1.sel.MainArea.styles.add(
	this.style(
		this.rule('background-color', 'white')
	)
);
```

> **Change selector definition itself:** 

```javascript
JS3.styles1.sel.MainArea('#d3');
```

> **Across files re-usability:** Access definitions from other files into current file. 

```javascript
(function() { 

	.xref('styles2', 'styles3')
	.styles('basic', [
		JS3.styles2.rules.allPadding2,
		this.rule('background-color', JS3.styles3.vars.backgroundColor2) 
	])

}.apply(JS3.css('styles1')));
```

> **Perform batch changes:** 

```javascript
JS3.suspendUpdates();
...
JS3.styles1.rules.allPadding.off();
JS3.styles1.sel.MainArea('#d3');
...
JS3.resumeUpdates();
```

> **Remain informed:** 

```javascript
JS3.onChange('myHandler', function(e) {

// e.css holds css object where changes are done
// e.type holds the type of change

});
```

> Possibilities are many. Check out the [documentation](https://github.com/vikasburman/js3/wiki) to see what all is available.

**Power of JS3 comes from following *five* key factors:**

* Rich object model built around CSS concepts: selectors, style rules, at-rules, etc. brings in required flexibility and helps in flattening JS3 learning curve
* Defining styles separately from selectors aids in maximum re-usability
* Core engine provides utmost control when dealing with multiple stylesheets
* Extensions helps in bringing domain (i.e., css) specific functionality right at the place of use
* Scopes helps in loading styles in a shared space without bleeding outside defined boundaries

Documentation
---
JS3 documentation is available [here](https://github.com/vikasburman/js3/wiki).

Release History
---
See the changelog [here](https://github.com/vikasburman/js3/blob/master/CHANGELOG.md).

Contributing to JS3
---

Community contributions will made JS3 a better specification and framework. If you are interested in contributing, please follow these simple guidelines.

Use [stackoverflow](http://stackoverflow.com/questions/tagged/js3) for questions. [Issues](https://github.com/vikasburman/js3/issues) should be opened if you find a problem or have an enhancement request.

Supply a working sample against the enhancement.

Similar Projects
---

There are several projects which are on similar lines, i.e., CSS and JavaScript together. However unlike JS3, none of below mentioned, do it in totality and provide an end-to-end seamless experience for stylesheet processing.

* [1996's W3.org proposal of JSSS](http://www.w3.org/Submission/1996/1/WD-jsss-960822)
* [1997's Netscape attempt of bringing CSS together with JavaScript](http://sunsite.uakom.sk/sunworldonline/swol-04-1997/swol-04-webmaster.html)
* [David Walsh's trick for directly playing with style DOM element to update stylesheet](http://davidwalsh.name/add-rules-stylesheets)
* [Jason Graves' approach to modify styles as well as cascading from style islands/blocks or externally linked css files using Javascript](http://glm-jss.sourceforge.net/)

*If you find something else that is coming up on similar lines, please share your findings and I will incorporate it here for everyone's reference.*

Who is using it?
---

If you are using JS3 in your project, drop me a mail at [vikasburman@yahoo.com](mailto:vikasburman@yahoo.com) and I will include your citation and/or project reference here.

License
---
Copyright (C) 2014 Vikas Burman. All rights reserved.

Licensed under the terms of the [MIT license](https://github.com/vikasburman/js3/blob/master/LICENSE.md). You are free to use **JS3** under any open source or commercial project, as long as this copyright header is left intact.

Disclaimer: JS3 is authored by me (Vikas Burman). The concepts and opinions found here, as well as in code, are my own and do not represent my employers (past, current or future) in any ways.
<br />
