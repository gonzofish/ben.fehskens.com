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
    const imageContainer = document.createElement('span');
    const nextControl = document.createElement('button');
    const prevControl = document.createElement('button');

    target.classList.add('fesh-gallery');

    firstImage.classList.add('active');
    imageContainer.appendChild(firstImage);

    for (const file of otherFiles) {
      imageContainer.appendChild(createImage(file));
    }

    nextControl.classList.add('control', 'next');
    nextControl.appendChild(document.createTextNode('➡️'));
    nextControl.addEventListener('click', () => {
      const currentActive = getActiveImage(target);
      const nextActive = imageContainer.lastChild === currentActive ? imageContainer.firstChild : currentActive.nextSibling;

      currentActive.classList.remove('active');
      nextActive.classList.add('active');
    });
    target.appendChild(nextControl);

    target.appendChild(imageContainer);

    prevControl.classList.add('control', 'prev');
    prevControl.appendChild(document.createTextNode('⬅️'));
    prevControl.addEventListener('click', () => {
      const currentActive = getActiveImage(target);
      const nextActive = imageContainer.firstChild === currentActive ? imageContainer.lastChild : currentActive.prevSibling;

      currentActive.classList.remove('active');
      nextActive.classList.add('active');
    });
    target.appendChild(prevControl);
  };

  window.fesh = {
    gallery,
  }
})();
