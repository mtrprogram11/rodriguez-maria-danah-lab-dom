'use strict';

// =====================================================
// Tarea 4 · Validación del formulario de inscripción
// JS puro, sin librerías. Sigue los patrones 3.3 y 3.4 del laboratorio.
// =====================================================

// ---------- Referencias al DOM ----------
const form = document.querySelector('#inscripcion');
const campoSede = document.querySelector('#campo-sede');
const selectSede = form.elements.sede;
const contador = document.querySelector('#comentarios-contador');
const barraFuerza = document.querySelector('#clave-fuerza');
const textoFuerza = document.querySelector('#clave-fuerza-texto');
const confirmacion = document.querySelector('#confirmacion');

const LIMITE_COMENTARIOS = 200;
const AVISO_COMENTARIOS = 180;
const EDAD_MINIMA = 16;

const LETRAS = 'A-Za-zÁÉÍÓÚÜÑáéíóúüñ';
const RE_NOMBRE = new RegExp(`^[${LETRAS}]+( [${LETRAS}]+)+$`);
const RE_CEDULA = /^([1-9]|1[0-3]|PE|E|N)-\d{1,4}-\d{1,6}$/i;
const RE_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RE_CELULAR = /^6\d{3}-?\d{4}$/;

// ---------- Utilidades ----------

// Lee el valor según el tipo de campo (texto, radio o checkbox).
function leerValor(nombre) {
  const campo = form.elements[nombre];
  if (campo instanceof RadioNodeList) return campo.value;
  if (campo.type === 'checkbox') return campo.checked;
  return campo.value;
}

// Devuelve el elemento que representa al campo (el primer radio en un grupo).
function primerCampo(nombre) {
  const campo = form.elements[nombre];
  return campo instanceof RadioNodeList ? campo[0] : campo;
}

function esPresencial() {
  return form.elements.modalidad.value === 'presencial';
}

function hoy() {
  const fecha = new Date();
  fecha.setHours(0, 0, 0, 0);
  return fecha;
}

// "2008-05-14" -> Date en hora local (new Date("2008-05-14") usaría UTC
// y en Panamá (UTC-5) daría el día anterior).
function fechaLocal(texto) {
  const [anio, mes, dia] = texto.split('-').map(Number);
  return new Date(anio, mes - 1, dia);
}

function limpiarNombre(texto) {
  return texto.trim().replace(/\s+/g, ' ');
}

// Lista de requisitos de contraseña que faltan.
function requisitosFaltantes(clave) {
  const faltan = [];
  if (clave.length < 8) faltan.push('al menos 8 caracteres');
  if (!/[A-ZÁÉÍÓÚÜÑ]/.test(clave)) faltan.push('una mayúscula');
  if (!/[a-záéíóúüñ]/.test(clave)) faltan.push('una minúscula');
  if (!/\d/.test(clave)) faltan.push('un número');
  if (!/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9\s]/.test(clave)) faltan.push('un símbolo');
  return faltan;
}

