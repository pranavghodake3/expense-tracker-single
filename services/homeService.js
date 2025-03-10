
const groupByDate = (expenses) => {
    return expenses.reduce((acc, expense) => {
      if (!acc[expense.date]) {
        acc[expense.date] = { total: 0, expenses: [] };
      }
      acc[expense.date].total += expense.amount;
      acc[expense.date].expenses.push(expense);
      return acc;
    }, {});
};

const homeFirstFunction = async() => {
    let expenses = [
        { date: "Sat,15-02-25", amount: 200, category: "Petrol" },
        { date: "Sat,15-02-25", amount: 300, category: "Other" },
        { date: "Fri,14-02-25", amount: 100, category: "Food" },
        { date: "Fri,14-02-25", amount: 150, category: "Travel" }
      ];
    const categories = [
        'Other',
        'Petrol',
        'Daaru',
        'Hotels',
    ]
    console.log("groupByDate: ",groupByDate(expenses))

    return {
        expenses,
        categories
    };
};

module.exports = {
    homeFirstFunction
};
