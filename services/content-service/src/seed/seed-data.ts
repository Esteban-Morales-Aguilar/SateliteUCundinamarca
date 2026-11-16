/* Contenido inicial del ODC SpaceNet Lab (editable vía API admin). */
export const MARCO_TEORICO = [
  {
    slug: 'satelites-educativos', order: 1, title: '2.1 Satélites educativos y capas de la atmósfera',
    references: ['Contente et al. (2022)', 'Moreira et al. (2020)', 'Díaz-Martínez et al. (2024)'],
    content: `<h2>Satélites educativos</h2>
<p>Un <strong>satélite educativo</strong> es una plataforma espacial de bajo costo diseñada para aprender haciendo: integra sensores, cómputo, energía y comunicaciones en un sistema que el estudiante puede construir, operar y analizar.</p>
<h3>CubeSat, CanSat y HAB</h3>
<ul>
<li><strong>CubeSat:</strong> nanosatélite estandarizado en unidades cúbicas de 10 cm (1U), pensado para órbita baja terrestre (LEO).</li>
<li><strong>CanSat:</strong> modelo del tamaño de una lata de bebida (~330 ml) que reproduce las funciones esenciales de un satélite.</li>
<li><strong>HAB (High Altitude Balloon):</strong> globo de gran altitud que alcanza la estratosfera y permite probar cargas útiles y enlaces de radio en condiciones cercanas al espacio con un costo muy inferior.</li>
</ul>
<h3>Capas de la atmósfera</h3>
<p>La <strong>troposfera</strong> (0–12 km aprox.) concentra el clima; la <strong>estratosfera</strong> (≈12–50 km) es la región que alcanzan los globos HAB, con baja presión y temperaturas muy frías; la <strong>mesosfera</strong> (≈50–85 km), la <strong>termosfera</strong> (≈85–600 km, donde orbitan los satélites LEO) y la <strong>exosfera</strong> completan el perfil. Cada capa afecta la propagación de la señal, la temperatura de operación y la presión que soporta la electrónica.</p>`,
  },
  {
    slug: 'lora-lorawan', order: 2, title: '2.2 LoRa y LoRaWAN',
    references: ['Doroshkin et al. (2019)', 'Ullah et al. (2024)', 'Haxhibeqiri et al. (2018)'],
    content: `<h2>LoRa: capa física</h2>
<p>LoRa modula la señal mediante <em>chirps</em> de espectro ensanchado. Sus parámetros clave son el <strong>Spreading Factor (SF 7–12)</strong>, el <strong>ancho de banda (125/250/500 kHz)</strong> y la <strong>tasa de codificación (CR 4/5–4/8)</strong>. Un SF mayor mejora la sensibilidad y el alcance, pero reduce la tasa de datos y aumenta el tiempo en aire.</p>
<h2>LoRaWAN: capa MAC y red</h2>
<p>Arquitectura en estrella de estrellas: <strong>nodos</strong> → <strong>gateways</strong> → <strong>servidor de red</strong> → servidores de aplicación.</p>
<h3>Clases de dispositivos</h3>
<ul>
<li><strong>Clase A:</strong> transmite cuando quiere y abre dos ventanas de recepción; mínimo consumo.</li>
<li><strong>Clase B:</strong> añade ventanas de recepción programadas por balizas.</li>
<li><strong>Clase C:</strong> escucha de forma casi continua; mayor consumo.</li>
</ul>
<h3>Comparación</h3>
<p>Frente a WiFi, LoRa ofrece mucho mayor alcance y menor consumo a cambio de tasas de datos muy bajas. Frente a LTE, opera en bandas ISM sin licencia de espectro ni suscripción de operador.</p>`,
  },
  {
    slug: 'doppler-redundancia', order: 3, title: '2.3 Efecto Doppler y redundancia',
    references: ['Zadorozhny et al. (2022)', 'Ullah et al. (2025)', 'Carvalho et al. (2021)', 'Wang et al. (2024)'],
    content: `<h2>Efecto Doppler en LEO</h2>
<p>Un satélite LEO a ~400 km viaja a cerca de <strong>7,7 km/s</strong>. La velocidad radial respecto a la estación produce un corrimiento <code>f_d = (v_r / c) · f_c</code>, del orden de ±20 kHz en 915 MHz, que puede desalinear el receptor LoRa.</p>
<h3>Mitigaciones</h3>
<ul>
<li><strong>Pre-compensación</strong> de frecuencia en el transmisor según la efeméride.</li>
<li><strong>SF ≤ 11 con BW &gt; 31,25 kHz</strong>, más tolerantes al desplazamiento.</li>
<li><strong>ADR</strong> (Adaptive Data Rate) para ajustar SF y potencia.</li>
<li><strong>LR-FHSS</strong>, modulación con saltos de frecuencia para enlaces satelitales.</li>
</ul>
<h2>Redundancia</h2>
<p>Estrategias para continuidad del servicio: <strong>nodos virtuales</strong>, <strong>gateway móvil</strong> de respaldo y arquitectura <strong>store-and-forward</strong> que almacena paquetes hasta que haya enlace.</p>`,
  },
  {
    slug: 'seguridad-lorawan', order: 4, title: '2.4 Seguridad en LoRaWAN',
    references: ['Toé et al. (2026)', 'Qadir et al. (2023)', 'Osuorah et al. (2025)', 'Rolland et al. (2025)'],
    content: `<h2>Vulnerabilidades</h2>
<p>Las amenazas se distribuyen entre capa física (PHY), MAC y aplicación. Según la revisión sistemática que sustenta este ODC, cerca del <strong>62 %</strong> de los ataques documentados se concentra en la <strong>capa MAC</strong>: replay, jamming, agotamiento de recursos y manipulación de contadores de trama.</p>
<h2>Defensas</h2>
<ul>
<li><strong>AES-128</strong> para cifrado y autenticación en capas de red y aplicación.</li>
<li><strong>ECDH + ECDSA</strong> para intercambio de claves y firma.</li>
<li><strong>Kyber-1024</strong>, criptografía post-cuántica.</li>
<li><strong>RF fingerprinting</strong> para autenticar físicamente al transmisor.</li>
</ul>
<h2>Política «listen first»</h2>
<p>Escuchar el canal antes de transmitir (<em>listen-before-talk</em>) reduce colisiones y ayuda a detectar interferencia o jamming.</p>`,
  },
];

