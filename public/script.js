const ruppeeSymbol = '&#8377;';
const allExpenses = {};
let categories = [];
let currentIncome = 0;
let monthlyGrantTotal = 0;
let monthlyIncomeId;
const arrangedCategoriesById = {};
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const monthDropdown = document.getElementById("month");
months.forEach((month, index) => {
    let option = document.createElement("option");
    option.value = month;
    option.text = month;
    monthDropdown.appendChild(option);
});
let currentMonth = new Date().toLocaleString('en-US', { month: 'short' });
monthDropdown.value = currentMonth;
document.getElementById("currentYear").innerHTML = new Date().getFullYear().toString();

$("table").on("click", "td", function () {
    $("td").removeClass("td-clicked"); // Remove the class from all cells
    $(this).toggleClass("td-clicked");    // Add the class to the clicked cell
});
$(".expense-info").on("click", ".income", function () {
    $("#updateIncomeModal").modal('show');
    $("#update-income-form").find(".income-field").val(currentIncome == 0 ? '' : currentIncome);
});
$('#setLimitModal, #updateLimitModal, #updateIncomeModal, #addExpenseModal, #updateExpenseModal').on('shown.bs.modal', function () {
    $("input[type='number']").trigger("focus");
});
function searchTable() {
    let input = document.getElementById("search");
    let filter = input.value.toLowerCase();
    let tableBody = document.getElementById("expenses");
    let rows = tableBody.getElementsByTagName("tr");
    
    for (let row of rows) {
        let cells = row.getElementsByTagName("td");
        let match = false;
        for (let cell of cells) {
            if (cell.innerText.toLowerCase().includes(filter)) {
                match = true;
                break;
            }
        }
        row.style.display = match ? "" : "none";
        // const closestDateRow = row.closest('tr.date-row');
        // if(closestDateRow){
        //     console.log("closestDateRow: ",closestDateRow, ", match: ",match)
        //     closestDateRow.style.display = match ? "" : "none";
        // }
    }
}

document.getElementById("addField").addEventListener("click", function() {
    const container = document.getElementById("fieldsContainer");
    const newGroup = document.createElement("div");
    newGroup.classList.add("single-expense-form");
    newGroup.classList.add("single-expense-form-extra");
    newGroup.innerHTML = `
        <div class="form-group">
            <input type="date" name="date[]" class=" form-control date-field" required>
        </div>
        <div class="form-group">
            <input type="number" name="amount[]" class="form-control amount-field" placeholder="Amount" required>
        </div>
        <div class="form-group">
            <input type="text" name="title[]" class="form-control title-field" placeholder="Description">
        </div>
        <div class="form-group">
            <select name="category[]" class="form-control category-field" required>
                 ${categories.map(e => `<option value="${e._id}" ${e.name === 'Other' ? 'selected' : ''}>${e.name}</option>`).join('')}
            </select>
        </div>
        <div class="form-group">
            <input type="text" name="new_category[]" class="form-control new-category-field" placeholder="New Category">
        </div>
        <button type="button" class="remove-btn">Remove</button>
    `;
    container.appendChild(newGroup);
    newGroup.querySelector(".date-field").value = new Date().toISOString().split('T')[0];
});
document.getElementById("fieldsContainer").addEventListener("click", function (event) {
    if (event.target.classList.contains("remove-btn")) {
        event.target.parentElement.remove();
    }
});

