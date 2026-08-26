/* =========================================================
   Ahmed Nadeem — Interactive To-Do List
   Vanilla JS: DOM manipulation, event listeners, localStorage
   ========================================================= */

(function () {
  'use strict';

  const STORAGE_KEY = 'ahmed-todo-tasks';

  /** @type {{id: string, text: string, completed: boolean}[]} */
  let tasks = [];
  let currentFilter = 'all';

  // ---------- DOM references ----------
  const addForm = document.getElementById('addForm');
  const taskInput = document.getElementById('taskInput');
  const taskList = document.getElementById('taskList');
  const emptyState = document.getElementById('emptyState');
  const emptyMessage = document.getElementById('emptyMessage');
  const emptySubMessage = document.getElementById('emptySubMessage');
  const itemsLeft = document.getElementById('itemsLeft');
  const clearCompletedBtn = document.getElementById('clearCompleted');
  const progressFill = document.getElementById('progressFill');
  const filterBtns = document.querySelectorAll('.filter-btn');

  // ---------- localStorage helpers ----------
  function loadTasks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      tasks = raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.warn('Could not read saved tasks, starting fresh.', err);
      tasks = [];
    }
  }

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (err) {
      console.warn('Could not save tasks to localStorage.', err);
    }
  }

  // ---------- Task operations ----------
  function addTask(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    tasks.unshift({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      text: trimmed,
      completed: false
    });
    saveTasks();
    render();
  }

  function toggleTask(id) {
    tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    saveTasks();
    render();
  }

  function deleteTask(id) {
    const el = taskList.querySelector(`[data-id="${id}"]`);
    if (el) {
      el.classList.add('removing');
      el.addEventListener('animationend', () => {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        render();
      }, { once: true });
    } else {
      tasks = tasks.filter(t => t.id !== id);
      saveTasks();
      render();
    }
  }

  function clearCompleted() {
    tasks = tasks.filter(t => !t.completed);
    saveTasks();
    render();
  }

  // ---------- Rendering ----------
  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function getFilteredTasks() {
    if (currentFilter === 'active') return tasks.filter(t => !t.completed);
    if (currentFilter === 'completed') return tasks.filter(t => t.completed);
    return tasks;
  }

  function render() {
    const filtered = getFilteredTasks();

    taskList.innerHTML = filtered.map(task => `
      <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
        <button class="task-check" aria-label="Toggle task completion" data-action="toggle">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
        </button>
        <span class="task-text">${escapeHTML(task.text)}</span>
        <button class="task-delete" aria-label="Delete task" data-action="delete">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </li>
    `).join('');

    // Empty state
    if (tasks.length === 0) {
      emptyState.style.display = 'block';
      emptyMessage.textContent = 'No tasks yet';
      emptySubMessage.textContent = 'Add your first task above to get started';
    } else if (filtered.length === 0) {
      emptyState.style.display = 'block';
      emptyMessage.textContent = currentFilter === 'completed'
        ? 'Nothing completed yet'
        : 'Nothing left to do';
      emptySubMessage.textContent = currentFilter === 'completed'
        ? 'Completed tasks will show up here'
        : 'Every task is checked off';
    } else {
      emptyState.style.display = 'none';
    }
    taskList.style.display = filtered.length === 0 ? 'none' : 'block';

    // Footer counter
    const remaining = tasks.filter(t => !t.completed).length;
    itemsLeft.textContent = `${remaining} ${remaining === 1 ? 'item' : 'items'} left`;

    // Clear completed button state
    const completedCount = tasks.filter(t => t.completed).length;
    clearCompletedBtn.disabled = completedCount === 0;

    // Progress bar
    const pct = tasks.length === 0 ? 0 : Math.round((tasks.length - remaining) / tasks.length * 100);
    progressFill.style.width = pct + '%';
  }

  // ---------- Event listeners ----------
  addForm.addEventListener('submit', (e) => {
    e.preventDefault();
    addTask(taskInput.value);
    taskInput.value = '';
    taskInput.focus();
  });

  taskList.addEventListener('click', (e) => {
    const actionEl = e.target.closest('[data-action]');
    if (!actionEl) return;
    const li = e.target.closest('.task-item');
    const id = li.getAttribute('data-id');
    const action = actionEl.getAttribute('data-action');
    if (action === 'toggle') toggleTask(id);
    if (action === 'delete') deleteTask(id);
  });

  clearCompletedBtn.addEventListener('click', clearCompleted);

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-filter');
      render();
    });
  });

  // Sync across tabs
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      loadTasks();
      render();
    }
  });

  // ---------- Init ----------
  loadTasks();
  render();
})();
