/* Ruta · Distribuciones Arga — datos de ejemplo (empresa, personas y clientes inventados). */
(function () {
  // Ciudad en rejilla: calles verticales i = 0..12, horizontales j = 0..9 (16 m de paso).
  // El río Arga ocupa la fila de manzanas 6 (entre las calles 6 y 7); puentes en i = 2, 5, 8, 10, 12.
  const RUTAS = [
    { id: 'R1', n: 1, color: '#5B8CFF', zona: 'Casco Antiguo', conductor: 'Javi Ochoa', corto: 'Javi', foto: 4,
      vehiculo: 'Mercedes Sprinter', matricula: '4821 LKM', hechas: 18, total: 26, kg: 486, kgMax: 1200, cobrado: 1642.3, fase: 0.08, vel: 3.3,
      nodos: [[4, 5], [4, 3], [7, 3], [7, 1], [8, 1], [8, 4], [6, 4], [6, 5]],
      nodosB: [[4, 5], [4, 3], [7, 3], [8, 3], [8, 4], [6, 4], [6, 5]],
      paradas: [
        [4, 4.3, 'Hotel Leyre', 'C/ Zapatería 9', 14, 'Hotel'],
        [5.5, 3, 'Bar La Plaza', 'C/ San Nicolás 14', 12, 'Bar'],
        [6.5, 3, 'Taberna Zaldi', 'C/ San Gregorio 3', 8, 'Taberna'],
        [8, 3.5, 'Café Iruñazar', 'Pl. del Castillo 22', 6, 'Cafetería'],
        [7.4, 4, 'Asador Kale Nagusi', 'C/ Mayor 41', 16, 'Restaurante'],
        [6, 4.55, 'Bar Txirrista', 'C/ Estafeta 57', 9, 'Bar'],
        [4.6, 5, 'Vinoteca Arga', 'C/ Jarauta 12', 5, 'Tienda']] },
    { id: 'R2', n: 2, color: '#2BB3D1', zona: 'Ensanche', conductor: 'Marta Elizalde', corto: 'Marta', foto: 1,
      vehiculo: 'Renault Master', matricula: '7310 KZP', hechas: 22, total: 30, kg: 612, kgMax: 1200, cobrado: 1284.6, fase: 0.34, vel: 3.5,
      nodos: [[8, 1], [11, 1], [11, 5], [9, 5], [9, 2], [8, 2]],
      antes: [[8, 1], [9, 1], [9, 5], [10, 5], [10, 1], [11, 1], [11, 3], [9, 3], [9, 4], [11, 4], [11, 5], [9, 5], [9, 2], [8, 2], [8, 1]],
      paradas: [
        [9.5, 1, 'Sidrería Kupela', 'C/ Navas de Tolosa 21', 18, 'Sidrería'],
        [11, 2.5, 'Hotel Ensanche', 'Av. Carlos III 36', 22, 'Hotel'],
        [11, 4.2, 'Cafetería Baluarte', 'C/ Cortes de Navarra 4', 7, 'Cafetería'],
        [10.3, 5, 'Bar Nuevo Ensanche', 'C/ García Castañón 11', 10, 'Bar'],
        [9, 3.6, 'Restaurante Amaiur', 'C/ Paulino Caballero 8', 12, 'Restaurante'],
        [8.5, 2, 'Súper Udaberri', 'C/ Olite 27', 26, 'Tienda']] },
    { id: 'R3', n: 3, color: '#8B7CF6', zona: 'San Juan', conductor: 'Luis Goñi', corto: 'Luis', foto: 2,
      vehiculo: 'Iveco Daily', matricula: '1957 MBR', hechas: 24, total: 32, kg: 538, kgMax: 1400, cobrado: 2105.9, fase: 0.55, vel: 3.2,
      nodos: [[0, 0], [3, 0], [3, 4], [1, 4], [1, 3], [0, 3]],
      paradas: [
        [1.5, 0, 'Bar Ciudadela', 'Av. del Ejército 12', 9, 'Bar'],
        [3, 1.5, 'Restaurante Yamaguchi', 'C/ Monasterio de Urdax 5', 14, 'Restaurante'],
        [3, 3.3, 'Hotel Taconera', 'Av. Pío XII 18', 20, 'Hotel'],
        [2.2, 4, 'Bodega San Juan', 'C/ Esquíroz 23', 11, 'Tienda'],
        [0, 1.6, 'Bar Larraina', 'C/ Irunlarrea 2', 6, 'Bar']] },
    { id: 'R4', n: 4, color: '#EC6FA0', zona: 'Iturrama', conductor: 'Ane Irigoyen', corto: 'Ane', foto: 3,
      vehiculo: 'Renault Master', matricula: '6204 LBT', hechas: 27, total: 36, kg: 702, kgMax: 1200, cobrado: 1930.4, fase: 0.2, vel: 3.2,
      nodos: [[0, 4], [0, 6], [3, 6], [3, 5], [1, 5], [1, 4]],
      paradas: [
        [0, 5.4, 'Cervecería Iturrama', 'C/ Iturrama 47', 15, 'Bar'],
        [1.6, 6, 'Kiosko del Paseo', 'Paseo del Arga 3', 4, 'Quiosco'],
        [3, 5.5, 'Restaurante Ardoa', 'C/ Fuente del Hierro 9', 12, 'Restaurante'],
        [2.3, 5, 'Bar Errota', 'C/ Sancho el Fuerte 61', 8, 'Bar']] },
    { id: 'R5', n: 5, color: '#F28C5B', zona: 'Rochapea', conductor: 'Iker Zubiri', corto: 'Iker', foto: 8,
      vehiculo: 'Mercedes Sprinter', matricula: '3388 LHD', hechas: 31, total: 44, kg: 1010, kgMax: 1400, cobrado: 2760.15, fase: 0.62, vel: 3.6,
      nodos: [[5, 6], [5, 7], [3, 7], [3, 9], [7, 9], [7, 8], [8, 8], [8, 6]],
      paradas: [
        [4.2, 7, 'Asador Rochapea', 'C/ Joaquín Beunza 6', 13, 'Restaurante'],
        [3, 8.4, 'Bar Txantxangorri', 'C/ Marcelo Celayeta 72', 7, 'Bar'],
        [5.2, 9, 'Cafetería Arga', 'C/ Errotazar 15', 6, 'Cafetería'],
        [6.4, 9, 'Hotel Puente', 'C/ Bernardino Tirapu 2', 19, 'Hotel'],
        [8, 7.6, 'Bar Puente Nuevo', 'C/ Doctor Huarte 31', 9, 'Bar'],
        [6.6, 6, 'Sidrería Errotazar', 'Paseo de los Enamorados 4', 14, 'Sidrería']] },
    { id: 'R6', n: 6, color: '#D9B23C', zona: 'Txantrea · Burlada', conductor: 'Sara Arbizu', corto: 'Sara', foto: 6,
      vehiculo: 'Iveco Daily', matricula: '8045 KXG', hechas: 30, total: 46, kg: 884, kgMax: 1400, cobrado: 2201.7, fase: 0.45, vel: 3.4,
      nodos: [[10, 5], [12, 5], [12, 9], [9, 9], [9, 7], [10, 7]],
      paradas: [
        [11.4, 5, 'Bar Mendialdea', 'C/ Ezkaba 8', 8, 'Bar'],
        [12, 7.6, 'Restaurante Txantrea', 'C/ Santesteban 4', 16, 'Restaurante'],
        [10.5, 9, 'Bodegón Villava', 'C/ Mayor de Villava 33', 21, 'Restaurante'],
        [9, 8.2, 'Cafetería Ulzama', 'C/ Ulzama 2', 6, 'Cafetería'],
        [12, 5.6, 'Hotel Mendillorri', 'Av. de Burlada 12', 18, 'Hotel']] }
  ];

  const FLOTA7 = { id: 'F7', color: '#B3B7BE', conductor: 'Unai Lasa', corto: 'Unai', foto: 5, vehiculo: 'Renault Master', matricula: '5512 LCC' };

  // Bandeja de pedidos: canal, cliente, hora, texto original y líneas que entiende el asistente
  const BANDEJA = [
    { id: 'PED-0215', canal: 'wa', cli: 'Bar Gure Txoko', quien: 'Iñaki', hora: '10:44', nuevo: true,
      txt: 'Buenas! Para mañana 3 barriles de Estrella 30 L, 2 cajas de Coca-Cola 24 y una caja de Rioja crianza. Y si podéis antes de las 11 mejor 🙏',
      lineas: [['BAR-EG30', 'Estrella Galicia · barril 30 L', 3, 'ud', 96.0], ['CC-24', 'Coca-Cola · caja 24 latas', 2, 'caja', 15.8], ['RJ-CR6', 'Rioja crianza · caja 6', 1, 'caja', 41.4]],
      ruta: 'R2', ventana: '9:00–11:00' },
    { id: 'PED-0214', canal: 'mail', cli: 'Hotel Ensanche', quien: 'Compras', hora: '10:40', txt: 'Pedido semanal adjunto (PDF). 14 líneas, entrega jueves.', n: 14, imp: '1.284,30 €' },
    { id: 'PED-0213', canal: 'web', cli: 'Bar Txirrista', quien: 'Tienda web', hora: '10:37', txt: '6 cajas de agua 1,5 L · 2 cajas de tónica · 1 barril Mahou 30 L', n: 3, imp: '214,60 €' },
    { id: 'PED-0212', canal: 'tel', cli: 'Asador Rochapea', quien: 'Llamada · 1 min 48 s', hora: '10:31', txt: 'Transcrito: 2 barriles de Keler, 1 caja de txakoli, hielo 4 sacos', n: 3, imp: '268,90 €' },
    { id: 'PED-0211', canal: 'wa', cli: 'Cafetería Ulzama', quien: 'Maider', hora: '10:26', txt: 'Lo de siempre pero con 2 cajas más de zumo de naranja', n: 7, imp: '176,45 €' },
    { id: 'PED-0210', canal: 'mail', cli: 'Restaurante Amaiur', quien: 'Mikel', hora: '10:19', txt: 'Re: Pedido viernes — añadid 3 rosados de Navarra, gracias', n: 9, imp: '412,00 €' },
    { id: 'PED-0209', canal: 'web', cli: 'Kiosko del Paseo', quien: 'Tienda web', hora: '10:12', txt: 'Refrescos surtidos · 4 cajas', n: 4, imp: '63,20 €' }
  ];

  // Albaranes recientes
  const ALBARANES = [
    ['ALB-08812', 'Sidrería Kupela', 'Marta', '—', 'pend'],
    ['ALB-08811', 'Asador Kale Nagusi', 'Javi', '10:42', 'ok'],
    ['ALB-08810', 'Hotel Puente', 'Iker', '10:41', 'ok'],
    ['ALB-08809', 'Bodegón Villava', 'Sara', '10:39', 'ok'],
    ['ALB-08808', 'Bar La Plaza', 'Javi', '—', 'inc'],
    ['ALB-08807', 'Hotel Taconera', 'Luis', '10:36', 'ok'],
    ['ALB-08806', 'Restaurante Ardoa', 'Ane', '10:33', 'ok'],
    ['ALB-08805', 'Bar Mendialdea', 'Sara', '10:30', 'ok'],
    ['ALB-08804', 'Café Iruñazar', 'Javi', '10:27', 'ok']
  ];

  // Cobros y cierre por ruta (vuelta de mañana)
  const COBROS = [
    // ruta, entregas, efectivo, tarjeta, recibo, pendiente, estado inicial, estado final
    ['R1', '18/26', 412.5, 806.3, 423.5, 96.0, 'ruta', 'ruta'],
    ['R2', '22/30', 288.0, 744.6, 252.0, 0, 'ruta', 'ruta'],
    ['R3', '32/32', 520.4, 1110.0, 690.6, 0, 'cuadre', 'cerrada'],
    ['R4', '27/36', 355.2, 980.0, 595.2, 140.5, 'ruta', 'ruta'],
    ['R5', '31/44', 610.0, 1406.15, 744.0, 0, 'ruta', 'ruta'],
    ['R6', '46/46', 924.1, 1812.25, 1206.8, 0, 'cuadre', 'cerrada']
  ];

  window.ARGA = { RUTAS, FLOTA7, BANDEJA, ALBARANES, COBROS };
})();
