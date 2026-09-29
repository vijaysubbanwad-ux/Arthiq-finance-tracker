import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction, Budget, UserProfile, FinancialHealthScore } from '../types';
import { formatCurrency } from './formatters';

export interface MonthlyReportData {
  userProfile: UserProfile;
  transactions: Transaction[];
  budgets: Budget[];
  healthScore?: number | FinancialHealthScore;
  month?: number; // 0-11
  year?: number;
  currencySymbol?: string;
}

export function generateMonthlyPdf(data: MonthlyReportData): { doc: jsPDF; filename: string; blob: Blob } {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const now = new Date();
  const targetMonth = data.month !== undefined ? data.month : now.getMonth();
  const targetYear = data.year !== undefined ? data.year : now.getFullYear();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthName = monthNames[targetMonth];
  const currency = data.currencySymbol || data.userProfile?.currencySymbol || '₹';
  const filename = `Spendly-Statement-${monthName}-${targetYear}.pdf`;

  // Filter transactions for target month
  const monthTxs = data.transactions.filter((tx) => {
    const d = new Date(tx.date);
    return d.getMonth() === targetMonth && d.getFullYear() === targetYear;
  });

  const totalIncome = monthTxs
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpense = monthTxs
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  const numericScore = typeof data.healthScore === 'object' && data.healthScore !== null
    ? data.healthScore.score
    : typeof data.healthScore === 'number'
    ? data.healthScore
    : 80;

  // --- BRAND HEADER ---
  // Top Banner background
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 42, 'F');

  // Emerald accent bar
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.rect(0, 41, 210, 2, 'F');

  // Brand Name & Logo title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('SPENDLY', 15, 20);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(52, 211, 153); // emerald-400
  doc.text('Personal Finance & Expense Intelligence', 15, 27);

  // Statement Metadata (Right-aligned in header)
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`MONTHLY STATEMENT`, 195, 18, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text(`${monthName} ${targetYear}`, 195, 25, { align: 'right' });
  doc.setFontSize(8);
  doc.text(`Generated: ${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, 195, 31, { align: 'right' });

  // --- ACCOUNT HOLDER INFO BAR ---
  doc.setFillColor(248, 250, 252); // slate-50
  doc.roundedRect(15, 48, 180, 20, 3, 3, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(15, 48, 180, 20, 3, 3, 'S');

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('ACCOUNT HOLDER', 22, 55);
  doc.text('EMAIL ADDRESS', 80, 55);
  doc.text('FINANCIAL HEALTH SCORE', 145, 55);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFontSize(10);
  doc.text(data.userProfile?.name || 'Account Owner', 22, 62);
  doc.text(data.userProfile?.email || data.userProfile?.monthlyReportEmail || 'Confidential', 80, 62);
  
  // Health Score badge
  doc.setTextColor(16, 185, 129);
  doc.text(`${numericScore} / 100 (${numericScore >= 80 ? 'Excellent' : numericScore >= 60 ? 'Good' : 'Needs Focus'})`, 145, 62);

  // --- EXECUTIVE SUMMARY 4-KPI BOXES ---
  const kpiY = 74;
  const boxWidth = 42;
  const boxHeight = 22;
  const gap = 4;

  const kpis = [
    { label: 'TOTAL INCOME', value: `${currency}${totalIncome.toLocaleString('en-IN')}`, color: [16, 185, 129] },
    { label: 'TOTAL EXPENSE', value: `${currency}${totalExpense.toLocaleString('en-IN')}`, color: [239, 68, 68] },
    { label: 'NET SAVINGS', value: `${currency}${netSavings.toLocaleString('en-IN')}`, color: [59, 130, 246] },
    { label: 'SAVINGS RATE', value: `${savingsRate}%`, color: [168, 85, 247] },
  ];

  kpis.forEach((kpi, idx) => {
    const x = 15 + idx * (boxWidth + gap);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, kpiY, boxWidth, boxHeight, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, kpiY, boxWidth, boxHeight, 2, 2, 'S');

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, x + 4, kpiY + 7);

    doc.setFontSize(11);
    doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.text(kpi.value, x + 4, kpiY + 16);
  });

  // --- CATEGORY SPENDING BREAKDOWN ---
  const catMap: Record<string, number> = {};
  monthTxs.filter(t => t.type === 'expense').forEach(t => {
    catMap[t.category] = (catMap[t.category] || 0) + t.amount;
  });

  const catRows = Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, amount]) => {
      const pct = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;
      return [cat, `${currency}${amount.toLocaleString('en-IN')}`, `${pct}%`];
    });

  let currentY = 104;

  if (catRows.length > 0) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Expense Category Distribution', 15, currentY);

    autoTable(doc, {
      startY: currentY + 3,
      head: [['Category', 'Amount Spent', '% of Total']],
      body: catRows.slice(0, 6),
      theme: 'grid',
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 8,
        cellPadding: 2.5,
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 55, halign: 'right' },
        2: { cellWidth: 45, halign: 'right' },
      },
      margin: { left: 15, right: 15 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;
  }

  // --- DETAILED TRANSACTIONS LEDGER ---
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`Monthly Transactions Ledger (${monthTxs.length} items)`, 15, currentY);

  const txTableData = monthTxs.map(tx => [
    new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    tx.title || tx.category,
    tx.category,
    tx.paymentMethod || 'UPI',
    tx.type === 'income' ? '+ Income' : '- Expense',
    `${tx.type === 'income' ? '+' : '-'}${currency}${tx.amount.toLocaleString('en-IN')}`,
  ]);

  if (txTableData.length === 0) {
    txTableData.push(['-', 'No transactions recorded for this month', '-', '-', '-', `${currency}0`]);
  }

  autoTable(doc, {
    startY: currentY + 3,
    head: [['Date', 'Description', 'Category', 'Method', 'Type', 'Amount']],
    body: txTableData,
    theme: 'striped',
    headStyles: {
      fillColor: [16, 185, 129], // emerald-500
      textColor: 255,
      fontSize: 8,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
    },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 50 },
      2: { cellWidth: 32 },
      3: { cellWidth: 26 },
      4: { cellWidth: 24 },
      5: { cellWidth: 26, halign: 'right', fontStyle: 'bold' },
    },
    didParseCell: function (data) {
      if (data.section === 'body' && data.column.index === 5) {
        const text = String(data.cell.raw);
        if (text.startsWith('+')) {
          data.cell.styles.textColor = [16, 185, 129];
        } else if (text.startsWith('-')) {
          data.cell.styles.textColor = [239, 68, 68];
        }
      }
    },
    margin: { left: 15, right: 15 },
  });

  // --- FOOTER ON ALL PAGES ---
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(
      `Spendly Automated Financial Report • Confidential • Page ${i} of ${pageCount}`,
      105,
      290,
      { align: 'center' }
    );
  }

  const blob = doc.output('blob');
  return { doc, filename, blob };
}
