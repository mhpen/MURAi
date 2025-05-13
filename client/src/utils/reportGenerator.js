import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateReport = async (data, type = 'overview') => {
  try {
    // Validate required data
    if (!data) {
      throw new Error('No data provided for report generation');
    }

    const isDarkMode = data.isDarkMode || false; // Get isDarkMode from data or default to false
    
    // Create new PDF document in portrait mode
    const doc = new jsPDF('p', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.width;
    const margin = 40;
    const contentWidth = pageWidth - (margin * 2);

    // Modern header
    doc.setFillColor(248, 249, 250);
    doc.rect(0, 0, pageWidth, 120, 'F');
    
    doc.setFontSize(24);
    doc.setTextColor(33, 37, 41);
    doc.text('Content Moderation Report', margin, 50);
    
    doc.setFontSize(12);
    doc.setTextColor(108, 117, 125);
    doc.text(`${type.charAt(0).toUpperCase() + type.slice(1)} Report`, margin, 75);
    doc.text(`Generated on ${data.reportDate || new Date().toLocaleString()}`, margin, 95);

    let yPos = 140;

    // KPI Summary in 2x2 grid
    const kpiSummary = [
      {
        title: 'Total Flagged',
        value: safeGet(data, 'totalFlagged'),
        change: `${safeGet(data, 'flaggedContent.weeklyChange')}% this week`
      },
      {
        title: 'Accuracy Rate',
        value: `${safeGet(data, 'moderationStats.accuracy')}%`,
        change: 'Overall accuracy'
      },
      {
        title: 'Auto Detection',
        value: `${((safeGet(data, 'flaggedContent.automated') / safeGet(data, 'flaggedContent.total')) * 100).toFixed(1)}%`,
        change: 'Automated flags'
      },
      {
        title: '24h Activity',
        value: safeGet(data, 'additionalStats.reportsLast24H'),
        change: 'Last 24 hours'
      }
    ];

    // Draw KPI cards
    const cardWidth = (contentWidth - 20) / 2;
    const cardHeight = 80;
    
    kpiSummary.forEach((kpi, index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;
      const x = margin + (col * (cardWidth + 20));
      const y = yPos + (row * (cardHeight + 20));

      // Card background
      doc.setFillColor(252, 252, 253);
      doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'F');

      // KPI content
      doc.setTextColor(33, 37, 41);
      doc.setFontSize(14);
      doc.text(kpi.title, x + 15, y + 25);
      
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text(kpi.value.toString(), x + 15, y + 55);
      
      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(108, 117, 125);
      doc.text(kpi.change, x + 15, y + 70);
    });

    // After KPI cards section, add some spacing
    yPos += 250; // Increased spacing after KPIs

    // Second page - All charts
    if (data.charts && Object.keys(data.charts).length > 0) {
      doc.addPage();
      
      // Charts page header
      doc.setFillColor(248, 249, 250);
      doc.rect(0, 0, pageWidth, 60, 'F');
      doc.setTextColor(33, 37, 41);
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text('Visualization Analysis', margin, 35);

      // Fixed dimensions for charts - no stretching
      const chartContainerWidth = contentWidth / 2 - 10;
      const chartContainerHeight = 260; // Fixed height
      const chartPadding = 15;
      const chartWidth = chartContainerWidth - (chartPadding * 2);
      const chartHeight = 160; // Fixed chart height
      
      // Position tracking
      let currentY = margin + 70;
      
      // Process charts in rows of 2
      const chartEntries = Object.entries(data.charts).filter(([_, chartData]) => 
        chartData?.dataUrl && typeof chartData.dataUrl === 'string'
      );
      
      for (let i = 0; i < chartEntries.length; i += 2) {
        // Check if we need a new page
        if (currentY + chartContainerHeight > doc.internal.pageSize.height - margin) {
          doc.addPage();
          currentY = margin + 20;
        }
        
        // Process up to 2 charts per row
        for (let j = 0; j < 2; j++) {
          if (i + j >= chartEntries.length) break;
          
          const [name, chartData] = chartEntries[i + j];
          const xPos = margin + (j * (chartContainerWidth + 20));
          
          // Chart container with fixed height
          doc.setFillColor(252, 252, 253);
          doc.roundedRect(xPos, currentY, chartContainerWidth, chartContainerHeight, 3, 3, 'F');
          
          // Chart title
          doc.setTextColor(33, 37, 41);
          doc.setFontSize(14);
          doc.setFont(undefined, 'bold');
          doc.text(chartData.labels.title, xPos + chartPadding, currentY + 25);
          
          // Description
          doc.setFontSize(10);
          doc.setFont(undefined, 'normal');
          doc.setTextColor(108, 117, 125);
          const descriptions = {
            language: 'Distribution of content by language',
            sentiment: 'Content sentiment analysis',
            detection: 'Detection method breakdown',
            accuracy: 'Moderation accuracy metrics'
          };
          doc.text(descriptions[name] || '', xPos + chartPadding, currentY + 45);
          
          // Add chart with fixed dimensions
          const chartX = xPos + chartPadding;
          const chartY = currentY + 60;
          
          try {
            doc.addImage(chartData.dataUrl, 'PNG', chartX, chartY, chartWidth, chartHeight);
          } catch (err) {
            console.warn('Error adding chart:', err);
          }
          
          // Add legend
          if (chartData.labels?.labels?.length > 0) {
            const legendY = chartY + chartHeight + 10;
            const legendItemWidth = chartWidth / chartData.labels.labels.length;
            
            chartData.labels.labels.forEach((label, idx) => {
              const value = chartData.labels.values[idx];
              const legendX = chartX + (idx * legendItemWidth);
              
              // Color indicator
              doc.setFillColor(...getChartColor(name, idx, isDarkMode));
              doc.rect(legendX, legendY, 8, 8, 'F');
              
              // Label and value
              const total = chartData.labels.values.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              
              doc.setTextColor(33, 37, 41);
              doc.setFontSize(8);
              doc.setFont(undefined, 'bold');
              doc.text(label, legendX + 12, legendY + 8);
              
              doc.setFont(undefined, 'normal');
              doc.setTextColor(108, 117, 125);
              doc.text(`${value} (${percentage}%)`, legendX + 12, legendY + 18);
            });
          }
        }
        
        // Move to next row
        currentY += chartContainerHeight + 20;
      }
    }

    // Save the PDF
    const fileName = `moderation-report-${type}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    return fileName;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(`Failed to generate PDF report: ${error.message}`);
  }
};

// Helper function to get chart colors
const getChartColor = (chartType, index, isDarkMode) => {
  const colors = {
    language: [
      isDarkMode ? [156, 163, 175] : [75, 85, 99],
      isDarkMode ? [165, 180, 252] : [99, 102, 241]
    ],
    sentiment: [
      isDarkMode ? [74, 222, 128] : [22, 163, 74],
      isDarkMode ? [203, 213, 225] : [148, 163, 184],
      isDarkMode ? [252, 165, 165] : [239, 68, 68]
    ],
    detection: [
      isDarkMode ? [125, 211, 252] : [14, 165, 233],
      isDarkMode ? [253, 224, 71] : [234, 179, 8]
    ],
    accuracy: [
      isDarkMode ? [134, 239, 172] : [34, 197, 94],
      isDarkMode ? [254, 202, 202] : [220, 38, 38]
    ]
  };

  return colors[chartType]?.[index] || [128, 128, 128];
};

// Helper function for safe data access
const safeGet = (obj, path, defaultValue = 0) => {
  try {
    return path.split('.').reduce((acc, part) => acc[part], obj) ?? defaultValue;
  } catch {
    return defaultValue;
  }
}; 