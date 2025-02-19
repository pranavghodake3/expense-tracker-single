
const allExpenses = {};
let categories = [];
document.getElementById("currentYear").innerHTML = new Date().getFullYear().toString();

document.getElementById("addField").addEventListener("click", function() {
    const container = document.getElementById("fieldsContainer");
    const newGroup = document.createElement("div");
    newGroup.classList.add("single-expense-form");
    newGroup.innerHTML = `
        <input type="date" name="date[]" class="date-field" required>
        <input type="number" name="amount[]" class="amount-field" placeholder="Amount" required>
        <select name="category[]" class="category-field" required>
            ${categories.map(e => `<option value="${e}" ${e === 'Other' ? 'selected' : ''}>${e}</option>`).join('')}
        </select>
        <input type="text" name="description[]" class="description-field" placeholder="Description">
        <button type="button" class="remove-btn">Remove</button>
    `;
    container.appendChild(newGroup);
    document.querySelectorAll(".date-field").forEach(input => {
        input.value = new Date().toISOString().split('T')[0];
    });
});
document.getElementById("fieldsContainer").addEventListener("click", function (event) {
    if (event.target.classList.contains("remove-btn")) {
        event.target.parentElement.remove();
    }
});

document.getElementById("add-expense-form").addEventListener("submit", async function(event) {
    event.preventDefault();
    const formDataArray = [];
    const dateFields = document.querySelectorAll(".date-field");
    const amountFields = document.querySelectorAll(".amount-field");
    const categoryFields = document.querySelectorAll(".category-field");
    const descriptionFields = document.querySelectorAll(".description-field");
    console.log("dateFields: ",dateFields)

    // Collect data from each form field group
    dateFields.forEach((dateField, index) => {
        formDataArray.push({
            date: dateFields[index].value,
            amount: amountFields[index].value,
            category: categoryFields[index].value,
            description: descriptionFields[index].value
        });
    });
    let formSubmitData = await fetch("/expenses", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(formDataArray),
    });
    console.log("formSubmitData: ",formSubmitData)
    showStatusMessage("Added Successfully!", 'true');
});
function onCancelClick(event){
    // document.getElementById('add-expense-form').classList.add('hide');
    document.getElementById('add-expense').classList.remove('hide');
    document.getElementById('add-expense-form').style.display = 'none';
}
function onAddExpenseClick(event){
    event.classList.add('hide');
    document.getElementById('add-expense-form').style.display = 'block';
}
document.querySelectorAll(".date-field").forEach(input => {
    input.value = new Date().toISOString().split('T')[0];
});
function showStatusMessage(formStatusMessage, formStatus){
    const formStatusElement = document.getElementById('form-status');
    formStatusElement.classList.remove('hide');
    if(formStatusMessage){
        formStatusElement.innerHTML = formStatusMessage;
        formStatusElement.classList.remove('hide');
        formStatusElement.classList.add(formStatus);
        setTimeout(() => {
            formStatusElement.classList.add('hide');
        }, formStatus === "true" ? 2000 : 10000);
    }
}

