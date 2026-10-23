# Calendario NBA España: DAZN y Prime Video

Calendario gratuito de la **NBA que se puede ver en España en DAZN y Prime Video**, sin tener que buscar cada semana los horarios ni añadir partidos uno a uno.

**Importante:** los partidos de Prime Video incluidos aquí son los emitidos con la suscripción normal a **Amazon Prime**. Los encuentros disponibles **únicamente mediante NBA League Pass de pago** no se añaden.

**Web y suscripción:** https://nba-calendar-espana.vercel.app

## Suscribirse al calendario

Puedes añadir uno de estos calendarios a Apple Calendario (iPhone, iPad o Mac) o a cualquier aplicación compatible con calendarios iCalendar por suscripción:

| Calendario | Enlace de suscripción |
| --- | --- |
| DAZN + Prime Video | [Calendario combinado](https://nba-calendar-espana.vercel.app/api/calendar?platform=all) |
| Solo DAZN | [Calendario DAZN](https://nba-calendar-espana.vercel.app/api/calendar?platform=dazn) |
| Solo Prime Video | [Calendario Prime Video](https://nba-calendar-espana.vercel.app/api/calendar?platform=prime) |

En iPhone, lo más sencillo es abrir la [web](https://nba-calendar-espana.vercel.app) en Safari y utilizar el enlace de suscripción. Alternativamente, copia una de las URL y añádela como **calendario por suscripción** desde las opciones de Calendario.

Si te suscribes al calendario combinado, no es necesario suscribirse también a los dos individuales: aparecerían partidos duplicados.

Los eventos incluyen el encuentro, la plataforma, el horario de España peninsular y un aviso 15 minutos antes (según la compatibilidad y configuración de notificaciones de la aplicación utilizada).

## Cómo funciona

- Consulta las programaciones españolas de **[BaloncestoHoy - DAZN](https://www.baloncestohoy.es/canales/dazn)** y **[BaloncestoHoy - Amazon Prime Video](https://www.baloncestohoy.es/canales/amazon-prime-video)**. Usa la programación del *canal de cada plataforma*, no la lista del canal NBA League Pass, para seleccionar las emisiones.
- Añade como respaldo algunos partidos anunciados en fuentes españolas, como las comunicaciones de [DAZN](https://dazngroup.com/press-room/la-nba-regresa-a-dazn-con-una-nueva-temporada-y-todas-las-finales-en-directo/) y la cobertura de [Gigantes del Basket](https://www.gigantes.com/nba/donde-ver-nba-espana-tv-streaming-prime-video-dazn/).
- Genera archivos `.ics` con identificadores de evento estables para que el calendario se pueda actualizar sin importar nuevos archivos.
- Convierte los horarios a UTC para su distribución; las aplicaciones muestran la hora correspondiente según su zona horaria. Se utiliza `Europe/Madrid` como referencia para el horario peninsular.
- Aprovecha la caché de Vercel para evitar consultar las fuentes en cada descarga.

**No hay una tarea programada ni una base de datos:** las fuentes se consultan cuando alguien solicita el calendario y se actualizan cuando la aplicación de calendario vuelve a leer la suscripción. Apple controla la frecuencia de consulta; los cambios no son instantáneos.

### Limitaciones

La programación de DAZN y Prime Video puede anunciarse con pocos días de antelación. Algunas fechas del principio de la temporada 2026-27 están incluidas como respaldo, pero **no hay cobertura garantizada de toda la temporada**. Si una fuente cambia su estructura o deja de responder, puede faltar algún partido. El calendario no determina si tu plan concreto de DAZN incluye el acceso necesario.

Que una ficha mencione NBA League Pass *además* de Prime Video no significa que sea exclusiva de League Pass. Por eso la distinción se basa en las programaciones atribuidas a DAZN o a Prime Video; aun así, pueden producirse errores en las fuentes.

Este proyecto es independiente, **no oficial** y no está afiliado a la NBA, DAZN ni Amazon. Los nombres comerciales pertenecen a sus respectivos titulares.

## Desarrollo

Aplicación pequeña para Vercel, con Node.js 20 o superior y sin paquetes npm externos.

```bash
npm test
```

Archivos principales:

- `index.html`: web en español, instrucciones y enlaces de suscripción.
- `lib/data.js`: extracción de las programaciones, validación, equipos y zona horaria.
- `api/calendar.js`: endpoint que genera los calendarios iCalendar.
- `api/events.js`: estado y próximos partidos en JSON.
- `vercel.json`: configuración de rutas y funciones.
- `test/calendar.test.js`: pruebas del horario peninsular, interpretación de fechas y formato ICS.

Para desplegarlo en tu propio Vercel, importa este repositorio como proyecto sin framework. Las funciones Node se detectan automáticamente. La web en producción se desplegó originalmente desde archivos y puede funcionar sin repositorio Git conectado.

## Licencia

El **código** se comparte bajo licencia [MIT](LICENSE). La licencia no concede derechos sobre marcas ni sobre información de terceros utilizada como fuente.