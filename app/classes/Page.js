import GSAP from 'gsap';
import NormalizeWheel from 'normalize-wheel';
import Prefix from 'prefix';

import each from 'lodash/each';
import map from 'lodash/map';

import Label from 'animations/Label';
import Paragraph from 'animations/Paragraph';
import Title from 'animations/Title';
import Highlight from 'animations/Highlight';

import ColorsManager from 'classes/Colors';
import AsyncLoad from 'classes/AsyncLoad';

export default class Page {
  constructor({ element, elements, id }) {
    this.selector = element;
    this.selectorChildren = {
      ...elements,

      animationsHighlighs: '[data-animation="highlight"]',
      animationsLabels: '[data-animation="label"]',
      animationsParagraphs: '[data-animation="paragraph"]',
      animationsTitles: '[data-animation="title"]',

      preloaders: '[data-src]'
    };

    this.id = id;

    this.transformPrefix = Prefix('transform');

    this.onMouseWheel = this.onMouseWheel.bind(this);
  }

  create() {
    this.element = document.querySelector(this.selector);
    this.elements = {};

    this.scroll = {
      current: 0,
      target: 0,
      last: 0,
      limit: 0
    };

    each(this.selectorChildren, (entry, key) => {
      if (
        entry instanceof window.HTMLElement ||
        entry instanceof window.NodeList ||
        Array.isArray(entry)
      ) {
        this.elements[key] = entry;
      } else {
        this.elements[key] = document.querySelectorAll(this.selector);

        if (this.elements[key].length === 0) {
          this.elements[key] = null;
        } else if (this.elements[key].length === 1) {
          this.elements[key] = document.querySelector(this.selector);
        }
      }
    });

    this.createAnimations();
    this.createPreloader();
  }

  createAnimations() {
    this.animations = [];

    this.animationsHighlighs = map(
      this.elements.animationsHighlighs,
      (element) => {
        return new Highlight({
          element
        });
      }
    );

    this.animations.push(...this.animationsHighlighs);

    this.animationsTitles = map(this.elements.animationsTitles, (element) => {
      return new Title({
        element
      });
    });

    this.animations.push(...this.animationsTitles);

    this.animationsParagraphs = map(
      this.elements.animationsParagraphs,
      (element) => {
        return new Paragraph({
          element
        });
      }
    );

    this.animations.push(...this.animationsParagraphs);

    this.animationsLabels = map(this.elements.animationsLabels, (element) => {
      return new Label({
        element
      });
    });

    this.animations.push(...this.animationsLabels);
  }

  createPreloader() {
    this.preloaders = map(this.elements.preloaders, (element) => {
      return new AsyncLoad(element);
    });
  }

  show() {
    return new Promise((resolve) => {
      ColorsManager.change({
        backgroundColor: this.element.getAttribute('data-background'),
        color: this.element.getAttribute('data-color')
      });

      this.animationIn = GSAP.timeline();

      this.animationIn.fromTo(
        this.element,
        {
          autoAlpha: 0
        },
        {
          autoAlpha: 1
        }
      );

      this.animationIn.call((_) => {
        this.addEventListeners();

        resolve();
      });
    });
  }

  hide() {
    return new Promise((resolve) => {
      this.destroy();

      this.animationOut = GSAP.timeline();

      this.animationOut.to(this.element, {
        autoAlpha: 0,
        onComplete: resolve
      });
    });
  }

  onResize() {
    if (this.page && this.page.onResize) {
      this.scroll.limit =
        this.elements.wrapper.clientHeight - window.innerHeight;
    }

    each(this.animations, (animation) => animation.onResize());
  }

  onMouseWheel(event) {
    const { pixelY } = NormalizeWheel(event);

    this.scroll.target += pixelY;
  }

  update() {
    this.scroll.current = GSAP.utils.interpolate(
      this.scroll.current,
      this.scroll.target,
      0.1
    );

    this.scroll.target = GSAP.utils.clamp(
      0,
      this.scroll.limit,
      this.scroll.target
    );

    if (this.scroll.current < 0.01) {
      this.scroll.current = 0;
    }

    if (this.elements.wrapper) {
      this.elements.wrapper.style[
        this.transformPrefix
      ] = `translateY(-${this.scroll.current})`;
    }
  }

  addEventListeners() {}

  removeEventListeners() {}

  destroy() {
    this.removeEventListeners();
  }
}
