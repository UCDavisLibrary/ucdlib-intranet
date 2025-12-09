class Editoria11yShims {

  attach(){
    document.addEventListener('ed11yResults', () => {
      this.run();
    });
  }

  run(){
    if ( !window.ed11yReady ) return;
    this.rmStyleFromAccordion();
  }

  /**
   * @description Removes the injected style from Editoria11y in ucd-theme-list-accordion elements
   * This style creates an empty list item at the end of the accordion
   */
  rmStyleFromAccordion(){
    const accordions = document.querySelectorAll('ucd-theme-list-accordion');
    if ( accordions.length === 0 ) return;
    accordions.forEach( accordion => {
      const styleEl = accordion.querySelector(':scope > .ed11y-style');
      if ( styleEl ){
        styleEl.remove();
      }
    });
  }
}

let editora11yShims = new Editoria11yShims();
editora11yShims.attach();