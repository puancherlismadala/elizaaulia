document.addEventListener('DOMContentLoaded', () => {
    // 1. Definisikan Elemen HTML (Sama seperti sebelumnya)
    const authPage = document.getElementById('auth-page');
    const dashboardPage = document.getElementById('dashboard-page');
    const usernameInput = document.getElementById('username-input');
    const startAppBtn = document.getElementById('start-app-btn');
    const greetingText = document.getElementById('greeting-text');

    const budgetPeriodSelect = document.getElementById('budget-period');
    const budgetAmountInput = document.getElementById('budget-amount-input');
    const setBudgetBtn = document.getElementById('set-budget-btn');
    const currentBudgetDisplay = document.getElementById('current-budget');
    const currentPeriodDisplay = document.getElementById('current-period');
    const remainingAmountDisplay = document.getElementById('remaining-amount');
    const expenseDescriptionInput = document.getElementById('expense-description');
    const expenseAmountInput = document.getElementById('expense-amount');
    const addExpenseBtn = document.getElementById('add-expense-btn');
    const expenseList = document.getElementById('expense-list');
    const totalSpentDisplay = document.getElementById('total-spent');
    const summaryPeriodDisplay = document.getElementById('summary-period');
    const alertMessage = document.getElementById('alert-message');
    const currentDateDisplay = document.getElementById('current-date');

    // 2. Inisialisasi Data Global (TANPA localStorage)
    let userData = {
        username: '',
        dailyBudget: 50000,
        weeklyBudget: 300000,
        monthlyBudget: 1200000,
        currentPeriod: 'daily',
        expenses: [] 
    };

    // 3. Fungsi Pembantu untuk Format Rupiah
    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number);
    };

    // 4. Manajemen Halaman (Auth dan Dashboard)
    const initializePage = () => {
        authPage.classList.add('active');
        dashboardPage.classList.add('hidden');

        const today = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        currentDateDisplay.textContent = `Tanggal: ${today.toLocaleDateString('id-ID', options)}`;
        
        usernameInput.value = '';
    };

    const showDashboard = (username) => {
        userData.username = username;
        greetingText.textContent = `Halo, ${username}! 💸`;
        authPage.classList.remove('active');
        authPage.classList.add('hidden');
        dashboardPage.classList.remove('hidden');
        dashboardPage.classList.add('active');
        
        initializeAppDefaults();
    };

    const initializeAppDefaults = () => {
        const budgetKey = `${userData.currentPeriod}Budget`;
        budgetAmountInput.value = userData[budgetKey];
        budgetPeriodSelect.value = userData.currentPeriod;
        
        updateBudgetDisplay();
        renderExpenseList(); 
    };

    startAppBtn.addEventListener('click', () => {
        const username = usernameInput.value.trim();
        if (username) {
            showDashboard(username);
        } else {
            alert('Masukkan nama pengguna untuk memulai!');
        }
    });

    // 5. Fungsi Utama: Update Tampilan Anggaran (SAMA)
    const updateBudgetDisplay = () => {
        const budgetKey = `${userData.currentPeriod}Budget`;
        const currentBudget = userData[budgetKey];
        
        const now = new Date();
        let periodStart;
        if (userData.currentPeriod === 'daily') {
            periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        } else if (userData.currentPeriod === 'weekly') {
            const firstDayOfWeek = now.getDate() - now.getDay();
            periodStart = new Date(now.getFullYear(), now.getMonth(), firstDayOfWeek);
        } else {
            periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        const periodExpenses = userData.expenses.filter(expense => {
            return new Date(expense.timestamp) >= periodStart;
        });

        const totalSpent = periodExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        const remaining = currentBudget - totalSpent;
        
        currentPeriodDisplay.textContent = userData.currentPeriod === 'daily' ? 'Harian' : userData.currentPeriod === 'weekly' ? 'Mingguan' : 'Bulanan';
        summaryPeriodDisplay.textContent = currentPeriodDisplay.textContent;
        currentBudgetDisplay.textContent = formatRupiah(currentBudget);
        remainingAmountDisplay.textContent = formatRupiah(remaining);
        totalSpentDisplay.textContent = formatRupiah(totalSpent);

        if (remaining >= currentBudget * 0.2) {
            remainingAmountDisplay.style.color = 'var(--success-color)';
        } else if (remaining > 0) {
            remainingAmountDisplay.style.color = '#FF9800';
        } else {
            remainingAmountDisplay.style.color = 'var(--danger-color)';
        }

        showAlert(remaining, currentBudget);
    };

    // 6. Fungsi: Tampilkan Peringatan & Tips (SAMA)
    const showAlert = (remaining, currentBudget) => {
        alertMessage.classList.remove('success', 'warning', 'danger', 'hidden');
        alertMessage.innerHTML = '';
        
        if (remaining < 0) {
            const overspent = Math.abs(remaining);
            alertMessage.classList.add('danger');
            alertMessage.innerHTML = `🚨 **KRISIS ANGGARAN!** Kamu sudah melebihi batas **${currentPeriodDisplay.textContent}** sebesar **${formatRupiah(overspent)}**. <br> **TINDAKAN:** **TIDAK ADA LAGI** pengeluaran yang diperbolehkan hari ini!`;
        } else if (remaining <= currentBudget * 0.2 && remaining > 0) {
            alertMessage.classList.add('warning');
            alertMessage.innerHTML = `⚠️ **Perhatian!** Sisa anggaran **${currentPeriodDisplay.textContent}** tinggal sedikit (${formatRupiah(remaining)}). <br> **Tips Cermat:** Prioritaskan kebutuhan!`;
        } else if (currentBudget - remaining > 0) {
            alertMessage.classList.add('success');
            alertMessage.innerHTML = `👍 **Keren!** Kamu masih punya ${formatRupiah(remaining)}! <br> **Tips Cermat:** Pertahankan kebiasaan ini!`;
        } else {
            alertMessage.classList.add('hidden'); 
        }
    };


    // 7. Fungsi: Tambah Pengeluaran Baru
    const addExpense = () => {
        const description = expenseDescriptionInput.value.trim();
        const amount = parseInt(expenseAmountInput.value);

        if (description === '' || isNaN(amount) || amount <= 0) {
            alert('Deskripsi dan Jumlah pengeluaran harus diisi dengan benar!');
            return;
        }

        // Ambil Anggaran Saat Ini dan Hitung Total Pengeluaran Saat Ini
        const budgetKey = `${userData.currentPeriod}Budget`;
        const currentBudget = userData[budgetKey];
        const now = new Date();
        let periodStart;
        if (userData.currentPeriod === 'daily') {
            periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        } else if (userData.currentPeriod === 'weekly') {
            const firstDayOfWeek = now.getDate() - now.getDay();
            periodStart = new Date(now.getFullYear(), now.getMonth(), firstDayOfWeek);
        } else {
            periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        }
        const periodExpenses = userData.expenses.filter(expense => {
            return new Date(expense.timestamp) >= periodStart;
        });
        const totalSpentBeforeNew = periodExpenses.reduce((sum, expense) => sum + expense.amount, 0);

        const newTotalSpent = totalSpentBeforeNew + amount;
        
        // Cek Peringatan Khusus Jika Pengeluaran Melebihi Batas
        if (newTotalSpent > currentBudget) {
            const overspent = newTotalSpent - currentBudget;
             alertMessage.classList.remove('hidden', 'success', 'warning');
             alertMessage.classList.add('danger');
             alertMessage.innerHTML = `🛑 **PENTING!** Pengeluaran ini akan membuat kamu **MELEBIHI BATAS** anggaran ${currentPeriodDisplay.textContent} sebesar ${formatRupiah(overspent)}. **Yakin ingin mencatatnya?** (Klik 'TAMBAH' lagi jika yakin)`;
             
             expenseAmountInput.focus();
        } else {
             alertMessage.classList.add('hidden');
        }


        // Proses Pencatatan Pengeluaran
        // **Fokus: Mengambil waktu (jam dan menit) saat ini secara otomatis**
        const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        const newExpense = {
            description,
            amount,
            time: timeString, // <-- Nilai ini disimpan
            timestamp: now.getTime(),
            id: Date.now()
        };

        userData.expenses.push(newExpense);
        
        renderExpenseList();
        updateBudgetDisplay(); 
        
        expenseDescriptionInput.value = '';
        expenseAmountInput.value = '';
        expenseDescriptionInput.focus();
    };

    // 8. Fungsi: Render (Menampilkan) Daftar SEMUA Pengeluaran
    const renderExpenseList = () => {
        expenseList.innerHTML = ''; 
        
        const sortedExpenses = [...userData.expenses].sort((a, b) => b.id - a.id);

        if (sortedExpenses.length === 0) {
             expenseList.innerHTML = '<li style="justify-content: center; color: #888;">Belum ada pengeluaran yang dicatat. Mulai catat sekarang!</li>';
             return;
        }

        sortedExpenses.forEach(expense => {
            const date = new Date(expense.timestamp);
            const dateString = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <div class="expense-info">
                    <strong>${expense.description}</strong>
                    <span class="expense-time">${dateString} | Pukul ${expense.time}</span> 
                </div>
                <span class="expense-amount">${formatRupiah(expense.amount)}</span>
            `;
            expenseList.appendChild(listItem);
        });
    };
    
    // 9. Event Listeners (SAMA)
    setBudgetBtn.addEventListener('click', () => {
        const newBudget = parseInt(budgetAmountInput.value);
        const newPeriod = budgetPeriodSelect.value;
        const budgetKey = `${newPeriod}Budget`;

        if (!isNaN(newBudget) && newBudget > 0) {
            userData[budgetKey] = newBudget;
            userData.currentPeriod = newPeriod;
            updateBudgetDisplay();

            alertMessage.classList.remove('hidden', 'danger', 'warning');
            alertMessage.classList.add('success');
            alertMessage.innerHTML = `🎉 Anggaran **${currentPeriodDisplay.textContent}** berhasil diatur menjadi ${formatRupiah(newBudget)}!`;
            
            setTimeout(() => { alertMessage.classList.add('hidden'); }, 3000);
        } else {
            alert('Masukkan batas anggaran yang valid (angka positif).');
        }
    });

    budgetPeriodSelect.addEventListener('change', (e) => {
        userData.currentPeriod = e.target.value;
        const budgetKey = `${userData.currentPeriod}Budget`;
        budgetAmountInput.value = userData[budgetKey];
        updateBudgetDisplay();
    });

    addExpenseBtn.addEventListener('click', addExpense);
    
    expenseAmountInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addExpense();
        }
    });

    // 10. Inisialisasi Tampilan
    initializePage();
});