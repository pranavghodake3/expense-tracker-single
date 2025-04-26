const expenseModel = require("../models/expenseModel");
const categoryModel = require("../models/categoryModel");
const budgetModel = require("../models/budgetModel");
const incomeTransactionModel = require("../models/incomeTransactionModel");
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const Category = require("../models/categoryModel");
const currentYear = new Date().getFullYear().toString();
const currentMonth =  new Date().getMonth();
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const rootPath = process.cwd();

const getExpenses = async(month = null, categoryId = null) => {
    const monthIndex = months.indexOf(month);
    const startDate = new Date(currentYear, monthIndex, 1);
    const endDate = new Date(currentYear, monthIndex+1, 1);

    const filter = {
        date: { $gte: startDate, $lt: endDate }
    };
    if(categoryId)  filter.categoryId = categoryId;
    const expenses = await expenseModel.find(filter).sort({date: -1});

    return {
        expenses,
    };
};

const getExpenseById = async(id) => {
    const expense = await expenseModel.findById(id);


    return {
        expense,
        // tt: await getTotalMonthExpense('Mar')
    };
};

const createExpense = async(body) => {
    const data = [];
    for (let i = 0; i < body.length; i++) {
        const { categoryId, amount, date, title, newCategory } = body[i];
        let finalCategoryId = categoryId;
        const expenseMonth = new Date(date).getMonth();
        const expenseYear = new Date(date).getFullYear();
        if (newCategory) {
            const newCategoryCreated = await categoryModel.updateOne(
                { name: newCategory }, // Search condition
                { $setOnInsert: { name: newCategory } }, // Only set fields on insert
                { upsert: true } // Create if not exists
            );
            finalCategoryId = newCategoryCreated.upsertedId;
        }
        const expenseModelObj = new expenseModel({
            categoryId: finalCategoryId, amount, date, title,
        });
        const response = await expenseModelObj.save();
        const budget = await budgetModel.findOne({categoryId: finalCategoryId, month: expenseMonth});
        if(budget){
            const spentTotal = parseFloat(budget.spent) + parseFloat(amount);
            const remainingTotal = parseFloat(budget.limit) - parseFloat(spentTotal);
            const updatedBudget = await budgetModel.findByIdAndUpdate(budget._id, {
                spent: spentTotal,
                remaining: remainingTotal,
            });
        }
        data.push(response);
        const incomeFilter = {  month: expenseMonth, year: expenseYear };
        let incomeTransactionObj = await incomeTransactionModel.find(incomeFilter);
        if(incomeTransactionObj.length == 1){
            console.log("incomeTransactionObj: ",incomeTransactionObj)
            await incomeTransactionModel.findByIdAndUpdate(incomeTransactionObj[0]._id, {spentTotal: parseFloat(amount) + parseFloat(incomeTransactionObj[0].spentTotal)});
        }
    }
    

    return data;
};

const updateExpense = async(id, body) => {
    const { categoryId, amount, date, title, newCategory } = body;
    let finalCategoryId = categoryId;
    const expenseMonth = new Date(date).getMonth();
    const expenseYear = new Date(date).getFullYear();
    if (newCategory) {
        const newCategoryCreated = await categoryModel.updateOne(
            { name: newCategory }, // Search condition
            { $setOnInsert: { name: newCategory } }, // Only set fields on insert
            { upsert: true } // Create if not exists
        );
        finalCategoryId = newCategoryCreated.upsertedId;
    }
    const budget = await budgetModel.findOne({categoryId: finalCategoryId, month: expenseMonth});
    if(budget){
        const spentTotal = parseFloat(budget.spent) + parseFloat(amount);
        const remainingTotal = parseFloat(budget.limit) - parseFloat(spentTotal);
        const updatedBudget = await budgetModel.findByIdAndUpdate(budget._id, {
            spent: spentTotal,
            remaining: remainingTotal,
        });
    }
    const data = await expenseModel.findByIdAndUpdate(id, {categoryId: finalCategoryId, amount, date, title});
    const incomeFilter = {  month: expenseMonth, year: expenseYear };
    let incomeTransactionObj = await incomeTransactionModel.find(incomeFilter);
    if(incomeTransactionObj){
        await incomeTransactionModel.findByIdAndUpdate(incomeTransactionObj[0]._id, {spentTotal: await getTotalMonthExpense(months[expenseMonth])});
    }

    return data;
};
const getTotalMonthExpense = async(month) => {
    const response = await getExpenses(month);
    const totalExpense = response.expenses.reduce((acc, exp) => acc + parseFloat(exp.amount), 0);
    return totalExpense;
};

