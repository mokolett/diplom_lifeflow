let tasks = [];
let habits = [];

function loadData() {
    const savedTasks = localStorage.getItem('lifeflow_tasks');
    const savedHabits = localStorage.getItem('lifeflow_habits');
    if (savedTasks) tasks = JSON.parse(savedTasks);
    if (savedHabits) habits = JSON.parse(savedHabits);
}

function saveTasks() {
    localStorage.setItem('lifeflow_tasks', JSON.stringify(tasks));
}

function saveHabits() {
    localStorage.setItem('lifeflow_habits', JSON.stringify(habits));
}

function generateId() {
    return Date.now() + '-' + Math.random().toString(36).substr(2, 6);
}

function renderTasks() {
    const container = document.getElementById('taskList');
    if (!container) return;
    
    if (tasks.length === 0) {
        container.innerHTML = '<div style="text-align:center; color:#8f9bb3; padding: 20px;">Нет задач. Добавьте первую!</div>';
        return;
    }
    
    container.innerHTML = '';
    tasks.forEach(task => {
        const taskDiv = document.createElement('div');
        taskDiv.className = 'task-item' + (task.completed ? ' completed' : '');
        taskDiv.innerHTML = `
            <input type="checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}" class="task-checkbox">
            <span class="task-text">${escapeHtml(task.text)}</span>
            <button class="delete-btn" data-id="${task.id}">🗑</button>
        `;
        container.appendChild(taskDiv);
    });

    document.querySelectorAll('.task-checkbox').forEach(cb => {
        cb.addEventListener('change', (e) => {
            const id = e.target.dataset.id;
            const task = tasks.find(t => t.id == id);
            if (task) {
                task.completed = e.target.checked;
                saveTasks();
                renderTasks();
                renderStats();
            }
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            tasks = tasks.filter(t => t.id != id);
            saveTasks();
            renderTasks();
            renderStats();
        });
    });
}

function renderHabits() {
    const container = document.getElementById('habitList');
    if (!container) return;
    
    if (habits.length === 0) {
        container.innerHTML = '<div style="text-align:center; color:#8f9bb3; padding: 20px;">Добавьте первую привычку!</div>';
        updateHabitProgress();
        return;
    }
    
    container.innerHTML = '';
    habits.forEach(habit => {
        const habitDiv = document.createElement('div');
        habitDiv.className = 'habit-item';
        habitDiv.innerHTML = `
            <input type="checkbox" ${habit.completedToday ? 'checked' : ''} data-id="${habit.id}" class="habit-checkbox">
            <span class="habit-name">${escapeHtml(habit.name)}</span>
            <button class="delete-btn" data-id="${habit.id}">🗑</button>
        `;
        container.appendChild(habitDiv);
    });
    
    document.querySelectorAll('.habit-checkbox').forEach(cb => {
        cb.addEventListener('change', (e) => {
            const id = e.target.dataset.id;
            const habit = habits.find(h => h.id == id);
            if (habit) {
                habit.completedToday = e.target.checked;
                saveHabits();
                renderHabits();
                renderStats();
                updateHabitProgress();
            }
        });
    });
    
    document.querySelectorAll('.habit-list .delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            habits = habits.filter(h => h.id != id);
            saveHabits();
            renderHabits();
            renderStats();
        });
    });
    
    updateHabitProgress();
}

function updateHabitProgress() {
    const total = habits.length;
    const completed = habits.filter(h => h.completedToday).length;
    const percent = total === 0 ? 0 : (completed / total) * 100;
    const progressBar = document.getElementById('habitProgressFill');
    if (progressBar) {
        progressBar.style.width = percent + '%';
    }
}

function renderStats() {
    const tasksDone = tasks.filter(t => t.completed).length;
    const habitsDone = habits.filter(h => h.completedToday).length;
    
    const tasksDoneEl = document.getElementById('totalTasksDone');
    const habitsDoneEl = document.getElementById('habitsDoneToday');
    
    if (tasksDoneEl) tasksDoneEl.textContent = tasksDone;
    if (habitsDoneEl) habitsDoneEl.textContent = habitsDone;
}

function switchTab(tabId) {
    // Скрыть все экраны
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    const activeScreen = document.getElementById(tabId + 'Screen');
    if (activeScreen) activeScreen.classList.add('active');
    
    // Обновить стиль кнопок
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabId) {
            btn.classList.add('active');
        }
    });

    renderTasks();
    renderHabits();
    renderStats();
}

function addTask() {
    const input = document.getElementById('taskInput');
    const text = input.value.trim();
    if (!text) return;
    
    tasks.push({
        id: generateId(),
        text: text,
        completed: false
    });
    saveTasks();
    renderTasks();
    renderStats();
    input.value = '';
}

function addHabit() {
    const input = document.getElementById('habitInput');
    const name = input.value.trim();
    if (!name) return;
    
    habits.push({
        id: generateId(),
        name: name,
        completedToday: false
    });
    saveHabits();
    renderHabits();
    renderStats();
    input.value = '';
}

function resetAllData() {
    if (confirm('Вы уверены? Все задачи и привычки будут удалены безвозвратно.')) {
        tasks = [];
        habits = [];
        saveTasks();
        saveHabits();
        renderTasks();
        renderHabits();
        renderStats();
    }
}

function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    
    // Назначаем обработчики кнопок
    document.getElementById('addTaskBtn')?.addEventListener('click', addTask);
    document.getElementById('addHabitBtn')?.addEventListener('click', addHabit);
    document.getElementById('resetAllData')?.addEventListener('click', resetAllData);
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.dataset.tab);
        });
    });
    
    // Нажатие Enter в полях ввода
    document.getElementById('taskInput')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });
    document.getElementById('habitInput')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addHabit();
    });
    
    switchTab('todo');
});
