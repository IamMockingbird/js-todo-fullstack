import {fetchTodos, addTodo, toggleTodo, deleteTodo } from "./api.js";

const input = document.getElementById('task-input');
const btn = document.getElementById(`add-btn`);
const list = document.getElementById('task-list');
// 1. Пытаемся достать задачи из памяти. Если их нет - создаем пустой 
// массив
// JSON.parse преварщает строку обратно в массив
let tasks = [];

const createTaskElement = (task) =>{
    // Создаем HTML
    const newLi = document.createElement('li');
    const liSpan = document.createElement('span');
    liSpan.innerText = task.text;

    // Если задача выполнена - добавляем класс
    if (task.done) newLi.classList.add('done');

    // Конпка удаления
    const deleteBtn = document.createElement('button');
    deleteBtn.innerText = 'Удалить';
    deleteBtn.classList.add('delBut');

    // Удаление задачи
    deleteBtn.addEventListener('click', (event) => {
        event.stopPropagation(); // Останавливаем дальнейшую передачу события после того, как сработают обработчики на текущем элементе
        deleteTaskHandler(task.id); // Вызываем функцию удаления по индексу 
    });

    // Зачеркивание задачи
    newLi.addEventListener('click', () => {
        toggleTask(task.id); // Вызываем переключение
    });
    // Собираем все вместе
    newLi.appendChild(liSpan);
    newLi.appendChild(deleteBtn);

    return newLi;
}

const render = () => {
    list.innerHTML = '';
    //Бежим по массиву
    // forEach - цикл
    // task - сама задача, index - её номер в массиве
    tasks.forEach((task) => {
        const taskElement = createTaskElement(task);
        list.appendChild(taskElement);
    });
}


btn.addEventListener('click', async () => {
    const todoText = input.value
    if(!todoText){
        alert("Введите задачу");
    }else{ 
        let newTask = await addTodo(todoText);
        tasks.unshift(newTask);
        render();
        input.value = '';
    };
});

const deleteTaskHandler = async (id) => {

    await deleteTodo(id);
    tasks = tasks.filter(task => task.id !== id);
    render();
}

const toggleTask = async (id) => {
   // Находим задачу в массиве по id
   const targetTask = tasks.find(task => task.id === id);
   // Отправляем запрос на сервер, используя id этой задачи
   // Главное, что бы запрос ушел
    await toggleTodo(targetTask.id);

    // Меняем статус локально, что бы обновить экран
    targetTask.done = !targetTask.done;
    render();
}

const loadInitialData = async () => {

    if (tasks.length > 0) return;

    // 1. Создаем временный элемент-лоадер
    const loaded = document.createElement('li');
    loaded.textContent = '⏳ Загрузка данных...';
    loaded.classList.add('load');
    // Показываем его в списке
    list.append(loaded);

    try {
        const serverData = await fetchTodos();              

        tasks = serverData;
        render();

    } catch (error) {
        console.error('Ошибка загрузки', error);
        alert('Этой ошибки быть не должно, свяжитесь с поддержкой');
    } finally {
        loaded.remove();
    }
        
    
}
render();
loadInitialData()    


