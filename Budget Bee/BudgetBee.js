function setBudget() {
    const budgetInput = document.getElementById('monthly-budget');
    const budget = parseFloat(budgetInput.value);
    if (budget > 0) {
        localStorage.setItem('budgetLimit', budget);
        localStorage.setItem('expenses', JSON.stringify([]));
        document.getElementById('setup-budget').style.display = 'none';
        document.getElementById('expense-tracker').style.display = 'block';
        renderTable([]);
        updateBudgetStatus();
    } else {
        alert("Please enter a valid budget amount.");
    }
}

window.onload = () => {
    if (!localStorage.getItem('budgetLimit')) {
        document.getElementById('setup-budget').style.display = 'flex';
    } else {
        document.getElementById('expense-tracker').style.display = 'block';
        const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
        renderTable(expenses);
        updateBudgetStatus(expenses);
    }
};

document.getElementById('expense-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const date = document.getElementById('date').value;
    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value).toFixed(2);
    if (date && category && description && amount > 0) {
        const expense = {
            date,
            category,
            description,
            amount
        };
        let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
        expenses.push(expense);
        localStorage.setItem('expenses', JSON.stringify(expenses));
        renderTable(expenses);
        updateBudgetStatus(expenses);
        document.getElementById('expense-form').reset();
    } else {
        alert("Please fill out all fields correctly.");
    }
});

function renderTable(expenses) {
    expenses.sort((a, b) => new Date(a.date) - new Date(b.date));
    let tableHTML = '<table><thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Amount ($)</th><th>Actions</th></tr></thead><tbody>';
    expenses.forEach((exp, index) => {
        tableHTML += `<tr class="${exp.category}">
            <td>${exp.date}</td>
            <td>${exp.category}</td>
            <td>${exp.description}</td>
            <td>${exp.amount}</td>
            <td>
                <button onclick="editExpense(${index})">Edit</button>
                <button onclick="deleteExpense(${index})">Delete</button>
            </td>
        </tr>`;
    });
    tableHTML += '</tbody></table>';
    document.getElementById('expense-table').innerHTML = tableHTML;
}

function updateBudgetStatus(expenses = JSON.parse(localStorage.getItem('expenses')) || []) {
    const budgetLimit = parseFloat(localStorage.getItem('budgetLimit'));
    let totalSpent = expenses.reduce((acc, exp) => acc + parseFloat(exp.amount), 0);
    const remaining = (budgetLimit - totalSpent).toFixed(2);

    const budgetStatus = document.getElementById('budget-status');
    const remainingBudget = document.getElementById('remaining-budget');
    const remainingAnalyze = document.getElementById('remaining-analyze');

    if (totalSpent <= budgetLimit) {
        budgetStatus.className = 'green';
        budgetStatus.textContent = `Within budget: You have spent $${totalSpent} out of your $${budgetLimit} budget.`;
    } else {
        budgetStatus.className = 'red';
        budgetStatus.textContent = `Budget exceeded: You have spent $${totalSpent} out of your $${budgetLimit} budget.`;
    }
    remainingBudget.textContent = `Remaining: $${remaining}`;
    remainingAnalyze.textContent = `Remaining: $${remaining}`;
}

function editExpense(index) {
    const expenses = JSON.parse(localStorage.getItem('expenses'));
    const exp = expenses[index];
    document.getElementById('date').value = exp.date;
    document.getElementById('category').value = exp.category;
    document.getElementById('description').value = exp.description;
    document.getElementById('amount').value = exp.amount;
    deleteExpense(index);
}

function deleteExpense(index) {
    let expenses = JSON.parse(localStorage.getItem('expenses'));
    expenses.splice(index, 1);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    renderTable(expenses);
    updateBudgetStatus(expenses);
}

function clearExpenses() {
    if (confirm("Are you sure you want to clear all expenses?")) {
        localStorage.setItem('expenses', JSON.stringify([]));
        renderTable([]);
        updateBudgetStatus([]);
    }
}

function showChart() {
    const chartContainer = document.getElementById('chart-container');
    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];

    if (chartContainer.style.display === 'none') {
        chartContainer.style.display = 'block';
        updateBudgetStatus(expenses);
        renderChart(expenses);
    } else {
        chartContainer.style.display = 'none';
    }
}

function renderChart(expenses) {
    const categoryTotals = expenses.reduce((totals, exp) => {
        totals[exp.category] = (totals[exp.category] || 0) + parseFloat(exp.amount);
        return totals;
    }, {});

    const categories = Object.keys(categoryTotals);
    const amounts = Object.values(categoryTotals);

    const ctx = document.getElementById('expense-chart').getContext('2d');

    // Destroy any existing chart instance to avoid overlap
    if (window.expenseChart) {
        window.expenseChart.destroy();
    }

    // Create new pie chart
    window.expenseChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: categories,
            datasets: [{
                data: amounts,
                backgroundColor: ['#ffb3b3', '#ffdab3', '#ffffb3', '#b3ffb3', '#b3e6ff', '#dab3ff', '#ffb3da'],
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                },
            },
        }
    });
}