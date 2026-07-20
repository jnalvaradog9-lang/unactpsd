import {
    db,
    ref,
    set,
    get,
    child
}
from "./firebase.js";

/* ========================================================= */
/* VARIABLES */
/* ========================================================= */
let reporteExamen = "";
let notaFinal = 0;
let correctasFinal = 0;
emailjs.init("cy2K6uxLpIqzX8Cz_");
let modoExamen = false;
let correoEstudiante = "";
let respuestasExamen = [];
let preguntas = [];
let filtradas = [];
let tiempoInicialExamen = 0;
let actual = 0;
let seleccion = null;
let tipousuario=null;
let estudiantes = [];
let estudianteActual = null;

let estadoPreguntas = [];

/* ========================================================= */
/* LOGROS */
/* ========================================================= */

const listaLogros = [

{
    id: 1,
    nombre: "Primer Paso",
    desc: "Responder 1 pregunta"
},
{
    id: 2,
    nombre: "Aprendiz",
    desc: "Responder 10 preguntas"
},
{
    id: 3,
    nombre: "Experto",
    desc: "Responder 50 preguntas"
},
{
    id: 4,
    nombre: "Maestro",
    desc: "Responder 100 preguntas"
},
{
    id: 5,
    nombre: "Perfecto",
    desc: "Obtener 100% en una categoría"
},
{
    id: 6,
    nombre: "Velocidad",
    desc: "Completar modo examen"
},
{
    id: 7,
    nombre: "Sin Fallos",
    desc: "10 respuestas correctas seguidas"
},
{
    id: 8,
    nombre: "Programador",
    desc: "Responder preguntas de programación"
},
{
    id: 9,
    nombre: "Bases de Datos",
    desc: "Responder preguntas BD"
},
{
    id: 10,
    nombre: "Redes",
    desc: "Responder preguntas de redes"
},
{
    id: 11,
    nombre: "Web Master",
    desc: "Responder preguntas web"
},
{
    id: 12,
    nombre: "Constancia",
    desc: "Usar la plataforma varios días"
},
{
    id: 13,
    nombre: "Modo Oscuro",
    desc: "Activar modo oscuro"
},
{
    id: 14,
    nombre: "Investigador",
    desc: "Usar pistas"
},
{
    id: 15,
    nombre: "Video Aprendiz",
    desc: "Ver videos educativos"
},
{
    id: 16,
    nombre: "Precisión",
    desc: "80% global"
},
{
    id: 17,
    nombre: "Imparable",
    desc: "200 preguntas respondidas"
},
{
    id: 18,
    nombre: "Dedicación",
    desc: "Practicar todas las categorías"
},
{
    id: 19,
    nombre: "Examinado",
    desc: "Completar 5 modos examen"
},
{
    id: 20,
    nombre: "Leyenda",
    desc: "Desbloquear todos los logros"
}

];

/* ========================================================= */
/* CARGAR PREGUNTAS */
/* ========================================================= */

fetch('preguntas.json')
.then(res => res.json())
.then(data => {

    preguntas = data;

    cargarCategorias();

});

/* ========================================================= */
/* CARGAR CATEGORÍAS */
/* ========================================================= */

function cargarCategorias(){

    const cont = document.getElementById("categorias");

    const categorias = [
        ...new Set(
            preguntas.map(p => p.categoria)
        )
    ];

    categorias.forEach(cat => {

        cont.innerHTML += `
        <label>

        <input
        type="checkbox"
        value="${cat}">

        ${cat}

        </label>
        `;

    });

}

/* ========================================================= */
/* LOGIN */
/* ========================================================= */

function comprobarCedula(){

    const cedula =
    document
    .getElementById("cedulaInput")
    .value
    .trim();


    const estudiante =
    estudiantes.find(
        e => e.cedula === cedula
    );

    const mensaje =
    document.getElementById(
        "mensajeError"
    );

    if(!estudiante){

        mensaje.innerHTML =
        "❌ Cédula no encontrada";

        return;

        
    }


    correoEstudiante = estudiante?.correo || "";
tipousuario= estudiante?.tipodeusuario || "";
    estudianteActual = estudiante;

    if(tipousuario === "Admin"){

    document
    .getElementById("btnMonitoreo")
    .classList.remove("hidden");

}else{

    document
    .getElementById("btnMonitoreo")
    .classList.add("hidden");

}

    /* CREAR LOGROS SI NO EXISTE */

    if(!estudianteActual.logros){
    estudianteActual.logros = [];
}

    if(!estudianteActual.favoritas){

    estudianteActual.favoritas=[];

}
if(!estudianteActual.actividad){

    estudianteActual.actividad = {};

}
if(!estudianteActual.examenes){
    estudianteActual.examenes = [];
}

    document.getElementById(
        "loginBox"
    ).style.display = "none";

    document.getElementById(
        "panelEstudiante"
    ).style.display = "block";

    document.getElementById(
        "nombreEstudiante"
    ).innerHTML =

    `Bienvenido ${estudiante.nombre}`;

}

/* ========================================================= */
/* HISTORIAL */
/* ========================================================= */

function generarCalendarioActividad(){

    if(!estudianteActual.actividad){

        estudianteActual.actividad = {};

    }

    let html = `

    <div class="historial-card">

    <h2>
    📅 Actividad Últimos 30 Días
    </h2>

    <div class="calendario-grid">

    `;

    const hoy = new Date();

    for(let i=29; i>=0; i--){

        const fecha = new Date();

        fecha.setDate(
            hoy.getDate() - i
        );

        const clave =

        fecha.getFullYear() + "-" +

        String(fecha.getMonth()+1)
        .padStart(2,"0") + "-" +

        String(fecha.getDate())
        .padStart(2,"0");

        const cantidad =

        estudianteActual
        .actividad[clave] || 0;

        let clase =
        "sin-actividad";

        if(cantidad >= 1)
        clase = "nivel1";

        if(cantidad >= 5)
        clase = "nivel2";

        if(cantidad >= 10)
        clase = "nivel3";

        if(cantidad >= 20)
        clase = "nivel4";

        html += `

        <div

        class="dia ${clase}"

        title="${clave}
${cantidad} preguntas">

        ${fecha.getDate()}

        </div>

        `;

    }

    html += `

    </div>

    <br>

    ${resumenActividad()}

    </div>

    `;

    return html;

}


