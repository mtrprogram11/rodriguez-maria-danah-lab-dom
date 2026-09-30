# Laboratorio DOM y Tarea 4 · Validación de formularios del lado cliente

**Estudiantes:** María Rodríguez y Danah Rodríguez
**Grupo:** 1SF133
**Curso:** Ingeniería Web · Universidad Tecnológica de Panamá
**Profesora:** Dra. Elba Valderrama Bahamóndez

## Enlaces

- Repositorio: https://github.com/mtrprogram11/rodriguez-maria-danah-lab-dom
- Formulario de inscripción (GitHub Pages): https://mtrprogram11.github.io/rodriguez-maria-danah-lab-dom/inscripcion/
- Laboratorio guiado (GitHub Pages): https://mtrprogram11.github.io/rodriguez-maria-danah-lab-dom/lab-dom/

## Contenido

```
rodriguez-maria-danah-lab-dom/
├── README.md
├── capturas/
│   ├── errores.png
│   └── confirmacion.png
├── lab-dom/            # laboratorio guiado (index.html + app.js)
└── inscripcion/        # Tarea 4
    ├── index.html
    ├── estilos.css
    └── validacion.js
```

## Qué hace la Tarea 4

- Formulario con `novalidate`; los mensajes aparecen debajo de cada campo, sin `alert()`.
- Todas las reglas viven en el objeto `reglas` y una sola función `validarCampo` las aplica.
- Patrón de validación: primero al salir del campo (`blur`), luego en vivo (`input`) y todo al enviar, con foco en el primer error.
- Cada campo inválido tiene `aria-invalid="true"` y su mensaje está enlazado con `aria-describedby`.
- La sede aparece y se vuelve obligatoria solo en modalidad presencial.
- Indicador de fuerza de contraseña y contador de comentarios en vivo (cambia de color al pasar de 180).
- Al enviar un formulario válido no se recarga la página: se crea con `createElement` una tarjeta de confirmación (sin la contraseña), usando `textContent`, y se reinicia el formulario.

## Capturas

![Errores de validación](capturas/errores.png)

![Tarjeta de confirmación](capturas/confirmacion.png)
