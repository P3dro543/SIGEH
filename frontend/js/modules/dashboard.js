auth.verificarAcceso();
navbar.render('dashboard.html');


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
   VARIABLES DE LOS GRAFICOS
   ===================================================== */

let chartLine = null;
let chartBar = null;
let chartDonut = null;


/* =====================================================
   CARGAR DASHBOARD
   ===================================================== */

async function cargarDashboard() {

    ui.loader(true);

    try {

        const [
            empleados,
            asistencias,
            permisos,
            inconsistencias
        ] = await Promise.all([
            api.get('/empleados'),
            api.get('/asistencias'),
            api.get('/permisos'),
            api.get('/inconsistencias')
        ]);


        /* =================================================
           EMPLEADOS ACTIVOS
           ================================================= */

        const empleadosActivos =
            empleados.filter(e => e.activo).length;

        document.getElementById('total-empleados').textContent =
            empleadosActivos;


        /* =================================================
           FECHA DE HOY
           ================================================= */

        const hoy = new Date();

        const hoyTexto =
            hoy.getFullYear() +
            '-' +
            String(hoy.getMonth() + 1).padStart(2, '0') +
            '-' +
            String(hoy.getDate()).padStart(2, '0');


        /* =================================================
           ASISTENCIA DE HOY
           ================================================= */

        const asistenciaHoy = asistencias.filter(a => {

            if (!a.fecha) {
                return false;
            }

            const fechaAsistencia =
                new Date(a.fecha);

            const fechaTexto =
                fechaAsistencia.getFullYear() +
                '-' +
                String(fechaAsistencia.getMonth() + 1).padStart(2, '0') +
                '-' +
                String(fechaAsistencia.getDate()).padStart(2, '0');

            return fechaTexto === hoyTexto;

        });


        document.getElementById('asistencia-hoy').textContent =
            asistenciaHoy.length;


        /* =================================================
           INCONSISTENCIAS
           ================================================= */

        const inconsistenciasPendientes =
            inconsistencias.filter(i => {

                if (i.estado === undefined) {
                    return true;
                }

                return (
                    i.estado === 'Pendiente' ||
                    i.estado === 'pendiente' ||
                    i.estado === 'PENDIENTE'
                );

            });


        document.getElementById('inconsistencias').textContent =
            inconsistenciasPendientes.length;


        /* =================================================
           PERMISOS
           ================================================= */

        document.getElementById('permisos').textContent =
            permisos.length;


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
                }
            ],

            asistencias
                .slice(0, 10)
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
                            : '–'

                }))
        );


        /* =================================================
           GRAFICOS
           ================================================= */

        crearGraficoAsistencia(asistencias);

        crearGraficoInconsistencias(inconsistencias);

        crearGraficoEstado(
            empleados,
            asistenciaHoy
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
   GRAFICO 1
   ASISTENCIA SEMANAL
   ===================================================== */

function crearGraficoAsistencia(asistencias) {

    const canvas =
        document.getElementById('chart-line');

    if (!canvas) {
        return;
    }


    /* ---------------------------------------------
       Obtener los últimos 7 días
       --------------------------------------------- */

    const hoy = new Date();

    const fechas = [];

    for (let i = 6; i >= 0; i--) {

        const fecha = new Date(hoy);

        fecha.setHours(0, 0, 0, 0);

        fecha.setDate(
            hoy.getDate() - i
        );

        fechas.push(fecha);

    }


    /* ---------------------------------------------
       Nombres de los días
       --------------------------------------------- */

    const labels = fechas.map(fecha => {

        return fecha.toLocaleDateString(
            'es-CR',
            {
                weekday: 'short'
            }
        ).replace('.', '');

    });


    /* ---------------------------------------------
       Contar asistencias por día
       --------------------------------------------- */

    const datos = fechas.map(fechaObjetivo => {

        return asistencias.filter(a => {

            if (!a.fecha) {
                return false;
            }

            const fecha =
                new Date(a.fecha);

            return (
                fecha.getFullYear() ===
                    fechaObjetivo.getFullYear() &&

                fecha.getMonth() ===
                    fechaObjetivo.getMonth() &&

                fecha.getDate() ===
                    fechaObjetivo.getDate()
            );

        }).length;

    });


    /* ---------------------------------------------
       Destruir gráfico anterior
       --------------------------------------------- */

    if (chartLine) {
        chartLine.destroy();
    }


    /* ---------------------------------------------
       Crear gráfico
       --------------------------------------------- */

    chartLine = new Chart(
        canvas,
        {

            type: 'line',

            data: {

                labels: labels,

                datasets: [

                    {
                        label: 'Asistencia',

                        data: datos,

                        borderColor: '#6366f1',

                        backgroundColor:
                            'rgba(99, 102, 241, 0.15)',

                        borderWidth: 2,

                        fill: true,

                        tension: 0.4,

                        pointRadius: 4,

                        pointHoverRadius: 6

                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {
                        display: false
                    }

                },

                scales: {

                    x: {

                        grid: {
                            display: false
                        }

                    },

                    y: {

                        beginAtZero: true,

                        ticks: {
                            precision: 0
                        }

                    }

                }

            }

        }
    );

}


/* =====================================================
   GRAFICO 2
   INCONSISTENCIAS POR TIPO
   ===================================================== */

function crearGraficoInconsistencias(inconsistencias) {

    const canvas =
        document.getElementById('chart-bar');

    if (!canvas) {
        return;
    }


    /* ---------------------------------------------
       Agrupar inconsistencias por tipo
       --------------------------------------------- */

    const tipos = {};

    inconsistencias.forEach(inconsistencia => {

        const tipo =
            inconsistencia.tipo ||
            inconsistencia.tipo_inconsistencia ||
            inconsistencia.nombre_tipo ||
            'Sin especificar';

        if (!tipos[tipo]) {
            tipos[tipo] = 0;
        }

        tipos[tipo]++;

    });


    const labels =
        Object.keys(tipos);

    const datos =
        Object.values(tipos);


    /* ---------------------------------------------
       Si no existen datos
       --------------------------------------------- */

    if (labels.length === 0) {

        labels.push('Sin inconsistencias');

        datos.push(0);

    }


    /* ---------------------------------------------
       Destruir gráfico anterior
       --------------------------------------------- */

    if (chartBar) {
        chartBar.destroy();
    }


    /* ---------------------------------------------
       Crear gráfico
       --------------------------------------------- */

    chartBar = new Chart(
        canvas,
        {

            type: 'bar',

            data: {

                labels: labels,

                datasets: [

                    {
                        label: 'Inconsistencias',

                        data: datos,

                        backgroundColor: [
                            '#f59e0b',
                            '#ef4444',
                            '#8b5cf6',
                            '#6366f1',
                            '#14b8a6',
                            '#ec4899'
                        ],

                        borderRadius: 6,

                        borderSkipped: false

                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {
                        display: false
                    }

                },

                scales: {

                    x: {

                        grid: {
                            display: false
                        }

                    },

                    y: {

                        beginAtZero: true,

                        ticks: {
                            precision: 0
                        }

                    }

                }

            }

        }
    );

}


/* =====================================================
   GRAFICO 3
   ESTADO DE EMPLEADOS
   ===================================================== */

function crearGraficoEstado(
    empleados,
    asistenciaHoy
) {

    const canvas =
        document.getElementById('chart-donut');

    if (!canvas) {
        return;
    }


    /* ---------------------------------------------
       Cantidades
       --------------------------------------------- */

    const presentes =
        asistenciaHoy.length;


    const total =
        empleados.filter(e => e.activo).length;


    const ausentes =
        Math.max(
            total - presentes,
            0
        );


    /* ---------------------------------------------
       Destruir gráfico anterior
       --------------------------------------------- */

    if (chartDonut) {
        chartDonut.destroy();
    }


    /* ---------------------------------------------
       Crear donut
       --------------------------------------------- */

    chartDonut = new Chart(
        canvas,
        {

            type: 'doughnut',

            data: {

                labels: [
                    'Presentes',
                    'Ausentes'
                ],

                datasets: [

                    {
                        data: [
                            presentes,
                            ausentes
                        ],

                        backgroundColor: [
                            '#22c55e',
                            '#ef4444'
                        ],

                        borderWidth: 0,

                        hoverOffset: 5

                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                cutout: '68%',

                plugins: {

                    legend: {
                        display: false
                    }

                }

            }

        }
    );


    /* ---------------------------------------------
       Leyenda personalizada
       --------------------------------------------- */

    const legend =
        document.getElementById('donut-legend');

    if (!legend) {
        return;
    }


    legend.innerHTML = `

        <div style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            font-size:12px;
        ">

            <span>

                <span style="
                    display:inline-block;
                    width:8px;
                    height:8px;
                    border-radius:50%;
                    background:#22c55e;
                    margin-right:7px;
                "></span>

                Presentes

            </span>

            <strong>
                ${presentes}
            </strong>

        </div>


        <div style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            font-size:12px;
        ">

            <span>

                <span style="
                    display:inline-block;
                    width:8px;
                    height:8px;
                    border-radius:50%;
                    background:#ef4444;
                    margin-right:7px;
                "></span>

                Ausentes

            </span>

            <strong>
                ${ausentes}
            </strong>

        </div>

    `;

}


/* =====================================================
   INICIAR DASHBOARD
   ===================================================== */

cargarDashboard();