function resumenActividad(){

    let total = 0;

    let mejorDia = "Sin datos";

    let mayor = 0;

    for(let fecha in estudianteActual.actividad){

        const cantidad =
        estudianteActual.actividad[fecha];

        total += cantidad;

        if(cantidad > mayor){

            mayor = cantidad;

            mejorDia = fecha;

        }

    }

    return `

    <div class="estadisticas-globales">

    <p>
    📚 Total preguntas:
    <strong>${total}</strong>
    </p>

    <p>
    🔥 Máximo en un día:
    <strong>${mayor}</strong>
    </p>

    <p>
    🏆 Mejor día:
    <strong>${mejorDia}</strong>
    </p>

    <p>
    📅 Días registrados:
    <strong>${Object.keys(estudianteActual.actividad).length}</strong>
    </p>

    </div>

    `;

}

function mostrarHistorial(){
document.getElementById("monitoreoBox")
.style.display = "none";
    document.getElementById("config")
    .style.display = "none";

    document.getElementById("quiz")
    .style.display = "none";

    document.getElementById("logrosBox")
    .style.display = "none";

    const box =
    document.getElementById(
        "historialBox"
    );

    box.style.display = "block";

    let html = "";
    
    let historialExamenes = `
  
<div class="historial-card">

<h2>
📝 Historial de Modo Examen
</h2>
`;

if(
    estudianteActual.examenes &&
    estudianteActual.examenes.length > 0
){

    historialExamenes += `
    <table class="tabla-monitoreo">

    <thead>

    <tr>

    <th>#</th>
    <th>Fecha</th>
    <th>Hora</th>
    <th>Correctas</th>
    <th>Nota</th>
<th>Tiempo</th>
    </tr>

    </thead>

    <tbody>
    `;

    estudianteActual.examenes
    .slice()
    .reverse()
    .forEach((e,i)=>{

        historialExamenes += `

        <tr>

        <td>${i+1}</td>

        <td>${e.fecha}</td>

        <td>${e.hora}</td>

        <td>${e.correctas}/${e.total}</td>

        <td>${e.nota}%</td>
<td>${e.tiempo || "00:00:00"}</td>
        </tr>

        `;

    });

    historialExamenes += `
    </tbody>
    </table>
    `;

}else{

    historialExamenes += `

    <p>

    Aún no se han realizado exámenes.

    </p>

    `;

}

historialExamenes += `
</div>

<div class="separador-historial"></div>
`;

    let totalRespondidas = 0;
    let totalAciertos = 0;

    let mejorCategoria = "";
    let peorCategoria = "";

    let mejorPorcentaje = -1;
    let peorPorcentaje = 101;

    let hayDatos = false;

    /* ========================================================= */
    /* RECORRER CATEGORÍAS */
    /* ========================================================= */

if(!estudianteActual.historial){

    estudianteActual.historial = {};

}

for(let categoria in estudianteActual.historial){

        let categoriaHTML = "";

        let categoriaTieneDatos = false;

        let catRespondidas = 0;
        let catAciertos = 0;

        ["facil","medio","dificil"]
        .forEach(nivel => {

            const datos =
            estudianteActual
            .historial[categoria][nivel];

            totalRespondidas +=
            datos.respondidas;

            catRespondidas +=
            datos.respondidas;

            const aciertosNivel =
            Math.round(
                (datos.correctas / 100)
                *
                datos.respondidas
            );

            totalAciertos +=
            aciertosNivel;

            catAciertos +=
            aciertosNivel;

            /* SOLO MOSTRAR SI HA RESPONDIDO */

            if(datos.respondidas > 0){

                categoriaTieneDatos = true;

                hayDatos = true;

               categoriaHTML += `
<div class="nivel-box">

<h4>
${nivel.toUpperCase()}
</h4>

<p>
📘 Respondidas:
${datos.respondidas}
</p>

<p>
✅ Correctas:
${datos.correctas}%
</p>

<p>
❌ Incorrectas:
${datos.incorrectas}%
</p>

</div>
`;

            }

        });

        /* ========================================================= */
        /* CALCULAR MEJOR Y PEOR CATEGORÍA */
        /* ========================================================= */

        if(catRespondidas > 0){

            const porcentaje =
            Math.round(
                (catAciertos /
                catRespondidas) * 100
            );

            if(
                porcentaje >
                mejorPorcentaje
            ){

                mejorPorcentaje =
                porcentaje;

                mejorCategoria =
                categoria;

            }

            if(
                porcentaje <
                peorPorcentaje
            ){

                peorPorcentaje =
                porcentaje;

                peorCategoria =
                categoria;

            }

        }

        /* ========================================================= */
        /* MOSTRAR CATEGORÍA */
        /* ========================================================= */

        if(categoriaTieneDatos){

           html += `
<div class="categoria-box">

<h3>
${categoria}
</h3>

<div class="niveles-grid">

${categoriaHTML}

</div>

</div>
`;

        }

    }

    /* ========================================================= */
    /* ESTADÍSTICAS GLOBALES */
    /* ========================================================= */

    const porcentajeGlobal =
    totalRespondidas > 0
    ?
    Math.round(
        (totalAciertos /
        totalRespondidas) * 100
    )
    :
    0;

    const categoriaFuerte =
    mejorCategoria || "Sin datos";

    const categoriaDebil =
    peorCategoria || "Sin datos";

    /* ========================================================= */
    /* ENCABEZADO */
    /* ========================================================= */

    html =  historialExamenes + `
    <div class="historial-card">

    <h2>
    📈 Estadísticas Globales
    </h2>

    <div class="estadisticas-globales">

    <p>
    📊 Porcentaje Global:
    <strong>${porcentajeGlobal}%</strong>
    </p>

    <p>
    💪 Categoría más fuerte:
    <strong>${categoriaFuerte}</strong>
    </p>

    <p>
    📚 Categoría más débil:
    <strong>${categoriaDebil}</strong>
    </p>

    </div>
${generarCalendarioActividad()}
    <h2>
    📊 Historial por Categoría
    </h2>

    ${html}
    `;

    /* ========================================================= */
    /* SI NO HAY DATOS */
    /* ========================================================= */

    if(!hayDatos){

        html += `
        <p class="sin-historial">

        📭 Aún no has respondido preguntas.

        </p>
        `;

    }

    html += `</div>`;

    box.innerHTML = html;

}


