# El Creador - Revision gameplay

Cambios de esta revision:
- La simulacion de 30-150 videos acumula suscriptores e ingresos antes de redondear.
- Se evita el bug de `Math.floor()` por video que producia +0 subs y +$0 en canales chicos.
- El flujo principal usa un unico boton SIGUIENTE para avanzar.
- Pretemporada -> elegir mejora -> Publicar.
- Resultado -> evento/sponsor si corresponde -> siguiente trimestre.
- Resultado del trimestre 2 -> resumen anual.
- Resumen anual -> Awards.
- Decision de evento -> siguiente paso automaticamente.
- Aceptar/rechazar sponsor -> siguiente paso automaticamente.
- Overrides responsive mobile para reducir tarjetas, espacios, titulos y HUD.