export const GUIAS = [
  {
    slug: 'seleccion-componentes', order: 1, title: '4.1 Selección de componentes', pdfUrl: 'guia-1-componentes.pdf',
    description: 'Dos configuraciones de referencia: económica (≈ $1.289.149 COP) y premium (≈ $4.507.479 COP).',
    steps: [
      { step: 1, title: 'Defina el perfil', body: 'Económico (Raspberry Pi Zero 2 W + módulo RFM95W) o premium (Raspberry Pi 4 + radio de mayor potencia, GPS y sensores de mejor grado).' },
      { step: 2, title: 'Radio LoRa', body: 'Elija la banda según su región (915 MHz en Colombia/ISM). Verifique antena y conector.' },
      { step: 3, title: 'Sensores', body: 'Barómetro/temperatura/humedad (p. ej. BME280) y GPS. Considere el rango de temperatura en estratosfera.' },
      { step: 4, title: 'Energía y estructura', body: 'Baterías de litio con buen desempeño en frío, aislamiento térmico y estructura ligera.' },
      { step: 5, title: 'Presupuesto', body: 'Totales de referencia: económico ≈ $1.289.149 COP; premium ≈ $4.507.479 COP. Verifique precios con proveedores vigentes.' },
    ],
    components: [
      { category: 'Cómputo', item: 'Computador de a bordo (Raspberry Pi Zero 2 W / Raspberry Pi 4 de 4 GB)', economico: 85000, premium: 380000 },
      { category: 'Comunicaciones', item: 'Módulo LoRa 915 MHz (RFM95W / módulo SX1262 de mayor potencia)', economico: 65000, premium: 450000 },
      { category: 'Navegación', item: 'GPS (NEO-6M / u-blox M8N)', economico: 45000, premium: 160000 },
      { category: 'Sensores', item: 'Presión, temperatura y humedad (BME280 / BME680 + IMU)', economico: 38000, premium: 190000 },
      { category: 'Energía', item: 'Baterías y portabaterías (Li-ion 18650 / litio para bajas temperaturas)', economico: 60000, premium: 150000 },
      { category: 'Comunicaciones', item: 'Antena 915 MHz (monopolo / helicoidal)', economico: 25000, premium: 120000 },
      { category: 'Vuelo', item: 'Globo meteorológico y helio', economico: 420000, premium: 780000 },
      { category: 'Vuelo', item: 'Paracaídas', economico: 90000, premium: 180000 },
      { category: 'Estructura', item: 'Caja térmica de poliestireno / con aislamiento reforzado', economico: 25000, premium: 90000 },
      { category: 'Carga útil', item: 'Cámara (módulo estándar / cámara de 12 MP)', economico: 120000, premium: 330000 },
      { category: 'Integración', item: 'Cables, conectores y protoboard / PCB', economico: 35000, premium: 80000 },
      { category: 'Estación terrena', item: 'Receptor LoRa y antena de recepción', economico: 281149, premium: 1597479 },
    ],
    code: [],
  },
  {
    slug: 'conexiones-electricas', order: 2, title: '4.2 Conexiones eléctricas', pdfUrl: 'guia-2-conexiones.pdf',
    description: 'Diagrama de bloques y conexión SPI/GPIO entre la Raspberry Pi y el módulo LoRa.',
    steps: [
      { step: 1, title: 'Seguridad primero', body: 'Trabaje sin alimentación conectada. El módulo RFM95W es de 3,3 V: nunca lo alimente a 5 V.' },
      { step: 2, title: 'Conexión SPI', body: 'Conecte SCK, MISO, MOSI y CS según el bloque de código; comparta GND entre todos los módulos.' },
      { step: 3, title: 'Antena', body: 'Nunca transmita sin antena conectada: puede dañar el amplificador de salida.' },
    ],
    code: ['# Raspberry Pi Zero 2 W  <->  RFM95W (SPI0)\n# 3V3         -> VIN\n# GND          -> GND\n# GPIO11 SCLK  -> SCK\n# GPIO10 MOSI  -> MOSI\n# GPIO9  MISO  -> MISO\n# GPIO8  CE0   -> NSS (CS)\n# GPIO25       -> RST\n# GPIO24       -> DIO0 (IRQ)'],
  },
  {
    slug: 'instalacion-software', order: 3, title: '4.3 Instalación de software', pdfUrl: 'guia-3-software.pdf',
    description: 'Raspberry Pi OS, Python, Node-RED, MQTT y stack LoRaWAN.',
    steps: [
      { step: 1, title: 'Sistema operativo', body: 'Grabe Raspberry Pi OS Lite (64-bit) con Raspberry Pi Imager y habilite SSH.' },
      { step: 2, title: 'Actualizar e instalar', body: 'Habilite SPI con raspi-config e instale Python, pip y Mosquitto (MQTT).' },
      { step: 3, title: 'Node-RED', body: 'Instale Node-RED con el script oficial para flujos de visualización y reenvío MQTT.' },
    ],
    code: ['sudo apt update && sudo apt full-upgrade -y\nsudo raspi-config nonint do_spi 0\nsudo apt install -y python3-pip python3-venv mosquitto mosquitto-clients\npython3 -m venv ~/lora && source ~/lora/bin/activate\npip install adafruit-circuitpython-rfm9x'],
  },
  {
    slug: 'programacion-raspberry', order: 4, title: '4.4 Programación de la Raspberry Pi', pdfUrl: 'guia-4-programacion.pdf',
    description: 'Script Python comentado para transmitir telemetría por LoRa.',
    steps: [
      { step: 1, title: 'Inicializar el radio', body: 'Configure SPI, frecuencia (915 MHz) y potencia de transmisión.' },
      { step: 2, title: 'Leer sensores y transmitir', body: 'Construya una trama compacta (CSV) y envíela periódicamente respetando el ciclo de trabajo.' },
    ],
    code: ['import time, board, busio, digitalio\nimport adafruit_rfm9x\n\n# --- Configuración del radio (SPI0) ---\nspi = busio.SPI(board.SCK, MOSI=board.MOSI, MISO=board.MISO)\ncs = digitalio.DigitalInOut(board.CE0)\nreset = digitalio.DigitalInOut(board.D25)\nrfm9x = adafruit_rfm9x.RFM9x(spi, cs, reset, 915.0)\nrfm9x.tx_power = 14        # dBm\nrfm9x.spreading_factor = 10\nrfm9x.signal_bandwidth = 125000\n\nwhile True:\n    # Trama: tiempo,altitud,temperatura\n    payload = f"{int(time.time())},0.0,0.0"\n    rfm9x.send(bytes(payload, "utf-8"))\n    time.sleep(10)'],
  },
  {
    slug: 'protocolo-lanzamiento', order: 5, title: '4.5 Protocolo de lanzamiento y recuperación', pdfUrl: 'guia-5-lanzamiento.pdf',
    description: 'Checklist pre-lanzamiento, inflado, secuencia, monitoreo, recuperación y análisis.',
    steps: [
      { step: 1, title: 'Checklist pre-lanzamiento', body: 'Baterías cargadas, sellado, paracaídas, GPS con fix, prueba de enlace y permisos aeronáuticos.' },
      { step: 2, title: 'Inflado', body: 'Calcule la flotación neutra y el ascenso deseado; infle con helio en zona sin viento fuerte.' },
      { step: 3, title: 'Secuencia de lanzamiento', body: 'Confirme telemetría activa antes de soltar; registre hora y condiciones.' },
      { step: 4, title: 'Monitoreo', body: 'Siga altitud, posición y calidad de enlace (RSSI/SNR) en el dashboard.' },
      { step: 5, title: 'Recuperación', body: 'Use la última posición conocida; lleve gateway móvil y coordine al equipo.' },
      { step: 6, title: 'Análisis', body: 'Descargue los datos, compare con el simulador y documente lecciones aprendidas.' },
    ],
    code: [],
  },
];