// ["a", "b", "c"] -> "a, b y c"
function unirLista(items) {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`;
}

// ---------- Reglas (en el mismo orden que el formulario) ----------
// Cada regla recibe el valor y devuelve true o el mensaje de error.
const reglas = {
  nombre: v => {
    const nombre = limpiarNombre(v);
    if (!nombre) return 'Escribe tu nombre y apellido.';
    if (nombre.length < 5 || nombre.length > 60) return 'El nombre debe tener entre 5 y 60 caracteres.';
    return RE_NOMBRE.test(nombre) || 'Escribe tu nombre y apellido, solo con letras.';
  },

  cedula: v => RE_CEDULA.test(v.trim()) || 'Usa el formato 8-123-4567.',

  celular: v => RE_CELULAR.test(v.trim()) || 'El celular debe tener 8 dígitos y empezar con 6.',

  correo: v => {
    if (!v.trim()) return 'Escribe tu correo.';
    return RE_CORREO.test(v.trim()) || 'Usa un correo como nombre@dominio.com.';
  },

  nacimiento: v => {
    if (!v) return 'Indica tu fecha de nacimiento.';
    const fecha = fechaLocal(v);
    if (Number.isNaN(fecha.getTime())) return 'Indica una fecha válida.';
    if (fecha > hoy()) return 'La fecha de nacimiento no puede ser futura.';
    const limite = hoy();
    limite.setFullYear(limite.getFullYear() - EDAD_MINIMA);
    return fecha <= limite || `Debes tener al menos ${EDAD_MINIMA} años.`;
  },

  curso: v => v !== '' || 'Elige un curso.',

  modalidad: v => v !== '' || 'Elige una modalidad.',

  // Solo es obligatoria si la modalidad es presencial.
  sede: v => !esPresencial() || v !== '' || 'Elige una sede.',

  clave: v => {
    const faltan = requisitosFaltantes(v);
    return faltan.length === 0 || `Te falta: ${unirLista(faltan)}.`;
  },

  clave2: v => {
    if (!v) return 'Confirma tu contraseña.';
    return v === form.elements.clave.value || 'Las contraseñas no coinciden.';
  },

  comentarios: v => v.length <= LIMITE_COMENTARIOS || `Máximo ${LIMITE_COMENTARIOS} caracteres.`,

  terminos: v => v === true || 'Debes aceptar los términos.',
};

// ---------- Una sola función aplica todas las reglas ----------
function validarCampo(campo) {
  const nombre = campo.name;
  const regla = reglas[nombre];
  if (!regla) return true;

  const resultado = regla(leerValor(nombre));
  const valido = resultado === true;

  // En los radios el estado se marca en el grupo (fieldset con role="radiogroup").
  const destino = campo.type === 'radio' ? campo.closest('fieldset') : campo;
  destino.setAttribute('aria-invalid', String(!valido));

  const error = document.getElementById(`${nombre}-error`);
  error.textContent = valido ? '' : resultado;   // textContent, nunca innerHTML
  return valido;
}

function limpiarCampo(campo) {
  const destino = campo.type === 'radio' ? campo.closest('fieldset') : campo;
  destino.removeAttribute('aria-invalid');
  document.getElementById(`${campo.name}-error`).textContent = '';
}

// ---------- Comportamientos en vivo ----------

// Muestra u oculta la sede según la modalidad.
function actualizarSede() {
  const presencial = esPresencial();
  campoSede.hidden = !presencial;
  selectSede.required = presencial;
  if (!presencial) {
    selectSede.value = '';      // deja de validarse y no se envía un valor viejo
    tocados.delete('sede');
    limpiarCampo(selectSede);
  }
}

const NIVELES = ['', 'Muy débil', 'Débil', 'Regular', 'Buena', 'Fuerte'];
let nivelActual = 0;

function calcularNivel(clave) {
  if (!clave) return 0;
  const cumplidos = 5 - requisitosFaltantes(clave).length;   // 0 a 5
  if (cumplidos === 5) return clave.length >= 12 ? 5 : 4;
  if (cumplidos >= 3) return 3;
  if (cumplidos === 2) return 2;
  return 1;
}

function actualizarFuerza(clave) {
  const nivel = calcularNivel(clave);
  barraFuerza.dataset.nivel = String(nivel);
  [...barraFuerza.children].forEach((segmento, i) => {
    segmento.classList.toggle('lleno', i < nivel);
  });
  // Solo cambia el texto si cambió el nivel, para no saturar al lector de pantalla.
  if (nivel !== nivelActual) {
    textoFuerza.textContent = `Fuerza: ${nivel ? NIVELES[nivel] : '—'}`;
    nivelActual = nivel;
  }
}

function actualizarContador(texto) {
  const n = texto.length;
  contador.textContent = `${n} / ${LIMITE_COMENTARIOS}`;
  contador.classList.toggle('aviso', n > AVISO_COMENTARIOS && n <= LIMITE_COMENTARIOS);
  contador.classList.toggle('excedido', n > LIMITE_COMENTARIOS);
}

// ---------- Patrón 3.4: blur → input → submit ----------
const tocados = new Set();

// 1) Al salir de un campo por primera vez se valida y queda "tocado".
form.addEventListener('blur', (e) => {
  if (!reglas[e.target.name]) return;
  tocados.add(e.target.name);
  validarCampo(e.target);
}, true);   // fase de captura: blur no burbujea

// 2) Desde entonces se revalida en vivo.
form.addEventListener('input', (e) => {
  const { name } = e.target;

  if (name === 'clave') actualizarFuerza(e.target.value);
  if (name === 'comentarios') actualizarContador(e.target.value);

  if (tocados.has(name)) validarCampo(e.target);

  // Si cambia la contraseña, la confirmación se revalida también.
  if (name === 'clave' && tocados.has('clave2')) validarCampo(form.elements.clave2);
});

form.addEventListener('change', (e) => {
  if (e.target.name === 'modalidad') actualizarSede();
});

// 3) Al enviar se valida todo y el foco va al primer error.
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const campos = Object.keys(reglas).map(primerCampo);
  campos.forEach(campo => tocados.add(campo.name));

  const invalidos = campos.filter(campo => !validarCampo(campo));
  if (invalidos.length) {
    invalidos[0].focus();
    return;
  }

  mostrarConfirmacion(new FormData(form));
  reiniciarFormulario();
});

// ---------- Confirmación ----------
function formatearCelular(valor) {
  const digitos = valor.replace(/\D/g, '');
  return `${digitos.slice(0, 4)}-${digitos.slice(4)}`;
}

function formatearFecha(valor) {
  return fechaLocal(valor).toLocaleDateString('es-PA', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function mostrarConfirmacion(datos) {
  const tarjeta = document.createElement('article');
  tarjeta.className = 'tarjeta';

  const titulo = document.createElement('h2');
  titulo.textContent = 'Inscripción recibida';
  titulo.tabIndex = -1;

  const intro = document.createElement('p');
  intro.textContent = `Te inscribiste en ${datos.get('curso')}. Revisa estos datos:`;

  const presencial = datos.get('modalidad') === 'presencial';
  const filas = [
    ['Nombre', limpiarNombre(datos.get('nombre'))],
    ['Cédula', datos.get('cedula').trim().toUpperCase()],
    ['Celular', formatearCelular(datos.get('celular'))],
    ['Correo', datos.get('correo').trim()],
    ['Fecha de nacimiento', formatearFecha(datos.get('nacimiento'))],
    ['Curso', datos.get('curso')],
    ['Modalidad', presencial ? 'Presencial' : 'Virtual'],
  ];
  if (presencial) filas.push(['Sede', datos.get('sede')]);

  const comentarios = datos.get('comentarios').trim();
  if (comentarios) filas.push(['Comentarios', comentarios]);
  // La contraseña nunca se muestra.

  const lista = document.createElement('dl');
  for (const [etiqueta, valor] of filas) {
    const dt = document.createElement('dt');
    dt.textContent = etiqueta;
    const dd = document.createElement('dd');
    dd.textContent = valor;
    lista.append(dt, dd);
  }

  tarjeta.append(titulo, intro, lista);
  confirmacion.replaceChildren(tarjeta);
  titulo.focus();
}

function reiniciarFormulario() {
  form.reset();
  tocados.clear();
  Object.keys(reglas).forEach(nombre => limpiarCampo(primerCampo(nombre)));
  actualizarSede();
  actualizarFuerza('');
  actualizarContador('');
}

// ---------- Estado inicial ----------
(function iniciar() {
  const h = hoy();
  const dosDigitos = n => String(n).padStart(2, '0');
  // Impide elegir fechas futuras en el calendario (la regla igual lo valida).
  form.elements.nacimiento.max = `${h.getFullYear()}-${dosDigitos(h.getMonth() + 1)}-${dosDigitos(h.getDate())}`;
  actualizarSede();
  actualizarFuerza('');
  actualizarContador('');
})();
