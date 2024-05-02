(function() {
  const createImage = (file) => {
    const img = document.createElement('img');

    img.setAttribute('src', file);

    return img;
  };

  const getActiveImage = (container) => container.querySelector('img.active');

  const gallery = (selector, files) => {
    const target = document.querySelector(selector);
    const [firstFile, ...otherFiles] = files;
    const firstImage = createImage(firstFile);
    const imageContainer = document.createElement('div');
    const controlsContainer = document.createElement('div');
    const nextControl = document.createElement('button');
    const prevControl = document.createElement('button');

    target.classList.add('fesh-gallery');
    controlsContainer.classList.add('controls');

    firstImage.classList.add('active');
    imageContainer.appendChild(firstImage);

    for (const file of otherFiles) {
      imageContainer.appendChild(createImage(file));
    }
    target.appendChild(imageContainer);

    prevControl.classList.add('prev');
    prevControl.appendChild(document.createTextNode('⬅️'));
    prevControl.addEventListener('click', () => {
      const currentActive = getActiveImage(target);
      const nextActive = imageContainer.firstChild === currentActive ? imageContainer.lastChild : currentActive.prevSibling;

      currentActive.classList.remove('active');
      nextActive.classList.add('active');
    });
    controlsContainer.appendChild(prevControl);

    nextControl.classList.add('next');
    nextControl.appendChild(document.createTextNode('➡️'));
    nextControl.addEventListener('click', () => {
      const currentActive = getActiveImage(target);
      const nextActive = imageContainer.lastChild === currentActive ? imageContainer.firstChild : currentActive.nextSibling;

      currentActive.classList.remove('active');
      nextActive.classList.add('active');
    });
    controlsContainer.appendChild(nextControl);

    target.appendChild(controlsContainer);
  };

  window.fesh = {
    gallery,
  }
})();
