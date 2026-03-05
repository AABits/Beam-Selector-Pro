import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve('.', 'beams_v2.db');
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS beam_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS beam_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type_id INTEGER,
    name TEXT NOT NULL,
    h REAL,
    b REAL,
    e REAL,
    e1 REAL,
    a REAL,
    ix REAL,
    wx REAL,
    iy REAL,
    wy REAL,
    p REAL,
    FOREIGN KEY(type_id) REFERENCES beam_types(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS materials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    fy REAL,
    e REAL
  );
`);

// Seed some initial data if empty
const countTypes = db.prepare('SELECT COUNT(*) as count FROM beam_types').get() as { count: number };
if (countTypes.count === 0) {
  db.transaction(() => {
    const insertType = db.prepare('INSERT INTO beam_types (name) VALUES (?)');
    const infoIPE = insertType.run('IPE');
    const infoIPN = insertType.run('IPN');
    const infoUPN = insertType.run('UPN');
    const infoHEB = insertType.run('HEB');
    const infoTuboCuadEst = insertType.run('Tubo Cuadrado Estructural');
    const infoTuboRectMec = insertType.run('Tubo Rectangular Mecánico');
    const infoTuboRectEst = insertType.run('Tubo Rectangular Estructural');
    const infoTuboRedMec = insertType.run('Tubo Redondo Mecánico');

    const insertProfile = db.prepare(`
      INSERT INTO beam_profiles (type_id, name, h, b, e, e1, a, ix, wx, iy, wy, p)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // IPE (Full series)
    insertProfile.run(infoIPE.lastInsertRowid, 'IPE 80', 80, 46, 3.8, 5.2, 7.64, 80.1, 20.0, 8.49, 3.69, 6.00);
  insertProfile.run(infoIPE.lastInsertRowid, 'IPE 100', 100, 55, 4.1, 5.7, 10.3, 171, 34.2, 15.9, 5.79, 8.10);
  insertProfile.run(infoIPE.lastInsertRowid, 'IPE 120', 120, 64, 4.4, 6.3, 13.2, 318, 53.0, 27.7, 8.65, 10.4);
  insertProfile.run(infoIPE.lastInsertRowid, 'IPE 140', 140, 73, 4.7, 6.9, 16.4, 541, 77.3, 44.9, 12.3, 12.9);
  insertProfile.run(infoIPE.lastInsertRowid, 'IPE 160', 160, 82, 5.0, 7.4, 20.1, 869, 109, 68.3, 16.7, 15.8);
  insertProfile.run(infoIPE.lastInsertRowid, 'IPE 180', 180, 91, 5.3, 8.0, 23.9, 1320, 146, 101, 22.2, 18.8);
  insertProfile.run(infoIPE.lastInsertRowid, 'IPE 200', 200, 100, 5.6, 8.5, 28.5, 1940, 194, 142, 28.5, 22.4);
  insertProfile.run(infoIPE.lastInsertRowid, 'IPE 220', 220, 110, 5.9, 9.2, 33.4, 2770, 252, 205, 37.3, 26.2);
  insertProfile.run(infoIPE.lastInsertRowid, 'IPE 240', 240, 120, 6.2, 9.8, 39.1, 3890, 324, 284, 47.3, 30.7);
  insertProfile.run(infoIPE.lastInsertRowid, 'IPE 270', 270, 135, 6.6, 10.2, 45.9, 5790, 429, 420, 62.2, 36.1);
  insertProfile.run(infoIPE.lastInsertRowid, 'IPE 300', 300, 150, 7.1, 10.7, 53.8, 8360, 557, 604, 80.5, 42.2);
  insertProfile.run(infoIPE.lastInsertRowid, 'IPE 330', 330, 160, 7.5, 11.5, 62.6, 11770, 713, 788, 98.5, 49.1);
  insertProfile.run(infoIPE.lastInsertRowid, 'IPE 360', 360, 170, 8.0, 12.7, 72.7, 16270, 904, 1040, 123, 57.1);
  insertProfile.run(infoIPE.lastInsertRowid, 'IPE 400', 400, 180, 8.6, 13.5, 84.5, 23130, 1160, 1320, 146, 66.3);
  insertProfile.run(infoIPE.lastInsertRowid, 'IPE 450', 450, 190, 9.4, 14.6, 98.8, 33740, 1500, 1680, 176, 77.6);
  insertProfile.run(infoIPE.lastInsertRowid, 'IPE 500', 500, 200, 10.2, 16.0, 116, 48200, 1930, 2140, 214, 90.7);
  insertProfile.run(infoIPE.lastInsertRowid, 'IPE 550', 550, 210, 11.1, 17.2, 134, 67120, 2440, 2640, 254, 106);
  insertProfile.run(infoIPE.lastInsertRowid, 'IPE 600', 600, 220, 12.0, 19.0, 155, 92080, 3070, 3390, 308, 122);
  
  // IPN (Full series provided by user)
  insertProfile.run(infoIPN.lastInsertRowid, 'IPN 80', 80, 42, 3.9, 5.9, 7.58, 77.8, 19.5, 6.29, 3.00, 5.95);
  insertProfile.run(infoIPN.lastInsertRowid, 'IPN 100', 100, 50, 4.5, 6.8, 10.6, 171, 34.2, 12.2, 4.88, 8.32);
  insertProfile.run(infoIPN.lastInsertRowid, 'IPN 120', 120, 58, 5.1, 7.7, 14.2, 328, 54.7, 21.5, 7.41, 11.2);
  insertProfile.run(infoIPN.lastInsertRowid, 'IPN 140', 140, 66, 5.7, 8.6, 18.3, 573, 81.9, 35.2, 10.7, 14.4);
  insertProfile.run(infoIPN.lastInsertRowid, 'IPN 160', 160, 74, 6.3, 9.5, 22.8, 935, 117, 54.7, 14.8, 17.9);
  insertProfile.run(infoIPN.lastInsertRowid, 'IPN 180', 180, 82, 6.9, 10.4, 27.9, 1450, 161.0, 81.3, 19.8, 21.9);
  insertProfile.run(infoIPN.lastInsertRowid, 'IPN 200', 200, 90, 7.5, 11.3, 33.5, 2140, 214, 117, 26.0, 26.3);
  insertProfile.run(infoIPN.lastInsertRowid, 'IPN 220', 220, 98, 8.1, 12.2, 39.6, 3060, 278, 162, 33.1, 31.1);
  insertProfile.run(infoIPN.lastInsertRowid, 'IPN 240', 240, 106, 8.7, 13.1, 46.1, 4250, 354, 221, 41.7, 36.2);
  insertProfile.run(infoIPN.lastInsertRowid, 'IPN 260', 260, 113, 9.4, 14.1, 53.4, 5740, 442, 288, 51.0, 41.9);
  insertProfile.run(infoIPN.lastInsertRowid, 'IPN 280', 280, 119, 10.1, 15.2, 61.1, 7590, 542, 364, 61.2, 48.0);
  insertProfile.run(infoIPN.lastInsertRowid, 'IPN 300', 300, 125, 10.8, 16.2, 69.1, 9800, 653, 451, 72.2, 54.2);
  insertProfile.run(infoIPN.lastInsertRowid, 'IPN 320', 320, 131, 11.5, 17.3, 77.8, 12510, 782, 555, 84.7, 61.1);
  insertProfile.run(infoIPN.lastInsertRowid, 'IPN 340', 340, 137, 12.2, 18.3, 86.8, 15700, 923, 674, 98.4, 68.1);
  insertProfile.run(infoIPN.lastInsertRowid, 'IPN 360', 360, 143, 13.0, 19.5, 97.1, 19610, 1090, 818, 114, 76.2);
  insertProfile.run(infoIPN.lastInsertRowid, 'IPN 380', 380, 149, 13.7, 20.5, 107, 24010, 1260, 975, 131, 84.0);
  insertProfile.run(infoIPN.lastInsertRowid, 'IPN 400', 400, 155, 14.4, 21.6, 118, 29210, 1460, 1160, 149, 92.6);
  insertProfile.run(infoIPN.lastInsertRowid, 'IPN 450', 450, 170, 16.2, 24.3, 147, 45850, 2040, 1730, 203, 115);
  insertProfile.run(infoIPN.lastInsertRowid, 'IPN 500', 500, 185, 18.0, 27.0, 180, 68740, 2750, 2480, 268, 141);
  insertProfile.run(infoIPN.lastInsertRowid, 'IPN 550', 550, 200, 19.0, 30, 212, 99180, 3610, 3490, 349, 167);
  insertProfile.run(infoIPN.lastInsertRowid, 'IPN 600', 600, 215, 21.6, 32.4, 254, 139000, 4630, 4670, 443, 199);

  // UPN (Full series provided by user)
  insertProfile.run(infoUPN.lastInsertRowid, 'UPN 80', 80, 45, 6.0, 8.0, 11.0, 106, 26.5, 19.4, 6.36, 8.64);
  insertProfile.run(infoUPN.lastInsertRowid, 'UPN 100', 100, 50, 6.0, 8.5, 13.5, 206, 41.2, 29.3, 8.49, 10.60);
  insertProfile.run(infoUPN.lastInsertRowid, 'UPN 120', 120, 55, 7.0, 9.0, 17.0, 364, 60.7, 43.2, 11.1, 13.4);
  insertProfile.run(infoUPN.lastInsertRowid, 'UPN 140', 140, 60, 7.0, 10.0, 20.4, 605, 86.4, 62, 14.8, 16);
  insertProfile.run(infoUPN.lastInsertRowid, 'UPN 160', 160, 65, 7.5, 10.5, 24.0, 923, 116, 85.3, 18.3, 18.8);
  insertProfile.run(infoUPN.lastInsertRowid, 'UPN 180', 180, 70, 8.0, 11.0, 28.0, 1350, 150, 114, 22.4, 22);
  insertProfile.run(infoUPN.lastInsertRowid, 'UPN 200', 200, 75, 8.5, 11.5, 32.2, 1910, 191, 148, 27.0, 25.3);
  insertProfile.run(infoUPN.lastInsertRowid, 'UPN 220', 220, 80, 9.0, 12.5, 37.4, 2690, 245, 197, 33.6, 29.4);
  insertProfile.run(infoUPN.lastInsertRowid, 'UPN 240', 240, 85, 9.5, 13.0, 42.3, 3600, 300, 248, 39.6, 33.2);
  insertProfile.run(infoUPN.lastInsertRowid, 'UPN 260', 260, 90, 10, 14.0, 48.3, 4820, 371, 317, 47.7, 37.9);
  insertProfile.run(infoUPN.lastInsertRowid, 'UPN 280', 280, 95, 10, 15.0, 53.3, 6280, 448, 399, 57.2, 41.8);
  insertProfile.run(infoUPN.lastInsertRowid, 'UPN 300', 300, 100, 10, 16.0, 58.8, 8030, 535, 495, 67.8, 46.2);

  // HEB (Data provided by user)
  insertProfile.run(infoHEB.lastInsertRowid, 'HEB 100', 100, 100, 6.0, 10, 26.0, 450, 90.0, 167, 33, 20.4);
  insertProfile.run(infoHEB.lastInsertRowid, 'HEB 120', 120, 120, 6.5, 11, 34.0, 864, 144, 318, 53, 26.7);
  insertProfile.run(infoHEB.lastInsertRowid, 'HEB 140', 140, 140, 7.0, 12, 43.0, 1509, 216.0, 550, 79, 33.7);
  insertProfile.run(infoHEB.lastInsertRowid, 'HEB 160', 160, 160, 8.0, 13, 54.3, 2492, 311, 889, 111, 42.6);
  insertProfile.run(infoHEB.lastInsertRowid, 'HEB 180', 180, 180, 8.5, 14, 65.3, 3831, 426, 1363, 151, 51.2);
  insertProfile.run(infoHEB.lastInsertRowid, 'HEB 200', 200, 200, 9.0, 15, 78.1, 5696, 570, 2003, 200, 61.3);
  insertProfile.run(infoHEB.lastInsertRowid, 'HEB 220', 220, 220, 9.5, 16, 91.0, 8091, 736, 2843, 258, 71.5);
  insertProfile.run(infoHEB.lastInsertRowid, 'HEB 240', 240, 240, 10.0, 17, 106.0, 11259, 938, 3923, 327, 83.2);
  insertProfile.run(infoHEB.lastInsertRowid, 'HEB 260', 260, 260, 10.0, 17.5, 118.4, 14919, 1150, 5135, 395, 93);
  insertProfile.run(infoHEB.lastInsertRowid, 'HEB 280', 280, 280, 10.5, 18, 131.4, 19270, 1380, 6595, 471, 103);
  insertProfile.run(infoHEB.lastInsertRowid, 'HEB 300', 300, 300, 11.0, 19, 149.1, 25166, 1680, 8563, 571, 117);
  insertProfile.run(infoHEB.lastInsertRowid, 'HEB 320', 320, 300, 11.5, 20.5, 161.3, 30823, 1930, 9239, 616, 127);
  insertProfile.run(infoHEB.lastInsertRowid, 'HEB 340', 340, 300, 12.0, 21.5, 170.9, 36656, 2160, 9690, 646, 134);
  insertProfile.run(infoHEB.lastInsertRowid, 'HEB 360', 360, 300, 12.5, 22.5, 180.6, 43193, 2400, 10140, 676, 142);
  insertProfile.run(infoHEB.lastInsertRowid, 'HEB 400', 400, 300, 13.5, 24, 197.8, 57680, 2880, 10819, 721, 155);
  insertProfile.run(infoHEB.lastInsertRowid, 'HEB 450', 450, 300, 14.0, 26, 218, 79887, 3550, 11721, 781, 171);
  insertProfile.run(infoHEB.lastInsertRowid, 'HEB 500', 500, 300, 14.5, 28, 238.6, 107176, 4290, 12624, 842, 187);
  insertProfile.run(infoHEB.lastInsertRowid, 'HEB 550', 550, 300, 15.0, 29, 254.1, 136691, 4970, 13077, 872, 199);
  insertProfile.run(infoHEB.lastInsertRowid, 'HEB 600', 600, 300, 15.5, 30, 270.0, 171041, 5700, 13530, 902, 212);

  // Tubo Cuadrado Estructural
  const sq = (b: number, e: number, a: number, p: number, i: number, w: number) => 
    insertProfile.run(infoTuboCuadEst.lastInsertRowid, `${b}x${b}x${e}`, b, b, e, 0, a, i, w, i, w, p);

  sq(20, 1.40, 0.99, 0.78, 0.56, 0.56);
  sq(20, 1.50, 1.05, 0.83, 0.58, 0.58);
  sq(20, 1.80, 1.23, 0.96, 0.66, 0.66);
  sq(20, 2.00, 1.34, 1.05, 0.70, 0.70);
  
  sq(25, 1.40, 1.27, 1.00, 1.16, 0.93);
  sq(25, 1.50, 1.25, 1.06, 1.22, 0.97);
  sq(25, 1.80, 1.59, 1.25, 1.39, 1.11);
  sq(25, 2.00, 1.74, 1.36, 1.49, 1.19);
  
  sq(30, 1.40, 1.55, 1.22, 2.08, 1.39);
  sq(30, 1.50, 1.65, 1.30, 2.20, 1.47);
  sq(30, 1.80, 1.95, 1.53, 2.53, 1.68);
  sq(30, 2.00, 2.14, 1.68, 2.73, 1.82);
  
  sq(40, 1.40, 2.11, 1.66, 5.18, 2.59);
  sq(40, 1.50, 2.25, 1.77, 5.49, 2.75);
  sq(40, 1.80, 2.67, 2.09, 6.39, 3.19);
  sq(40, 2.00, 2.90, 2.31, 6.95, 3.47);
  sq(40, 2.50, 3.59, 2.82, 8.23, 4.12);
  sq(40, 3.00, 4.21, 3.30, 9.36, 4.68);
  sq(40, 4.00, 5.35, 4.20, 11.18, 5.59);
  
  sq(50, 1.40, 2.67, 2.10, 10.42, 4.17);
  sq(50, 1.50, 2.85, 2.24, 11.07, 4.43);
  sq(50, 1.80, 3.39, 2.66, 12.95, 5.18);
  sq(50, 2.00, 3.74, 2.93, 14.15, 5.66);
  sq(50, 2.50, 4.59, 3.60, 16.96, 6.78);
  sq(50, 3.00, 5.41, 4.25, 19.50, 7.80);
  sq(50, 4.00, 6.95, 5.45, 23.84, 9.54);
  
  sq(60, 1.50, 3.45, 2.71, 19.52, 6.51);
  sq(60, 1.80, 4.11, 3.22, 22.95, 7.65);
  sq(60, 2.00, 4.54, 3.56, 25.15, 8.38);
  sq(60, 2.50, 5.59, 4.39, 30.36, 10.12);
  sq(60, 3.00, 6.61, 5.19, 35.17, 11.72);
  sq(60, 4.00, 8.55, 6.71, 43.65, 14.55);
  
  sq(70, 1.50, 4.05, 3.18, 31.46, 8.99);
  sq(70, 1.80, 4.83, 3.79, 37.09, 10.60);
  sq(70, 2.00, 5.34, 4.19, 40.73, 11.64);
  sq(70, 2.50, 6.59, 5.17, 49.43, 14.12);
  sq(70, 3.00, 7.81, 6.13, 57.56, 16.45);
  sq(70, 4.00, 10.15, 7.97, 72.22, 20.64);
  
  sq(75, 1.50, 4.35, 3.42, 38.92, 10.38);
  sq(75, 1.80, 5.19, 4.07, 45.95, 12.25);
  sq(75, 2.00, 5.74, 4.50, 50.50, 13.47);
  sq(75, 2.50, 7.09, 5.56, 61.40, 16.37);
  sq(75, 3.00, 8.41, 6.60, 71.65, 19.11);
  sq(75, 4.00, 10.95, 8.59, 90.29, 24.08);
  
  sq(90, 1.80, 6.27, 4.92, 80.71, 17.94);
  sq(90, 2.00, 6.94, 5.45, 88.87, 19.75);
  sq(90, 2.50, 8.59, 6.74, 108.57, 24.13);
  sq(90, 3.00, 10.21, 8.01, 127.32, 28.29);
  sq(90, 4.00, 13.35, 10.48, 162.02, 36.01);
  
  sq(100, 1.80, 6.99, 5.48, 111.62, 22.32);
  sq(100, 2.00, 7.74, 6.07, 123.01, 24.60);
  sq(100, 2.50, 9.59, 7.53, 150.65, 30.13);
  sq(100, 3.00, 11.41, 8.96, 177.08, 35.42);
  sq(100, 4.00, 14.95, 11.73, 226.46, 45.29);
  sq(100, 5.00, 18.36, 14.41, 271.36, 54.27);
  sq(100, 6.00, 21.63, 16.98, 312.00, 62.40);
  
  sq(125, 3.00, 14.41, 11.31, 354.53, 56.73);
  sq(125, 4.00, 18.95, 14.87, 457.33, 73.17);
  sq(125, 5.00, 23.36, 18.33, 552.87, 88.46);
  sq(125, 6.00, 27.63, 21.69, 641.41, 102.63);
  
  sq(135, 3.00, 15.61, 12.25, 449.88, 66.65);
  sq(135, 4.00, 20.55, 16.13, 581.80, 86.19);
  sq(135, 5.00, 25.36, 19.90, 705.16, 104.47);
  sq(135, 6.00, 30.03, 23.58, 820.25, 121.52);
  
  sq(150, 3.00, 17.41, 13.67, 622.76, 83.03);
  sq(150, 4.00, 22.95, 18.01, 807.92, 107.72);
  sq(150, 5.00, 28.36, 22.26, 982.37, 130.98);
  sq(150, 6.00, 33.63, 26.40, 1146.43, 152.86);

  // Tubo Rectangular Mecánico
  const rectMec = (h: number, b: number, e: number, a: number, p: number, ix: number, wx: number, iy: number, wy: number) => 
    insertProfile.run(infoTuboRectMec.lastInsertRowid, `${h}x${b}x${e}`, h, b, e, 0, a, ix, wx, iy, wy, p);

  rectMec(20, 10, 0.8, 0.35, 0.36, 0.23, 0.09, 0.08, 0.04);
  rectMec(25, 12, 0.8, 0.53, 0.43, 0.43, 0.43, 0.13, 0.22);
  rectMec(25, 12, 1.0, 0.77, 0.54, 0.59, 0.48, 0.18, 0.30);
  rectMec(25, 15, 0.8, 0.61, 0.49, 0.52, 0.21, 0.23, 0.12);
  rectMec(25, 15, 1.0, 0.83, 0.64, 0.69, 0.28, 0.31, 0.15);
  rectMec(25, 15, 1.2, 0.90, 0.69, 0.74, 0.30, 0.33, 0.16);
  rectMec(30, 20, 0.8, 0.77, 0.61, 0.99, 0.40, 0.53, 0.26);
  rectMec(30, 20, 1.2, 1.14, 0.90, 1.42, 0.57, 0.75, 0.37);
  rectMec(40, 20, 0.8, 0.93, 0.74, 1.98, 0.79, 0.67, 0.34);
  rectMec(40, 20, 1.0, 1.27, 0.92, 2.66, 1.06, 0.89, 0.45);
  rectMec(40, 20, 1.2, 1.38, 1.09, 2.87, 1.15, 0.96, 0.48);
  rectMec(40, 20, 1.5, 1.65, 1.35, 3.10, 1.60, 1.06, 1.06);
  rectMec(50, 20, 1.2, 1.62, 1.29, 5.02, 2.01, 1.17, 0.59);
  rectMec(50, 20, 1.5, 2.14, 1.59, 6.48, 2.59, 1.48, 0.74);
  rectMec(50, 20, 0.8, 1.08, 0.95, 3.59, 1.43, 1.24, 0.99);
  rectMec(50, 25, 1.0, 1.36, 1.15, 4.47, 1.79, 1.53, 1.22);
  rectMec(50, 25, 1.2, 1.57, 1.37, 5.10, 2.04, 1.74, 1.40);
  rectMec(50, 25, 1.5, 2.10, 1.82, 6.39, 2.56, 2.19, 1.75);
  rectMec(50, 30, 0.8, 1.25, 0.98, 4.42, 1.77, 2.01, 1.01);
  rectMec(50, 30, 1.0, 1.71, 1.23, 5.95, 2.38, 2.69, 1.35);
  rectMec(50, 30, 1.2, 1.86, 1.47, 6.44, 2.58, 2.91, 1.46);
  rectMec(50, 30, 1.5, 2.25, 1.88, 7.27, 2.91, 3.32, 2.21);

  // Tubo Rectangular Estructural
  const rectEst = (h: number, b: number, e: number, a: number, p: number, ix: number, wx: number, iy: number, wy: number) => 
    insertProfile.run(infoTuboRectEst.lastInsertRowid, `${h}x${b}x${e}`, h, b, e, 0, a, ix, wx, iy, wy, p);

  rectEst(30, 20, 1.50, 1.35, 1.06, 1.59, 1.06, 0.84, 0.84);
  rectEst(30, 20, 2.00, 1.74, 1.36, 1.94, 1.30, 1.02, 1.02);
  
  rectEst(40, 20, 1.40, 1.55, 1.22, 3.09, 1.55, 1.04, 1.04);
  rectEst(40, 20, 1.50, 1.65, 1.30, 3.27, 1.63, 1.10, 1.10);
  rectEst(40, 20, 1.80, 1.95, 1.53, 3.76, 1.88, 1.26, 1.26);
  rectEst(40, 20, 2.00, 2.14, 1.68, 4.06, 2.03, 1.35, 1.35);
  
  rectEst(50, 25, 1.40, 1.97, 1.55, 6.28, 2.51, 2.13, 1.71);
  rectEst(50, 25, 1.50, 2.10, 1.65, 6.66, 2.66, 2.26, 1.80);
  rectEst(50, 25, 1.80, 2.49, 1.95, 7.72, 3.09, 2.60, 2.08);
  rectEst(50, 25, 2.00, 2.74, 2.15, 8.39, 3.36, 2.82, 2.25);
  rectEst(50, 25, 2.50, 3.34, 2.62, 9.90, 3.96, 3.29, 2.64);
  rectEst(50, 25, 3.00, 3.91, 3.07, 11.20, 4.48, 3.70, 2.96);
  
  rectEst(50, 30, 1.40, 2.11, 1.66, 7.11, 2.84, 3.23, 2.15);
  rectEst(50, 30, 1.50, 2.25, 1.77, 7.54, 3.02, 3.42, 2.28);
  rectEst(50, 30, 1.80, 2.67, 2.09, 8.77, 3.51, 3.96, 2.64);
  rectEst(50, 30, 2.00, 2.94, 2.31, 9.54, 3.82, 4.30, 2.87);
  rectEst(50, 30, 2.50, 3.59, 2.82, 11.31, 4.53, 5.07, 3.38);
  rectEst(50, 30, 3.00, 4.21, 3.30, 12.86, 5.15, 5.73, 3.82);
  
  rectEst(60, 40, 1.40, 2.67, 2.10, 13.54, 4.51, 7.27, 3.63);
  rectEst(60, 40, 1.50, 2.85, 2.24, 14.39, 4.80, 7.72, 3.86);
  rectEst(60, 40, 1.80, 3.39, 2.66, 16.85, 5.62, 9.01, 4.51);
  rectEst(60, 40, 2.00, 3.74, 2.93, 18.42, 6.14, 9.84, 4.92);
  rectEst(60, 40, 2.50, 4.59, 3.60, 22.09, 7.36, 11.75, 5.88);
  rectEst(60, 40, 3.00, 5.41, 4.25, 25.41, 8.47, 13.47, 6.74);
  
  rectEst(70, 30, 1.40, 2.67, 2.10, 16.36, 4.67, 4.37, 2.92);
  rectEst(70, 30, 1.50, 2.85, 2.24, 17.38, 4.97, 4.64, 3.09);
  rectEst(70, 30, 1.80, 3.39, 2.66, 20.35, 5.81, 5.39, 3.60);
  rectEst(70, 30, 2.00, 3.74, 2.93, 22.23, 6.35, 5.87, 3.91);
  rectEst(70, 30, 2.50, 4.59, 3.60, 26.63, 7.61, 6.96, 4.64);
  rectEst(70, 30, 3.00, 5.41, 4.25, 30.61, 8.74, 7.93, 5.29);
  
  rectEst(80, 40, 1.50, 3.45, 2.71, 28.99, 7.25, 9.94, 4.97);
  rectEst(80, 40, 1.80, 4.11, 3.22, 34.09, 8.52, 11.64, 5.82);
  rectEst(80, 40, 2.00, 4.54, 3.56, 37.36, 9.34, 12.73, 6.36);
  rectEst(80, 40, 2.50, 5.59, 4.39, 45.12, 11.28, 15.27, 7.64);
  rectEst(80, 40, 3.00, 6.61, 5.19, 52.28, 13.07, 17.59, 8.79);
  rectEst(80, 40, 4.00, 8.55, 6.71, 64.90, 16.22, 21.59, 10.79);
  
  rectEst(90, 50, 1.50, 4.05, 3.18, 44.68, 9.93, 18.13, 7.25);
  rectEst(90, 50, 1.80, 4.83, 3.79, 52.70, 11.71, 21.32, 8.53);
  rectEst(90, 50, 2.00, 5.34, 4.19, 57.88, 12.86, 23.37, 9.35);
  rectEst(90, 50, 2.50, 6.59, 5.17, 70.28, 15.62, 28.25, 11.30);
  rectEst(90, 50, 3.00, 7.81, 6.13, 81.88, 18.20, 32.77, 13.11);
  rectEst(90, 50, 4.00, 10.15, 7.97, 102.81, 22.85, 40.81, 16.32);
  
  rectEst(100, 50, 1.50, 4.35, 3.42, 57.77, 11.55, 19.89, 7.96);
  rectEst(100, 50, 1.80, 5.19, 4.07, 68.22, 13.64, 23.41, 9.37);
  rectEst(100, 50, 2.00, 5.74, 4.50, 74.99, 15.00, 25.68, 10.27);
  rectEst(100, 50, 2.50, 7.09, 5.56, 91.22, 18.24, 31.07, 12.43);
  rectEst(100, 50, 3.00, 8.41, 6.60, 106.49, 21.30, 36.09, 14.44);
  rectEst(100, 50, 4.00, 10.95, 8.59, 134.24, 26.85, 45.05, 18.02);
  
  rectEst(150, 50, 1.80, 6.99, 5.48, 188.33, 25.11, 33.87, 13.55);
  rectEst(150, 50, 2.00, 7.74, 6.07, 207.54, 27.67, 37.21, 14.88);
  rectEst(150, 50, 2.50, 9.59, 7.53, 254.09, 33.88, 45.19, 18.08);
  rectEst(150, 50, 3.00, 11.41, 8.96, 298.58, 39.81, 52.68, 21.07);
  rectEst(150, 50, 4.00, 14.95, 11.73, 381.49, 50.87, 66.27, 26.51);
  rectEst(150, 50, 5.00, 18.36, 14.41, 456.54, 60.87, 78.12, 31.25);
  
  rectEst(120, 60, 1.80, 6.27, 4.92, 119.80, 19.97, 41.25, 13.75);
  rectEst(120, 60, 2.00, 6.94, 5.45, 131.93, 21.99, 45.34, 15.11);
  rectEst(120, 60, 2.50, 8.59, 6.74, 161.25, 26.87, 55.17, 18.39);
  rectEst(120, 60, 3.00, 10.21, 8.01, 189.15, 31.53, 64.44, 21.48);
  rectEst(120, 60, 4.00, 13.35, 10.48, 240.84, 40.14, 81.35, 27.12);
  rectEst(120, 60, 5.00, 16.36, 12.84, 287.23, 47.87, 96.25, 32.08);
  
  rectEst(200, 70, 3.00, 15.61, 12.25, 749.71, 74.97, 145.15, 41.47);
  rectEst(200, 70, 4.00, 20.55, 16.13, 969.28, 96.93, 185.62, 53.03);
  rectEst(200, 70, 5.00, 25.36, 19.90, 1174.26, 117.43, 222.47, 63.56);
  rectEst(200, 70, 6.00, 30.03, 23.58, 1365.00, 136.50, 255.91, 73.12);
  
  rectEst(125, 75, 1.80, 6.99, 5.48, 152.92, 24.47, 70.06, 18.68);
  rectEst(125, 75, 2.00, 7.74, 6.07, 168.56, 26.97, 77.15, 20.57);
  rectEst(125, 75, 2.50, 9.59, 7.53, 206.53, 33.04, 94.26, 25.14);
  rectEst(125, 75, 3.00, 11.41, 8.96, 242.88, 38.86, 110.55, 29.48);
  rectEst(125, 75, 4.00, 14.95, 11.73, 310.87, 49.74, 140.75, 37.53);
  rectEst(125, 75, 5.00, 18.36, 14.41, 372.77, 59.64, 167.93, 44.78);
  
  rectEst(175, 75, 3.00, 14.41, 11.31, 556.71, 63.60, 149.46, 39.86);
  rectEst(175, 75, 4.00, 18.95, 14.87, 718.30, 82.09, 191.22, 50.99);
  rectEst(175, 75, 5.00, 23.36, 18.33, 868.40, 99.25, 229.29, 61.14);
  rectEst(175, 75, 6.00, 27.63, 21.69, 1007.36, 115.13, 263.88, 70.37);
  
  rectEst(150, 100, 3.00, 14.41, 11.31, 460.67, 61.42, 247.67, 49.53);
  rectEst(150, 100, 4.00, 18.95, 14.87, 594.71, 79.29, 318.67, 63.73);
  rectEst(150, 100, 5.00, 23.36, 18.33, 719.46, 95.93, 384.27, 76.85);
  rectEst(150, 100, 6.00, 27.63, 21.69, 835.21, 111.36, 444.72, 88.94);
  
  rectEst(200, 100, 3.00, 17.41, 13.67, 924.37, 92.44, 318.26, 63.65);
  rectEst(200, 100, 4.00, 22.95, 18.01, 1199.81, 119.98, 410.88, 82.18);
  rectEst(200, 100, 5.00, 28.36, 22.26, 1459.51, 145.95, 497.19, 99.44);
  rectEst(200, 100, 6.00, 33.63, 26.40, 1703.83, 170.38, 577.44, 115.49);

  // Tubo Redondo Mecánico
  const round = (label: string, d: number, e: number, a: number, p: number, i: number, w: number) =>
    insertProfile.run(infoTuboRedMec.lastInsertRowid, `${label} (${e}mm)`, d, 0, e, 0, a, i, w, i, w, p);

  round('1/2"', 12.70, 0.95, 0.35, 1.86/6, 0.06, 0.09);
  round('1/2"', 12.70, 1.10, 0.40, 2.10/6, 0.07, 0.11);
  round('1/2"', 12.70, 1.50, 0.53, 2.82/6, 0.08, 0.13);
  round('5/8"', 15.88, 0.95, 0.44, 2.28/6, 0.12, 0.15);
  round('5/8"', 15.88, 1.10, 0.51, 2.64/6, 0.14, 0.18);
  round('5/8"', 15.88, 1.50, 0.68, 3.54/6, 0.18, 0.22);
  round('3/4"', 19.05, 0.95, 0.54, 2.70/6, 0.22, 0.23);
  round('3/4"', 19.05, 1.10, 0.62, 3.18/6, 0.25, 0.26);
  round('3/4"', 19.05, 1.50, 0.83, 4.20/6, 0.32, 0.34);
  round('7/8"', 22.22, 0.95, 0.63, 3.18/6, 0.36, 0.32);
  round('7/8"', 22.22, 1.10, 0.73, 3.66/6, 0.41, 0.37);
  round('7/8"', 22.22, 1.50, 0.98, 4.92/6, 0.53, 0.47);
  round('1"', 25.40, 0.95, 0.73, 3.60/6, 0.55, 0.43);
  round('1"', 25.40, 1.10, 0.84, 4.20/6, 0.62, 0.49);
  round('1"', 25.40, 1.50, 1.13, 5.64/6, 0.81, 0.64);
  round('1 1/4"', 31.75, 0.95, 0.92, 4.50/6, 1.09, 0.69);
  round('1 1/4"', 31.75, 1.10, 1.06, 5.22/6, 1.24, 0.78);
  round('1 1/4"', 31.75, 1.50, 1.43, 7.08/6, 1.63, 1.03);
  round('1 1/2"', 38.10, 0.95, 1.11, 5.40/6, 1.91, 1.00);
  round('1 1/2"', 38.10, 1.10, 1.28, 6.24/6, 2.19, 1.15);
  round('1 1/2"', 38.10, 1.50, 1.72, 8.46/6, 2.89, 1.52);
  round('1 3/4"', 44.45, 0.95, 1.30, 6.24/6, 3.07, 1.38);
  round('1 3/4"', 44.45, 1.10, 1.50, 7.26/6, 3.52, 0.16);
  round('1 3/4"', 44.45, 1.50, 2.02, 9.84/6, 4.67, 2.10);
  round('1 7/8"', 47.63, 0.95, 1.40, 6.78/6, 3.80, 1.60);
  round('1 7/8"', 47.63, 1.10, 1.61, 7.80/6, 4.35, 1.83);
  round('1 7/8"', 47.63, 1.50, 2.17, 10.26/6, 5.79, 2.43);
  round('2"', 50.80, 0.95, 1.49, 7.20/6, 4.62, 1.82);
  round('2"', 50.80, 1.10, 1.72, 8.34/6, 5.30, 2.09);
  round('2"', 50.80, 1.50, 2.32, 10.80/6, 7.06, 2.78);
  round('2 3/8"', 60.33, 1.50, 2.77, 13.20/6, 12.00, 3.98);
  round('2 1/2"', 63.50, 1.50, 2.92, 14.04/6, 14.05, 4.42);
  })();
}

const countMaterials = db.prepare('SELECT COUNT(*) as count FROM materials').get() as { count: number };
if (countMaterials.count === 0) {
  db.transaction(() => {
    const insertMaterial = db.prepare('INSERT INTO materials (name, fy, e) VALUES (?, ?, ?)');
    insertMaterial.run('ASTM A36', 250, 200);
    insertMaterial.run('ASTM A572 Gr. 50', 345, 200);
    insertMaterial.run('ASTM A500 Gr. B', 290, 200);
    insertMaterial.run('ASTM A500 Gr. C', 315, 200);
    insertMaterial.run('S275', 275, 210);
    insertMaterial.run('S355', 355, 210);
  })();
}

export default db;
