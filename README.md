JavaScript StyleSheet - JS3
=== 
> Instead of putting programming in CSS, it puts CSS in a programming language. 


Introduction
---

As more and more development is moving towards client side, different opportunities are opening up and traditional styles of doing everything is undergoing drastic changes. CSS is one such case.

CSSes used to be static style definitions, with pre-processors like LESS and SASS, CSS management becomes much easier. With pre-processors static stylesheets get some life in form of variables, mixins, inheritance, etc. However once processed, they again become static CSS files. All that liveliness remained inside the xxSS execution engine during xxSS processing.

This is where JS3 brings the difference. It creates *live* CSS with almost zero learning curve as there are *NO* new constructs beyond what is available in CSS. A *live* CSS is a javascript object that transparently writes/updates CSS (in browser) in real-time, as you play with this object. 

You no longer need to think in terms of having different class for different scenarios and using javascript switch classes. JS3 gives access to each style rule, collections, selectors, etc. as an object which you can play around with directly or indirectly with embedded javascript functions.

JS3 can load predefined *.js3 files (comparable to *.css files) or can define a CSS on the fly using pure javascript. 

Features
---
* Pure JavaScript
* No external dependencies
* Supports *all* CSS features *as-is* (including experimental ones)
* Future proof syntax, anything that comes in future CSS structure, when not supported directly can be written-to as is
* Almost zero learning curve (if you know JavaScript and know how to write CSS, you already know 99.9% of JS3)
* No build steps (its not a pre-processor)
* Live CSS (updates loaded CSS transparently in DOM, without any flicker)
* Open extension model to extend JS3 objects for further ease
* All client-side processing, no server trips
* No need to create additional CSS classes, and then switching them at runtime using jQuery or otherwise to see desired behavior. Instead directly play with style rules, styles, selectors,  or variables and see the effect instantly 
* Define selector, styles, rules and variables, etc. only once and then share them across files
* Cross-reference JS3 files and let changes cascade in dependencies
* MIT License

Getting Started
---

**1. Include JS3 (the core engine)**

Include JS3 engine in your html page. 

> There are no external dependencies of this library, therefore feel free to include in whatever order required. However this must be included before any `*.js3` file or any JS3 extension is being included.  

```html
<script type="text/javascript" src="path/JS3.min.js"></script>
```
You may choose to include `JS3.core.js` instead, if you don't plan to use all extensions which otherwise are bundled into `JS3.min.js` file. When using `JS3.core.js`, you can choose to include individual extensions as per your requirement.

Loading this file will create one global named `JS3` that will serve as anchor for all JS3 operations.

**2. Include *.js3 files (your javascript based stylesheet files)**

A `*.js3` file can be seen as a javascript counterpart of a `*.css` file. With JS3, instead of writing `.css` you would be writing `.js3` files, which are pure javascript files.

```html
<script type="text/javascript" src="path/styles1.js3"></script>
<script type="text/javascript" src="path/styles2.js3"></script>
```

> Although creating a `.js3` file is recommended for clean code separation, it is possible that you write your stylesheet code directly in any javascript file of yours. No matter how it is loaded these stylesheet objects will be able to see each other and can share style information and be dependent on each other at runtime.

That's all is needed to start using the power of JS3.

Create your first `.js3` file
---

*A: The empty `.js3` file looks as below. Note this is defining a new CSS object using `JS3.css(<objectName>)` call and passing the resulting new css object as `this` context here:*

```javascript
(function() { 

// style definitions in javascript notations will come here

}.apply(JS3.css('styles1')));
```

*B: Define variables that you may want to change at runtime later or that you may want to use across different files:*

```javascript
(function() { 
	this
	
	// define variables
	.vars('backgroundColor', 'yellow') 

}.apply(JS3.css('styles1')));
```
> Note the use of `this`. It helps in chaining the calls together.

