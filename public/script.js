
const allExpenses = {};
let categories = [];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const select = document.getElementById("month");
months.forEach((month, index) => {
    let option = document.createElement("option");
    option.value = month;
    option.text = month;
    select.appendChild(option);
});
let currentMonth = new Date().toLocaleString('en-US', { month: 'short' });
select.value = currentMonth;
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
    const submitButton = document.getElementById("submit-btn");
    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";
    const formDataArray = [];
    const dateFields = document.querySelectorAll(".date-field");
    const amountFields = document.querySelectorAll(".amount-field");
    const categoryFields = document.querySelectorAll(".category-field");
    const descriptionFields = document.querySelectorAll(".description-field");

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
    formSubmitData = await formSubmitData.json();
    if(formSubmitData.status){
        showStatusMessage("Added Successfully!", 'true');
    }else{
        showStatusMessage(formSubmitData.error, 'false');
    }
    submitButton.disabled = false;
    submitButton.textContent = "Submit";
});
function onCancelClick(event){
    document.getElementById('add-expense-form').classList.add('hide');
    document.getElementById('add-expense-btn').classList.remove('hide');
    // document.getElementById('add-expense-form').style.display = 'none';
}
function onAddExpenseClick(event){
    event.classList.add('hide');
    document.getElementById('add-expense-form').classList.remove('hide');
    // document.getElementById('add-expense-form').style.display = 'block';
}
function showStatus(button){
    button.classList.add("hide");
    document.getElementById('hide-stats-btn').classList.remove("hide");
    document.getElementById('stats').classList.remove("hide");
}
function loadStats(changedMonth){
    const stats = {};
    allExpenses[changedMonth].forEach(e => {
        if(typeof stats[e.category] == 'undefined') stats[e.category] = 0;
        stats[e.category] += parseFloat(e.amount);
    });
    const statsTableBody = document.getElementById("stats-table-body");
    statsTableBody.innerHTML = '';
    for (const key in stats) {
        let row = statsTableBody.insertRow();
        let cell1 = row.insertCell(0);
        let cell2 = row.insertCell(1);
        cell1.innerHTML = key;
        cell2.innerHTML = stats[key].toLocaleString();
    }
}
function hideStatus(button){
    button.classList.add("hide");
    document.getElementById('show-stats-btn').classList.remove("hide");
    document.getElementById('stats').classList.add("hide");
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
        }, formStatus === "true" ? 1000 : 2000);
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
                    <div class="content date-content">${item.date}</div>
                    <div class="content-html hide">
                        <input type="date" name="date[]" class="date-field" value="${new Date().toISOString().split('T')[0]}" required>
                    </div>
                `;
                cell1.innerHTML = `
                    <div class="content description-content">${item.description}</div>
                    <div class="content-html hide">
                        <input type="text" name="description[]" class="description-field" placeholder="Description" value="${item.description}">
                    </div>
                    `;
                cell2.innerHTML = `
                    <div class="content category-content">${item.category}</div>
                    <div class="content-html hide">
                        <select name="category[]" class="category-field" required>
                            ${categories.map(e => `<option value="${e}" ${e === item.category ? 'selected' : ''}>${e}</option>`).join('')}
                        </select>
                    </div>
                `;
                cell3.innerHTML = `
                    <div class="content amount-content">${item.amount}</div>
                    <div class="content-html hide">
                        <input type="number" name="amount[]" class="amount-field" placeholder="Amount" value="${parseFloat(item.amount)}" required>
                    </div>`;
                cell4.innerHTML = `<td>
                        <div class="action-btns">
                            <input type="hidden" name="id" class="id-field" value="${item.id}">
                            <button class="edit-btn" onclick="editExpense(this)">Edit</button>
                            <button class="update-btn hide" onclick="updateExpense(this)">Update</button>
                            <button class="cancel-btn hide" onclick="cancelEditExpense(this)">Cancel</button>
                            <button class="delete-btn"  onclick="deleteExpense(this)">Delete</button>
                        </div>
                    </td>`;
                sum += parseFloat(item.amount);
            });
            loadStats(month);
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
    const date = tr.querySelector('.date-content').innerHTML;
    const description = tr.querySelector('.description-content').innerHTML;
    const category = tr.querySelector('.category-content').innerHTML;
    const amount = tr.querySelector('.amount-content').innerHTML;
    tr.querySelector('.date-field').value = new Date(formatDate(date)).toISOString().split('T')[0];
    tr.querySelector('.description-field').value = description;
    tr.querySelector('.category-field').value = category;
    tr.querySelector('.amount-field').value = amount;
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
        body: JSON.stringify({date, description, category, amount, currentMonth}),
    });
    formSubmitData = await formSubmitData.json();
    if(formSubmitData.status){
        tr.querySelector('.date-content').innerHTML = formatDate(date, false);
        tr.querySelector('.description-content').innerHTML = description;
        tr.querySelector('.category-content').innerHTML = category;
        tr.querySelector('.amount-content').innerHTML = amount;
        showStatusMessage('Updated successfuly!', 'true');
    }else{
        showStatusMessage(formSubmitData.error, 'false');
    }
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
async function deleteExpense(button) {
    let tr = button.closest('tr');
    button.disabled = true;
    button.textContent = "Deleting...";
    const id = tr.querySelector('.id-field').value;
    let formSubmitData = await fetch("/expenses/"+id, {
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
        showStatusMessage('Deleted successfuly!', 'true');
    }else{
        showStatusMessage(formSubmitData.error, 'false');
    }
    button.disabled = false;
    button.textContent = "Delete";
}

async function onMonthChange(event){
    currentMonth = event.value;
    await loadExpenses(event.value);
    loadStats(event.value);
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