/* ========================================================= */
/* LOGROS */
/* ========================================================= */

function mostrarLogros(){
clearInterval(temporizadorIntervalo);
document.getElementById("monitoreoBox")
.style.display = "none";
    document.getElementById("historialBox")
    .style.display = "none";

    document.getElementById("config")
    .style.display = "none";

    document.getElementById("quiz")
    .style.display = "none";

    const box =
    document.getElementById(
        "logrosBox"
    );

    box.style.display = "block";

    let html = `

    <div class="historial-card">

    <h2>🏆 Logros</h2>

    <div class="logros-grid">
    `;

    listaLogros.forEach(logro => {

        const desbloqueado =
        estudianteActual.logros.includes(
            logro.id
        );

        html += `

        <div class="logro-item ${
            desbloqueado
            ?
            "desbloqueado"
            :
            "bloqueado"
        }">

        <h3>

        ${
            desbloqueado
            ?
            "🏆"
            :
            "🔒"
        }

        ${logro.nombre}

        </h3>

        <p>
        ${logro.desc}
        </p>

        </div>
        `;

    });

    html += `
    </div>
    </div>
    `;

    box.innerHTML = html;

}

/* ========================================================= */
/* MOSTRAR PRÁCTICAS */
/* ========================================================= */

function mostrarPracticas(){
clearInterval(temporizadorIntervalo);
    modoExamen = false;
    document.getElementById("monitoreoBox")
.style.display = "none";
document
.getElementById("btnFinalizar")
.classList.add("hidden");
    document.getElementById("historialBox")
    .style.display = "none";

    document.getElementById("logrosBox")
    .style.display = "none";

    document.getElementById("quiz")
    .style.display = "none";

    const examenBox =
    document.getElementById("modoExamenBox");

    if(examenBox){

        examenBox.style.display = "none";

    }

    document.getElementById("config")
    .style.display = "block";

}
/* ========================================================= */
/* MODO EXAMEN */
/* ========================================================= */

function iniciarModoExamen(){

    modoExamen = true;
document
.getElementById("btnFinalizar")
.classList.remove("hidden");
    document.getElementById("config")
.style.display = "none";

document.getElementById("historialBox")
.style.display = "none";

document.getElementById("logrosBox")
.style.display = "none";

    document.getElementById("quiz")
    .style.display = "block";

    filtradas = preguntas.filter(p =>

        p.nivel === "medio" ||
        p.nivel === "dificil"

    );

    filtradas.sort(
        () => Math.random() - 0.5
    );

    filtradas = filtradas.slice(0,10);
respuestasExamen =
filtradas.map(() => null);
    actual = 0;
document
.getElementById("btnFinalizar")
.disabled = true;

document
.getElementById("btnFinalizar")
.innerHTML =
`⛔ Faltan ${filtradas.length}`;
    estadoPreguntas =
    filtradas.map(
        () => "no-vista"
    );

    crearNav();

    mostrarPregunta();
    const tiempoGuardado =
    localStorage.getItem("tiempoExamen");

// Reiniciar siempre el tiempo del examen
tiempoExamen = 10800; // 3 horas
tiempoInicialExamen = tiempoExamen;
// Eliminar cualquier tiempo guardado anteriormente
localStorage.removeItem("tiempoExamen");

clearInterval(temporizadorIntervalo);
iniciarTemporizador();

}
function formatearTiempo(segundos){

    const horas = Math.floor(segundos / 3600);

    const minutos = Math.floor((segundos % 3600) / 60);

    const seg = segundos % 60;

    return `${String(horas).padStart(2,"0")}:${String(minutos).padStart(2,"0")}:${String(seg).padStart(2,"0")}`;

}

function seleccionar(i){

    seleccion = i;

    if(modoExamen){

        respuestasExamen[actual] = i;

        estadoPreguntas[actual] =
        "respondida";

        actualizarNav();

        verificarPreguntasPendientes();

    }

    document
    .querySelectorAll(".opcion")
    .forEach((el,index)=>{

        el.classList.remove(
            "seleccionada"
        );

        if(index === i){

            el.classList.add(
                "seleccionada"
            );

        }

    });

}

function finalizarExamen(){

    alert(
        "⏰ Tiempo agotado"
    );

    finalizarExamenManual();

}

function verificarPreguntasPendientes(){

    const faltantes =
    respuestasExamen.filter(
        r => r === null
    ).length;

    const btn =
    document.getElementById(
        "btnFinalizar"
    );

    btn.disabled =
    faltantes > 0;

    if(faltantes > 0){

        btn.innerHTML =
        `⛔ Faltan ${faltantes}`;

    }else{

        btn.innerHTML =
        "✅ Finalizar Examen";

    }

}

