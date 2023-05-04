# Painless peek


**THS EXTENSION HAS HAD BASIC TESTING BUT MAY FLASH IMAGES BEFORE FILTERING THEM OCASIONALLY, AND THERE MAY BE EDGE CASES WHICH DO NOT GET FILTERED, OR INDUCE BUGS IN THE PAGE. ** Please report issues via github issues so I can fix them!

Painless Peek is a browser extension to make it easier to more safley view traumatic imagery. 

It can apply various filters, from a blur or a greyscale to colour shifts, to artbitrary selectors- At the moment images, but it's easy to format it onto other targets.

Extra filters as compared to other tools for bluring images are useful, but the best option is the "letterbox" filter, which allows you to view part of an image without filters while leaving the rest filtered- So you can inspect the detail on a building while leaving bodies in the foreground blured. 

## Installation


The extension is currently awaiting aproval for the second time in the chrome web store. 

Chrome refuses to allow the installation of .crx files that aren't in their web store into their browser on windows and linux, no matter how much you tell them it's ok. 

For now, the best way to install it is:
- From this repository, go to the "<> Code" button in the rop right.
- Click the drop down, and click "download zip"
- Unzip the folder.
- Open chrome extensions(top right menu in chrome(three vertical dots)>more tools>extensions)
- Click the "developer mode" toggle in the top right.
- Choose "load unpacked", now just below and to the far left of the "developer mode" toggle
- Navigate to the folder you unzipped this repository in, then navigate to painlessPeek/Output/extension
- Load it from there.
- The extension should be loaded.

Chromium and Firefox should load the CRX file in the root of this repo fine. 

## Roadmap
- [x] Initial demo
- [x] Rename
- [x] Fix background image bug
- [x] remove custom selector demo
- [x] UI improvements
- [x] Refactor to allow modular filters.
- [ ] Add to chrome/firefox web store
- [ ] Implement custom selectors properly
- [ ] UI to make custom selectors

## Usage
A popup sits in the top left corner: it allows you to apply various filters to the page, targeting different selectors. 

## Additional Information

### Known Bugs
- Google image search is intermittantly breaking filtering, seems to be unique to that site. 

### Future Work
- Element picker ublock origin style, to allow non technical users to select elements to filter.
- Option to "paint" unfiltered areas onto an image, and then save them with only the most traumatic elements filtered, rather than viewing through a small window around the mouse
- More filters, if there's ideas for them
- Full options page- at the moment everything is in the popup.
- Documentation and making it easier to contribute

