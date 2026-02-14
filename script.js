/* ==========================================
   CONFIGURACIÓN GENERAL Y VARIABLES
   ========================================== */
// Cambia la URL larga por tu archivo local
// Asegúrate de que el archivo esté en la misma carpeta que tu index.html
const URL_HEART_PINK = "./heartpink.png";// --- VARIABLES DE JUEGO ---
let freddiesQuemados = 0; 
let portalesAbiertos = false; 
let lluviaFocasActiva = false;
let contadorSpawns = 0; 

// --- VARIABLES DE ESTADO ---
let escapesRealizados = 0;
const MAX_ESCAPES = 2; 
let clickActual = 0;
let enCooldown = false; 

// --- FÍSICA ---
let freddies = []; // Array principal de objetos (Freddys, Focas, Mechero)
const GRAVEDAD = 0.5;
const REBOTE = -0.7; 
const FRICCION = 0.98; 

// --- PORTALES ---
const portalOrange = { x: 0, y: 0, el: null, dragging: false, offsetX: 0, offsetY: 0 };
const portalBlue = { x: 0, y: 0, el: null, dragging: false, offsetX: 0, offsetY: 0 };

// --- FOCAS ---
const CANTIDAD_FOCAS = 114; // Total de imágenes en la carpeta

// --- RUTAS DE ARCHIVOS (Asegúrate que coincidan con tu carpeta) ---
const URL_SONIDO_GOLPE = 'https://www.myinstants.com/media/sounds/minecraft-pickaxe-sound.mp3';
const URL_SONIDO_FINAL = 'https://www.myinstants.com/media/sounds/minecraft-tool-break.mp3';
const URL_SONIDO_POP = 'https://www.myinstants.com/media/sounds/fnaf-12-3-freddys-nose-sound.mp3';
const URL_FUEGO_GIF = "https://media.tenor.com/TpZ5dQKpk7YAAAAj/fire-minecraft.gif";

// Archivos locales
const URL_IMAGEN_LATERAL = "./image.png";
const URL_SONIDO_FIRE = './Fire.ogg'; 
const URL_SONIDO_FIZZ = './Fizz.ogg';
const URL_MECHERO = "./flintimage.png";
const URL_FREDDIE = "./freddyplushie.png";

const texturasRotura = [
    "./breaking1.png", "./breaking2.png", "./breaking3.png", 
    "./breaking4.png", "./breaking5.png", "./breaking6.png"
];
const CLICKS_TOTALES = texturasRotura.length; 


/* ==========================================
   LÓGICA DE LA CARTA Y PREGUNTAS
   ========================================== */

function mostrarCarta() {
    const contenido = document.getElementById('carta');
    contenido.classList.add('mostrar');
    document.querySelector('button.btn').classList.add('oculto');
    setTimeout(() => {
        const container = document.querySelector('.container');
        container.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 500);
}

function interactuarBoton() {
    if (escapesRealizados < MAX_ESCAPES) {
        moverBoton();
        return;
    }
    avanzarRotura();
}

function moverBoton() {
    if (enCooldown) return;
    const wrapper = document.getElementById('movable-wrapper');
    if (escapesRealizados === 0) {
        wrapper.style.transform = "scale(0)";
        setTimeout(() => {
            wrapper.style.position = "fixed";
            const randomX = Math.random() * 80 + 10;
            const randomY = Math.random() * 80 + 10;
            wrapper.style.left = randomX + '%';
            wrapper.style.top = randomY + '%';
            wrapper.style.transform = "scale(1)";
        }, 400); 
    } else {
        const randomX = Math.random() * 80 + 10;
        const randomY = Math.random() * 80 + 10;
        wrapper.style.left = randomX + '%';
        wrapper.style.top = randomY + '%';
    }
    escapesRealizados++;
    enCooldown = true;
    setTimeout(() => { enCooldown = false; }, 800);
}

function avanzarRotura() {
    const btn = document.getElementById('btn-no');
    const wrapper = document.getElementById('movable-wrapper');

    if (clickActual < CLICKS_TOTALES) {
        const sonido = new Audio(URL_SONIDO_GOLPE);
        sonido.volume = 0.6;
        sonido.play();
        
        const textura = texturasRotura[clickActual];
        btn.style.backgroundImage = `url('${textura}')`;
        btn.style.backgroundSize = 'cover';       
        btn.style.backgroundRepeat = 'no-repeat';
        btn.style.backgroundPosition = 'center';
        btn.style.backgroundColor = '#800000'; 
        
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => btn.style.transform = 'scale(1)', 50);

        clickActual++; 
    } else {
        const sonidoFin = new Audio(URL_SONIDO_FINAL);
        sonidoFin.volume = 0.6;
        sonidoFin.play();

        const rect = wrapper.getBoundingClientRect();
        const centroX = rect.left + rect.width / 2;
        const centroY = rect.top + rect.height / 2;

        spawnParticles(centroX, centroY);
        finalizarRotura();
    }
}

