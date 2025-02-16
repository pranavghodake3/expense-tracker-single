const { google } = require("googleapis");
const googleCredentials = require("../google-credentials.json");
require("dotenv").config();
// const credentials = JSON.parse(fs.readFileSync("google-credentials.json"));
const credentials = googleCredentials;
const client = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const sheets = google.sheets({ version: "v4", auth: client });
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const currentYear = new Date().getFullYear().toString().slice(-2);

const getExpenses = async(month = null) => {
  const currentMonth = new Date().toLocaleString('en-US', { month: 'short' });
  let SHEET_NAME = `${currentMonth} ${currentYear}`;
  SHEET_NAME = `${month ?? currentMonth} ${currentYear}`;
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A:D`,
  });
  let expenses = response.data.values.map(e => {
    const expense = {
        date: e[0],
        title: e[1],
        amount: e[3],
        category: e[2],
    };
    return e.length == 0 || e[0] == 'Date' ? false : expense;
  });
  expenses = expenses.filter(e => e);
  expenses.sort((a, b) => {
    // Extract date part (ignoring the weekday)
    const parseDate = (str) => {
      let [, day, month, year] = str.match(/(\d{2})-(\d{2})-(\d{2})/);
      return new Date(`20${year}-${month}-${day}`); // Convert to full year format (e.g., 2025)
    };
    return parseDate(b.date) - parseDate(a.date);
  });
  const categories = [
      'Other',
      'Extra Unplanned',
      'Petrol',
      'Fast food & Drink',
      'Daaru',
      'Bills & Utilities',
      'Hotels',
      'Shoping',
      'Mutton Mase',
      'Grocery',
      'Entertainment',
  ]

  return {
      expenses,
      categories
  };
};

const getCategories = () => {
  const categories = [
      'Other',
      'Extra Unplanned',
      'Petrol',
      'Fast food & Drink',
      'Daaru',
      'Bills & Utilities',
      'Hotels',
      'Shoping',
      'Mutton Mase',
      'Grocery',
      'Entertainment',
  ]

  return {
      categories,
  };
};

const addExpense = async(body) => {
  const data = [];
  for (let i = 0; i < body.length; i++) {
    const { category, amount, date, description } = body[i];
    const currentMonth = new Date(date).toLocaleString('en-US', { month: 'short' });
    const SHEET_NAME = `${currentMonth} ${currentYear}`;
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A3:D3`,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [[formatDate(date), description ?? category, category, parseFloat(amount)]],
      },
    });
    data.push(response)
  }
    
    // const data = await sheets.spreadsheets.values.update({
    //     spreadsheetId: SPREADSHEET_ID,
    //     range: `${SHEET_NAME}!A2:D2`, // Change to the correct row dynamically if needed
    //     valueInputOption: "RAW",
    //     requestBody: {
    //         values: [[formatDate(date), category, category, parseFloat(amount)]],
    //     },
    // });

    return data;
};

function formatDate(dateString) {
    const date = new Date(dateString);
    
    const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);
    
    return `${weekday}, ${day}-${month}-${year}`;
}
  

module.exports = {
    getExpenses,
    addExpense,
    getCategories,
};