async function loadExpenses(month){
    const expensesTbody = document.getElementById("expenses");
    expensesTbody.innerHTML = '';
    let row = expensesTbody.insertRow();
    let cell1 = row.insertCell(0);
    cell1.colSpan = 5;
    cell1.style.textAlign  = "center";
    cell1.textContent = "Loadding...";
    // expensesTbody.innerHTML = 'Loadding...';
    let data = await fetch('/expenses?month='+month);
    data = await data.json();
    if(data.status){
        expensesTbody.innerHTML = '';
        let sum = 0;
        allExpenses[month] = data.data.expenses;
        if(data.data.expenses.length > 0){
            data.data.expenses.forEach(item => {
                let row = expensesTbody.insertRow();
                let cell0 = row.insertCell(0);
                let cell1 = row.insertCell(1);
                let cell2 = row.insertCell(2);
                let cell3 = row.insertCell(3);
                let cell4 = row.insertCell(4);
                cell0.innerHTML = `
                    <div class="content">${item.date}</div>
                    <div class="content-html hide">
                        <input type="date" name="date[]" class="date-field" value="${new Date().toISOString().split('T')[0]}" required>
                    </div>
                `;
                // cell0.querySelector('.date-field').value = new Date(item.date).toISOString().split('T')[0];
                cell1.innerHTML = `
                    <div class="content">${item.description}</div>
                    <div class="content-html hide">
                        <input type="text" name="description[]" class="description-field" placeholder="Description" value="${item.description}">
                    </div>
                    `;
                cell2.innerHTML = `
                    <div class="content">${item.category}</div>
                    <div class="content-html hide">
                        <select name="category[]" class="category-field" required>
                            ${categories.map(e => `<option value="${e}" ${e === item.category ? 'selected' : ''}>${e}</option>`).join('')}
                        </select>
                    </div>
                `;
                cell3.innerHTML = `
                    <div class="content">${item.amount}</div>
                    <div class="content-html hide">
                        <input type="number" name="amount[]" class="amount-field" placeholder="Amount" value="${parseFloat(item.amount)}" required>
                    </div>`;
                cell4.innerHTML = `<td>
                        <div class="action-btns">
                            <input type="hidden" name="id" class="id-field" value="${item.id}">
                            <button class="edit-btn" onclick="editExpense(this)">Edit</button>
                            <button class="update-btn" onclick="updateExpense(this)">Update</button>
                            <button class="cancel-btn" onclick="cancelEditExpense(this)">Cancel</button>
                            <button class="delete-btn">Delete</button>
                        </div>
                    </td>`;
                sum += parseFloat(item.amount);
            });
        }else{
            let row = expensesTbody.insertRow();
            let cell1 = row.insertCell(0);
            cell1.colSpan = 5;
            cell1.style.textAlign  = "center";
            cell1.textContent = "No expenses";
        }
        document.getElementById("sum").innerHTML = sum.toLocaleString();
    }else{
        showStatusMessage(data.error, 'false');
    }
}
function editExpense(button) {
    let tr = button.closest('tr');
    tr.querySelector('.edit-btn').classList.add('hide');
    tr.querySelector('.update-btn').classList.remove('hide');
    tr.querySelector('.cancel-btn').classList.remove('hide');
    tr.querySelectorAll(".content").forEach(contentDiv => {
        contentDiv.style.display = 'none';
    });
    tr.querySelectorAll(".content-html").forEach(contentHtmlDiv => {
        contentHtmlDiv.style.display = 'block';
    });
}
async function updateExpense(button) {
    let tr = button.closest('tr');
    const id = tr.querySelector('.id-field').value;
    const date = tr.querySelector('.date-field').value;
    const description = tr.querySelector('.description-field').value;
    const category = tr.querySelector('.category-field').value;
    const amount = tr.querySelector('.amount-field').value;
    tr.querySelector('.edit-btn').classList.remove('hide');
    tr.querySelector('.update-btn').classList.add('hide');
    tr.querySelector('.cancel-btn').classList.add('hide');
    tr.querySelectorAll(".content").forEach(contentDiv => {
        contentDiv.style.display = 'block';
    });
    tr.querySelectorAll(".content-html").forEach(contentHtmlDiv => {
        contentHtmlDiv.style.display = 'none';
    });
    let formSubmitData = await fetch("/expenses/"+id, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({date, description, category, amount}),
    });
    console.log("formSubmitData: ",formSubmitData)
}
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

// Month
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const select = document.getElementById("month");
months.forEach((month, index) => {
    let option = document.createElement("option");
    option.value = month;
    option.text = month;
    select.appendChild(option);
});
const currentMonth = new Date().toLocaleString('en-US', { month: 'short' });
select.value = currentMonth;
async function onMonthChange(event){
    await loadExpenses(event.value);
}
async function loadCategories(){
    let data = await fetch('/categories');
    data = await data.json();
    categories = data.data.categories;
    const select = document.getElementsByClassName("category-field")[0];
    data.data.categories.forEach(category => {
        let option = document.createElement("option");
        option.value = category;
        option.text = category;
        if(category === 'Other')    option.selected = true;
        select.appendChild(option);
    });
}
// window.onload = loadExpenses(currentMonth);
window.onload = async function(){
    await loadCategories();
    await loadExpenses(currentMonth);
};