document.getElementById("add-expense-form").addEventListener("submit", async function(event) {
    event.preventDefault();
    const submitButton = document.getElementById("submit-btn");
    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";
    const formDataArray = [];
    const form = document.getElementById("add-expense-form");
    const dateFields = form.querySelectorAll(".date-field");
    const amountFields = form.querySelectorAll(".amount-field");
    const categoryFields = form.querySelectorAll(".category-field");
    const newCategoryFields = form.querySelectorAll(".new-category-field");
    const titleFields = form.querySelectorAll(".title-field");

    // Collect data from each form field group
    dateFields.forEach((dateField, index) => {
        formDataArray.push({
            date: dateFields[index].value,
            amount: amountFields[index].value,
            categoryId: categoryFields[index].value,
            title: titleFields[index].value,
            newCategory: newCategoryFields[index].value
        });
    });
    let formSubmitData = await fetch("/expenses", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(formDataArray),
    });
    formSubmitData = await formSubmitData.json();
    if(formSubmitData.status){
        $('#addExpenseModal').modal('hide');
        await showStatusMessage("Added Successfully!", 'true', [loadExpenses, loadBudgets, loadIncome]);
    }else{
        await showStatusMessage(formSubmitData.error, 'false');
    }
    submitButton.disabled = false;
    submitButton.textContent = "Submit";
});
function onCancelClick(event){
    document.querySelectorAll(".single-expense-form-extra").forEach(e => e.remove());
    document.getElementById("add-expense-collaps-btn").click();
    // document.getElementById('add-expense-form').classList.add('hide');
    // document.getElementById('add-expense-btn').classList.remove('hide');
    // document.getElementById('add-expense-form').style.display = 'none';
}
function onAddExpenseClick(event){
    event.classList.add('hide');
    document.getElementById('add-expense-form').classList.remove('hide');
    // document.getElementById('add-expense-form').style.display = 'block';
}
function getStats(){
    let stats = {};
    let totalSum = 0;

    for(let key in allExpenses[currentMonth]){
        for(let i = 0; i < allExpenses[currentMonth][key].length; i++){
            let catName = arrangedCategoriesById[allExpenses[currentMonth][key][i].categoryId].name;
            if(typeof stats[catName] == 'undefined') stats[catName] = {total:0, count:0};
            stats[catName].total += parseFloat(allExpenses[currentMonth][key][i].amount);
            stats[catName].count++;
            totalSum += parseFloat(allExpenses[currentMonth][key][i].amount);
        }
    }
    stats = Object.fromEntries(
        Object.entries(stats).sort(([, v1], [, v2]) => v2.total - v1.total)
      );
    return stats;
}
function loadStats(changedMonth){
    let stats = {};
    let totalSum = 0;

    for(let key in allExpenses[changedMonth]){
        for(let i = 0; i < allExpenses[changedMonth][key].length; i++){
            let catName = arrangedCategoriesById[allExpenses[changedMonth][key][i].categoryId].name;
            if(typeof stats[catName] == 'undefined') stats[catName] = {total:0, count:0};
            stats[catName].total += parseFloat(allExpenses[changedMonth][key][i].amount);
            stats[catName].count++;
            totalSum += parseFloat(allExpenses[changedMonth][key][i].amount);
        }
    }
    stats = Object.fromEntries(
        Object.entries(stats).sort(([, v1], [, v2]) => v2.total - v1.total)
      );
    // allExpenses[changedMonth].forEach(e => {
    //     if(typeof stats[e.category] == 'undefined') stats[e.category] = 0;
    //     stats[e.category] += parseFloat(e.amount);
    // });
    const statsTableBody = document.getElementById("stats-table-body");
    statsTableBody.innerHTML = '';
    for (const key in stats) {
        let row = statsTableBody.insertRow();
        let cell1 = row.insertCell(0);
        let cell2 = row.insertCell(1);
        cell1.innerHTML = key+": ";
        cell2.innerHTML = `${ruppeeSymbol} ${stats[key].total.toLocaleString()} (${stats[key].count})`;
    }
    // for (const key in stats) {
    //     const container = document.getElementById("stats-body");
    //     const newGroup = document.createElement("div");
    //     newGroup.classList.add("progress");
    //     let categoryPercentage = Math.round((parseFloat(stats[key])/totalSum)*100);
    //     newGroup.innerHTML = `
    //         <div class="progress-bar" role="progressbar" aria-valuenow="${categoryPercentage}"
    //         aria-valuemin="0" aria-valuemax="100" style="width:${categoryPercentage}%">${key} ${categoryPercentage}%</div>
    //         <span class="badge">${stats[key].toLocaleString()}</span>
    //     `;
    //     container.appendChild(newGroup);
    // }
    // const statsList = document.getElementById("stats-list");
    // for (const key in stats) {
        
    //     const li = document.createElement("li");
    //     li.classList.add("list-group-item");
    //     let categoryPercentage = Math.round((parseFloat(stats[key])/totalSum)*100);
    //     li.innerHTML = `
    //         ${key} <span class="badge">${ruppeeSymbol}${parseFloat(stats[key]).toLocaleString()}</span>
    //     `;
    //     statsList.appendChild(li);
    // }
}

