let draggedCard = null;
let rightClickedCard = null


document.addEventListener('DOMContentLoaded', () => {
    loadTaskFromLocalStorage(); // Load tasks from local storage on page load
});


function addTask(columnId) {
    const input = document.getElementById(`${columnId}-input`);
    const taskText = input.value.trim();
    if (taskText === '') return;

    const taskDate = new Date().toLocaleString();
    const taskElement = createTaskElement(taskText,taskDate)

    document.getElementById(`${columnId}-tasks`).appendChild(taskElement)

    updateTasksCount(columnId); // Update the task count for the column
    saveTaskToLocalStorage(columnId,taskText,taskDate)
    input.value = ''; // Clear the input field

}

function createTaskElement(taskText,taskDate){
    const taskElement = document.createElement('div');
    taskElement.classList.add('card');
    taskElement.innerHTML = `<span>${taskText}</span><br><small class="time">${taskDate}</small>`;
    taskElement.draggable = true;

    taskElement.addEventListener('dragstart', dragStart);
    taskElement.addEventListener('dragend', dragEnd);

    taskElement.addEventListener("contextmenu", function(event) {
        event.preventDefault();

        rightClickedCard = this;
        showContextMenu(event.pageX, event.pageY);
    });

    return taskElement
}

function dragStart() {
    this.classList.add('dragging');
    draggedCard = this;
}


function dragEnd() {
    this.classList.remove('dragging');
    draggedCard = null;
    ["todo","doing","done"].forEach(columnId => {
        updateTasksCount(columnId);
    })
    updateLocalStorage();
}


const columns = document.querySelectorAll('.column .tasks');
columns.forEach(column => {
    column.addEventListener('dragover', dragOver);
}); 


function dragOver(event) {
    event.preventDefault();
    // this.appendChild(draggedCard);
    const afterElement = getDragAfterElement(this, event.clientY);
    if (afterElement == null) {
        this.appendChild(draggedCard);
    } else {
        this.insertBefore(draggedCard, afterElement);
    }
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.card:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

const contextmenu = document.querySelector(".context-menu")

function showContextMenu(x,y){
    contextmenu.style.display = "block";
    contextmenu.style.left = `${x}px`;
    contextmenu.style.top = `${y}px`;
}

document.addEventListener("click",()=>{
    contextmenu.style.display = "none";
})


function editTask(){
    if(rightClickedCard){
        const span = rightClickedCard.querySelector('span');
        const newText = prompt("Edit task:", span.textContent);
        if (newText !== null) {
            span.textContent = newText.trim();
            updateLocalStorage(); // Update local storage after editing
        }
    }
}

function deleteTask(){
    if(rightClickedCard){
        const id = rightClickedCard.parentElement.id;
        rightClickedCard.remove();
        const columnId = id.split('-')[0];
        updateLocalStorage(); // Update local storage after deleting
        updateTasksCount(columnId);
    }
}


function updateTasksCount(columnId){
    const count = document.querySelectorAll(`#${columnId}-tasks .card`).length;
    document.getElementById(`${columnId}-count`).textContent = count;
}



function saveTaskToLocalStorage(columnId,taskText,taskDate) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push({ text: taskText, date: taskDate});
    localStorage.setItem(columnId, JSON.stringify(tasks));
}



function loadTaskFromLocalStorage(){
    ["todo", "doing", "done"].forEach(columnId => {
        const tasks = JSON.parse(localStorage.getItem(columnId)) || [];
        const taskContainer = document.getElementById(`${columnId}-tasks`);
        tasks.forEach(task => {
            const taskElement = createTaskElement(task.text, task.date);
            taskContainer.appendChild(taskElement);
        });
        updateTasksCount(columnId); // Update the task count for the column
    });
}

function updateLocalStorage(){
    ["todo", "doing", "done"].forEach(columnId => {
        const tasks = Array.from(document.querySelectorAll(`#${columnId}-tasks .card`)).map(task => {
            return {
                text: task.querySelector('span').textContent,
                date: task.querySelector('.time').textContent
            };
        });
        localStorage.setItem(columnId, JSON.stringify(tasks));
    });
}