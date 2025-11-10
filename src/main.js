// src/main.js
import './firebase.js'; // Import Firebase FIRST

console.log('Main.js loaded - Firebase should be initialized');

// Check if App exists and initialize it
if (typeof App !== 'undefined') {
  console.log('App found, initializing...');
  App.init();
} else {
  console.log('App not defined yet - checking in 1 second...');
  // Wait a bit and check again (in case App loads later)
  setTimeout(() => {
    if (typeof App !== 'undefined') {
      console.log('App found after delay, initializing...');
      App.init();
    } else {
      console.error('App still not defined. Check your app.js file');
      
      // Create a fallback App for testing
      window.App = {
        init: function() {
          console.log('Fallback App initialized - Firebase should work now');
        }
      };
      window.App.init();
    }
  }, 1000);
}
