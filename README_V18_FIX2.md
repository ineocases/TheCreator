# El Creador — Fix 2: alcance, eventos y colabs

Correcciones realizadas sobre la build integrada v16:

- Las publicaciones automáticas del trimestre ya no quedan comprimidas por una fórmula de descubrimiento independiente de la audiencia.
- Cada video normal calcula vistas a partir de los suscriptores actuales del canal, con ratios progresivos según tamaño, fama, algoritmo, edición, marketing, constancia y tendencias.
- La simulación de 30–150 publicaciones conserva el rendimiento de cada publicación y suma sus resultados.
- Se redujo la posibilidad de que un trimestre muy largo produzca cifras absurdamente bajas respecto de los subs.
- `Pasan cosas` sigue generando un evento elegible al cierre del trimestre.
- Se añadió un overlay global: evento, colaboración o sponsor pendiente aparece automáticamente en pantalla, sin obligar al jugador a buscarlo en un menú.
- Las colaboraciones tienen una probabilidad alta y se garantiza la primera invitación para canales establecidos cuando existe un candidato válido.
- Sponsors elegibles aparecen con una probabilidad mucho más alta.
- La pantalla Colabs fue simplificada: muestra únicamente creadores a los que realmente se les puede proponer colaboración, con botón rojo `PROPONER COLAB`.
- Se mantienen los 329 creadores, 0 perfiles de Música y los 20 eventos de `eventsExpansion.js`.

Validación: todos los archivos JavaScript modificados pasan `node --check`.
