// --- CONFIGURA ESTO CON TUS DATOS DE FIREBASE ---
const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "tu-proyecto.firebaseapp.com",
    databaseURL: "https://tu-proyecto-default-rtdb.firebaseio.com",
    projectId: "tu-proyecto",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "tu_sender_id",
    appId: "tu_app_id"
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