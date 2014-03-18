JS3 Changelog
===

##### 0.9.x - &beta; (Future)

* Sample JS3 files (ports of few standard CSS files)

##### 0.8.x - &beta; (Next)

* Update Wiki

##### 0.8.5 - &beta; (18 Mar 2014)

* API re-written from scratch to make it leaner
* Entire code is re-factored, reducing about 20% code size for JS3 code engine as well as for .js3 file definition
* Selector, at-rule, prefixes and direct strings cannot be named now
* .sel, .at, .dir, and .write API functions are replaced by .$$
* .pfx is .prefixes now
* Several other APIs (including events) are also dropped for much simpler usage, e.g., .done() is now .end(false) instead
* New toCSS() call can be used to get entire CSS as string, when using JS3 on server side
* Selectors and at-rules can now be naturally nested, much like LESS
* Dynamic style selection is now limited to using object literals, instead of both array and literals
* All rules, styles, etc. which do not need any dynamism, can now be written as-is (without any wrapping), reducing unnecessary memory consumption
* Named styles and rules can now be defined in-place, at their first use
* Scoped loading is now restricted only to one scope, instead of multiple (this makes more sense)
* .js3 definition structure is completely revamped, and instead of a chained syntax this is much cleaner now using several JS3 language functions
* Extensions API is also changed and it can also use JS3 language functions
* .xref definition is promoted and now defined in .js3 file header, causing referred file(s) to be available as '{objectName}' variable while defining .js3 file
* In addition to extending object operations, new language functions can also be defined
* Extensions can register their private types that can be shared across vsrious types of extensions (operations and language functions)
* Entire set of color manipulation operations are added (using http://tech.pusherhq.com/libraries/color library for color manipulations)
* Entire set of math operations added
* With leaner and more natural API, JS3 can now be used even by CSS designers or whoever is using LESS, SASS, etc.
* Examples are updated showing new API usage
* Minified versions of extensions are also created for easy distribution

##### 0.7.1 - &beta; (08 Mar 2014)

* Issues fixed
* Unload, reload anomalies resolved 
* Directly embedded styles under atRule are now supported (@font-face case)
* API Documentation updated

##### 0.6.4 - &beta; (07 Mar 2014)

* Issue fixed

##### 0.6.2 - &beta; (07 Mar 2014)

* Issue fixed
* Full-fledged running example (Basic)

##### 0.5.7 - &beta; (07 Mar 2014)

* Issues fixed
* Distribution files updated

##### 0.5.5 - &beta; (07 Mar 2014)

* Issues fixed
* Added support for declaration level debugging
* Added support for interactive reset for dynamic style and style rules
* Completed guides documentation

##### 0.4.9 - &beta; (27 Feb 2014)
* Minor API standardization
* Core API documentation completed
* Better debugging support via pretty style generation

##### 0.3.6 - &beta; (23 Feb 2014)

* First level API documentation
* Minor enhancements
* Support for window.JS3Settings added
* Extensions definition API changed

##### 0.2.1 - &beta; (22 Feb 2014)

* Stability, enhancements and completion
* API standardization
* Build engine ([grunt](http://gruntjs.com/))
* Basic extensions
* Basic documentation
* Bower publishing ([JS3](http://bower.io/search/#!/search/JS3))

##### 0.1.x - &alpha; (15 Feb 2014)

* Basic library structure with quick functional plumbing
* Extension's core api


##### 0.0.x - &alpha; (8 Feb 2014)

* Idea processing
* Conceptualizing and maturing the overall approach

---
