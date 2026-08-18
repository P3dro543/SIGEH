auth.verificarAcceso();
navbar.render('dashboard.html');

const gridColor = 'rgba(255,255,255,0.05)';
const tickColor = 'rgba(255,255,255,0.4)';

let chartLine, chartBar, chartDonut;


/* =====================================================
   FECHA ACTUAL
   ===================================================== */

const fecha = new Date().toLocaleDateString('es-CR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
});

const elementoFecha = document.getElementById('fecha-hoy');

if (elementoFecha) {
    elementoFecha.textContent =
        fecha.charAt(0).toUpperCase() + fecha.slice(1);
}


/* =====================================================
   CARGAR DASHBOARD
   ===================================================== */

async function cargarDashboard() {

    ui.loader(true);

    try {

        const [
            empleados,
            asistencias,
            inconsistencias,
            permisos
        ] = await Promise.all([
            api.get('/empleados'),
            api.get('/asistencias'),
            api.get('/inconsistencias'),
            api.get('/permisos')
        ]);


        /* =================================================
           EMPLEADOS ACTIVOS
           ================================================= */

        const activos =
            empleados.filter(e => e.activo).length;

        document.getElementById('total-empleados').textContent =
            activos;


        /* =================================================
           FECHA DE HOY
           ================================================= */

        const hoy =
            new Date().toISOString().split('T')[0];


        /* =================================================
           ASISTENCIA DE HOY
           ================================================= */

        const asistenciaHoy =
            asistencias.filter(a =>
                a.fecha &&
                a.fecha.startsWith(hoy)
            );

        document.getElementById('asistencia-hoy').textContent =
            asistenciaHoy.length;


        /* =================================================
           INCONSISTENCIAS PENDIENTES
           ================================================= */

        const pendientes =
            inconsistencias.filter(i =>
                i.estado === 'pendiente'
            );

        document.getElementById('inconsistencias').textContent =
            pendientes.length;


        /* =================================================
           PERMISOS
           ================================================= */

        document.getElementById('permisos').textContent =
            permisos.length;


        /* =================================================
           GRAFICO DE LINEA
           ASISTENCIA DE LOS ULTIMOS 7 DIAS
           ================================================= */

        const dias = [];
        const datosAsistencia = [];

        for (let i = 6; i >= 0; i--) {

            const d = new Date();

            d.setDate(
                d.getDate() - i
            );

            const fechaStr =
                d.toISOString().split('T')[0];

            dias.push(
                d.toLocaleDateString(
                    'es-CR',
                    {
                        weekday: 'short'
                    }
                )
            );

            datosAsistencia.push(
                asistencias.filter(a =>
                    a.fecha &&
                    a.fecha.startsWith(fechaStr)
                ).length
            );

        }


        if (chartLine) {
            chartLine.destroy();
        }


        const canvasLine =
            document.getElementById('chart-line');

        if (canvasLine) {

            chartLine = new Chart(
                canvasLine,
                {
                    type: 'line',

                    data: {

                        labels: dias,

                        datasets: [

                            {
                                label: 'Asistencias',

                                data: datosAsistencia,

                                borderColor: '#818cf8',

                                backgroundColor:
                                    'rgba(129,140,248,0.08)',

                                borderWidth: 2,

                                fill: true,

                                tension: 0.4,

                                pointBackgroundColor:
                                    '#818cf8',

                                pointBorderColor:
                                    'rgba(15,12,41,1)',

                                pointBorderWidth: 2,

                                pointRadius: 5,

                                pointHoverRadius: 7
                            }

                        ]
                    },

                    options: {

                        responsive: true,

                        maintainAspectRatio: false,

                        plugins: {

                            legend: {
                                display: false
                            },

                            tooltip: {

                                backgroundColor:
                                    'rgba(15,12,41,0.95)',

                                borderColor:
                                    'rgba(129,140,248,0.3)',

                                borderWidth: 1,

                                titleColor:
                                    '#818cf8',

                                bodyColor:
                                    'rgba(255,255,255,0.7)',

                                padding: 10,

                                cornerRadius: 8
                            }
                        },

                        scales: {

                            x: {

                                grid: {
                                    color: gridColor,
                                    drawBorder: false
                                },

                                ticks: {

                                    color: tickColor,

                                    font: {
                                        size: 11,
                                        family: 'Inter'
                                    }
                                }
                            },

                            y: {

                                grid: {
                                    color: gridColor,
                                    drawBorder: false
                                },

                                ticks: {

                                    color: tickColor,

                                    font: {
                                        size: 11,
                                        family: 'Inter'
                                    },

                                    stepSize: 1,

                                    precision: 0
                                },

                                beginAtZero: true
                            }
                        }
                    }
                }
            );

        }


        /* =================================================
           GRAFICO DE BARRAS
           INCONSISTENCIAS
           ================================================= */

        const tardanzas =
            inconsistencias.filter(i =>
                i.tipo === 'tardanza'
            ).length;

        const ausencias =
            inconsistencias.filter(i =>
                i.tipo === 'ausencia'
            ).length;

        const salidas =
            inconsistencias.filter(i =>
                i.tipo === 'salida_anticipada'
            ).length;


        if (chartBar) {
            chartBar.destroy();
        }


        const canvasBar =
            document.getElementById('chart-bar');

        if (canvasBar) {

            chartBar = new Chart(
                canvasBar,
                {
                    type: 'bar',

                    data: {

                        labels: [
                            'Tardanza',
                            'Ausencia',
                            'Salida ant.'
                        ],

                        datasets: [

                            {
                                data: [
                                    tardanzas,
                                    ausencias,
                                    salidas
                                ],

                                backgroundColor: [
                                    'rgba(251,191,36,0.5)',
                                    'rgba(248,113,113,0.5)',
                                    'rgba(96,165,250,0.5)'
                                ],

                                borderColor: [
                                    '#fbbf24',
                                    '#f87171',
                                    '#60a5fa'
                                ],

                                borderWidth: 1.5,

                                borderRadius: 8,

                                borderSkipped: false,

                                /* BARRAS MAS DELGADAS */
                                barThickness: 32
                            }
                        ]
                    },

                    options: {

                        responsive: true,

                        maintainAspectRatio: false,

                        plugins: {

                            legend: {
                                display: false
                            },

                            tooltip: {

                                backgroundColor:
                                    'rgba(15,12,41,0.95)',

                                borderColor:
                                    'rgba(255,255,255,0.1)',

                                borderWidth: 1,

                                titleColor:
                                    'rgba(255,255,255,0.8)',

                                bodyColor:
                                    'rgba(255,255,255,0.6)',

                                padding: 10,

                                cornerRadius: 8
                            }
                        },

                        scales: {

                            x: {

                                grid: {
                                    display: false
                                },

                                ticks: {

                                    color: tickColor,

                                    font: {
                                        size: 11,
                                        family: 'Inter'
                                    }
                                }
                            },

                            y: {

                                grid: {
                                    color: gridColor,
                                    drawBorder: false
                                },

                                ticks: {

                                    color: tickColor,

                                    font: {
                                        size: 11,
                                        family: 'Inter'
                                    },

                                    stepSize: 1,

                                    precision: 0
                                },

                                beginAtZero: true
                            }
                        }
                    }
                }
            );

        }


        /* =================================================
           GRAFICO DONUT
           ESTADO DE EMPLEADOS
           ================================================= */

        const enTurno =
            asistenciaHoy.filter(a =>
                a.hora_entrada &&
                !a.hora_salida
            ).length;


        const completos =
            asistenciaHoy.filter(a =>
                a.hora_salida
            ).length;


        const ausentes =
            Math.max(
                activos - asistenciaHoy.length,
                0
            );


        if (chartDonut) {
            chartDonut.destroy();
        }


        const canvasDonut =
            document.getElementById('chart-donut');

        if (canvasDonut) {

            chartDonut = new Chart(
                canvasDonut,
                {
                    type: 'doughnut',

                    data: {

                        labels: [
                            'En turno',
                            'Completo',
                            'Ausente'
                        ],

                        datasets: [

                            {
                                data: [
                                    enTurno,
                                    completos,
                                    ausentes
                                ],

                                backgroundColor: [
                                    'rgba(251,191,36,0.75)',
                                    'rgba(52,211,153,0.75)',
                                    'rgba(248,113,113,0.75)'
                                ],

                                borderColor: [
                                    '#fbbf24',
                                    '#34d399',
                                    '#f87171'
                                ],

                                borderWidth: 1.5,

                                hoverOffset: 4
                            }
                        ]
                    },

                    options: {

                        responsive: true,

                        maintainAspectRatio: false,

                        cutout: '72%',

                        plugins: {

                            legend: {
                                display: false
                            },

                            tooltip: {

                                backgroundColor:
                                    'rgba(15,12,41,0.95)',

                                borderColor:
                                    'rgba(255,255,255,0.1)',

                                borderWidth: 1,

                                titleColor:
                                    'rgba(255,255,255,0.8)',

                                bodyColor:
                                    'rgba(255,255,255,0.6)',

                                padding: 10,

                                cornerRadius: 8
                            }
                        }
                    }
                }
            );

        }


        /* =================================================
           LEYENDA DEL DONUT
           ================================================= */

        const donutLabels = [
            'En turno',
            'Completo',
            'Ausente'
        ];

        const donutData = [
            enTurno,
            completos,
            ausentes
        ];

        const donutColors = [
            '#fbbf24',
            '#34d399',
            '#f87171'
        ];

        const total =
            donutData.reduce(
                (a, b) => a + b,
                0
            );


        const legend =
            document.getElementById('donut-legend');


        if (legend) {

            legend.innerHTML = '';

            donutLabels.forEach((label, index) => {

                const porcentaje =
                    total > 0
                        ? Math.round(
                            donutData[index] /
                            total *
                            100
                        )
                        : 0;


                legend.innerHTML += `

                    <div class="donut-legend-item">

                        <div style="
                            display:flex;
                            align-items:center;
                            gap:8px;
                        ">

                            <div
                                class="donut-legend-dot"
                                style="
                                    background:${donutColors[index]};
                                    width:10px;
                                    height:10px;
                                    border-radius:3px;
                                ">
                            </div>

                            <span style="
                                color:var(--text-muted);
                                font-size:13px;
                            ">
                                ${label}
                            </span>

                        </div>


                        <span style="
                            color:var(--text-primary);
                            font-weight:600;
                            font-size:13px;
                        ">

                            ${donutData[index]}

                            <span style="
                                color:var(--text-muted);
                                font-weight:400;
                            ">
                                (${porcentaje}%)
                            </span>

                        </span>

                    </div>

                `;

            });

        }


        /* =================================================
           TABLA DE ASISTENCIA
           ================================================= */

        ui.tabla(
            'tabla-asistencia',

            [
                {
                    label: 'Empleado',
                    key: 'nombre_completo'
                },

                {
                    label: 'Cédula',
                    key: 'cedula'
                },

                {
                    label: 'Fecha',
                    key: 'fecha_fmt'
                },

                {
                    label: 'Entrada',
                    key: 'entrada_fmt'
                },

                {
                    label: 'Salida',
                    key: 'salida_fmt'
                },

                {
                    label: 'Estado',
                    key: 'estado_fmt'
                }
            ],

            asistencias
                .slice(0, 8)
                .map(a => ({

                    ...a,

                    nombre_completo:
                        `${a.nombre} ${a.apellido}`,

                    fecha_fmt:
                        a.fecha
                            ? new Date(a.fecha)
                                .toLocaleDateString('es-CR')
                            : '–',

                    entrada_fmt:
                        a.hora_entrada
                            ? new Date(a.hora_entrada)
                                .toLocaleTimeString(
                                    'es-CR',
                                    {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    }
                                )
                            : '–',

                    salida_fmt:
                        a.hora_salida
                            ? new Date(a.hora_salida)
                                .toLocaleTimeString(
                                    'es-CR',
                                    {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    }
                                )
                            : '–',

                    estado_fmt:
                        a.hora_salida
                            ? '<span class="badge badge-green">Completo</span>'
                            : a.hora_entrada
                                ? '<span class="badge badge-amber">En turno</span>'
                                : '<span class="badge badge-red">Ausente</span>'

                }))
        );


    } catch (err) {

        console.error(
            'Error cargando dashboard:',
            err
        );

        ui.alerta(
            'Error cargando el dashboard',
            'error'
        );

    } finally {

        ui.loader(false);

    }

}


/* =====================================================
   INICIAR DASHBOARD
   ===================================================== */

cargarDashboard();