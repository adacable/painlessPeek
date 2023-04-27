# Painless peek

Painless Peek is a browser extension to make it easier to more safley view traumatic imagery. 

It can apply various filters, from a blur or a greyscale to colour shifts, to artbitrary selectors- At the moment images, but it's easy to format it onto other targets.

Extra filters as compared to other tools for bluring images are useful, but the best option is the "letterbox" filter, which allows you to view part of an image without filters while leaving the rest filtered- So you can inspect the detail on a building while leaving bodies in the foreground blured. 

## Installation

A crx chrome extension is available in the repository, a web store link will be available when we're at a reliable background image implementation(see below) as having the extension fail unpredictably is dangerous. 

## Roadmap
- [x] Initial demo
- [x] Rename
- [x] Fix background image bug
- [x] remove custom selector demo
- [x] UI improvements
- [ ] Refactor to allow modular filters.
- [ ] Add to chrome/firefox web store
- [ ] Implement custom selectors properly
- [ ] UI to make custom selectors

## Usage
A popup sits in the top left corner: it allows you to apply various filters to the page, targeting different selectors. 

## Additional Information

### Known Bugs
- Not all background images are captued by the "img" filter- particularly nasty on telegram, but fixed with the current selector

### Future Work
- Element picker ublock origin style, to allow non technical users to select elements to filter.
- Option to "paint" unfiltered areas onto an image, and then save them with only the most traumatic elements filtered, rather than viewing through a small window around the mouse
- More filters, if there's ideas for them
- Full options page- at the moment everything is in the popup.
- Documentation and making it easier to contribute

