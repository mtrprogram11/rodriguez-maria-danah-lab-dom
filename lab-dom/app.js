// =====================================================
// Laboratorio: DOM, eventos y validación de formularios
// =====================================================

// El formulario se usa en las partes 2.3 y 3, por eso se declara una sola vez aquí.
const form = document.querySelector('#registro');

// ---------- Parte 1 · El DOM ----------

// 1.1 Seleccionar elementos
const titulo = document.querySelector('#titulo');     // primer elemento que coincide
const items  = document.querySelectorAll('li');       // NodeList con todos
console.log(titulo.textContent);
items.forEach(li => console.log(li.textContent));

// 1.2 Cambiar texto, clases y atributos
titulo.textContent = '¡Hola DOM!';            // texto seguro
titulo.classList.add('destacado');            // add / remove / toggle / contains
titulo.setAttribute('title', 'Encabezado');
titulo.dataset.estado = 'activo';             // crea data-estado="activo"
titulo.style.color = 'steelblue';             // estilo en línea (úsalo poco)

// 1.3 Crear y eliminar nodos
const lista = document.querySelector('#lista');
const lenguajes = ['HTML', 'CSS', 'JavaScript'];
for (const nombre of lenguajes) {
  const li = document.createElement('li');
  li.textContent = nombre;
  lista.append(li);                           // lo agrega al final
}
lista.lastElementChild.remove();              // elimina "JavaScript"

// ---------- Parte 2 · Eventos ----------

// 2.1 addEventListener y el objeto event
const boton = document.querySelector('#saludar');
boton.addEventListener('click', (event) => {
  console.log(event.type);     // "click"
  console.log(event.target);   // el elemento que recibió el clic
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') console.log('Cerrar modal');
});

// 2.2 Delegación de eventos
// (En el laboratorio se llama "lista"; aquí es "listaTareas" porque "lista" ya existe en 1.3.)
const listaTareas = document.querySelector('#tareas');
listaTareas.addEventListener('click', (e) => {
  const borrar = e.target.closest('.borrar');
  if (borrar) {
    borrar.closest('li').remove();
    return;
  }
  const texto = e.target.closest('.texto');
  if (texto) texto.closest('li').classList.toggle('hecha');
});

// Extra: agregar tareas nuevas para comprobar que la delegación
// funciona con elementos creados después de registrar el manejador.
document.querySelector('#agregar-tarea').addEventListener('click', () => {
  const entrada = document.querySelector('#nueva-tarea');
  const valor = entrada.value.trim();
  if (!valor) return;
  const li = document.createElement('li');
  const span = document.createElement('span');
  span.className = 'texto';
  span.textContent = valor;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'borrar';
  btn.textContent = 'Borrar';
  li.append(span, ' ', btn);
  listaTareas.append(li);
  entrada.value = '';
});

// 2.3 preventDefault
form.addEventListener('submit', (e) => {
  e.preventDefault();                  // no recargar la página
  const datos = new FormData(form);
  console.log(Object.fromEntries(datos));
});

// ---------- Parte 3 · Validación ----------

// 3.2 Capa 2: API de validación del navegador
const correo = document.querySelector('#correo');
console.log(correo.checkValidity());           // true / false
console.log(correo.validity.valueMissing);     // true si required y está vacío
console.log(correo.validity.typeMismatch);     // true si no parece un correo
console.log(correo.validity.patternMismatch);  // true si no cumple pattern
console.log(correo.validity.tooShort);         // true si no llega a minlength

// Marcar un error propio (cadena vacía = válido)
correo.setCustomValidity('Ese correo ya está registrado');
console.log(correo.validationMessage);         // "Ese correo ya está registrado"
correo.setCustomValidity('');                  // lo limpiamos para seguir el lab

// 3.3 Capa 3: reglas propias, reutilizables
const reglas = {
  nombre: v => v.trim().length >= 3 || 'Escribe al menos 3 caracteres.',
  correo: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Usa un correo como nombre@dominio.com.',
  cedula: v => /^([1-9]|1[0-3]|PE|E|N)-\d{1,4}-\d{1,6}$/.test(v) || 'Formato: 8-123-4567.',
  clave:  v => (v.length >= 8 && /[A-Z]/.test(v) && /\d/.test(v))
               || 'Mínimo 8 caracteres, una mayúscula y un número.',
  clave2: v => v === form.clave.value || 'Las contraseñas no coinciden.',
};

function validarCampo(input) {
  const resultado = reglas[input.name](input.value);
  const valido = resultado === true;
  const error = document.getElementById(`${input.name}-error`);
  input.setAttribute('aria-invalid', String(!valido));
  error.textContent = valido ? '' : resultado;
  return valido;
}

// 3.4 Cuándo mostrar los errores
const tocados = new Set();

form.addEventListener('blur', (e) => {
  if (!reglas[e.target.name]) return;
  tocados.add(e.target.name);
  validarCampo(e.target);
}, true);   // true = fase de captura (blur no burbujea)

form.addEventListener('input', (e) => {
  if (tocados.has(e.target.name)) validarCampo(e.target);
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const campos = [...form.elements].filter(el => reglas[el.name]);
  const invalidos = campos.filter(el => !validarCampo(el));
  if (invalidos.length) { invalidos[0].focus(); return; }
  mostrarResumen(new FormData(form));
  form.reset();
});

// El laboratorio llama a mostrarResumen pero no la define: aquí va una versión simple.
// Usa textContent (nunca innerHTML) y no muestra las contraseñas.
function mostrarResumen(datos) {
  const resumen = document.querySelector('#resumen');
  const p = document.createElement('p');
  p.textContent = `Cuenta creada para ${datos.get('nombre')} (${datos.get('correo')}), cédula ${datos.get('cedula')}.`;
  resumen.replaceChildren(p);
}
