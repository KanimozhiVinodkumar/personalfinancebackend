const PdfPrinter = require('pdfmake');
const fs = require('fs');

const fonts = {
  Roboto: {
    normal: 'node_modules/roboto-font/fonts/Roboto/Roboto-Regular.ttf',
    bold: 'node_modules/roboto-font/fonts/Roboto/Roboto-Medium.ttf',
    italics: 'node_modules/roboto-font/fonts/Roboto/Roboto-Italic.ttf',
    bolditalics: 'node_modules/roboto-font/fonts/Roboto/Roboto-MediumItalic.ttf',
  },
};

const printer = new PdfPrinter(fonts);

exports.generatePdf = async (data, title) => {
  const docDefinition = {
    content: [
      { text: title, style: 'header' },
      '\n\n',
      {
        table: {
          headerRows: 1,
          widths: ['*', '*', '*', '*'],
          body: [
            [
              { text: 'Description', style: 'tableHeader' },
              { text: 'Amount', style: 'tableHeader' },
              { text: 'Category', style: 'tableHeader' },
              { text: 'Date', style: 'tableHeader' },
            ],
            ...data.map((item) => [
              item.description,
              `$${item.amount.toFixed(2)}`,
              item.category,
              new Date(item.date).toLocaleDateString(),
            ]),
          ],
        },
      },
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        alignment: 'center',
        margin: [0, 0, 0, 20],
      },
      tableHeader: {
        bold: true,
        fontSize: 13,
        color: 'black',
      },
    },
    defaultStyle: {
      font: 'Roboto',
    },
  };

  return printer.createPdfKitDocument(docDefinition);
};