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
  let expenses = response?.data?.values ? response?.data?.values.map((e, index) => {
    const expense = {
      id: index,
      date: e[0],
      description: e[1],
      category: e[2],
      amount: e[3],
    };
    return expense;
  }) : [];
  expenses = expenses.filter(e => e);
  expenses.sort((a, b) => {
    const parseDate = (str) => {
      let [, day, month, year] = str.match(/(\d{2})-(\d{2})-(\d{2})/);
      return new Date(`20${year}-${month}-${day}`);
    };
    return parseDate(b.date) - parseDate(a.date);
  });
  
  const finalArr = {};
  expenses.forEach(element => {
    if (typeof finalArr[element.date] == 'undefined') finalArr[element.date] = [];
    finalArr[element.date].push(element);
  });
  expenses = finalArr;

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
  const existingWorkSheets = (await getAllWorkSheets()).map(sheet => sheet.properties.title);
  const notCurrentYears = [];
  body.forEach(e => {
    if(currentYear != new Date(e.date).getFullYear().toString().slice(-2))  notCurrentYears.push(e.date)
  });
  if(notCurrentYears.length > 0)  throw Error(`Years should be current running: ${notCurrentYears.join(", ")}`)
  
  for (let i = 0; i < body.length; i++) {
    const { category, amount, date, description } = body[i];
    const currentMonth = new Date(date).toLocaleString('en-US', { month: 'short' });
    let SHEET_NAME = `${currentMonth} ${currentYear}`;
    if (!existingWorkSheets.includes(SHEET_NAME)) {
      await createWorkSheet(SHEET_NAME);
    }
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:D`,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [[formatDate(date), description, category, parseFloat(amount)]],
      },
    });
    data.push(response)
  }

    return data;
};
const createWorkSheet = async(workSheetName) => {
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          addSheet: {
            properties: {
              title: workSheetName,
              gridProperties: { rowCount: 50, columnCount: 10 },
            },
          },
        },
      ],
    },
  });
}

const updateExpense = async(id, body) => {
  const { category, amount, date, description, currentMonth } = body;
  if(currentYear != new Date(date).getFullYear().toString().slice(-2)){
    throw Error(`Year should be current running only: ${date}`)
  }
  const newMonth = new Date(date).toLocaleString('en-US', { month: 'short' });
  let data = [];
  if(currentMonth == newMonth){
    const SHEET_NAME = `${currentMonth} ${currentYear}`;
    data = await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A${id+1}:D${id+1}`,
        valueInputOption: "RAW",
        requestBody: {
            values: [[formatDate(date), description, category, parseFloat(amount)]],
        },
    });
  }else{
    data = await addExpense([{category, amount, date, description}]);
    await deleteExpense(id, newMonth);
  }
  

  return data;
};

async function getSheetId(sheetName) {
  const workSheets = await getAllWorkSheets();

  const sheet = workSheets.find(s => s.properties.title === sheetName);
  return sheet ? sheet.properties.sheetId : null;
}

async function getAllWorkSheets(){
  const sheetMetadata = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
  });

  return sheetMetadata.data.sheets;
}

async function deleteExpense(id, month) {
  // const currentMonth = new Date(date).toLocaleString('en-US', { month: 'short' });
  const SHEET_NAME = `${month} ${currentYear}`;
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
  const response = await sheets.spreadsheets.batchUpdate(request);
  return response;
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