function finalizarRotura() {
    document.getElementById('btn-no').style.display = 'none';
    const btnSi = document.getElementById('btn-si-real');
    btnSi.style.display = 'flex'; 
    const wrapper = document.getElementById('movable-wrapper');
    wrapper.style.animation = 'shake 0.5s';
}

function aceptarPropuesta() {
    document.getElementById('propuesta-container').style.display = 'none';
    document.getElementById('mensaje-final').style.display = 'block';
    document.getElementById('movable-wrapper').style.display = 'none';

    // Explosión de corazones al final
    for(let i=0; i<50; i++) {
        setTimeout(createHeart, i * 80);
    }
}

function spawnParticles(x, y) {
    const cantidad = 30; 
    for (let i = 0; i < cantidad; i++) {
        const p = document.createElement('div');
        p.classList.add('particle');
        document.body.appendChild(p);
        p.style.left = x + 'px';
        p.style.top = y + 'px';
        const colores = ['#8b0000', '#a52a2a', '#500000', '#ff0000'];
        p.style.backgroundColor = colores[Math.floor(Math.random() * colores.length)];
        const destX = (Math.random() - 0.5) * 300; 
        const destY = (Math.random() - 0.5) * 300; 
        const rot = Math.random() * 360;
        p.style.setProperty('--tx', destX + 'px');
        p.style.setProperty('--ty', destY + 'px');
        p.style.setProperty('--rot', rot + 'deg');
        setTimeout(() => p.remove(), 800);
    }
}

/* ==========================================
   SISTEMA DE CORAZONES Y SPAWNS
   ========================================== */

function createHeart() {
    const container = document.getElementById('hearts-container');
    if (!container) return;

    const heart = document.createElement('div');
    heart.classList.add('heart');
    
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.animationDuration = Math.random() * 3 + 4 + 's'; 
    const size = Math.random() * 30 + 20; 
    heart.style.width = size + 'px';
    heart.style.height = size + 'px';
    const rotacion = Math.random() * 90 - 45; 
    heart.style.setProperty('--rotacion', rotacion + 'deg');
    
    heart.onclick = function(e) {
        const audio = new Audio(URL_SONIDO_POP);
        audio.volume = 0.3;
        audio.play();
        
        contadorSpawns++;
        const rect = heart.getBoundingClientRect();
        
        // Spawnear mechero SOLO una vez en el 5º click
        if (contadorSpawns === 5) { 
            spawnMechero(rect.left, rect.top);
            spawnImagenLateral();
        } else {
            spawnFreddie(rect.left, rect.top);
        }

        heart.remove();
    };

    container.appendChild(heart);
    setTimeout(() => { 
        if (heart.isConnected) heart.remove();
    }, 7000);
}

// Fase 2: Corazones Rosas
function activarFaseFocas() {
    if (lluviaFocasActiva) return;
    lluviaFocasActiva = true;
    setInterval(createPinkHeart, 800);
}



/* ==========================================
   CREACIÓN DE OBJETOS (SPAWNERS)
   ========================================== */

function spawnImagenLateral() {
    if (document.querySelector('.imagen-lateral')) return;
    const img = document.createElement('img');
    img.src = URL_IMAGEN_LATERAL; 
    img.classList.add('imagen-lateral');
    document.body.appendChild(img);
    setTimeout(() => img.classList.add('visible'), 50);
}

function spawnFreddie(x, y) {
    crearObjetoFisico(x, y, URL_FREDDIE, 80, 'inflamable');
}

function spawnMechero(x, y) {
    crearObjetoFisico(x, y, URL_MECHERO, 60, 'fuego');
}

