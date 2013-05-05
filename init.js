function waitForDOM(callback) {
  var callbackArguments = [].slice.call(arguments, 1),
      callbackWrapper = function () {
        callback.apply(this, callbackArguments);
      },
      readyState = document.readyState;

  if (readyState == 'interactive' || readyState == 'complete') {
    callbackWrapper();
  }
  else {
    document.addEventListener('DOMContentLoaded', function onDOM() {
      document.removeEventListener('DOMContentLoaded', onDOM);
      callbackWrapper();
    });
  }
}

waitForDOM(setupPresentation);
