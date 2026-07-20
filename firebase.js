import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getDatabase,
    ref,
    set,
    get,
    child
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {

  apiKey: "AIzaSyAsbt8_DNeNxQYXNovoP05pyqI_1DQ-e9I",

  authDomain:
  "proyectouna2026-a385d.firebaseapp.com",

  databaseURL:
  "https://proyectouna2026-a385d-default-rtdb.firebaseio.com",

  projectId:
  "proyectouna2026-a385d",

  storageBucket:
  "proyectouna2026-a385d.firebasestorage.app",

  messagingSenderId:
  "800596143672",

  appId:
  "1:800596143672:web:7b4b81d2dd5116fd2140cd",

  measurementId:
  "G-1C2JNPFHTY"

};

const app =
initializeApp(firebaseConfig);

const db =
getDatabase(app);

export {
    db,
    ref,
    set,
    get,
    child
};