document.addEventListener(
"click",
function(e){

    if(
        e.target.id === "btnFinalizar" &&
        e.target.disabled
    ){

        const faltantes =
        respuestasExamen.filter(
            r => r === null
        ).length;

        alert(
            `⚠ Debe responder las ${faltantes} preguntas restantes`
        );

    }

});
function finalizarExamenManual(){

    let correctas = 0;

    filtradas.forEach((p,i)=>{

        if(
            respuestasExamen[i] ===
            p.correcta
        ){

            correctas++;

        }

    });

    const nota =
    (
        correctas /
        filtradas.length
    ) * 100;

    mostrarResultadosExamen(
        nota,
        correctas
    );

}
async function mostrarResultadosExamen(
    nota,
    correctas
){
notaFinal = nota;
correctasFinal = correctas;
const fecha = new Date();
const tiempoUtilizado =
tiempoInicialExamen - tiempoExamen;
estudianteActual.examenes.push({

    nota: Number(nota.toFixed(2)),

    correctas: correctas,

    total: filtradas.length,

    fecha: fecha.toLocaleDateString("es-CR"),

    hora: fecha.toLocaleTimeString("es-CR"),

        tiempo: formatearTiempo(tiempoUtilizado)

});




reporteExamen = "";
    clearInterval(
        temporizadorIntervalo
    );

    let html = `

    <div class="historial-card">

    <h2>
    Resultado del Examen
    </h2>

    <h3>
    Nota:
    ${nota.toFixed(2)}%
    </h3>

    <p>
    Correctas:
    ${correctas}
    de
    ${filtradas.length}
    </p>

    <hr>

    `;

    filtradas.forEach((p,i)=>{
console.log(p);
console.log(respuestasExamen[i]);
        const correcta =
        respuestasExamen[i] ===
        p.correcta;

    

        html += `

        <div class="resultado-pregunta">

        <h4>
        ${i+1}. ${p.pregunta}
        </h4>

        <p>

        Su respuesta:

        <strong>

        ${
        respuestasExamen[i] !== null
        ?
        p.opciones[
        respuestasExamen[i]
        ]
        :
        "No respondió"
        }

        </strong>

        </p>

        <p>

        Respuesta correcta:

        <strong>

        ${p.opciones[p.correcta]}

        </strong>

        </p>

        <p>

        ${
        correcta
        ?
        "✅ Correcta"
        :
        "❌ Incorrecta"
        }

        </p>

        <hr>

        </div>

        `;


        reporteExamen +=

`Pregunta ${i+1}

${p.pregunta}

Respuesta estudiante:
${
respuestasExamen[i] !== null
?
p.opciones[respuestasExamen[i]]
:
"No respondió"
}

Respuesta correcta:
${p.opciones[p.correcta]}

${
respuestasExamen[i] === p.correcta
?
"CORRECTA"
:
"INCORRECTA"
}

--------------------------------

`;

    });
    filtradas.forEach((p,i)=>{

    const correcta =
    respuestasExamen[i] ===
    p.correcta;

    actualizarHistorial(
        p.categoria,
        p.nivel,
        correcta,
        false
    );

});


function agregarFavorita(){

    const id = filtradas[actual].id;

    if(!estudianteActual.favoritas){

        estudianteActual.favoritas=[];

    }

    if(
        estudianteActual.favoritas.includes(id)
    ){

        estudianteActual.favoritas =
        estudianteActual.favoritas.filter(
            x=>x!=id
        );

        alert("Pregunta eliminada de favoritos");

    }else{

        estudianteActual.favoritas.push(id);

        alert("Pregunta agregada a favoritos");

    }

    guardarEstudianteFirebase();

}

await guardarEstudianteFirebase();

   html += `

<button onclick="mostrarPracticas()">
Volver
</button>

<button onclick="enviarResultado()">
📧 Enviar reporte al correo institucional
</button>

</div>

`;

    document
    .getElementById("preguntaBox")
    .innerHTML = html;

}


function enviarResultado(){

    emailjs.send(

        "service_du1be4g",
        "template_5z39mbu",

        {
correo:correoEstudiante,
            nombre:
            estudianteActual.nombre,

            cedula:
            estudianteActual.cedula,

            nota:
            notaFinal.toFixed(2),

            correctas:
            correctasFinal,

            total:
            filtradas.length,

            reporte:
            reporteExamen

        }

    )

    .then(() => {

        alert(
            "✅ Resultado enviado correctamente"
        );

    })

    .catch((error) => {

        console.log(error);

        alert(
            "❌ Error al enviar resultado"
        );

    });

}
/* ========================================================= */
/* INICIAR */
/* ========================================================= */

function iniciar(){
clearInterval(temporizadorIntervalo);
    modoExamen = false;
document
.getElementById("temporizador")
.classList.add("hidden");
    const seleccionadas =

    [...document.querySelectorAll(
        "#categorias input:checked"
    )]

    .map(i => i.value);

    const nivel =
    document.querySelector(
        'input[name="nivel"]:checked'
    ).value;

    filtradas = preguntas.filter(p => {

        const okCategoria =

        seleccionadas.length === 0 ||

        seleccionadas.includes(
            p.categoria
        );

        const okNivel =

        nivel === "todos" ||

        p.nivel === nivel;

        return (
            okCategoria &&
            okNivel
        );

    });

    if(filtradas.length === 0){

        alert("No hay preguntas");

        return;

    }

    actual = 0;

    estadoPreguntas =
    filtradas.map(
        () => "no-vista"
    );

    document.getElementById("config")
    .style.display = "none";

    document.getElementById("quiz")
    .style.display = "block";

    crearNav();

    mostrarPregunta();

}

/* ========================================================= */
/* NAV */
/* ========================================================= */

function crearNav(){

    const nav =
    document.getElementById(
        "navPreguntas"
    );

    nav.innerHTML = "";

    filtradas.forEach((_,i)=>{

        nav.innerHTML += `
        <div
        class="nav-item"
        onclick="ir(${i})">

        ${i+1}

        </div>
        `;

    });

}

function ir(i){

    actual = i;

    mostrarPregunta();

}

/* ========================================================= */
/* MOSTRAR PREGUNTA */
/* ========================================================= */

function mostrarPregunta(){
    document.getElementById("monitoreoBox")
.style.display = "none";

if(modoExamen){

    if(respuestasExamen[actual] !== null){

        estadoPreguntas[actual] = "respondida";

    }else{

        estadoPreguntas[actual] = "vista";

    }

}else{

    if(estadoPreguntas[actual] === "no-vista"){

        estadoPreguntas[actual] = "vista";

    }

}

    actualizarNav();

    const p = filtradas[actual];

    const box =
    document.getElementById(
        "preguntaBox"
    );

   if(modoExamen){

    seleccion =
    respuestasExamen[actual];

}else{

    seleccion = null;

}

    box.innerHTML = `
    <div class="pregunta">

    <h3>

    ${actual+1}.
    ${p.pregunta}

    </h3>

    ${
        p.imagen
        ?
        `<img src="${p.imagen}">`
        :
        ""
    }

    <div class="opciones">

    ${p.opciones.map((op,i)=>`

    <div
class="opcion ${
modoExamen &&
respuestasExamen[actual] === i
?
"seleccionada"
:
""
}"
onclick="seleccionar(${i})">

    ${op}

    </div>

    `).join("")}

    </div>

   <div class="acciones-pregunta">

${
!modoExamen
?
`
<button onclick="comprobar()">
Comprobar
</button>
`
:
""
}

    ${
        !modoExamen &&
        (
            p.nivel === "facil" ||
            p.nivel === "medio"||
            p.nivel === "dificil"
        )
        &&
        p.pista
        ?
        `
        <button
        class="btn-pista"
        onclick="mostrarPista()">

        💡 Ver pista

        </button>

       
        `
        :
        ""
    }
   <button
id="btnFavorita"
onclick="agregarFavorita()">
⭐ Agregar a Favoritos
</button>

    </div>

    <div id="pistaBox"></div>

    <div id="feedback"></div>

    </div>
    `;
    actualizarBotonFavorita();

}