// CORRECCIÓN 1: Corazones Rosas que sí rotan y se mueven bien
function createPinkHeart() {
    const container = document.getElementById('hearts-container');
    if (!container) return;

    // Creamos el elemento
    const item = document.createElement('div');
    item.classList.add('floating-item'); 
    
    // Tu imagen local
    item.style.backgroundImage = `url('${URL_HEART_PINK}')`;
    
    // Posición aleatoria
    item.style.left = Math.random() * 90 + 'vw';
    
    // Velocidad aleatoria (entre 3 y 6 segundos)
    item.style.animationDuration = Math.random() * 3 + 3 + 's'; 
    
    // Tamaño aleatorio
    const size = Math.random() * 20 + 40; 
    item.style.width = size + 'px';
    item.style.height = size + 'px';

    // --- CORRECCIÓN DE ROTACIÓN ---
    // Generamos un ángulo entre -45 y 45 grados solamente.
    // Así se inclinan, pero nunca salen "boca abajo".
    const rotacion = Math.random() * 90 - 45; 
    
    // IMPORTANTE: Usamos setProperty para que la animación CSS 'float' lo entienda
    item.style.setProperty('--rotacion', rotacion + 'deg');
    
    // Evento Click
    item.onclick = function(e) {
        const audio = new Audio(URL_SONIDO_POP);
        audio.volume = 0.4;
        audio.play();
        
        const rect = item.getBoundingClientRect();
        
        // Spawneamos la foca (seal0, seal1, etc.)
        spawnSeal(rect.left, rect.top); 
        
        item.remove();
    };

    container.appendChild(item);
    
    // Limpieza
    setTimeout(() => { 
        if (item.isConnected) item.remove();
    }, 6000);
}

// CORRECCIÓN 2: Focas con nombre sealX.png
function spawnSeal(x, y) {
    // Genera número de 0 a 113 (asumiendo CANTIDAD_FOCAS = 114)
    const numero = Math.floor(Math.random() * CANTIDAD_FOCAS); 
    
    // Nombre exacto: seal0.png, seal1.png...
    const nombreArchivo = `seal${numero}.png`; 
    
    // Ruta completa
    const randomImg = `./seal/${nombreArchivo}`;
    
    // Debug por si acaso
    const imgTest = new Image();
    imgTest.src = randomImg;
    imgTest.onerror = function() {
        console.error("Aún falla la imagen:", randomImg);
    };
    
    crearObjetoFisico(x, y, randomImg, 70, 'inflamable'); 
}

function crearObjetoFisico(x, y, urlImagen, tamano, tipo) {
    // 1. Elemento Visual (DOM)
    const wrapper = document.createElement('div');
    wrapper.classList.add('physics-item'); 
    wrapper.style.left = x + 'px';
    wrapper.style.top = y + 'px';
    wrapper.style.width = tamano + 'px';
    
    const img = document.createElement('img');
    img.src = urlImagen;
    img.classList.add('sprite'); 
    img.draggable = false;
    
    wrapper.appendChild(img);
    document.body.appendChild(wrapper);

    // 2. Objeto Lógico (Datos)
    const objeto = {
        element: wrapper,
        x: x, 
        y: y,
        vx: (Math.random() - 0.5) * 15,
        vy: -8,
        width: tamano,
        height: tamano, 
        tipo: tipo,      
        quemandose: false,
        isDragging: false,
        dead: false, // Nuevo flag para saber si hay que eliminarlo
        lastMouseX: 0, 
        lastMouseY: 0,
        audioFuego: null,
        teleportCooldown: 0
    };

    // 3. Evento Arrancar
    wrapper.onmousedown = function(e) {
        objeto.isDragging = true;
        objeto.vx = 0; 
        objeto.vy = 0;
        objeto.lastMouseX = e.clientX;
        objeto.lastMouseY = e.clientY;
    };

    freddies.push(objeto);
}

/* ==========================================
   LOOP PRINCIPAL DE FÍSICA
   ========================================== */

function updatePhysics() {
    // Filtramos los objetos muertos antes de procesar
    // (Esto evita bugs si el array cambia de tamaño mientras iteramos)
    freddies = freddies.filter(p => !p.dead);

    freddies.forEach(p => {
        // SEGURIDAD: Si el elemento DOM fue borrado, marcamos muerte y salimos
        if (!p.element || !p.element.parentNode) {
            p.dead = true;
            return;
        }

        if (p.isDragging) return; 

        // Movimiento
        p.vy += GRAVEDAD;
        p.vx *= FRICCION;
        p.vy *= FRICCION;
        
        if (p.teleportCooldown > 0) p.teleportCooldown--;

        p.x += p.vx;
        p.y += p.vy;

        // Rebotes
        const floor = window.innerHeight - p.height - 20; 
        const wall = window.innerWidth - p.width;

        if (p.y > floor) {
            p.y = floor;
            p.vy *= REBOTE; 
        }
        if (p.y < 0) {
            p.y = 0;
            p.vy *= REBOTE;
        }
        if (p.x > wall) {
            p.x = wall;
            p.vx *= REBOTE;
        }
        if (p.x < 0) {
            p.x = 0;
            p.vx *= REBOTE;
        }

        // Aplicar al DOM
        p.element.style.left = p.x + 'px';
        p.element.style.top = p.y + 'px';
    });

    detectarFuego();
    
    if (portalesAbiertos) {
        checkTeleport();
    }

    requestAnimationFrame(updatePhysics);
}

