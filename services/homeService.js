
const groupByDate = (transactions) => {
    return transactions.reduce((acc, transaction) => {
      if (!acc[transaction.date]) {
        acc[transaction.date] = { total: 0, expenses: [] };
      }
      acc[transaction.date].total += transaction.amount;
      acc[transaction.date].expenses.push(transaction);
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
