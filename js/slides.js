var CompactSlide = (function() {
  'use strict';

  var EVENT_NAMESPACE = 'compactslide';

  function NavigationModel(slides) {
    this.currentSlideNumber = 0;
    this.slideCount = slides.length;
    this.steppingToTarget = 0;
  }

  NavigationModel.prototype.goToSlide = function(targetSlideNumber) {
    if (targetSlideNumber < 1 || targetSlideNumber > this.slideCount) {
      return;
    }
    var forward = targetSlideNumber > this.currentSlideNumber;
    var steps = Math.abs(targetSlideNumber - this.currentSlideNumber);
    this.goToSlideStepByStep(steps, forward);
  };

  NavigationModel.prototype.goToSlideStepByStep = function(steps, forward) {
    var self = this;
    function nextStep() {
      if (forward) {
        self.nextSlide();
      }
      else {
        self.previousSlide();
      }
      steps--;
      if (steps) {
        self.steppingToTarget = setTimeout(nextStep, 200);
      }
    }

    clearTimeout(this.steppingToTarget);
    nextStep();
  }

  NavigationModel.prototype.nextSlide = function() {
    if (!this.isEnd) {
      this.currentSlideNumber++;
      this.emit(
        EVENT_NAMESPACE + ':slidechange',
        { forward: true,
          from: this.currentSlideNumber - 1 , to: this.currentSlideNumber }
      );
    }
  };

  Object.defineProperty(NavigationModel.prototype, 'isEnd', {
    get: function () {
      return this.currentSlideNumber === this.slideCount;
    }
  });

  NavigationModel.prototype.previousSlide = function() {
    if (!this.isBegin) {
      this.currentSlideNumber--;
      this.emit(
        EVENT_NAMESPACE + ':slidechange',
        { backward: true,
          from: this.currentSlideNumber + 1 , to: this.currentSlideNumber }
      );
    }
  };

  Object.defineProperty(NavigationModel.prototype, 'isBegin', {
    get: function () {
      return this.currentSlideNumber === 1;
    }
  });

  NavigationModel.prototype.emit = function(type, detail) {
    var syncEvent = new CustomEvent(type, { detail: detail });
    window.dispatchEvent(syncEvent);
  }

  function NavigationRender(model, slides, progress, navigator) {
    this.model = model;
    this.slides = slides;
    this.progress = progress;
    this.navigator = navigator;

    this.setupSlides();
    this.setupProgressBar();
    this.setupNavigationButtons();
    this.setupPaginator();

    var self = this;
    window.addEventListener(EVENT_NAMESPACE + ':slidechange', function (evt) {
      self.updateNavigation(evt.detail);
    });
  }

  NavigationRender.prototype.setupSlides = function () {
    this.slides.forEach(function onEachSlide(slide) {
      slide.dataset.viewport = 'right';
    });
  }

  NavigationRender.prototype.setupProgressBar = function () {
    this.progress.max = this.model.slideCount;
  };

  NavigationRender.prototype.setupNavigationButtons = function () {
    this.nextSlideButton = document.getElementById('next-slide-button');
    this.previousSlideButton = document.getElementById('previous-slide-button');
  };

  NavigationRender.prototype.setupPaginator = function () {
    var slideCount = this.model.slideCount;
    var directIndex = this.navigator.querySelector('ul');
    var label, tab, tabContainer = document.createDocumentFragment();
    for (var i = 1; i <= slideCount; i++) {
      tab = document.createElement('li');
      tab.setAttribute('role', 'tab');
      tab.style.width = 'calc(100% / ' + slideCount + ')';
      label = this.getLabelForPage(i);
      tab.innerHTML = '<a href="#/' + i + '">' + label + '</a>';
      tabContainer.appendChild(tab);
    }
    directIndex.appendChild(tabContainer)
  };

  NavigationRender.prototype.getLabelForPage = function (pageNumber) {
    var i = pageNumber - 1;
    if (this.slides[i].classList.contains('index'))
      return 'I';

    if (this.slides[i].classList.contains('title'))
      return 'T';

    return pageNumber;
  };

  NavigationRender.prototype.updateNavigation = function (detail) {
    this.updateSlides(detail);
    this.updateProgressBar();
    this.updateNavigationButtons();
    this.updatePaginator();
  };

  NavigationRender.prototype.updateSlides = function (detail) {
    var currentSlide = this.slides[detail.to - 1],
        previousSlide = this.slides[detail.from - 1];

    delete currentSlide.dataset.viewport;
    if (previousSlide) {
      if ('forward' in detail) {
        previousSlide.dataset.viewport = 'left';
      }
      else if ('backward' in detail) {
        previousSlide.dataset.viewport = 'right';
      }
    }
  }

  NavigationRender.prototype.updateProgressBar = function () {
    this.progress.value = this.model.currentSlideNumber;
  };

  NavigationRender.prototype.updateNavigationButtons = function() {
    this.nextSlideButton.disabled = this.model.isEnd;
    this.previousSlideButton.disabled = this.model.isBegin;
  }

  NavigationRender.prototype.updatePaginator = function() {
    var currentSlideIndex = this.model.currentSlideNumber - 1;
    var pages = [].slice.call(
      this.navigator.querySelectorAll('[role="tablist"] > [role="tab"]')
    );
    pages.forEach(function onEachPageItem(pageItem, index) {
      pageItem.setAttribute('aria-selected', index === currentSlideIndex);
    });
  }

  function NavigationControl(model, navigator) {
    this.model = model;
    this.navigator = navigator;

    this.setupNavigationArrows();
    this.setupNavigationButtons();
    this.setupHashControl();
  }

  NavigationControl.prototype.setupNavigationArrows = function () {
    var self = this;
    var RIGHT_ARROW = 39, LEFT_ARROW = 37;
    window.addEventListener('keypress', function (evt) {
      var keycode = evt.keyCode;
      switch(keycode) {
        case RIGHT_ARROW:
          evt.preventDefault();
          self.navigateToNextSlide();
          break;
        case LEFT_ARROW:
          evt.preventDefault();
          self.navigateToPreviousSlide();
          break;
      }
    });
  }

  NavigationControl.prototype.setupNavigationButtons = function () {
    document.getElementById('next-slide-button').onclick =
      this.navigateToNextSlide.bind(this);

    document.getElementById('previous-slide-button').onclick =
      this.navigateToPreviousSlide.bind(this);
  };

  NavigationControl.prototype.setupHashControl = function () {
    var self = this;
    window.addEventListener('hashchange', function () {
      var targetSlide = parseInt(location.hash.split('/')[1], 10);
      self.model.goToSlide(targetSlide);
    });
    window.location.hash = '#';
  };

  NavigationControl.prototype.navigateToSlide = function (targetSlide) {
    window.location.hash = '#/' + targetSlide;
  }

  NavigationControl.prototype.navigateToNextSlide = function () {
    var targetSlide = this.model.currentSlideNumber + 1;
    this.navigateToSlide(targetSlide);
  };

  NavigationControl.prototype.navigateToPreviousSlide = function () {
    var targetSlide = this.model.currentSlideNumber - 1;
    this.navigateToSlide(targetSlide);
  };

  function init() {
    var progress = document.getElementById('progress');
    var navigation = document.getElementById('navigation');
    var slides = [].slice.call(document.getElementsByClassName('slide'));

    var theModel = new NavigationModel(slides);
    var theRender = new  NavigationRender(
      theModel,
      slides, progress, navigation
    );
    var theControl = new NavigationControl(theModel, navigation);
    theControl.navigateToSlide(1);

    notifyPresentationIsReady();
  }

  function notifyPresentationIsReady() {
    var presentationNotifier = document.getElementById('presentation-notifier');
    presentationNotifier.classList.add('active');
    setTimeout(function () {
      presentationNotifier.classList.remove('active');
    }, 1000);
  }

  return {
    init: init
  };
}());