export const CREDITOS = {
  authors: [{ name: 'Esteban Morales Aguilar' }, { name: 'Darikson Felipe Pérez Rodríguez' }],
  program: 'Especialización en Infraestructura y Seguridad de Redes',
  university: 'Universidad de Cundinamarca',
  researchGroup: 'CAI2272024210 / CTI-IIPA2026-G8',
  teacher: 'Jonathan Alejandro Nino Jaramillo', year: 2026, license: 'Creative Commons BY-NC-SA 4.0',
};

/* IMPORTANTE: solo constan autor y año citados en el ODC. Reemplace `apa` por la
   referencia APA 7 completa de su RSL (PATCH admin o editando este archivo). */
const R = (citeKey: string, topic: string, label: string) => ({ citeKey, topic, apa: `${label} [Completar referencia APA 7]` });
export const REFERENCIAS = [
  R('contente2022', 'satelites', 'Contente et al. (2022).'), R('moreira2020', 'satelites', 'Moreira et al. (2020).'),
  R('diazmartinez2024', 'satelites', 'Díaz-Martínez et al. (2024).'), R('doroshkin2019', 'lora', 'Doroshkin et al. (2019).'),
  R('ullah2024', 'lora', 'Ullah et al. (2024).'), R('haxhibeqiri2018', 'lora', 'Haxhibeqiri et al. (2018).'),
  R('zadorozhny2022', 'doppler', 'Zadorozhny et al. (2022).'), R('ullah2025', 'doppler', 'Ullah et al. (2025).'),
  R('carvalho2021', 'doppler', 'Carvalho et al. (2021).'), R('wang2024', 'doppler', 'Wang et al. (2024).'),
  R('toe2026', 'seguridad', 'Toé et al. (2026).'), R('qadir2023', 'seguridad', 'Qadir et al. (2023).'),
  R('osuorah2025', 'seguridad', 'Osuorah et al. (2025).'), R('rolland2025', 'seguridad', 'Rolland et al. (2025).'),
];
