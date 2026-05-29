document.addEventListener('DOMContentLoaded', () => {
    const todoTitle = document.getElementById('todo-title');
    const todoDesc = document.getElementById('todo-desc');
    const todoGroupSelect = document.getElementById('todo-group-select');
    const addBtn = document.getElementById('add-btn');
    
    const newGroupName = document.getElementById('new-group-name');
    const addGroupBtn = document.getElementById('add-group-btn');
    const groupsList = document.getElementById('groups-list');
    
    const pendingGroupsContainer = document.getElementById('pending-groups');
    const completedGroupsContainer = document.getElementById('completed-groups');

    // тута грязные делишки
    let todos = JSON.parse(localStorage.getItem('cat_todos')) || [];
    let groups = JSON.parse(localStorage.getItem('cat_groups')) || ['General'];
    
    // проверка шобы была хоть одна група всегда
    if (!groups.includes('General')) {
        groups.unshift('General');
    }

    // сейвим
    const saveState = () => {
        localStorage.setItem('cat_todos', JSON.stringify(todos));
        localStorage.setItem('cat_groups', JSON.stringify(groups));
    };

    // рисуем список груп в сайдбаре и в селекте
    const renderGroups = () => {
        todoGroupSelect.innerHTML = groups.map(g => `<option value="${g}">${g}</option>`).join('');
        // несчастный крестик
        groupsList.innerHTML = groups.map((g, i) => `
            <li>
                <span>${g}</span>
                ${g !== 'General' ? `<span class="delete-group-btn" onclick="deleteGroup(${i})">✖</span>` : ''}
            </li>
        `).join('');
    };

    // создаем хтмл для одной таски
    const createTodoItem = (todo, index) => {
        return `
            <li class="todo-item ${todo.completed ? 'completed' : ''}">
                <div class="todo-content">
                    <h3>${todo.title}</h3>
                    <p>${todo.description}</p>
                </div>
                <div class="todo-actions">
                    <button class="action-btn ${todo.completed ? 'uncomplete-btn' : 'complete-btn'}" onclick="toggleTodo(${index})" title="${todo.completed ? 'Restore' : 'Complete'}">
                        ${todo.completed ? '✖' : '✔'}
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteTodo(${index})" title="Delete">
                        🗑️
                    </button>
                </div>
            </li>
        `;
    };

    // главная функция отрисовки всех списков
    const renderTodos = () => {
        pendingGroupsContainer.innerHTML = '';
        completedGroupsContainer.innerHTML = '';

        groups.forEach(groupName => {
            const pendingInGroup = todos.filter(t => !t.completed && t.group === groupName);
            const completedInGroup = todos.filter(t => t.completed && t.group === groupName);

            // если в групе есть не выполненые - рисуем заголовок и список
            if (pendingInGroup.length > 0) {
                const groupDiv = document.createElement('div');
                groupDiv.className = 'group-container';
                groupDiv.innerHTML = `
                    <div class="group-header">
                        <h3 class="group-title">${groupName}</h3>
                    </div>
                    <ul class="todo-list">
                        ${todos.map((t, i) => (!t.completed && t.group === groupName) ? createTodoItem(t, i) : '').join('')}
                    </ul>
                `;
                pendingGroupsContainer.appendChild(groupDiv);
            }

            if (completedInGroup.length > 0) {
                const groupDiv = document.createElement('div');
                groupDiv.className = 'group-container';
                groupDiv.innerHTML = `
                    <div class="group-header">
                        <h3 class="group-title">${groupName}</h3>
                        <button class="clear-group-btn" onclick="clearGroupCompleted('${groupName}')">Clear</button>
                    </div>
                    <ul class="todo-list">
                        ${todos.map((t, i) => (t.completed && t.group === groupName) ? createTodoItem(t, i) : '').join('')}
                    </ul>
                `;
                completedGroupsContainer.appendChild(groupDiv);
            }
        });
    };

    // меняем статус таски
    window.toggleTodo = (index) => {
        todos[index].completed = !todos[index].completed;
        saveState();
        renderTodos();
    };

    // удаление одной задачи с поддверждением
    window.deleteTodo = (index) => {
        if (confirm('Delete this task?')) {
            todos.splice(index, 1);
            saveState();
            renderTodos();
        }
    };

    // удаляем групу и перекидываем таски в общую
    window.deleteGroup = (index) => {
        const groupToDelete = groups[index];
        if (groupToDelete === 'General') return;

        if (confirm(`Delete group "${groupToDelete}"? All tasks in this group will be moved to "General".`)) {
            todos.forEach(t => {
                if (t.group === groupToDelete) t.group = 'General';
            });
            groups.splice(index, 1);
            saveState();
            renderGroups();
            renderTodos();
        }
    };

    // чистим выполненые в конкретной групке
    window.clearGroupCompleted = (groupName) => {
        if (confirm(`Clear all completed tasks in "${groupName}"?`)) {
            todos = todos.filter(t => !(t.completed && t.group === groupName));
            saveState();
            renderTodos();
        }
    };

    // вешаем слушатель на кнопку добавления
    addBtn.addEventListener('click', () => {
        const title = todoTitle.value.trim();
        const description = todoDesc.value.trim();
        const group = todoGroupSelect.value;

        if (title) {
            todos.push({ title, description, completed: false, group });
            todoTitle.value = '';
            todoDesc.value = '';
            saveState();
            renderTodos();
        } else {
            alert('Please enter a title!');
        }
    });

    // создание новой групы
    addGroupBtn.addEventListener('click', () => {
        const name = newGroupName.value.trim();
        if (name && !groups.includes(name)) {
            groups.push(name);
            newGroupName.value = '';
            saveState();
            renderGroups();
            renderTodos();
        } else if (groups.includes(name)) {
            alert('Group already exists!');
        }
    });

    // запускаем отрисовку при старте
    renderGroups();
    renderTodos();
});