/* ========================================================= */
/* PISTA */
/* ========================================================= */
function actualizarBotonFavorita(){

    if(!estudianteActual) return;

    if(!estudianteActual.favoritas){

        estudianteActual.favoritas = [];

    }

    const btn = document.getElementById("btnFavorita");

    if(!btn) return;

    const pregunta = filtradas[actual];

    const existe = estudianteActual.favoritas.includes(pregunta.id);

    if(existe){

        btn.innerHTML = "❤️ Quitar de Favoritos";

    }else{

        btn.innerHTML = "⭐ Agregar a Favoritos";

    }

}


async function agregarFavorita(){

    if(!estudianteActual.favoritas){

        estudianteActual.favoritas = [];

    }

    const pregunta = filtradas[actual];

    const indice =
    estudianteActual.favoritas.indexOf(pregunta.id);

    if(indice === -1){

        estudianteActual.favoritas.push(pregunta.id);

        alert("⭐ Pregunta agregada a favoritos");

    }else{

        estudianteActual.favoritas.splice(indice,1);

        alert("❤️ Pregunta eliminada de favoritos");

    }

    await guardarEstudianteFirebase();

    actualizarBotonFavorita();

}

function mostrarFavoritas(){

    clearInterval(temporizadorIntervalo);

    modoExamen = false;

    document.getElementById("config").style.display="none";
    document.getElementById("historialBox").style.display="none";
    document.getElementById("logrosBox").style.display="none";
    document.getElementById("monitoreoBox").style.display="none";

    if(!estudianteActual.favoritas){

        estudianteActual.favoritas=[];

    }

    filtradas = preguntas.filter(p=>

        estudianteActual.favoritas.includes(p.id)

    );

    if(filtradas.length===0){

        alert("No tiene preguntas favoritas.");

        return;

    }

    actual=0;

    estadoPreguntas =
    filtradas.map(()=>"no-vista");

    document.getElementById("quiz")
    .style.display="block";

    crearNav();

    mostrarPregunta();

}



function mostrarPista(){

    const p = filtradas[actual];

    desbloquearLogro(14,true);

    guardarEstudianteFirebase();

    document.getElementById(
        "pistaBox"
    ).innerHTML = `

    <div class="pista-contenedor">

    💡 ${p.pista}

    </div>
    `;

}

/* ========================================================= */
/* COMPROBAR */
/* ========================================================= */

function comprobar(){

    const p = filtradas[actual];

    const feedback =
    document.getElementById(
        "feedback"
    );

    if(seleccion === null){

        feedback.innerHTML = `
        <p style="
        color:red;
        font-weight:bold;
        ">

        ⚠ Debe seleccionar una opción

        </p>
        `;

        return;

    }

    let correcta = false;

    if(seleccion === p.correcta){

        correcta = true;

        estadoPreguntas[actual] =
        "correcta";

       feedback.innerHTML = `
<div class="feedback-correcto">

<h4>✅ Correcta</h4>

<p>
${p.retroalimentacion}
</p>

${
p.imagenRetro
?
`
<div class="retro-img">
    <img
    src="${p.imagenRetro}"
    alt="Retroalimentación">
</div>
`
:
""
}

${
p.video
?
`
<iframe
width="100%"
height="315"
src="${p.video.replace("watch?v=","embed/")}"
frameborder="0"
allowfullscreen>
</iframe>
`
:
""
}

</div>
`;

    }else{

        estadoPreguntas[actual] =
        "incorrecta";

      feedback.innerHTML = `
<div class="feedback-incorrecto">

<h4>❌ Incorrecta</h4>

<p>

Correcta:

<strong>
${p.opciones[p.correcta]}
</strong>

</p>

<p>
${p.retroalimentacion}
</p>

${
p.imagenRetro
?
`
<div class="retro-img">
    <img
    src="${p.imagenRetro}"
    alt="Retroalimentación">
</div>
`
:
""
}
${
p.video
?
`
<iframe
width="100%"
height="315"
src="${p.video.replace("watch?v=","embed/")}"
frameborder="0"
allowfullscreen>
</iframe>
`
:
""
}

</div>
`;
    }

    actualizarHistorial(
        p.categoria,
        p.nivel,
        correcta
    );

    actualizarNav();

}

/* ========================================================= */
/* ACTUALIZAR HISTORIAL */
/* ========================================================= */

function actualizarHistorial(
    categoria,
    nivel,
    correcta,
        guardar = true
){

    // Crear historial si no existe
if(!estudianteActual.historial){

    estudianteActual.historial = {};

}

// Crear categoría si no existe
if(!estudianteActual.historial[categoria]){

    estudianteActual.historial[categoria] = {

        facil:{
            respondidas:0,
            aciertos:0,
            correctas:0,
            incorrectas:0
        },

        medio:{
            respondidas:0,
            aciertos:0,
            correctas:0,
            incorrectas:0
        },

        dificil:{
            respondidas:0,
            aciertos:0,
            correctas:0,
            incorrectas:0
        }

    };

}

    const datos =
    estudianteActual
    .historial[categoria][nivel];

    datos.respondidas++;

    if(correcta){

        if(!datos.aciertos){

            datos.aciertos = 0;

        }

        datos.aciertos++;

    }

    datos.correctas =
    Math.round(
        (
            datos.aciertos /
            datos.respondidas
        ) * 100
    );

    datos.incorrectas =
    100 - datos.correctas;
registrarActividad();
verificarLogros();

if(guardar){
    guardarEstudianteFirebase();
}

}

/* ========================================================= */
/* VERIFICAR LOGROS */
/* ========================================================= */

/* ========================================================= */
/* VERIFICAR LOGROS */
/* ========================================================= */
function registrarActividad(){

    if(!estudianteActual.actividad){

        estudianteActual.actividad = {};

    }

    const hoy = new Date();

    const fecha =

    hoy.getFullYear() + "-" +

    String(hoy.getMonth()+1)
    .padStart(2,"0") + "-" +

    String(hoy.getDate())
    .padStart(2,"0");

    if(!estudianteActual.actividad[fecha]){

        estudianteActual.actividad[fecha] = 0;

    }

    estudianteActual.actividad[fecha]++;

}


