// data/creators.js
// El mundo usa cifras BASE de simulación. No pretenden ser seguidores reales exactos:
// sirven para que la escala entre creadores sea coherente y el mundo pueda crecer.

const C = (id, nombre, nicho, seguidores, popularidad, crecimientoBase = 0.025) => ({
    id,
    nombre,
    nicho,
    pais: "Argentina",
    seguidores,
    seguidoresIniciales: seguidores,
    popularidad,
    crecimientoBase,
    relacion: 0,
    respeto: 0,
    rivalidad: 0,
    colaboraciones: 0,
    activo: true,
    mundo: {
        videos: 0,
        vistas: 0,
        nuevosSeguidores: 0,
        virales: 0,
        clips: 0,
        enojos: 0,
        temporadas: 0
    }
});

const creatorsIniciales = [
    C("coscu", "Coscu", "Gaming", 2500000, 95, 0.018),
    C("spreen", "Spreen", "Gaming", 5000000, 98, 0.032),
    C("coker", "Coker", "Gaming", 700000, 82, 0.045),
    C("mernosketti", "Mernosketti", "Gaming", 550000, 80, 0.050),
    C("momo", "Momo", "Gaming", 1400000, 88, 0.025),
    C("goncho", "Goncho", "Gaming", 1000000, 86, 0.028),
    C("brunenger", "Brunenger", "Variedad", 1100000, 87, 0.030),
    C("luquita", "Luquita Rodríguez", "Fútbol", 1300000, 90, 0.040),
    C("davoo", "Davoo Xeneize", "Fútbol", 2600000, 93, 0.038),
    C("lacobra", "La Cobra", "Fútbol", 1800000, 91, 0.042),
    C("carrera", "Carrera", "Gaming", 800000, 78, 0.035),
    C("ciber-renzo", "Ciber-Renzo", "Gaming", 420000, 76, 0.050),
    C("robleis", "Robleis", "Gaming", 6500000, 97, 0.025),
    C("reydelgaming", "Rey del Gaming", "Gaming", 900000, 77, 0.030),
    C("luken", "Luken", "Gaming", 600000, 74, 0.030),
    C("joaco", "Jjjoaco", "Gaming", 750000, 79, 0.042),
    C("agusbob", "AgusBob", "Gaming", 500000, 72, 0.040),
    C("tuli", "Tuli", "Variedad", 950000, 80, 0.035),
    C("milica", "Milica", "Variedad", 850000, 79, 0.033),
    C("santidead", "Santidead", "Gaming", 450000, 70, 0.032),
    C("frankkaster", "Frankkaster", "Gaming", 700000, 75, 0.020),
    C("pimpeano", "Pimpeano", "Variedad", 650000, 76, 0.025),
    C("gianpa", "Gianpa", "Variedad", 550000, 73, 0.030),
    C("manteca", "Manteca", "Gaming", 350000, 68, 0.045),
    C("tomasmazza", "Tomás Mazza", "Fitness", 4500000, 94, 0.030),
    C("gonchoirl", "Goncho IRL", "IRL", 900000, 83, 0.030),
    C("mauromon", "Mauro Monzón", "Variedad", 500000, 70, 0.028),
    C("luzutv", "Luzu", "Variedad", 1200000, 88, 0.025),
    C("miguegranados", "Migue Granados", "Variedad", 1800000, 92, 0.020),
    C("martinpugliese", "Martín Pugliese", "Comedia", 650000, 78, 0.028),
    C("ibai", "Ibai", "Variedad", 15000000, 100, 0.018),
    C("elrubius", "ElRubius", "Gaming", 14000000, 99, 0.012),
    C("auron", "AuronPlay", "Gaming", 17000000, 99, 0.014),
    C("illojuan", "IlloJuan", "Gaming", 5000000, 96, 0.025),
    C("xokas", "Xokas", "Variedad", 2200000, 91, 0.020),
    C("luisito", "Luisito Comunica", "Vlog", 42000000, 100, 0.012),
    C("mkbhd", "MKBHD", "Tecnología", 20000000, 100, 0.010)
];

const paisesNoArgentina = {
    ibai: "España",
    elrubius: "España",
    auron: "España",
    illojuan: "España",
    xokas: "España",
    luisito: "México",
    mkbhd: "Estados Unidos"
};

creatorsIniciales.forEach(c => {
    if (paisesNoArgentina[c.id]) c.pais = paisesNoArgentina[c.id];
});

export { creatorsIniciales };
