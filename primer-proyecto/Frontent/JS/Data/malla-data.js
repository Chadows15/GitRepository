
const MALLA = [
  {
    nivel: 1, nombre: "N100-I", materias: [
      { id: "n1-1", codigo: "MATG1045", nombre: "Cálculo de una variable", horas: 9, creditos: 3, prerrequisitos: [] },
      { id: "n1-2", codigo: "FISG1005", nombre: "Física: Mecánica", horas: 9, creditos: 3, prerrequisitos: [] },
      { id: "n1-3", codigo: "INDG1033", nombre: "Análisis y resolución de problemas", horas: 9, creditos: 3, prerrequisitos: [] },
      { id: "n1-4", codigo: "CCPG1043", nombre: "Fundamentos de programación", horas: 9, creditos: 3, prerrequisitos: [] },
      { id: "n1-5", codigo: null, nombre: "Complementarias de artes, deportes e idiomas", horas: 3, creditos: 1, prerrequisitos: [] },
      { id: "n1-6", codigo: "IDIG1006", nombre: "Inglés I", horas: 6, creditos: 2, prerrequisitos: [] }
    ]
  },
  {
    nivel: 2, nombre: "N100-II", materias: [
      { id: "n2-1", codigo: "MATG1049", nombre: "Álgebra lineal", horas: 9, creditos: 3, prerrequisitos: [] },
      { id: "n2-2", codigo: "MATG1046", nombre: "Cálculo vectorial", horas: 9, creditos: 3, prerrequisitos: [] },
      { id: "n2-3", codigo: "CCPG1039", nombre: "Computación y sociedad", horas: 6, creditos: 2, prerrequisitos: [] },
      { id: "n2-4", codigo: "CCPG1052", nombre: "Programación orientada a objetos", horas: 9, creditos: 3, prerrequisitos: [] },
      { id: "n2-5", codigo: "IDIG2012", nombre: "Comunicación", horas: 6, creditos: 2, prerrequisitos: [] },
      { id: "n2-6", codigo: "IDIG1007", nombre: "Inglés II", horas: 6, creditos: 2, prerrequisitos: [] }
    ]
  },
  {
    nivel: 3, nombre: "N200-I", materias: [
      { id: "n3-1", codigo: "EYAG1037", nombre: "Fundamentos de electricidad y sistemas digitales", horas: 6, creditos: 2, prerrequisitos: [] },
      { id: "n3-2", codigo: "MATG1051", nombre: "Matemáticas discretas", horas: 9, creditos: 3, prerrequisitos: [] },
      { id: "n3-3", codigo: "CCPG1034", nombre: "Estructuras de datos", horas: 9, creditos: 3, prerrequisitos: [] },
      { id: "n3-4", codigo: "CCPG1042", nombre: "Diseño de software", horas: 6, creditos: 2, prerrequisitos: [] },
      { id: "n3-5", codigo: "TICG1018", nombre: "Sistema de bases de datos", horas: 9, creditos: 3, prerrequisitos: [] },
      { id: "n3-6", codigo: "IDIG1008", nombre: "Inglés III", horas: 6, creditos: 2, prerrequisitos: [] }
    ]
  },
  {
    nivel: 4, nombre: "N200-II", materias: [
      { id: "n4-1", codigo: "CCPG1049", nombre: "Organización de computadores", horas: 6, creditos: 2, prerrequisitos: [] },
      { id: "n4-2", codigo: "CCPG1051", nombre: "Programación de sistemas", horas: 9, creditos: 3, prerrequisitos: [] },
      { id: "n4-3", codigo: "ESTG1034", nombre: "Estadística", horas: 9, creditos: 3, prerrequisitos: [] },
      { id: "n4-4", codigo: "CCPG1046", nombre: "Interacción humano computador", horas: 6, creditos: 2, prerrequisitos: [] },
      { id: "n4-5", codigo: "TLMG1032", nombre: "Redes de datos", horas: 9, creditos: 3, prerrequisitos: [] },
      { id: "n4-6", codigo: "IDIG1009", nombre: "Inglés IV", horas: 6, creditos: 2, prerrequisitos: [] }
    ]
  },
  {
    nivel: 5, nombre: "N300-I", materias: [
      { id: "n5-1", codigo: "CCPG1056", nombre: "Sistemas operativos", horas: 9, creditos: 3, prerrequisitos: [] },
      { id: "n5-2", codigo: "CCPG1036", nombre: "Análisis de algoritmos", horas: 6, creditos: 2, prerrequisitos: [] },
      { id: "n5-3", codigo: "SOFG1006", nombre: "Desarrollo de aplicaciones web y móviles", horas: 9, creditos: 3, prerrequisitos: [] },
      { id: "n5-4", codigo: "SOFG1007", nombre: "Ingeniería de software I", horas: 6, creditos: 2, prerrequisitos: [] },
      { id: "n5-5", codigo: "ADSG1005", nombre: "Emprendimiento e innovación", horas: 9, creditos: 3, prerrequisitos: [] },
      { id: "n5-6", codigo: "IDIG1010", nombre: "Inglés V", horas: 6, creditos: 2, prerrequisitos: [] }
    ]
  },
  {
    nivel: 6, nombre: "N300-II", materias: [
      { id: "n6-1", codigo: "CCPG1053", nombre: "Seguridad de la información", horas: 6, creditos: 2, prerrequisitos: [] },
      { id: "n6-2", codigo: "CCPG1048", nombre: "Metodología de la investigación en computación", horas: 6, creditos: 2, prerrequisitos: [] },
      { id: "n6-3", codigo: "SOFG1009", nombre: "Lenguajes de programación", horas: 9, creditos: 3, prerrequisitos: [] },
      { id: "n6-4", codigo: "SOFG1008", nombre: "Ingeniería de software II", horas: 9, creditos: 3, prerrequisitos: [] },
      { id: "n6-5", codigo: "ADSG1026", nombre: "Ciencias de la sostenibilidad", horas: 9, creditos: 3, prerrequisitos: [] },
      { id: "n6-6", codigo: null, nombre: "Prácticas de servicio comunitario", horas: 6, creditos: 2, prerrequisitos: [] }
    ]
  },
  {
    nivel: 7, nombre: "N400-I", materias: [
      { id: "n7-1", codigo: "CCPG1044", nombre: "Inteligencia artificial", horas: 9, creditos: 3, prerrequisitos: [] },
      { id: "n7-2", codigo: "CCPG1054", nombre: "Sistemas de información", horas: 6, creditos: 2, prerrequisitos: [] },
      { id: "n7-3", codigo: "CCPG1055", nombre: "Sistemas distribuidos y computación en la nube", horas: 9, creditos: 3, prerrequisitos: [] },
      { id: "n7-4", codigo: "CCPG1041", nombre: "Dirección de proyectos informáticos", horas: 6, creditos: 2, prerrequisitos: [] },
      { id: "n7-5", codigo: null, nombre: "Itinerario I", horas: 9, creditos: 3, prerrequisitos: [] }
    ]
  },
  {
    nivel: 8, nombre: "N400-II", materias: [
      { id: "n8-1", codigo: null, nombre: "Complementarias de humanísticas", horas: 3, creditos: 1, prerrequisitos: [] },
      { id: "n8-2", codigo: "CCPG1035", nombre: "Materia integradora de computación", horas: 9, creditos: 3, prerrequisitos: [] },
      { id: "n8-3", codigo: null, nombre: "Itinerario II", horas: 9, creditos: 3, prerrequisitos: [] },
      { id: "n8-4", codigo: null, nombre: "Prácticas preprofesionales empresariales", horas: 5, creditos: 1.67, prerrequisitos: [] }
    ]
  }
];
