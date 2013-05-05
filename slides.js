var slides, tabs, currentSlideNumber = 0, progress, animation;
var previousSlideButton, nextSlideButton;

function setupNavigation(itemCount) {
  previousSlideButton = document.getElementById('previous-slide-button');
  nextSlideButton = document.getElementById('next-slide-button');

  progress = document.getElementById('progress');
  progress.max = itemCount;

  previousSlideButton.disabled = true;
  previousSlideButton.onclick = navigateToPreviousSlide;
  nextSlideButton.disabled = true;
  nextSlideButton.onclick = navigateToNextSlide;

  var directIndex = document.querySelector('#navigation ul');
  var tab, tabContainer = document.createDocumentFragment();
  for (var i = 1; i <= itemCount; i++) {
    tab = document.createElement('li');
    tab.setAttribute('role', 'tab');
    tab.style.width = 'calc(100% / ' + itemCount + ')';
    tab.innerHTML = '<a href="#/' + i + '">' + i + '</a>';
    tab.dataset.slide = i;
    tabContainer.appendChild(tab);
  }
  directIndex.appendChild(tabContainer)
  tabs = [].slice.call(directIndex.children);

  window.addEventListener('hashchange', function (evt) {
    var targetSlide = parseInt(location.hash.split('/')[1], 10);
    goToSlide(targetSlide);
  });
}

function navigateToSlide(targetSlide) {
  location.hash = '#/' + targetSlide;
}

function setupSlides() {
  slides = [].slice.call(document.getElementsByClassName('slide')),
  slides.forEach(function onEachSlide(slide) {
    slide.dataset.viewport = 'right';
  });
}

function goToSlide(targetSlideNumber) {
  clearInterval(animation);

  var steps = Math.abs(targetSlideNumber - currentSlideNumber),
      reversed = targetSlideNumber < currentSlideNumber;

  function moveToTargetSlide() {
    if (steps === 0) {
      clearInterval(animation);
      return;
    }

    if (reversed) {
      previousSlide();
    }
    else {
      nextSlide();
    }
    steps--;
  }

  moveToTargetSlide();
  animation = setInterval(moveToTargetSlide, 100);
}

function nextSlide() {
  var currentIndex = currentSlideNumber - 1,
      currentSlide = slides[currentIndex],
      currentTab = tabs[currentIndex],
      nextSlide = slides[currentIndex + 1],
      nextTab = tabs[currentIndex + 1];

  if (currentSlide) {
    currentSlide.dataset.viewport = 'left';
    currentTab.classList.remove('active');
  }
  if (nextSlide) {
    delete nextSlide.dataset.viewport;
    nextTab.classList.add('active');
  }
  updateNavigationState(false);
}

function previousSlide() {
  var currentIndex = currentSlideNumber - 1,
      currentSlide = slides[currentIndex],
      currentTab = tabs[currentIndex],
      previousSlide = slides[currentIndex - 1],
      previousTab = tabs[currentIndex - 1];

  if (currentSlide) {
    currentSlide.dataset.viewport = 'right';
    currentTab.classList.remove('active');
  }
  if (previousSlide) {
    delete previousSlide.dataset.viewport;
    previousTab.classList.add('active');
  }
  updateNavigationState(true);
}

function updateNavigationState(reversed) {
  currentSlideNumber += reversed ? -1 : 1;
  progress.value = currentSlideNumber;
  previousSlideButton.disabled = currentSlideNumber === 1;
  nextSlideButton.disabled = currentSlideNumber === slides.length;
}

function notifyReady() {
  var notification = document.querySelector('section[role="status"]');
  notification.classList.add('active');
  setTimeout(function () {
    notification.classList.remove('active');
  }, 1000);
}

function setupPresentation() {
  setupSlides();
  setupNavigation(slides.length);
  notifyReady();
  navigateToSlide(1);
}

function navigateToNextSlide() {
  if (currentSlideNumber < slides.length)
    navigateToSlide(currentSlideNumber+1);
}

function navigateToPreviousSlide() {
  if (currentSlideNumber > 1)
    navigateToSlide(currentSlideNumber-1);
}