function verificarLogros(){

    let total = 0;

    let categoriasRespondidas = new Set();

    let totalCorrectas = 0;

  if(!estudianteActual.historial){

    estudianteActual.historial = {};

}

for(let categoria in estudianteActual.historial){

        let totalCategoria = 0;
        let aciertosCategoria = 0;

        ["facil","medio","dificil"]
        .forEach(nivel => {

            const datos =
            estudianteActual
            .historial[categoria][nivel];

            total += datos.respondidas;

            totalCategoria += datos.respondidas;

            if(datos.aciertos){

                totalCorrectas += datos.aciertos;

                aciertosCategoria += datos.aciertos;

            }

        });

        /* CATEGORÍA PRACTICADA */

        if(totalCategoria > 0){

            categoriasRespondidas.add(categoria);

        }

        /* PERFECTO */

        if(
            totalCategoria > 0 &&
            aciertosCategoria === totalCategoria
        ){

            desbloquearLogro(5,true);

        }

    }

    /* ========================================================= */
    /* LOGROS BÁSICOS */
    /* ========================================================= */

    desbloquearLogro(1,total >= 1);

    desbloquearLogro(2,total >= 10);

    desbloquearLogro(3,total >= 50);

    desbloquearLogro(4,total >= 100);

    desbloquearLogro(17,total >= 200);

    /* ========================================================= */
    /* PRECISIÓN */
    /* ========================================================= */

    const porcentajeGlobal =
    total > 0
    ?
    Math.round(
        (totalCorrectas / total) * 100
    )
    :
    0;

    desbloquearLogro(16, porcentajeGlobal >= 80);

    /* ========================================================= */
    /* DEDICACIÓN */
    /* ========================================================= */

    desbloquearLogro(
        18,
        categoriasRespondidas.size >= 5
    );

}

/* ========================================================= */
/* DESBLOQUEAR LOGRO */
/* ========================================================= */

function desbloquearLogro(id,condicion){

    if(!estudianteActual) return;

    if(
        condicion &&
        !estudianteActual.logros.includes(id)
    ){

        estudianteActual.logros.push(id);

        alert(
            "🏆 Nuevo logro desbloqueado"
        );

    }

}

/* ========================================================= */
/* GUARDAR */
/* ========================================================= */

async function guardarEstudianteFirebase(){

    await set(

        ref(
            db,
            "estudiantes/" +
            estudianteActual.cedula
        ),

        estudianteActual

    );

    console.log(
        "Historial guardado"
    );

}

/* ========================================================= */
/* CARGAR ESTUDIANTES */
/* ========================================================= */

async function cargarEstudiantes(){

    try{

        const snapshot =
        await get(
            child(
                ref(db),
                "estudiantes"
            )
        );

        if(snapshot.exists()){

            estudiantes =
            Object.values(
                snapshot.val()
            );

        }

        else{

            const res =
            await fetch(
                "estudiantes.json"
            );

            estudiantes =
            await res.json();

            for(
                const estudiante
                of estudiantes
            ){

                await set(

                    ref(
                        db,
                        "estudiantes/" +
                        estudiante.cedula
                    ),

                    estudiante

                );

            }

        }

    }catch(error){

        console.error(error);

    }

}

cargarEstudiantes();

/* ========================================================= */
/* ACTUALIZAR NAV */
/* ========================================================= */

function actualizarNav(){

    const items =
    document.querySelectorAll(
        ".nav-item"
    );

    items.forEach((item,i)=>{

    
      item.classList.remove(
    "correct",
    "wrong",
    "vista",
    "respondida"
);
    console.log(    i,    estadoPreguntas[i]);
     if(
    estadoPreguntas[i]
    === "respondida"
){

    item.classList.add(
        "respondida"
    );

}   
    else if(
            estadoPreguntas[i]
            === "correcta"
        ){

            item.classList.add(
                "correct"
            );

        }

        else if(
            estadoPreguntas[i]
            === "incorrecta"
        ){

            item.classList.add(
                "wrong"
            );

        }

        else if(
            estadoPreguntas[i]
            === "vista"
        ){

            item.classList.add(
                "vista"
            );

        }
        

    });

}

/* ========================================================= */
/* VOLVER */
/* ========================================================= */

function volverPracticas(){

    modoExamen = false;
document
.getElementById("btnFinalizar")
.classList.add("hidden");
    clearInterval(temporizadorIntervalo);

    temporizadorIntervalo = null;

    tiempoExamen = 10800;

    localStorage.removeItem("tiempoExamen");

    document
        .getElementById("temporizador")
        .classList.add("hidden");

    document.getElementById("quiz")
        .style.display = "none";

    document.getElementById("config")
        .style.display = "block";
}
/* ========================================================= */
/* TEMA */
/* ========================================================= */

function cambiarTema(){

    document.body.classList.toggle("dark");

    desbloquearLogro(13,true);

    guardarEstudianteFirebase();

    const btn =
    document.getElementById("temaBtn");

    if(
        document.body.classList.contains(
            "dark"
        )
    ){

        btn.innerHTML =
        "☀️ Modo Claro";

    }else{

        btn.innerHTML =
        "🌙 Modo Oscuro";

    }

}

/* ========================================================= */
/* CHATBOT */
/* ========================================================= */



/* ========================================================= */
/* CHATBOT */
/* ========================================================= */

const divMensajes =
document.getElementById('mensajes');

const entradaTexto =
document.getElementById('entradaTexto');

const chatbox =
document.getElementById('chatbox');

const btnAbrirChat =
document.getElementById('btnAbrirChat');

/* ========================================================= */
/* ABRIR CHAT */
/* ========================================================= */

btnAbrirChat.addEventListener(
'click',
() => {

    if(
        chatbox.style.display === "block"
    ){

        chatbox.style.display = "none";

    }else{

        chatbox.style.display = "block";

        /* MENSAJE INICIAL */

        if(
            divMensajes.childNodes.length === 0
        ){

            agregarMensaje(
            "bot",

`👋 Bienvenido al asistente virtual

Seleccione una opción:
1) ¿Cómo iniciar la práctica?
2) Significado de colores
3) Navegación entre preguntas
4) Modo oscuro y claro
5) Uso de pistas
6) Videos educativos
7) Cómo responder preguntas
8) Recomendaciones de estudio
9) Información de la plataforma
10) Modo examen
0) Menú principal`

            );

        }

    }

}
);

