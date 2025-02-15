const { google } = require("googleapis");
const googleCredentials = require("../config/google-credentials.json");
require("dotenv").config();

// Load Google API credentials
// const credentials = JSON.parse(fs.readFileSync("google-credentials.json"));
const credentials = googleCredentials;
const client = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const sheets = google.sheets({ version: "v4", auth: client });
// Google Sheet ID (replace with your actual Sheet ID)
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_NAME = "Feb 25";

const getExpenses = async() => {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:D`,
    });
    let expenses = response.data.values.map(e => {
        const expense = {
            date: e[0],
            amount: e[3],
            category: e[2],
        };
        return e.length == 0 || e[0] == 'Date' ? false : expense;
      });
      expenses = expenses.filter(e => e)
    const categories = [
        'Other',
        'Petrol',
        'Daaru',
        'Hotels',
    ]

    return {
        expenses,
        categories
    };
};

const addExpense = async(body) => {
    const { category, amount, date } = body;
    const data = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A3:D3`,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [[formatDate(date), category, category, parseFloat(amount)]],
      },
    });
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
};
