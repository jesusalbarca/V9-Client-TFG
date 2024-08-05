/*
  This makes the footer stick to the bottom of the page and never overlap the main content
   */

console.log(`LOADED AvoidFooterOverlap.js`)



function avoidFooterOverlap(extraMargin = 100) {
    const main = document.querySelector('main');
    const footer = document.querySelector('footer');
    //console.log("footer.dimensions", footer.getBoundingClientRect());
    // main.style.marginBottom = `${Math.round(footer.getBoundingClientRect().height)}px`;
    main.style.marginBottom = `${Math.round(footer.getBoundingClientRect().height)+extraMargin}px`;

};



// avoidFooterOverlap();
window.addEventListener("resize", avoidFooterOverlap);
;
