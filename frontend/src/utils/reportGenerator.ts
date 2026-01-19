import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { MovementResponse } from '../services/api';

// Helper to safely extract strings from populated or unpopulated fields
const safeString = (field: any, key: string = 'name'): string => {
  if (!field) return 'N/A';
  if (typeof field === 'string') return field;
  return field[key] || 'N/A';
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString('es-EC', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const exportToPDF = (movements: MovementResponse[], filterDescription: string) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(16);
  doc.text('BODEGA EQUIPO Y VESTUARIO - FAE', 14, 20);
  doc.setFontSize(12);
  doc.text('REPORTE DE AUDITORÍA DE MOVIMIENTOS', 14, 28);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generado el: ${new Date().toLocaleString('es-EC')}`, 14, 35);
  doc.text(`Filtro aplicado: ${filterDescription}`, 14, 40);

  // Table Data
  const tableColumn = ["Fecha", "Tipo", "Equipo", "Cant.", "Responsable", "Registrado Por", "Motivo"];
  const tableRows = movements.map(m => [
    formatDate(m.timestamp),
    m.type,
    safeString(m.equipmentId, 'description'),
    m.quantity,
    safeString(m.responsibleId, 'name'),
    safeString(m.performedById, 'name'),
    m.reason || '-'
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 45,
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229] }, // Indigo-600
    styles: { fontSize: 8 },
  });

  doc.save(`reporte_movimientos_${new Date().getTime()}.pdf`);
};

export const exportToExcel = (movements: MovementResponse[], filterDescription: string) => {
  // Format data for Excel
  const dataToExport = movements.map(m => ({
    'Fecha y Hora': formatDate(m.timestamp),
    'Tipo Movimiento': m.type,
    'Equipo': safeString(m.equipmentId, 'description'),
    'Tipo Equipo': safeString(m.equipmentId, 'tipo'),
    'Cantidad': m.quantity,
    'Responsable': safeString(m.responsibleId, 'name'),
    'Email Responsable': safeString(m.responsibleId, 'email'),
    'Registrado Por': safeString(m.performedById, 'name'),
    'Sucursal': safeString(m.branchId, 'name'),
    'Motivo/Observación': m.reason || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  
  XLSX.utils.book_append_sheet(workbook, worksheet, "Movimientos");
  
  // Adjust column width (approximate)
  const wscols = [
    {wch: 20}, // Fecha
    {wch: 15}, // Tipo
    {wch: 30}, // Equipo
    {wch: 20}, // Tipo Equipo
    {wch: 10}, // Cantidad
    {wch: 25}, // Responsable
    {wch: 25}, // Email
    {wch: 25}, // Registrado Por
    {wch: 15}, // Sucursal
    {wch: 30}  // Motivo
  ];
  worksheet['!cols'] = wscols;

  XLSX.writeFile(workbook, `reporte_movimientos_${new Date().getTime()}.xlsx`);
};
