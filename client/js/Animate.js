export function fadeIn(element, duration = 400, options = {display: 'flex'}) {
    element.style.opacity = 0;
    element.style.display = options.display;

    let startTime = performance.now();

    function animate() {
        let currentTime = performance.now();
        let elapsedTime = currentTime - startTime;
        let progress = elapsedTime / duration;
        console.log(`fading In : progress ${progress}`)
        if (progress < 1) {
            element.style.opacity = progress;
            requestAnimationFrame(animate);
        } else {
            element.style.opacity = 1;
        }
    }
    
    requestAnimationFrame(animate);
}

export function fadeOut(element, duration = 400) {
    let startTime = performance.now();

    function animate() {
        let currentTime = performance.now();
        let elapsedTime = currentTime - startTime;
        let progress = elapsedTime / duration;
        console.log(`fading In : progress ${progress}`)

        if (progress < 1) {
            element.style.opacity = 1 - progress;
            requestAnimationFrame(animate);
        } else {
            element.style.opacity = 0;
            element.style.display = 'none';
        }
    }

    requestAnimationFrame(animate);
}