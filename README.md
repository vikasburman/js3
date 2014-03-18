JavaScript StyleSheet - JS3
=== 
> Instead of putting programming in CSS, it puts CSS in a programming language. 


Introduction
---

As more and more development is moving towards client side, different opportunities are opening up and traditional styles of doing everything are undergoing drastic changes. CSS definition is one such case.

CSSes are style definitions which are static in nature, but with pre-processors like LESS and SASS, adding dynamism to CSS becomes much easier. Although limited to design-time, with pre-processors, static style sheets get some life in form of variables, mixins, inheritance, etc. However once processed, they again become static styles. Therefore all such liveliness still remains inside the xxSS execution engine. 

With the help of javascript, styles can be manipulated at run-time, both at element level (e.g., using $.css(...)) as well as global level (e.g., using document.styleSheets). However updating values using former approach changes specificity, while using later approach is tedious and raw.

**This is where JS3 brings the difference.** It creates *live* CSS. A *live* CSS is a javascript object that transparently writes/updates CSS (in browser) in real-time, as you play with this object. You get the best of both worlds, LESS, SASS type design-time dynamism that can be applied at run-time using plain javascript.

JS3 can load predefined *.js3 files (comparable to *.css files) or can even define a new CSS on the fly using pure javascript. 

Features
---
* Pure JavaScript
* No external dependencies in core engine
* Supports *all* CSS features *as-is* (including experimental ones)
* Hierarchal definition of selectors along with mixin support reduces amount of code to be written for lengthy and repetitive CSS scenarios
* Future proof syntax, anything that comes in future CSS structure, when not supported directly can be written-to as is
* Almost zero learning curve (if you know JavaScript and know how to write CSS, you already know 99% of JS3)
* No build steps (its not a pre-processor)
* Live CSS (updates CSS transparently in DOM, without any flicker)
* Open extension model to extend JS3 objects for further ease
* All client-side processing, no server trips
* No need to create additional CSS classes, and then switching them at runtime using jQuery or otherwise to see desired behavior. Instead directly play with rule, styles, or variables and see the effect instantly 
* Define styles, rules and variables, etc. only once and then share them across files
* Define required .js3 files during definition, and let changes in referred .js3 files cascade in dependencies
* MIT License

Getting Started
---

**1. Install**