document.querySelectorAll(".date-field").forEach(input => {
    input.value = new Date().toISOString().split('T')[0];
});
async function showStatusMessage(formStatusMessage, formStatus, funArr = []){
    const formStatusElement = document.getElementsByClassName(formStatus == 'true' ? 'alert-success' : 'alert-danger')[0];
    formStatusElement.classList.remove('hide');
    if(formStatusMessage){
        formStatusElement.innerHTML = formStatusMessage;
        formStatusElement.classList.remove('hide');
        formStatusElement.classList.add(formStatus);
        setTimeout(() => {
            formStatusElement.classList.add('hide');
            if(funArr.length > 0){
                for (let i = 0; i < funArr.length; i++) {
                    funArr[i]();
                }
            }
        }, formStatus === "true" ? 1000 : 3000);
    }
    if(formStatus == 'true')    await clearFormFields();
}
async function clearFormFields(){
    document.querySelectorAll(".single-expense-form-extra").forEach(e => e.remove());
    document.getElementById("add-expense-form").reset();
    // document.getElementById("add-expense-collaps-btn").click();
    // await loadExpenses(currentMonth);
}

async function loadExpenses(categoryId = null){
    const expensesTbody = document.getElementById("expenses");
    expensesTbody.innerHTML = '';
    let row = expensesTbody.insertRow();
    let cell1 = row.insertCell(0);
    cell1.colSpan = 5;
    cell1.style.textAlign  = "center";
    cell1.textContent = "Loadding...";
    let expensesUrl = `/expenses?month=${currentMonth}`;
    if(categoryId)  expensesUrl += `&categoryId=${categoryId}`;
    let data = await fetch(expensesUrl);
    data = await data.json();
    if(data.status){
        expensesTbody.innerHTML = '';
        row = expensesTbody.insertRow();
        row.classList.add('expense-title-row');
        cell1 = row.insertCell(0);
        cell1.colSpan = 5;
        cell1.style.textAlign  = "center";
        cell1.innerHTML = categoryId ? `${arrangedCategoriesById[categoryId].name} - Expenses <button type="button" class="btn btn-primary btn-xs" onclick="loadExpenses();">Reset</button>` : 'Monthly Expenses';
        let totalSum = 0;
        let totalExpenses = 0;
        const finalExpenses = {};
        data.data.expenses.forEach(element => {
            if (typeof finalExpenses[element.date] == 'undefined') finalExpenses[element.date] = [];
            finalExpenses[element.date].push(element);
        });
        allExpenses[currentMonth] = finalExpenses;
        if(Object.entries(finalExpenses).length > 0){
            let p = 0;
            for(let key in finalExpenses){
                let sum = 0;
                finalExpenses[key].forEach(e => { sum += parseFloat(e.amount); })
                let row = expensesTbody.insertRow();
                row.classList.add('date-row');
                row.classList.add('date-row-'+p);
                p++;
                row.classList.add('active');
                let cell_l = row.insertCell(0);
                let cell_2 = row.insertCell(1);
                let cell_3 = row.insertCell(2);
                // isDateHaveWeekdayFormat(expenseData.date) ? formatDate(expenseData.date, true) : expenseData.date;
                cell_l.innerHTML = formatDateNew(key);
                cell_2.innerHTML = `${ruppeeSymbol} ${sum.toLocaleString()} (${finalExpenses[key].length})`;
                cell_3.innerHTML = '';
                for(let i = 0; i < finalExpenses[key].length; i++){
                    row = expensesTbody.insertRow();
                    row.classList.add('expense-row');
                    cell_l = row.insertCell(0);
                    cell_2 = row.insertCell(1);
                    cell_3 = row.insertCell(2);
                    cell_l.innerHTML = `
                        <div class="title">${finalExpenses[key][i].title}</div>
                        <div class="category">${arrangedCategoriesById[finalExpenses[key][i].categoryId].name}</div>
                        <input type="hidden" name="expense-field" class="expense-field" value='${JSON.stringify(finalExpenses[key][i])}'>
                    `;
                    cell_l.addEventListener("click", editExpense);
                    cell_2.innerHTML = `<div class="amount">${ruppeeSymbol} ${parseFloat(finalExpenses[key][i].amount).toLocaleString()} </div>`;
                    cell_3.innerHTML = `
                        <input type="hidden" name="id" class="id-field" value="${finalExpenses[key][i]._id}">
                        <button type="button" class="btn btn-danger btn-xs" onclick="deleteExpense(this)">
                            <span class="glyphicon glyphicon-trash"></span> 
                        </button>
                    `;
                    totalExpenses++;
                }
                totalSum += sum
            }
        }else{
            let row = expensesTbody.insertRow();
            let cell1 = row.insertCell(0);
            cell1.colSpan = 5;
            cell1.style.textAlign  = "center";
            cell1.textContent = "No expenses";
        }
        monthlyGrantTotal = totalSum;
        document.getElementById("totalSum").innerHTML = `${ruppeeSymbol} ${totalSum.toLocaleString()} (${totalExpenses})`;
    }else{
        cell1.textContent = data.error;
        await showStatusMessage(data.error, 'false');
    }
}
function isDateHaveWeekdayFormat(dateString){
    let parts = dateString.split(',');
    return parts.length > 1 ? true : false;
}
function formatDate(dateString, standard = true) {
    let formattedDate = '';
    if(standard){
        let parts = dateString.split(', ')[1];
        let [day, month, year] = parts.split('-');
        year = parseInt(year, 10) < 50 ? '20' + year : '19' + year;
        formattedDate = `${year}-${month}-${day}`;
    }else{
        const date = new Date(dateString);
        const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = String(date.getFullYear()).slice(-2);
        formattedDate = `${weekday}, ${day}-${month}-${year}`;
    }

    return formattedDate;
}
function formatDateNew(dateString) {
    let formattedDate = '';
    const date = new Date(dateString);
    const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);
    formattedDate = `${weekday}, ${day}-${month}-${year}`;

    return formattedDate;
}
function editExpense(td) {
    let expenseData = this.querySelector('.expense-field').value;
    expenseData = JSON.parse(expenseData);
    const form = document.getElementById("update-expense-form");
    form.querySelector('.date-field').value = new Date(expenseData.date).toISOString().split('T')[0];
    form.querySelector('.expense-id-field').value = expenseData._id;
    form.querySelector('.title-field').value = expenseData.title;
    form.querySelector('.category-field').value = expenseData.categoryId;
    form.querySelector('.amount-field').value = expenseData.amount;
    $("#updateExpenseModal").modal("show");
    // form.classList.remove("hide");
    // window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.getElementById("update-expense-form").addEventListener("submit", async function(event) {
    event.preventDefault();
    const submitButton = document.getElementById("update-btn");
    submitButton.disabled = true;
    submitButton.textContent = "Updating...";
    const form = document.getElementById("update-expense-form");
    const id = form.querySelector('.expense-id-field').value;
    const date = form.querySelector('.date-field').value;
    const title = form.querySelector('.title-field').value;
    const categoryId = form.querySelector('.category-field').value;
    const amount = form.querySelector('.amount-field').value;

    let formSubmitData = await fetch("/expenses/"+id, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({date, title, categoryId, amount, currentMonth}),
    });
    formSubmitData = await formSubmitData.json();
    if(formSubmitData.status){
        $("#updateExpenseModal").modal("hide");
        await showStatusMessage('Updated successfuly!', 'true', [loadExpenses, loadBudgets, loadIncome]);
    }else{
        await showStatusMessage(formSubmitData.error, 'false');
    }
    submitButton.disabled = false;
    submitButton.textContent = "Update";
});
// async function updateExpense(button) {
//     const form = document.getElementById("update-expense-form");
//     const id = form.querySelector('.expense-id-field').value;
//     const date = form.querySelector('.date-field').value;
//     const title = form.querySelector('.title-field').value;
//     const category = form.querySelector('.category-field').value;
//     const amount = form.querySelector('.amount-field').value;
//     let formSubmitData = await fetch("/expenses/"+id, {
//         method: "PUT",
//         headers: {
//             "Content-Type": "application/json"
//         },
//         body: JSON.stringify({date, title, category, amount, currentMonth}),
//     });
//     formSubmitData = await formSubmitData.json();
//     if(formSubmitData.status){
//         form.classList.add("hide");
//         await loadExpenses(currentMonth);
//         await showStatusMessage('Updated successfuly!', 'true');
//     }else{
//         await showStatusMessage(formSubmitData.error, 'false');
//     }
// }
function cancelEditExpense(button) {
    let tr = button.closest('tr');
    tr.querySelector('.edit-btn').classList.remove('hide');
    tr.querySelector('.update-btn').classList.add('hide');
    tr.querySelector('.cancel-btn').classList.add('hide');
    tr.querySelectorAll(".content").forEach(contentDiv => {
        contentDiv.style.display = 'block';
    });
    tr.querySelectorAll(".content-html").forEach(contentHtmlDiv => {
        contentHtmlDiv.style.display = 'none';
    });
}
async function deleteExpense(button) {
    const deleteConfirm = confirm("Are you sure to delete this Expense ?");
    if(deleteConfirm){
        let tr = button.closest('tr');
        button.disabled = true;
        button.textContent = "Deleting...";
        const id = tr.querySelector('.id-field').value;
        let formSubmitData = await fetch(`/expenses/${id}/${currentMonth}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
        });
        formSubmitData = await formSubmitData.json();
        if(formSubmitData.status){
            document.querySelectorAll(".id-field").forEach(input => {
                if(input.value > id){
                    input.value -= 1;
                }
            });
            tr.remove();
            await showStatusMessage('Deleted successfuly!', 'true', [loadExpenses, loadBudgets, loadIncome]);
        }else{
            await showStatusMessage(formSubmitData.error, 'false');
        }
        button.disabled = false;
        button.textContent = "Delete";
    }
}

async function onMonthChange(event){
    currentMonth = event.value;
    await loadExpenses();
    await loadBudgets();
    await loadIncome();
}
async function loadCategories(){
    let data = await fetch('/categories');
    data = await data.json();
    categories = data.data.categories;
    // const select = document.getElementsByClassName("category-field")[0];
    const categoriesTbody = document.getElementById("categories-tbody");
    categoriesTbody.innerHTML = '';
    document.querySelectorAll(".category-dropdown").forEach(select => {
        data.data.categories.forEach(category => {
            arrangedCategoriesById[category._id] = category;
            let option = document.createElement("option");
            option.value = category._id;
            option.text = category.name;
            if(category.name === 'Other')    option.selected = true;
            select.appendChild(option);
        });
    });
    data.data.categories.forEach(category => {
        let row = categoriesTbody.insertRow();
        let cell_l = row.insertCell(0);
        cell_l.innerHTML = category.name;
        cell_l.setAttribute("category-id", category._id);
        cell_l.setAttribute("category-name", category.name);
        cell_l.addEventListener("click", editCategory);
    });
}
async function editCategory(td){
    $("#updateCategoryModal").modal("show");
    $("#update-category-form").find("input[name='categoryId']").val($(this).attr("category-id"));
    $("#update-category-form").find("input[name='name']").val($(this).attr("category-name"));
}

async function loadBudgets(){
    const stats = getStats();
    let data = await fetch('/budgets?month='+currentMonth);
    data = await data.json();
    const categorizedBudgets = {};
    const budgetsTbody = document.getElementById("budgets-tbody");
    budgetsTbody.innerHTML = '';
    const budgets = data.data.budgets;
    budgets.forEach(e => categorizedBudgets[e.categoryId] = e);
    categories.forEach(cat => {
        const spent = categorizedBudgets[cat._id] ? categorizedBudgets[cat._id].spent : 0;
        const limit = categorizedBudgets[cat._id] ? categorizedBudgets[cat._id].limit : 0;
        const remaining = categorizedBudgets[cat._id] ? categorizedBudgets[cat._id].remaining : 0;
        let row = budgetsTbody.insertRow();
        row.classList.add('expense-row');
        let cell_l = row.insertCell(0);
        let cell_2 = row.insertCell(1);
        let cell_3 = row.insertCell(2);
        let cell_4 = row.insertCell(3);
        cell_l.innerHTML = `${cat.name}`;
        cell_2.innerHTML = `
            ${ruppeeSymbol} ${spent.toLocaleString()}(${typeof stats[cat.name] == 'undefined' ? 0 : stats[cat.name].count})
            <input type="hidden" class="category-id-field" value="${cat._id}">
        `;
        cell_2.addEventListener("click", loadCategorizedExpenses);
        cell_3.innerHTML = `${ruppeeSymbol} ${limit.toLocaleString()} ${
            categorizedBudgets[cat._id] ?
            '<button type="button" class="btn btn-primary btn-xs" data-toggle="modal" data-target="#updateLimitModal" category-id="'+cat._id+'" budget-id="'+categorizedBudgets[cat._id]._id+'" limit="'+limit+'" spent="'+spent+'" onclick="updateLimit(this)">Update</button>'
            :
            '<button type="button" class="btn btn-danger btn-xs" data-toggle="modal" data-target="#setLimitModal" category-id="'+cat._id+'" limit="'+limit+'" onclick="setLimit(this)">Set</button>'
        }`;
        cell_4.innerHTML = `${ruppeeSymbol} ${remaining.toLocaleString()}`;
    });
}
async function loadCategorizedExpenses(){
    const categoryId = this.querySelector(".category-id-field").value;
    await loadExpenses(categoryId);
}
async function setLimit(button) {
    const categoryId = button.getAttribute('category-id');
    const limit = button.getAttribute('limit');
    const form = document.getElementById("set-budget-form");
    form.querySelector(".category-id-field").value = categoryId;
    form.querySelector(".limit-field").value = limit == 0 ? '' : limit;
    form.querySelector(".limit-category-name").textContent = arrangedCategoriesById[categoryId].name;
}
async function updateLimit(button) {
    const budgetId = button.getAttribute('budget-id');
    const categoryId = button.getAttribute('category-id');
    const spent = button.getAttribute('spent');
    const limit = button.getAttribute('limit');
    const form = document.getElementById("update-budget-form");
    form.querySelector(".budget-id-field").value = budgetId;
    form.querySelector(".spent-field").value = spent;
    form.querySelector(".limit-field").value = limit == 0 ? '' : limit;
    form.querySelector(".limit-category-name").classList.add("123");
    form.querySelector(".limit-category-name").textContent = arrangedCategoriesById[categoryId].name;
}
document.getElementById("set-budget-form").addEventListener("submit", async function(event) {
    event.preventDefault();
    const form = document.getElementById("set-budget-form");
    const categoryId = form.querySelector('.category-id-field').value;
    const limit = form.querySelector('.limit-field').value;
    const month = months.indexOf(monthDropdown.value);
    const year = new Date().getFullYear().toString();

    let formSubmitData = await fetch("/budgets/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({categoryId, spent: 0, remaining: limit, limit, month, year}),
    });
    formSubmitData = await formSubmitData.json();
    if(formSubmitData.status){
        $('#setLimitModal').modal('hide');
        await showStatusMessage('Updated successfuly!', 'true', [loadExpenses, loadBudgets]);
    }else{
        await showStatusMessage(formSubmitData.error, 'false');
    }
});
document.getElementById("update-budget-form").addEventListener("submit", async function(event) {
    event.preventDefault();
    const form = document.getElementById("update-budget-form");
    const budgetId = form.querySelector('.budget-id-field').value;
    const limit = form.querySelector('.limit-field').value;
    const spent = form.querySelector('.spent-field').value;

    let formSubmitData = await fetch("/budgets/"+budgetId, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({limit, remaining: (parseFloat(limit) - parseFloat(spent))}),
    });
    formSubmitData = await formSubmitData.json();
    if(formSubmitData.status){
        $('#updateLimitModal').modal('hide');
        await showStatusMessage('Updated successfuly!', 'true', [loadExpenses, loadBudgets]);
    }else{
        await showStatusMessage(formSubmitData.error, 'false');
    }
});
async function loadIncome(){
    const stats = getStats();
    let data = await fetch('/income-transactions?month='+currentMonth);
    data = await data.json();
    const incomeTransactions = data.data.incomeTransactions;
    currentIncome = 0;
    monthlyIncomeId = null;
    let remaining = 0
    if(incomeTransactions.length > 0){
        currentIncome = incomeTransactions[0].amount;
        monthlyIncomeId = incomeTransactions[0]._id;
        remaining = parseFloat(incomeTransactions[0].amount) - parseFloat(incomeTransactions[0].spentTotal);
    }
    $("#update-income-form").find(".income-id-field").val(monthlyIncomeId);
    $(".income").find(".amount").html(`${ruppeeSymbol} ${currentIncome.toLocaleString()}`);
    $(".remaining").find(".amount").html(`${ruppeeSymbol} ${remaining.toLocaleString()}`);
}
document.getElementById("update-income-form").addEventListener("submit", async function(event) {
    event.preventDefault();
    const form = document.getElementById("update-income-form");
    const incomeId = form.querySelector('.income-id-field').value;
    const income = form.querySelector('.income-field').value;
    const month = months.indexOf(monthDropdown.value);
    const year = new Date().getFullYear().toString();
    let formSubmitData;
    if(incomeId){
        formSubmitData = await fetch("/income-transactions/"+incomeId, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                month,
                year,
                amount: income,
                spentTotal: monthlyGrantTotal,
            }),
        });
    }else{
        formSubmitData = await fetch("/income-transactions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                month,
                year,
                amount: income,
                spentTotal: monthlyGrantTotal,
            }),
        });
    }
    
    formSubmitData = await formSubmitData.json();
    if(formSubmitData.status){
        $('#updateIncomeModal').modal('hide');
        await showStatusMessage('Updated successfuly!', 'true', [loadIncome]);
    }else{
        await showStatusMessage(formSubmitData.error, 'false');
    }
});

$('#update-category-form').on("submit", async function (e) {
    e.preventDefault();
    const formDataArray = $(this).serializeArray();
    const formDataJson = {};
    $.each(formDataArray, function(_, field) {
        formDataJson[field.name] = field.value;
    });
    const categoryId = formDataJson['categoryId'];
    let formSubmitData = await fetch("/categories/"+categoryId, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: formDataJson.name
        }),
    });
    formSubmitData = await formSubmitData.json();
    if(formSubmitData.status){
        $('#updateCategoryModal').modal('hide');
        await showStatusMessage('Updated successfuly!', 'true', [loadCategories, loadExpenses, loadBudgets]);
    }else{
        await showStatusMessage(formSubmitData.error, 'false');
    }
});
$(".show-panel").on("click", function (event){
    const buttonName = $(this).attr("butn-name");
    if(buttonName == "budgets"){
        $("#categories-body").removeClass("in");
    }else if(buttonName == "categories"){
        $("#budget-body").removeClass("in");
    }
})

window.onload = async function(){
    await loadCategories();
    await loadExpenses();
    await loadBudgets();
    await loadIncome();
};
