<!-- In index.html -->
<script src="https://www.gstatic.com/firebasejs/9.6.10/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.6.10/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore-compat.js"></script>

<script>
  // Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyCL3nmvDtX7QO-xqVCVQg3vGVD2weVhgpM",
    authDomain: "barterbite-c735d.firebaseapp.com",
    projectId: "barterbite-c735d",
    storageBucket: "barterbite-c735d.firebasestorage.app",
    messagingSenderId: "77392068948",
    appId: "1:77392068948:web:036761985e672f80f708c1"
  };

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  
  // Make available globally
  window.auth = firebase.auth();
  window.db = firebase.firestore();
</script>
