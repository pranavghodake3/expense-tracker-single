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
  let expenses = response.data.values.map((e, index) => {
    const expense = {
      id: index,
      date: e[0],
      description: e[1],
      category: e[2],
      amount: e[3],
    };
    return expense;
  });
  expenses = expenses.filter(e => e);
  expenses.sort((a, b) => {
    const parseDate = (str) => {
      let [, day, month, year] = str.match(/(\d{2})-(\d{2})-(\d{2})/);
      return new Date(`20${year}-${month}-${day}`);
    };
    return parseDate(b.date) - parseDate(a.date);
  });

  return {
      expenses,
  };
};

const getCategories = async () => {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `Categories!A:A`,
  });

  return {
      categories: response.data.values.map(e=> e[0])
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
      range: `${SHEET_NAME}!A:D`,
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

const updateExpense = async(id, body) => {
  const { category, amount, date, description, currentMonth } = body;
  // const currentMonth = new Date(date).toLocaleString('en-US', { month: 'short' });
  const SHEET_NAME = `${currentMonth} ${currentYear}`;
  const data = await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A${id+1}:D${id+1}`,
      valueInputOption: "RAW",
      requestBody: {
          values: [[formatDate(date), description, category, parseFloat(amount)]],
      },
  });

  return data;
};

async function getSheetId(sheetName) {
  const sheetMetadata = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
      // auth: authClient,
  });

  const sheet = sheetMetadata.data.sheets.find(s => s.properties.title === sheetName);
  return sheet ? sheet.properties.sheetId : null;
}

async function deleteExpense(id) {
  // const currentMonth = new Date(date).toLocaleString('en-US', { month: 'short' });
  const currentMonth = 'Mar'
  const SHEET_NAME = `${currentMonth} ${currentYear}`;
  // const authClient = await auth.getClient();

  const request = {
    spreadsheetId: SPREADSHEET_ID,
    resource: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: await getSheetId(SHEET_NAME),    // Sheet ID (not name)
              dimension: 'ROWS',    // Delete a row
              startIndex: ((id+1) - 1), // Zero-based index
              endIndex: (id+1),  // Delete only this row
            },
          },
        },
      ],
    },
    // auth: authClient,
  };

  try {
    const response = await sheets.spreadsheets.batchUpdate(request);
    console.log('Row deleted successfully', response.data);
  } catch (error) {
    console.error('Error deleting row:', error);
  }
}

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
    updateExpense,
    deleteExpense,
};
