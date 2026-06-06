/* ============================================================
   js/firebase-init.js — Class S
   SDK Firebase COMPAT (v9) — script normal, pas de module ES
   Chargé SYNCHRONIQUEMENT → window.FB disponible immédiatement
   pour tous les scripts defer qui suivent.
============================================================ */
(function () {
  var config = {
    apiKey:            'AIzaSyAUjEq5gT_BewDShDjHe_zsSxIiw_k_GBg',
    authDomain:        'class-s-website.firebaseapp.com',
    projectId:         'class-s-website',
    storageBucket:     'class-s-website.firebasestorage.app',
    messagingSenderId: '205743085246',
    appId:             '1:205743085246:web:4dfe5ff65951efb61470ef'
  };

  try {
    if (!firebase.apps.length) firebase.initializeApp(config);
    var db = firebase.firestore();

    window.FB = {
      /* Charge une clé depuis Firestore */
      load: function (key) {
        return db.collection('site').doc(key).get().then(function (snap) {
          return snap.exists ? snap.data().value : null;
        });
      },

      /* Sauvegarde une clé dans Firestore */
      save: function (key, value) {
        return db.collection('site').doc(key).set({ value: value, updatedAt: new Date().toISOString() });
      },

      /* Charge plusieurs clés en parallèle */
      loadAll: function (keys) {
        var result = {};
        return Promise.all(keys.map(function (k) {
          return db.collection('site').doc(k).get().then(function (snap) {
            if (snap.exists) result[k] = snap.data().value;
          }).catch(function (e) {
            console.warn('[Firebase] load error:', k, e);
          });
        })).then(function () { return result; });
      }
    };

    console.log('[Firebase] ✅ Connexion Firestore établie');
  } catch (e) {
    console.error('[Firebase] ❌ Erreur init:', e);
    window.FB = null;
  }
})();
