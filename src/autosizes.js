(function() {
  // Check if the browser already supports sizes="auto"
  // We're using UA sniffing here, as there's no way to detect browser
  // support without a forced layout, which would make things slower for everyone.
  const polyfillAutoSizes = () => {
    // Avoid polyfilling if the browser is too old and doesn't support performance observer and paint timing
    if (!('PerformanceObserver' in window) || !('paint' in PerformanceObserver.supportedEntryTypes)) {
      return false;
    }

    const userAgent = navigator.userAgent;
    const chromeMatch = userAgent.match(/Chrome\/(\d+)/);
    
    if (!chromeMatch) {
      return true;
    }
    
    const chromeVersion = parseInt(chromeMatch[1], 10);
    return chromeVersion < 126;
  };

  if (polyfillAutoSizes()) {
    return;
  }

  let didFirstContentfulPaintRun = false;
  function calculateAndSetSizes(img) {
    // Calculate the displayed width of the image
    // getBoundingClientRect() forces layout, but this is running right after FCP,
    // so hopefully the DOM is not dirty.
    const computedWidth = Math.round(img.getBoundingClientRect().width);
    console.log(`computedWidth for ${img.src}: ${computedWidth}`);
    
    // Set the sizes attribute to the computed width in pixels
    if (computedWidth > 0) {
      img.sizes = `${computedWidth}px`;
    } else {
      // If we get a negative or zero width, use the parent's width
      // or fall back to 100vw if that's not available
      const parentWidth = img.parentElement?.getBoundingClientRect().width;
      img.sizes = parentWidth > 0 ? `${parentWidth}px` : '100vw';
    }
  }

  // Store the original src and srcset attributes, and remove them to prevent loading before
  // we've calculated the sizes attribute
  function preventNonAutoImageLoad(images) {
    for (const img of images) {
      if (img.complete) {
        // Don't do any of this if the image is already loaded
        continue;
      }
      // Only process images with sizes attribute starting with "auto" and loading="lazy"
      if (!img.getAttribute('sizes')?.trim().startsWith('auto') || 
          img.getAttribute('loading') !== 'lazy') {
        continue;
      }
      if (!didFirstContentfulPaintRun) {
        // Remove src and srcset to prevent loading
        if (img.hasAttribute('src')) {
          img.setAttribute('data-auto-sizes-src', img.getAttribute('src'));
          img.removeAttribute('src');
        }
        
        if (img.hasAttribute('srcset')) {
          img.setAttribute('data-auto-sizes-srcset', img.getAttribute('srcset'));
          img.removeAttribute('srcset');
        }
      } else {
        // Calculate sizes without removing src and srcset
        calculateAndSetSizes(img);
      }
    }
  }

  // Set the sizes attribute to the computed width in pixels and restore original src and srcset
  function restoreImageAttributes() {
    const images = document.querySelectorAll('img[sizes^="auto"][loading="lazy"]');
    
    for (const img of images) {
      if (img.hasAttribute('data-auto-sizes-src') || 
          img.hasAttribute('data-auto-sizes-srcset')) {
        
        calculateAndSetSizes(img);
        // Restore original src and srcset
        if (img.hasAttribute('data-auto-sizes-src')) {
          img.src = img.getAttribute('data-auto-sizes-src');
          img.removeAttribute('data-auto-sizes-src');
        }
        
        if (img.hasAttribute('data-auto-sizes-srcset')) {
          img.srcset = img.getAttribute('data-auto-sizes-srcset');
          img.removeAttribute('data-auto-sizes-srcset');
        }
      }
    }
  }

  // Set up mutation observer to detect new images
  const observer = new MutationObserver(mutations => {
    const newImages = [];
    
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        for (const node of mutation.addedNodes) {
          if (node.nodeName === 'IMG') {
            newImages.push(node);
          }
          // Add all images within added nodes
          if (node.querySelectorAll) {
            newImages.push(...node.querySelectorAll('img'));
          }
        }
      }
      // Check for attribute changes on images
      else if (mutation.type === 'attributes' && 
               mutation.target.nodeName === 'IMG' &&
               (mutation.attributeName === 'sizes' ||
                mutation.attributeName === 'loading' ||
                mutation.attributeName === 'src' ||
                mutation.attributeName === 'srcset')) {
        newImages.push(mutation.target);
      }
    }
    
    if (newImages.length > 0) {
      preventNonAutoImageLoad(newImages);
    }
  });

  // Start observing the document
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['sizes', 'loading']
  });

  preventNonAutoImageLoad(document.querySelectorAll('img[sizes^="auto"][loading="lazy"]'));

  (new PerformanceObserver((entries, observer) => {
    entries.getEntriesByName('first-contentful-paint').forEach(() => {
      didFirstContentfulPaintRun = true;
      setTimeout(restoreImageAttributes, 0);
      observer.disconnect();
    });
  })).observe({ type: 'paint', buffered: true });
})();
