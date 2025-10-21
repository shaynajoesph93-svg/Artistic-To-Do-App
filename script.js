// =======================================================
// Global Data Array & Data Persistence (Phase 3)
// =======================================================
let tasks = loadTasks();

function loadTasks() {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
}
// Global sorting state variable (default is to sort by priority)
let currentSortMode = localStorage.getItem('sortMode') || 'priority'; 

// New DOM Selector
const sortDateBtn = document.getElementById('sort-due-date-btn');

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// =======================================================
// DOM Element Selectors 
// =======================================================
const taskForm = document.getElementById('new-task-form');
const taskInput = document.getElementById('task-input');
const categorySelect = document.getElementById('category-select');
const dueDateInput = document.getElementById('due-date');

const workTasksList = document.getElementById('work-tasks');
const schoolTasksList = document.getElementById('school-tasks');
const lifeTasksList = document.getElementById('life-tasks');
const themeToggle = document.getElementById('theme-toggle');


// =======================================================
// Task Creation (Phase 1, 2, Y, Z)
// =======================================================
taskForm.addEventListener('submit', (e) => {
    e.preventDefault(); 
    const taskText = taskInput.value.trim();
    
    if (taskText === '') {
        alert('Please enter a task description.');
        return;
    }

    const newTask = {
        id: Date.now(),
        text: taskText,
        category: categorySelect.value, 
        dueDate: dueDateInput.value,    
        completed: false,
        priority: false,                
    };

    tasks.push(newTask);
    saveTasks(); 
    renderTasks();
    
    // Reset inputs
    taskInput.value = '';
    dueDateInput.value = '';
    categorySelect.value = 'work';
});


/**
 * Renders all tasks from the 'tasks' array into their respective categories.
 */
function renderTasks() {
    // Clear the current lists
    workTasksList.innerHTML = '';
    schoolTasksList.innerHTML = ''; 
    lifeTasksList.innerHTML = '';   

    // Sort the tasks: high priority first, then incomplete tasks first
    const sortedTasks = tasks.sort((a, b) => {
        if (a.priority !== b.priority) return b.priority - a.priority;
        if (a.completed !== b.completed) return a.completed - b.completed;
        return a.text.localeCompare(b.text);
    });

    sortedTasks.forEach(task => {
        const taskElement = createTaskElement(task);

        // Phase 2: Append to the correct category list
        if (task.category === 'work') {
            workTasksList.appendChild(taskElement);
        } else if (task.category === 'school') {
            schoolTasksList.appendChild(taskElement);
        } else if (task.category === 'life') {
            lifeTasksList.appendChild(taskElement);
        }
    });
}


function createTaskElement(task) {
    const li = document.createElement('li');
    li.classList.add('task-item');
    li.classList.toggle('completed', task.completed); 
    li.dataset.id = task.id; 
    li.classList.toggle('high-priority', task.priority);

    // Build the inner HTML structure including priority, complete, and delete buttons
    li.innerHTML = `
        <div class="task-info">
            <span class="task-text">${task.text}</span>
            <span class="task-due-date">${task.dueDate ? 'Due: ' + task.dueDate : ''}</span>
        </div>
        <div class="task-actions">
            <button class="btn priority-btn" data-action="priority" aria-label="Toggle priority">
                ⭐
            </button>
            <input type="checkbox" class="complete-checkbox" ${task.completed ? 'checked' : ''} data-action="complete">
            <button class="btn delete-btn" data-action="delete" aria-label="Delete task">
                &times;
            </button>
        </div>
    `;

    return li;
}

// =======================================================
// Action Handlers (Complete, Delete, Priority)
// =======================================================
document.addEventListener('click', (e) => {
    const taskItem = e.target.closest('.task-item');
    if (!taskItem) return;

    const taskId = Number(taskItem.dataset.id);
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return; 

    const action = e.target.dataset.action;

    if (action === 'complete') {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        saveTasks();
        renderTasks();
    } 
    else if (action === 'delete') {
        tasks.splice(taskIndex, 1);
        saveTasks();
        renderTasks(); 
    }
    else if (action === 'priority') { 
        tasks[taskIndex].priority = !tasks[taskIndex].priority;
        saveTasks();
        renderTasks(); 
    }
});

// =======================================================
// Phase X: Dark Mode Toggle Implementation
// =======================================================
function loadTheme() {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '☀️'; 
    } else {
        themeToggle.textContent = '🎨'; 
    }
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
        themeToggle.textContent = '☀️';
    } else {
        localStorage.setItem('theme', 'light');
        localStorage.setItem('theme', 'light');
        themeToggle.textContent = '🎨';
    }
});

// Initialization: Display existing tasks when the page loads
loadTheme();
renderTasks();

/**
 * Renders all tasks, applying the current sort mode.
 */
function renderTasks() {
    // Clear the current lists
    workTasksList.innerHTML = '';
    schoolTasksList.innerHTML = ''; 
    lifeTasksList.innerHTML = '';   

    // 1. Define the sorting logic based on the global state
    let sortedTasks = [...tasks]; // Create a shallow copy to sort

    if (currentSortMode === 'due-date') {
        // Sort by earliest due date first. Tasks without a due date go last.
        sortedTasks.sort((a, b) => {
            if (!a.dueDate) return 1; // a moves to the end
            if (!b.dueDate) return -1; // b moves to the end
            return new Date(a.dueDate) - new Date(b.dueDate);
        });
        sortDateBtn.textContent = 'Sort: Due Date First (Active)';
    } else { // 'priority' mode
        // Default sort: high priority first, then incomplete tasks
        sortedTasks.sort((a, b) => {
            if (a.priority !== b.priority) return b.priority - a.priority;
            if (a.completed !== b.completed) return a.completed - b.completed;
            return a.text.localeCompare(b.text);
        });
        sortDateBtn.textContent = 'Sort: Priority First';
    }

    // 2. Render the sorted tasks
    sortedTasks.forEach(task => {
        const taskElement = createTaskElement(task);
        if (task.category === 'work') {
            workTasksList.appendChild(taskElement);
        } else if (task.category === 'school') {
            schoolTasksList.appendChild(taskElement);
        } else if (task.category === 'life') {
            lifeTasksList.appendChild(taskElement);
        }
    });
}

// =======================================================
// Phase Z: Sort by Due Date Toggle
// =======================================================
sortDateBtn.addEventListener('click', () => {
    // Toggle the sort mode
    currentSortMode = (currentSortMode === 'priority') ? 'due-date' : 'priority';
    localStorage.setItem('sortMode', currentSortMode);
    renderTasks();
});