const deleteExpense = async(id) => {
    const expense = await expenseModel.findById(id);
    const expenseMonth = new Date(expense.date).getMonth();
    const expenseYear = new Date(expense.date).getFullYear();
    const budget = await budgetModel.findOne({categoryId: expense.categoryId, month: expenseMonth});
    if(budget){
        const spentTotal = parseFloat(budget.spent) - parseFloat(expense.amount);
        const remainingTotal = parseFloat(budget.limit) - parseFloat(spentTotal);
        const budgetUpdate = await budgetModel.findByIdAndUpdate(budget._id, {
            spent: spentTotal,
            remaining: remainingTotal,
        });
    }
    const data = await expenseModel.findByIdAndDelete(id);
    const incomeFilter = {  month: expenseMonth, year: expenseYear };
    let incomeTransactionObj = await incomeTransactionModel.find(incomeFilter);
    if(incomeTransactionObj){
        console.log("incomeTransactionObj: ",incomeTransactionObj)
        await incomeTransactionModel.findByIdAndUpdate(incomeTransactionObj[0]._id, {spentTotal: parseFloat(incomeTransactionObj[0].spentTotal) - parseFloat(expense.amount)});
    }

    return data;
};

const deleteExpensesByCondition = async(condition) => {
    const data = await expenseModel.deleteMany(condition);

    return data;
};

const importCSV = async() => {
    // const monthIndex = 1;
    // const startDate = new Date(currentYear, monthIndex, 1);
    // const endDate = new Date(currentYear, monthIndex+1, 1);

    // const filter = {
    //     date: { $gte: startDate, $lt: endDate }
    // };
    // await expenseModel.deleteMany(filter)
    const filePath = path.join(rootPath, 'csv', 'jan.csv'); // change path if needed
    let results = [];
    const categories = [];
    
  results = await parseCSV(filePath);
  const catObj = {};
  const insertData = [];
  for (let i = 0; i < results.length; i++) {
    const element = results[i];
    let categoryId = '';
    if(typeof catObj[element.Category] == 'undefined'){
        const cat = await Category.findOne({name: element.Category});
        if(cat){
            catObj[element.Category] = cat._id;
            categoryId = cat._id;
        }else if(element.Category == 'Mutton Mase'){
            categoryId = '67cc09a2a2ea244dfb0c1cc3';
        }
    }else{
        categoryId = catObj[element.Category];
    }
    const [day, month, year] = element.Date.split("-");
    const formattedDate = `${year}-${month}-${day}`;
    const insertObj = {
        categoryId,
        amount: parseFloat(element.Amount),
        date: formattedDate,
        title: element.Description,
        newCategory: null
    };
    insertData.push(insertObj)
  }
    // await createExpense(insertData);

    return {
        insertData,
    };
};

const parseCSV = (filePath) => {
    return new Promise((resolve, reject) => {
      const results = [];
      const categories = [];
  
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
            if(!categories.includes(data.Category)) categories.push(data.Category);
            results.push(data)
        })
        .on('end', async() => {
            // for (let i = 0; i < categories.length; i++) {
            //     const cat = await Category.findOne({name: categories[i]});
            //     if(cat){
            //         console.log("cat: ",cat.name)
            //     }else{
            //         console.log("missing cat name: ",categories[i]);
            //     }
            // }
            resolve(results)
        })
        .on('error', (err) => reject(err));
    });
};

module.exports = {
    getExpenses,
    getExpenseById,
    createExpense,
    updateExpense,
    deleteExpense,
    deleteExpensesByCondition,
    importCSV,
};
