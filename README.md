JavaScript StyleSheet - JS3
=== 
Instead of putting programming in CSS, it puts CSS in a programming language. 


Introduction
---

As more and more development is moving towards client side, different opportunities are opening up and traditional styles of doing everything is undergoing drastic changes. CSS is one such case.

CSSes used to be static style definitions, with pre-processors like LESS and SASS, CSS management becomes much easier. With pre-processors static stylesheets get some life in form of variables, mixins, inheritance, etc. However once processed, they again become static CSS files. All that liveliness remained inside the xxSS execution engine during xxSS processing.

This is where JS3 brings the difference. It creates *live* CSS with almost zero learning curve as there are *NO* new constructs beyond what is available in CSS. A *live* CSS is a javascript object that transparently writes/updates CSS (in browser) in real-time, as you play with this object. 

You no longer need to think in terms of having different class for different scenarios and using javascript switch classes. JS3 gives access to each style rule, collections, selectors, etc. as an object which you can play around with directly or indirectly with embedded javascript functions.

JS3 can load predefined *.js3 files (comparable to *.css files) or can define a CSS on the fly using pure javascript. 


Getting Started
---

**1. Include JS3**

```html
<script type="text/javascript" src="path/JS3.min.js"></script>