*C: Define named style rules that you may want to use in multiple styles or change at runtime later or that you may want to use across different files:*

```javascript
(function() { 
	this
	
	// ...

	// define named rules
	.rules('allPadding', 'padding', 100, 'px !important')
	.rules('textColor', 'color', 'red')

}.apply(JS3.css('styles1')));
```

*D: Define named styles that you may want to apply on multiple selectors or want to change at runtime later or that you may want to use across different files:*

```javascript
(function() { 
	this
	
	// ...

	// define named styles
	.styles('basic', [
		this.rules.allPadding,
		this.rule('background-color', this.vars.backgroundColor) 
	])
	.styles('basicEx', this.rules.textColor)

}.apply(JS3.css('styles1')));
```

> Note the in-place definition of a rule when defining the style. Not every rule needs to be a named rule when there is limited use. Also note the use of the variable in the style rule.

*E: Define named selectors to identify various regions of your webpage for easy styling. Like everything else, these can also be changed at runtime or can be shared across files:*

```javascript
(function() { 
	this
	
	// ...

	// define selectors
	.sel('Everywhere', 'body')
	.sel('MainArea', '#d1')
	.sel('Widgets', ['#d2', '#d3'])
	
}.apply(JS3.css('styles1')));
```

*F: Define any at-rules. These can also be changed or shared across files:*

```javascript
(function() { 
	this
	
	// ...
      
       // define at-rules
        .at('UTF8', 'charset', 'UTF-8')
	
}.apply(JS3.css('styles1')));
```

*G: Once all definitions are done, start building up the stylesheet:*

```javascript
(function() { 
	this
	
	// ...

	// write styles
	.write(this.at.UTF8)
	.write(this.sel.Everywhere, [
		this.styles.basic,
		this.styles.basicEx
	])

	.write(this.sel.Widgets, this.styles.basic)
	
	.write(this.sel.MainArea, 
		this.style([
			this.rule('text-align', 'right'),
			this.rule('letter-spacing', 5, 'px')
		])
	)
}.apply(JS3.css('styles1')));
```
> Note, how styles defined once are being reused with multiple selectors. Also note how less used styles can be defined in-place without the need of defining it as named style.

*H: Once everything is done, mark for it:*

```javascript
(function() { 
	this
	
	// ...

	// done
	.end(); 
}.apply(JS3.css('styles1')));
```

*I: Here is how complete `.js3` file looks like:*

```javascript
(function() { 
	this
	
	// define variables
	.vars('backgroundColor', 'yellow') 

	// define named rules
	.rules('allPadding', 'padding', 100, 'px !important')
	.rules('textColor', 'color', 'red')
	
	// define named styles
	.styles('basic', [
		this.rules.allPadding,
		this.rule('background-color', this.vars.backgroundColor) 
	])
	.styles('basicEx', this.rules.textColor)
	
	// define selectors
	.sel('Everywhere', 'body')
	.sel('MainArea', '#d1')
	.sel('Widgets', ['#d1', '#d2'])
	
       // define at-rules
        .at('UTF8', 'charset', 'UTF-8')

	// write styles
	.write(this.at.UTF8)
	.write(this.sel.Everywhere, [
		this.styles.basic,
		this.styles.basicEx
	])

	.write(this.sel.Widgets, this.styles.basic)
	
	.write(this.sel.MainArea, 
		this.style([
			this.rule('text-align', 'right'),
			this.rule('letter-spacing', 5, 'px')
		])
	)

	// done
	.end(); 
}.apply(JS3.css('styles1')));
```
> Note, everything is plain javascript here.

Using the power of JS3
---


Turn off 'allPadding' rule. Note: 'allPadding' is a friendly name that you may have given to a style rule.
```javascript
JS3.styles1.styles.allPadding.off();
```

Update 'lightBackground' variable's value
JS3.styles1.vars.lightBackground('yellow'); // will update all styles with new color where 'lightBackground' variable is used


```

---