/* ==========================================
   INTERACCIONES (FUEGO Y PORTALES)
   ========================================== */

function detectarFuego() {
    const mecheros = freddies.filter(p => p.tipo === 'fuego' && !p.dead);
    const victimas = freddies.filter(p => p.tipo === 'inflamable' && !p.quemandose && !p.dead);

    if (mecheros.length === 0 || victimas.length === 0) return;

    mecheros.forEach(mechero => {
        victimas.forEach(victima => {
            if (colision(mechero, victima)) {
                quemarObjeto(victima);
            }
        });
    });
}

function colision(obj1, obj2) {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    const distancia = Math.sqrt(dx * dx + dy * dy);
    return distancia < 60; 
}

function quemarObjeto(objeto) {
    if (objeto.quemandose) return; 
    objeto.quemandose = true;

    // Lógica del juego (contar muertes)
    if (objeto.tipo === 'inflamable') { 
        freddiesQuemados++;
        // Al llegar a 10, abrir portales e iniciar focas
        if (freddiesQuemados === 10 && !portalesAbiertos) {
            abrirPortales();
            activarFaseFocas(); 
        }
    }

    // Audio y efectos
    const sonidoFuego = new Audio(URL_SONIDO_FIRE);
    sonidoFuego.loop = true;
    sonidoFuego.volume = 0.4;
    sonidoFuego.play().catch(e => console.log("Audio play error", e));
    objeto.audioFuego = sonidoFuego;

    const fuego = document.createElement('img');
    fuego.src = URL_FUEGO_GIF;
    fuego.classList.add('fire-overlay'); 
    objeto.element.appendChild(fuego);

    // Muerte del objeto a los 5 segundos
    setTimeout(() => {
        // Parar fuego
        if(objeto.audioFuego) {
            objeto.audioFuego.pause();
            objeto.audioFuego.currentTime = 0;
        }

        // Sonido final
        const sonidoFizz = new Audio(URL_SONIDO_FIZZ);
        sonidoFizz.volume = 0.4;
        sonidoFizz.play();

        // Desvanecer visualmente
        if (objeto.element) {
            objeto.element.style.transition = "opacity 0.5s, transform 0.5s";
            objeto.element.style.opacity = "0";
            objeto.element.style.transform = "scale(0)";
        }

        // ELIMINACIÓN SEGURA
        setTimeout(() => {
            if (objeto.element) objeto.element.remove();
            objeto.dead = true; // Marcamos para que el updatePhysics lo borre
        }, 500);

    }, 5000); 
}

function abrirPortales() {
    portalesAbiertos = true;
    const audio = new Audio(URL_SONIDO_GOLPE); 
    audio.play();

    // Portal Naranja
    const p1 = document.createElement('div');
    p1.classList.add('portal', 'portal-orange');
    p1.style.left = '50px';
    p1.style.top = '40%';
    p1.addEventListener('mousedown', (e) => {
        portalOrange.dragging = true;
        const rect = p1.getBoundingClientRect();
        portalOrange.offsetX = e.clientX - rect.left;
        portalOrange.offsetY = e.clientY - rect.top;
    });
    document.body.appendChild(p1);
    
    // Portal Azul
    const p2 = document.createElement('div');
    p2.classList.add('portal', 'portal-blue');
    p2.style.left = (window.innerWidth - 110) + 'px'; 
    p2.style.top = '40%';
    p2.addEventListener('mousedown', (e) => {
        portalBlue.dragging = true;
        const rect = p2.getBoundingClientRect();
        portalBlue.offsetX = e.clientX - rect.left;
        portalBlue.offsetY = e.clientY - rect.top;
    });
    document.body.appendChild(p2);

    // Configurar referencias
    portalOrange.el = p1;
    portalOrange.x = 50 + 30; 
    portalOrange.y = (window.innerHeight * 0.4) + 60; 

    portalBlue.el = p2;
    portalBlue.x = (window.innerWidth - 110) + 30;
    portalBlue.y = (window.innerHeight * 0.4) + 60;

    setTimeout(() => {
        p1.classList.add('visible');
        p2.classList.add('visible');
    }, 100);
}