/* ========================================================= */
/* CERRAR CHAT */
/* ========================================================= */

function cerrarChat(){

    chatbox.style.display = "none";

}

/* ========================================================= */
/* AGREGAR MENSAJE */
/* ========================================================= */

function agregarMensaje(
tipo,
texto
){

    const div =
    document.createElement("div");

    div.className =

    tipo === "usuario"
    ?
    "mensaje-usuario"
    :
    "mensaje-bot";

    div.textContent = texto;

    divMensajes.appendChild(div);

    divMensajes.scrollTop =
    divMensajes.scrollHeight;

}

/* ========================================================= */
/* ENVIAR MENSAJE */
/* ========================================================= */

function enviarMensaje(){

    const texto =
    entradaTexto.value.trim();

    if(texto === "") return;

    agregarMensaje(
        "usuario",
        texto
    );

    entradaTexto.value = "";

    setTimeout(() => {

        responderBot(texto);

    },500);

}

/* ========================================================= */
/* RESPONDER BOT */
/* ========================================================= */

function responderBot(texto){

    switch(texto){

        case "1":

        agregarMensaje(
        "bot",

`📘 Para iniciar una práctica:

1. Seleccione categorías
2. Seleccione nivel
3. Presione iniciar

0) Volver al menú principal`

        );

        break;

        case "2":

        agregarMensaje(
        "bot",

`🎨 Significado de colores:

🟢 Verde:
Pregunta correcta

🟠 Naranja:
Pregunta incorrecta

🟣 Morado:
Pregunta vista

0) Volver al menú principal`

        );

        break;

        case "3":

        agregarMensaje(
        "bot",

`🧭 Navegación:

Puede cambiar entre preguntas utilizando los números superiores.

0) Volver al menú principal`

        );

        break;

        case "4":

        agregarMensaje(
        "bot",

`🌙 Tema visual:

Puede cambiar entre modo oscuro y claro utilizando el botón superior derecho.

0) Volver al menú principal`

        );

        break;

        case "5":

        agregarMensaje(
        "bot",

`💡 Uso de pistas:

Las pistas solo aparecen en modo Práctica.

0) Volver al menú principal`

        );

        break;

        case "6":

        agregarMensaje(
        "bot",

`🎥 Videos educativos:

Algunas preguntas incluyen videos o imágenes explicativos para reforzar el aprendizaje.

0) Volver al menú principal`

        );

        break;

        case "7":

        agregarMensaje(
        "bot",

`📝 Cómo responder:

1. Seleccione una opción
2. Presione comprobar
3. Revise la retroalimentación

0) Volver al menú principal`

        );

        break;

        case "8":

        agregarMensaje(
        "bot",

`📚 Recomendaciones:

✔ Practique diariamente
✔ Lea cuidadosamente
✔ Revise errores
✔ Utilice las pistas

0) Volver al menú principal`

        );

        break;

        case "9":

        agregarMensaje(
        "bot",

`💻 Plataforma educativa diseñada para apoyar la preparación de la Prueba Nacional Estandarizada Sumativa de Especialidades Técnicas.

0) Volver al menú principal`

        );

        break;

        case "10":

        agregarMensaje(
        "bot",

`📝 Modo examen:

Genera automáticamente preguntas de nivel medio y difícil sin pistas.
Se muestra un reloj en cuenta regresiva con el tiempo disponible para finalizar la prueba.
El botón finalizar se encuentra bloqueado hasta que ya haya resuelto todas las preguntas.

0) Volver al menú principal`

        );

        break;

        case "0":

        agregarMensaje(
        "bot",

`📋 MENÚ PRINCIPAL
1) ¿Cómo iniciar la práctica?
2) Significado de colores
3) Navegación entre preguntas
4) Modo oscuro y claro
5) Uso de pistas
6) Videos educativos
7) Cómo responder preguntas
8) Recomendaciones de estudio
9) Información de la plataforma
10) Modo examen
0) Menú principal`

        );

        break;

        default:

        agregarMensaje(
        "bot",

`❌ Opción no válida.

Digite un número del menú.

0) Menú principal`

        );

    }

}

/* ========================================================= */
/* ENTER */
/* ========================================================= */

entradaTexto.addEventListener(
"keypress",
function(e){

    if(e.key === "Enter"){

        enviarMensaje();

    }

}
);

/* ========================================================= */
/* CERRAR SESIÓN */
/* ========================================================= */

function cerrarSesion(){

    estudianteActual = null;

    document.getElementById("panelEstudiante")
    .style.display = "none";

    document.getElementById("config")
    .style.display = "none";

    document.getElementById("quiz")
    .style.display = "none";

    document.getElementById("historialBox")
    .style.display = "none";

    document.getElementById("logrosBox")
    .style.display = "none";

   document.getElementById("loginBox")
.style.display = "flex";

    document.getElementById("cedulaInput")
    .value = "";

    document.getElementById("mensajeError")
    .innerHTML = "";

}

let tiempoExamen = 10800; // 3 horas = 10800 segundos
let temporizadorIntervalo = null;

function iniciarTemporizador() {

    document
        .getElementById("temporizador")
        .classList.remove("hidden");

    actualizarReloj();

    temporizadorIntervalo = setInterval(() => {

        tiempoExamen--;

        localStorage.setItem(
            "tiempoExamen",
            tiempoExamen
        );

        actualizarReloj();

        if (tiempoExamen <= 0) {

            clearInterval(
                temporizadorIntervalo
            );

          finalizarExamenManual();

        }

    }, 1000);
}


