const { Parser } = require('json2csv');

exports.generateCsv = async (data) => {
  const fields = ['description', 'amount', 'category', 'date'];
  const opts = { fields };

  try {
    const parser = new Parser(opts);
    const csv = parser.parse(data);
    return csv;
  } catch (err) {
    throw err;
  }
};