function checkTeleport() {
    freddies.forEach(obj => {
        if (obj.teleportCooldown > 0 || obj.dead) return;

        const cx = obj.x + obj.width / 2;
        const cy = obj.y + obj.height / 2;
        const distOrange = Math.hypot(cx - portalOrange.x, cy - portalOrange.y);
        const distBlue = Math.hypot(cx - portalBlue.x, cy - portalBlue.y);
        const radioPortal = 50;

        if (distOrange < radioPortal) {
            teletransportar(obj, portalBlue);
        } else if (distBlue < radioPortal) {
            teletransportar(obj, portalOrange);
        }
    });
}

function teletransportar(objeto, destino) {
    objeto.x = destino.x - (objeto.width / 2);
    objeto.y = destino.y - (objeto.height / 2);
    objeto.teleportCooldown = 60; 
    objeto.vx = objeto.vx * 1.2; 
    objeto.vy = objeto.vy * 1.2;
    objeto.element.style.left = objeto.x + 'px';
    objeto.element.style.top = objeto.y + 'px';
    objeto.element.style.transform = "scale(0)";
    setTimeout(() => objeto.element.style.transform = "scale(1)", 100);
}

/* ==========================================
   EVENTOS GLOBALES (MOUSE)
   ========================================== */

window.addEventListener('mousemove', (e) => {
    // 1. Mover Freddys/Objetos
    freddies.forEach(p => {
        if (p.isDragging && !p.dead && p.element) {
            const deltaX = e.clientX - p.lastMouseX;
            const deltaY = e.clientY - p.lastMouseY;
            
            p.vx = deltaX; 
            p.vy = deltaY;
            p.x = e.clientX - (p.width / 2);
            p.y = e.clientY - (p.height / 2);
            
            p.element.style.left = p.x + 'px';
            p.element.style.top = p.y + 'px';
            p.lastMouseX = e.clientX;
            p.lastMouseY = e.clientY;
        }
    });

    // 2. Mover Portales
    if (portalesAbiertos) {
        moverPortal(e, portalOrange);
        moverPortal(e, portalBlue);
    }
});

function moverPortal(e, portal) {
    if (portal.dragging && portal.el) {
        const newLeft = e.clientX - portal.offsetX;
        const newTop = e.clientY - portal.offsetY;

        portal.el.style.left = newLeft + 'px';
        portal.el.style.top = newTop + 'px';

        // Actualizar centro lógico (+30 ancho / +60 alto)
        portal.x = newLeft + 30;
        portal.y = newTop + 60;
    }
}

window.addEventListener('mouseup', () => {
    freddies.forEach(p => {
        if (p.isDragging) p.isDragging = false;
    });
    if (portalesAbiertos) {
        portalOrange.dragging = false;
        portalBlue.dragging = false;
    }
});

/* ==========================================
   INICIALIZACIÓN Y RELOJ
   ========================================== */

updatePhysics();
setInterval(createHeart, 250);

function actualizarContador() {
    const elementos = {
        dias: document.getElementById('dias'),
        horas: document.getElementById('horas'),
        minutos: document.getElementById('minutos'),
        segundos: document.getElementById('segundos')
    };

    if (!elementos.dias) return;

    const ahora = new Date();
    const year = ahora.getFullYear();
    const objetivo = new Date(`${year}-02-14T17:00:00-03:00`);

    if (ahora > objetivo) {
        // objetivo.setFullYear(year + 1); // Descomentar para año siguiente
    }

    const diferencia = objetivo - ahora;

    if (diferencia <= 0) {
        elementos.dias.innerText = "00";
        elementos.horas.innerText = "00";
        elementos.minutos.innerText = "00";
        elementos.segundos.innerText = "00";
        document.querySelector('.texto-espera').innerText = "VC <3";
        return;
    }

    const d = Math.floor(diferencia / 1000 / 60 / 60 / 24);
    const h = Math.floor((diferencia / 1000 / 60 / 60) % 24);
    const m = Math.floor((diferencia / 1000 / 60) % 60);
    const s = Math.floor((diferencia / 1000) % 60);

    elementos.dias.innerText = d < 10 ? '0' + d : d;
    elementos.horas.innerText = h < 10 ? '0' + h : h;
    elementos.minutos.innerText = m < 10 ? '0' + m : m;
    elementos.segundos.innerText = s < 10 ? '0' + s : s;
}

setInterval(actualizarContador, 1000);
actualizarContador();