function actualizarReloj(){

    const horas =
        Math.floor(tiempoExamen / 3600);

    const minutos =
        Math.floor((tiempoExamen % 3600) / 60);

    const segundos =
        tiempoExamen % 60;

    document.getElementById("reloj").textContent =
        `${String(horas).padStart(2,"0")}:` +
        `${String(minutos).padStart(2,"0")}:` +
        `${String(segundos).padStart(2,"0")}`;

    if(tiempoExamen <= 600){

        document
            .getElementById("temporizador")
            .classList.add("tiempo-alerta");

    }
}
function calcularRendimientoGlobal(estudiante){

    let respondidas = 0;
    let aciertos = 0;

    if(!estudiante.historial){
        return 0;
    }

    for(let categoria in estudiante.historial){

        const categoriaDatos = estudiante.historial[categoria];

        if(!categoriaDatos){
            continue;
        }

        ["facil","medio","dificil"].forEach(nivel=>{

            const datos = categoriaDatos[nivel];

            if(!datos){
                return;
            }

            respondidas += datos.respondidas || 0;
            aciertos += datos.aciertos || 0;

        });

    }

    if(respondidas === 0){
        return 0;
    }

    return Math.round((aciertos/respondidas) * 100);

}

function mostrarMonitoreo(){

    document.getElementById("config")
    .style.display = "none";

    document.getElementById("quiz")
    .style.display = "none";

    document.getElementById("historialBox")
    .style.display = "none";

    document.getElementById("logrosBox")
    .style.display = "none";

    const box =
    document.getElementById("monitoreoBox");

    box.style.display = "block";

    let html = `

    <div class="historial-card">

    <h2>
    📈 Monitoreo General
    </h2>

    <table class="tabla-monitoreo">

    <thead>

    <tr>

    <th>Nombre</th>
    <th>Cédula</th>
    <th>Rendimiento</th>

    </tr>

    </thead>

    <tbody>
    `;

    estudiantes.forEach(estudiante => {

        const rendimiento =
        calcularRendimientoGlobal(estudiante);

        html += `

        <tr>

        <td>

        <a href="#"
        onclick="verDetalleEstudiante('${estudiante.cedula}')">

        ${estudiante.nombre}

        </a>

        </td>

        <td>
        ${estudiante.cedula}
        </td>

        <td>
        ${rendimiento}%
        </td>

        </tr>

        `;

    });

    html += `

    </tbody>

    </table>

    </div>

    `;

    box.innerHTML = html;

}

function verDetalleEstudiante(cedula){

    const estudiante =
    estudiantes.find(
        e => e.cedula === cedula
    );

    if(!estudiante) return;

    const rendimientoGlobal =
    calcularRendimientoGlobal(estudiante);

    let html = `

    <div class="historial-card">

    <button onclick="mostrarMonitoreo()">
    ⬅ Volver al Monitoreo General
    </button>

    <h2>
    👨‍🎓 ${estudiante.nombre}
    </h2>

    <table class="tabla-monitoreo">

    <thead>

    <tr>

    <th>Nombre</th>
    <th>Cédula</th>
    <th>Rendimiento Global</th>

    </tr>

    </thead>

    <tbody>

    <tr>

    <td>
    ${estudiante.nombre}
    </td>

    <td>
    ${estudiante.cedula}
    </td>

    <td>
    ${rendimientoGlobal}%
    </td>

    </tr>

    </tbody>

    </table>
    <h3>
📝 Historial de Modo Examen
</h3>

<table class="tabla-monitoreo">

<thead>

<tr>

<th>#</th>
<th>Fecha</th>
<th>Hora</th>
<th>Correctas</th>
<th>Nota</th>
<th>Tiempo</th>

</tr>

</thead>

<tbody>
`;

if(
    estudiante.examenes &&
    estudiante.examenes.length > 0
){

    estudiante.examenes
    .slice()
    .reverse()
    .forEach((e,i)=>{

        html += `

        <tr>

        <td>${i+1}</td>

        <td>${e.fecha}</td>

        <td>${e.hora}</td>

        <td>${e.correctas}/${e.total}</td>

        <td>${e.nota}%</td>

        <td>${e.tiempo || "00:00:00"}</td>

        </tr>

        `;

    });

}else{

    html += `

    <tr>

    <td colspan="6">

    Aún no ha realizado exámenes.

    </td>

    </tr>

    `;

}

html += `

</tbody>

</table>


    <h3>
    📚 Rendimiento por Categoría
    </h3>

    <table class="tabla-monitoreo">

    <thead>

    <tr>

    <th>Categoría</th>
    <th>Respondidas</th>
    <th>Aciertos</th>
    <th>Rendimiento</th>

    </tr>

    </thead>

    <tbody>
    `;

    for(let categoria in estudiante.historial){

        let respondidas = 0;
        let aciertos = 0;

        ["facil","medio","dificil"]
        .forEach(nivel => {

            const datos =
            estudiante.historial[categoria][nivel];

            respondidas +=
            datos.respondidas;

            aciertos +=
            datos.aciertos || 0;

        });

        const porcentaje =
        respondidas > 0
        ?
        Math.round(
            (aciertos/respondidas) * 100
        )
        :
        0;

        html += `

        <tr>

        <td>
        ${categoria}
        </td>

        <td>
        ${respondidas}
        </td>

        <td>
        ${aciertos}
        </td>

        <td>
        ${porcentaje}%
        </td>

        </tr>

        `;

    }

    html += `

    </tbody>

    </table>

    </div>

    `;

    document.getElementById(
        "monitoreoBox"
    ).innerHTML = html;

    window.scrollTo({
        top:0,
        behavior:"smooth"
    });

}

window.mostrarMonitoreo =
mostrarMonitoreo;

window.verDetalleEstudiante =
verDetalleEstudiante;
/* ========================================================= */
/* GLOBALES */
/* ========================================================= */

window.cambiarTema =
cambiarTema;

window.comprobarCedula =
comprobarCedula;

window.mostrarPracticas =
mostrarPracticas;

window.mostrarHistorial =
mostrarHistorial;

window.mostrarLogros =
mostrarLogros;

window.iniciarModoExamen =
iniciarModoExamen;

window.iniciar =
iniciar;

window.ir =
ir;

window.seleccionar =
seleccionar;

window.mostrarPista =
mostrarPista;

window.comprobar =
comprobar;

window.volverPracticas =
volverPracticas;

window.cerrarChat =
cerrarChat;

window.enviarMensaje =
enviarMensaje;

window.cerrarSesion =
cerrarSesion;

window.finalizarExamenManual =
finalizarExamenManual;

window.enviarResultado =
enviarResultado;
window.mostrarFavoritas = mostrarFavoritas;
window.agregarFavorita = agregarFavorita;