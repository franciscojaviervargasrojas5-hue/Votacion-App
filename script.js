// --- CONFIGURACIÓN DE FIREBASE CORREGIDA ---
const firebaseConfig = {
    apiKey: "AIzaSyAPZ8vqBxaMxkT6W3mubfHG65fm7imEAWM",
    authDomain: "votacionapp-7f777.firebaseapp.com",
    databaseURL: "https://votacionapp-7f777-default-rtdb.firebaseio.com", // <-- ¡Esta línea faltaba y es obligatoria!
    projectId: "votacionapp-7f777",
    storageBucket: "votacionapp-7f777.firebasestorage.app",
    messagingSenderId: "739814735072",
    appId: "1:739814735072:web:44b8044d4553401ac02485",
    measurementId: "G-FLTD6KF239"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Función para emitir el voto
function votar(idOpcion, nombreOpcion) {
    const nombre = document.getElementById("nombreUsuario").value.trim();

    if (nombre === "") {
        alert("Por favor, ingresa tu nombre antes de votar.");
        document.getElementById("nombreUsuario").focus();
        return;
    }

    // Verificar en la base de datos si esta persona ya votó
    db.ref("votosRegistrados/" + nombre).once("value", (snapshot) => {
        if (snapshot.exists()) {
            alert(`¡Lo siento, ${nombre}, ya registraste un voto anteriormente!`);
        } else {
            // Guardar quién votó y por qué opción
            db.ref("votosRegistrados/" + nombre).set({
                opcion: nombreOpcion
            });

            // Actualizar el contador general
            db.ref("totales/opcion" + idOpcion).transaction((currentVotes) => {
                return (currentVotes || 0) + 1;
            });

            alert(`¡Gracias ${nombre}, tu voto por la ${nombreOpcion} ha sido registrado!`);
            document.getElementById("nombreUsuario").value = ""; // Limpiar campo
        }
    });
}

// Escuchar cambios en tiempo real para actualizar contadores en pantalla
db.ref("totales").on("value", (snapshot) => {
    const data = snapshot.val() || {};
    document.getElementById("votos-1").innerText = data.opcion1 || 0;
    document.getElementById("votos-2").innerText = data.opcion2 || 0;
    document.getElementById("votos-3").innerText = data.opcion3 || 0;
});

// Escuchar cambios en tiempo real para mostrar la lista de quiénes votaron
db.ref("votosRegistrados").on("value", (snapshot) => {
    const lista = document.getElementById("lista-votantes");
    lista.innerHTML = ""; // Limpiar lista actual
    
    snapshot.forEach((childSnapshot) => {
        const nombreVotante = childSnapshot.key;
        const infoVoto = childSnapshot.val();

        const li = document.createElement("li");
        li.innerText = `${nombreVotante} votó por: ${infoVoto.opcion}`;
        lista.appendChild(li);
    });    
});
