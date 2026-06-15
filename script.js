// ====== DOM elements ======
const balanceEl = document.getElementById("balance");
const incomeAmountEl = document.getElementById("income-amount");
const expenseAmountEl = document.getElementById("expense-amount");
const transactionListEl = document.getElementById("transaction-list");
const transactionFormEl = document.getElementById("transaction-form");
const descriptionEl = document.getElementById("description");
const amountEl = document.getElementById("amount");

// ====== LocalStorage helpers ======
function saveTransactions() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function loadTransactions() {
  const saved = localStorage.getItem("transactions");
  return saved ? JSON.parse(saved) : [];
}

// ====== State ======
let transactions = loadTransactions();
let editingId = null; // ⭐ নতুন: কোন transaction edit হচ্ছে

// ====== Event listeners ======
transactionFormEl.addEventListener("submit", addTransaction);

// ====== Add Transaction ======
function addTransaction(e) {
  e.preventDefault();
  const description = descriptionEl.value.trim();
  const amount = parseFloat(amountEl.value);

  if (description === "" || isNaN(amount)) {
    alert("Please enter a description and a valid amount.");
    return;
  }

  transactions.push({
    id: Date.now(),
    description,
    amount,
  });

  saveTransactions();
  updateTransactionList();
  updateSummary();
  transactionFormEl.reset();
}

// ====== Render Transaction List ======
function updateTransactionList() {
  transactionListEl.innerHTML = "";
  const sortedTransactions = [...transactions].reverse();
  sortedTransactions.forEach((transaction) => {
    const transactionEl = createTransactionElement(transaction);
    transactionListEl.appendChild(transactionEl);
  });
}

// ====== Create Each Transaction Element ======
function createTransactionElement(transaction) {
  const li = document.createElement("li");
  li.classList.add("transaction");
  li.classList.add(transaction.amount > 0 ? "income" : "expense");

  // ⭐ Check: এই transaction edit mode এ আছে কিনা
  if (editingId === transaction.id) {
    // ===== EDIT MODE =====
    li.classList.add("editing");
    li.innerHTML = `
      <input 
        type="text" 
        class="edit-input description" 
        id="edit-desc-${transaction.id}" 
        value="${transaction.description}"
      />
      <span>
        <input 
          type="number" 
          class="edit-input amount" 
          id="edit-amount-${transaction.id}" 
          value="${transaction.amount}"
        />
        <button class="save-btn" onclick="saveEdit(${transaction.id})">Save</button>
        <button class="cancel-btn" onclick="cancelEdit()">Cancel</button>
      </span>
    `;
  } else {
    // ===== NORMAL MODE =====
    li.innerHTML = `
      <span>${transaction.description}</span>
      <span>
        ${formatCurrency(transaction.amount)}
        <button class="edit-btn" onclick="startEdit(${transaction.id})">✎</button>
        <button class="delete-btn" onclick="removeTransaction(${transaction.id})">x</button>
      </span>
    `;
  }

  return li;
}

// ====== Update Summary ======
function updateSummary() {
  const balance = transactions.reduce(
    (acc, transaction) => acc + transaction.amount,
    0
  );
  const income = transactions
    .filter((transaction) => transaction.amount > 0)
    .reduce((acc, transaction) => acc + transaction.amount, 0);
  const expenses = transactions
    .filter((transaction) => transaction.amount < 0)
    .reduce((acc, transaction) => acc + transaction.amount, 0);

  balanceEl.textContent = formatCurrency(balance);
  incomeAmountEl.textContent = formatCurrency(income);
  expenseAmountEl.textContent = formatCurrency(expenses);
}

// ====== Format Currency ======
function formatCurrency(number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(number);
}

// ====== Remove Transaction ======
function removeTransaction(id) {
  transactions = transactions.filter((transaction) => transaction.id !== id);
  saveTransactions();
  updateTransactionList();
  updateSummary();
}

// ⭐ ====== Start Edit Mode ======
function startEdit(id) {
  editingId = id;
  updateTransactionList();
}

// ⭐ ====== Cancel Edit ======
function cancelEdit() {
  editingId = null;
  updateTransactionList();
}

// ⭐ ====== Save Edited Transaction ======
function saveEdit(id) {
  const descInput = document.getElementById(`edit-desc-${id}`);
  const amountInput = document.getElementById(`edit-amount-${id}`);

  const newDescription = descInput.value.trim();
  const newAmount = parseFloat(amountInput.value);

  // Validation
  if (newDescription === "" || isNaN(newAmount)) {
    alert("Please enter a valid description and amount.");
    return;
  }

  // Update the transaction in array
  transactions = transactions.map((transaction) => {
    if (transaction.id === id) {
      return {
        ...transaction,
        description: newDescription,
        amount: newAmount,
      };
    }
    return transaction;
  });

  editingId = null;
  saveTransactions();
  updateTransactionList();
  updateSummary();
}

// ====== Initial render ======
updateTransactionList();
updateSummary();