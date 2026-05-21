/* ============================================================
   js/firebase.js — Class S
   Firebase Firestore + Storage
   Expose window._fbReady (Promise → fbApi)
============================================================ */
import { initializeApp }
  from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js';
import { getFirestore, doc, getDoc, setDoc }
  from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL }
  from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js';

const firebaseConfig = {
  apiKey:            'AIzaSyAUjEq5gT_BewDShDjHe_zsSxIiw_k_GBg',
  authDomain:        'class-s-website.firebaseapp.com',
  projectId:         'class-s-website',
  storageBucket:     'class-s-website.firebasestorage.app',
  messagingSenderId: '205743085246',
  appId:             '1:205743085246:web:4dfe5ff65951efb61470ef'
};

const app     = initializeApp(firebaseConfig);
const db      = getFirestore(app);
const storage = getStorage(app);

const fbApi = {
  /** Charge une clé depuis Firestore. Retourne null si absente. */
  async load(key) {
    const snap = await getDoc(doc(db, 'site', key));
    return snap.exists() ? snap.data().value : null;
  },

  /** Charge plusieurs clés en parallèle. Retourne { key: value, … } */
  async loadAll(keys) {
    const result = {};
    await Promise.all(keys.map(async k => {
      try {
        const snap = await getDoc(doc(db, 'site', k));
        if (snap.exists()) result[k] = snap.data().value;
      } catch (e) {
        console.warn('[Firebase] load error for', k, e);
      }
    }));
    return result;
  },

  /** Sauvegarde une valeur dans Firestore. */
  async save(key, value) {
    await setDoc(doc(db, 'site', key), {
      value,
      updatedAt: new Date().toISOString()
    });
  },

  /**
   * Upload un fichier (dataURL base64) vers Firebase Storage.
   * Retourne l'URL publique de téléchargement.
   * path exemple : "team/scott.jpg", "projects/koulba-1.jpg"
   */
  async uploadImage(path, dataURL) {
    const resp = await fetch(dataURL);
    const blob = await resp.blob();
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, blob, { contentType: blob.type || 'image/jpeg' });
    return await getDownloadURL(storageRef);
  }
};

if (typeof window._fbReadyResolve === 'function') {
  window._fbReadyResolve(fbApi);
} else {
  window._fbReady = Promise.resolve(fbApi);
}
