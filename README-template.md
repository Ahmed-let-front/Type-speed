# Frontend Mentor - Typing Speed Test solution

This is a solution to the [Typing Speed Test challenge on Frontend Mentor](https://www.frontendmentor.io/challenges/typing-speed-test). Frontend Mentor challenges help you improve your coding skills by building realistic projects. 

## Table of contents

- [Overview](#overview)
  - [The challenge](#the-challenge)
  - [Screenshot](#screenshot)
  - [Links](#links)
- [My process](#my-process)
  - [Built with](#built-with)
  - [What I learned](#what-i-learned)
  - [Continued development](#continued-development)
  - [Useful resources](#useful-resources)
  - [AI Collaboration](#ai-collaboration)
- [Author](#author)
- [Acknowledgments](#acknowledgments)

## Overview

### The challenge

Users should be able to:

- View the optimal layout for the interface depending on their device's screen size
- See hover and focus states for all interactive elements on the page

### Screenshot

![](./screenshot.jpg)

### Links

- Solution URL: [Add solution URL here](https://your-solution-url.com)
- Live Site URL: [Add live site URL here](https://your-live-site-url.com)

## My process

### Built with

- Semantic HTML5 markup
- CSS custom properties
- Flexbox
- CSS Grid
- Mobile-first workflow
- Vanilla JavaScript (ES6 Modules)
- Tailwind CSS v4

### What I learned

During this project, I focused heavily on advancing my vanilla JavaScript architecture and modern web APIs. Here are some of the key concepts and techniques I implemented:

- **AbortController Signals:** Utilized `AbortSignal` to automatically clean up and remove multiple event listeners simultaneously without manual removal boilerplate.
- **`inert` Attribute:** Swapped traditional `aria-hidden` approaches for the native `inert` attribute to completely disable interaction and focusability on hidden UI containers.
- **Audio Integration:** Programmatically managed and triggered audio feedback loops via JavaScript for enhanced game interactivity.
- **Event Delegation & Grid Transitions:** Handled dynamic dropdown states using CSS Grid template rows scaling combined with clean event delegation patterns.

```js
// Example of using AbortController for clean event handling
const controller = new AbortController();
window.addEventListener('resize', handleResize, { signal: controller.signal });

// Clean up all listeners tied to this signal automatically
controller.abort();