Install using `bower install JS3` or download [latest release](https://github.com/vikasburman/js3/releases). All you need is to have `JS3.min.js` available, whatever approach you want to take.

**2. Include**

Include JS3 engine in your html page.

> There are no external dependencies of the core engine of this library, therefore feel free to include in whatever order required. However this must be included before any `*.js3` file or any JS3 extension is being included.  

```html
<script type="text/javascript" src="path/JS3.min.js"></script>
```
You may choose to include `dist/JS3.core.js` instead, if you don't plan to use all extensions which by default are bundled into `dist/JS3.min.js` file. When using `dist/JS3.core.js`, you can choose to include individual extensions (`dist/extensions/js3.*.min.js`) as per your requirement.

Loading this file will create one global variable named `JS3`, that will serve as the anchor for all JS3 operations.

**3. Load `*.js3` files**

A `*.js3` file can be seen as a javascript counterpart of a `*.css` file. With JS3, instead of writing `.css` you would be writing `.js3` files, which are pure javascript files. These can be loaded like any other javascript file (including using any loader such as yepnope).

```html
<script type="text/javascript" src="path/styles1.js3"></script>
<script type="text/javascript" src="path/styles2.js3"></script>
```

> Although creating a `.js3` file is recommended for clean code separation, it is possible that you write your stylesheet code directly in any javascript file of yours. 

> No matter how they are defined or loaded, all js3 objects will be able to see each other and can share style information at runtime.

That's all is needed to start using the power of JS3.

Create your first `.js3` file
---
Creating a `.js3` file is simply writing bunch of javascript code lines. Each `js3` file gets loaded on global `JS3` object by its name. Here is a quick example:

```javascript

JS3.define('demo1', function() {
	// define prefixes
	prefixes('-moz-', '-webkit-');
	
	// define variables
	vars('lightColor', color('yellow')).tint(.9);
	vars('borderColor', color('lightgray')); 
	vars({ 		
		size: 11,
		unit: 'px'
	});

	// define re-usable css declarations (called 'rule' here)
	rule('[allMargins] margin', 5, vars.unit);					
	rule('[allPaddings] padding', {
		tiny: 5,
		small: 10,
		medium: 15,
		large: 25,
		xLarge: 50
	}, vars.unit).select('small');
	rule('[CodeColor] color', color('blue'));
	
	// define re-usable css declaration blocks (called 'style' here)
	style('spacing', 
		rules.allPaddings,						   
		rules.allMargins
	);	
	style('basic', {
		set1: {
			color: 'black',
			'background-color': vars.lightColor
		},
		set2: [
			rule('color', 'blue'),						
			rule('background-color', vars.borderColor) 
		]
	}).select(function() { return 'set1'; });

	style('borders', 
		rule('[myBorder] border', '1px dashed red'),
		rule('[allRadius] ~border-radius', 25, vars.unit)	
	).off();
	style('code', 
		rule('font-family', 'monospace')
	);

	// write CSS, JS3 style
	$$('@charset', '"utf-8"');
	$$('@font-face', {
		'font-family': '"Bitstream Vera Serif Bold"',
		'src': 'url("http://developer.mozilla.org/@api/deki/files/2934/=VeraSeBd.ttf")'
	});
	
	$$('body', 
		styles.basic,
		styles.spacing
	);
	$$('#root', { 
		'width': '100%'
	});
	$$('.content li', 
		styles.code
	);
	$$('#left', { 
		'width': '70%',				    
		'float': 'left'					   
	});
	$$('#right', { 
		'width': '25%',				    
		'float': 'right'					   
		})
		.$$('div',
			styles.borders
		).up()
		.$$('.widget', 
			rule('padding-bottom', 20, vars.unit)
		)
	
	$$('&/* some comments */');
	
	// ends definition and loads css
	end(); 
});

```

Above defined .js3 will eventually generate following .css

```css

@charset "utf-8";
@font-face {
	font-family: "Bitstream Vera Serif Bold";
	src: url("http://developer.mozilla.org/@api/deki/files/2934/=VeraSeBd.ttf");
}
body {
	color: black;
	background-color: rgba(255,255,230,1);
	padding: 10px;
	margin: 5px;
}
#root {
	width: 100%;
}
.content li {
	font-family: monospace;
}
#left {
	width: 70%;
	float: left;
}
#right {
	width: 25%;
	float: right;
}
#right div {

}
#right .widget {
	padding-bottom: 20px;
}
/* some comments */

```

Check [Creating your first .js3 file](https://github.com/vikasburman/js3/wiki/Creating-your-first-.js3-file) guide for  detailed and step-by-step rundown of key concepts shown here and more.

Using the power of JS3
---

`JS3` global object provides access to all core functionalists as well as all loaded style sheets. Some quick samples to give you an idea of various possibilities are:

> **Change variable's value:** 

```javascript

JS3.demo1.vars.lightColor('green');

```

> **Perform operations:**

```javascript

JS3.demo1.rules.allPaddings.add(10);

```

> **Change style rule value, from predefined set:**

```javascript

JS3.demo1.rules.allPaddings.select('large');

```

> **Turn a style rule off:**

```javascript

JS3.demo1.rules.allPaddings.off();

```

> **Add new (pre-defined) rule:** 

```javascript

JS3.demo1.styles.spacing.rules.add(
	JS3.demo1.rules.CodeColor
);

```

> **Across files re-usability:** Access definitions from other files into current file. 

```javascript

JS3.define('demo2', ['demo1'], function() {
	...
	
	$$('.content', 
		style(
			demo1.rules.CodeColor,
			rule('overflow', 'auto'),
			rule('height', 50, demo1.vars.unit)
		)
	);

	...
});

```

> **Perform batch changes:** 

```javascript

JS3.suspendUpdates();
...
JS3.demo1.rules.allPaddings.off();
JS3.demo1.styles.borders.on()
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

License
---
Copyright (C) 2014 Vikas Burman. All rights reserved.

Licensed under the terms of the [MIT license](https://github.com/vikasburman/js3/blob/master/LICENSE.md). You are free to use **JS3** under any open source or commercial project, as long as this copyright header is left intact.

Disclaimer: JS3 is authored by me (Vikas Burman). The concepts and opinions found here, as well as in code, are my own and do not represent my employers (past, current or future) in any ways.
<br />
