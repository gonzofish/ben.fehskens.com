(function() {
  const createImage = (file) => {
    const link = document.createElement('a');
    const img = document.createElement('img');

    link.setAttribute('href', file);
    link.setAttribute('rel', 'noopener noreferrer');
    link.setAttribute('target', '_blank');
    img.setAttribute('src', file);

    link.appendChild(img);

    return link;
  };

  const getActiveImage = (container) => container.querySelector('a.active');

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
    imageContainer.classList.add('images');
    imageContainer.appendChild(firstImage);

    for (const file of otherFiles) {
      imageContainer.appendChild(createImage(file));
    }
    target.appendChild(imageContainer);

    prevControl.classList.add('prev');
    prevControl.appendChild(document.createTextNode('⬅️'));
    prevControl.addEventListener('click', () => {
      const currentActive = getActiveImage(target);
      const nextActive = imageContainer.firstChild === currentActive ? imageContainer.lastChild : currentActive.previousSibling;

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
