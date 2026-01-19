import {fetchTodos, addTodo, toggleTodo, deleteTodo, moveTodo } from "./api.js";

const input = document.getElementById('task-input');
const btn = document.getElementById(`add-btn`);
const list = document.getElementById('task-list');

// 1. Пытаемся достать задачи из памяти. Если их нет - создаем пустой 
// массив
// JSON.parse преварщает строку обратно в массив
let tasks = [];

const createTaskElement = (task) => {
    // Создаем HTML
    const newLi = document.createElement('li');
    const liSpan = document.createElement('span');
    newLi.setAttribute('draggable', 'true');
    newLi.dataset.id = task.id;
    liSpan.innerText = task.text;

    // Обрабатываем перетаскивание
    newLi.addEventListener('dragstart', (e) =>{
        
        //Убираем картинку под курсором при перетаскивании
        const img = new Image();
        e.dataTransfer.setDragImage(img, 0, 0);
        newLi.classList.add('dragging');
    });

    newLi.addEventListener('dragend', (e) =>{
        newLi.classList.remove('dragging');
    });

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

const getDragAfterElement = (container, y) => {

    const notDraggableNodeList = container.querySelectorAll('li:not(.dragging)');
    const notDraggable = Array.from(notDraggableNodeList);

    const cursorY = y; // Y - координата курсора 
    let minDistance = Infinity; // Минимальное расстояние до центра элемента
    let closestItem = null;

    notDraggable.forEach(item => {
        const rect = item.getBoundingClientRect();
        const itemCenterY = rect.top + rect.height / 2; // Центр элемента

        // Проверяем, находится ли центр ниже курсора
        if (itemCenterY > cursorY) {
            const distance = itemCenterY - cursorY; // Расстояние от курсора до центра элемента

            // Если расстояние меньше текущего минимума, обновляем
            if (distance < minDistance) {
                minDistance = distance;
                closestItem = item;
            }
        }
    });
    return(closestItem);
}

let activeAfterElement = null; //переменная для сравнения с afterElement

list.addEventListener('dragover', (e) => {
    e.preventDefault(); //разрешаем сбрасывать перетаскиваемый элемент
    const afterElement = getDragAfterElement(list, e.clientY); // Элемент, перед которым мы хотим встать (или null, если мы в самом низу).

    //Делаем проверку, что бы не грузить браузер, если нет смещения задачи
    if (activeAfterElement === afterElement) {
        return
    } else {
        
        activeAfterElement = afterElement;
        
        const draggable = document.querySelector('.dragging'); // элемент, который мы тащим.
        
        //Получаем положение всех li в list для анимации
        const allLiNodeList = list.querySelectorAll('li');
        const allLiArray = Array.from(allLiNodeList);

        //получаем положение всех li до переноса
        const allLiPosition = allLiArray.map((element) => {
            const rect = element.getBoundingClientRect().top;
            
            return{
                id: element.dataset.id,
                top: rect
            };
        });

        if (!afterElement) {
            list.appendChild(draggable);
        }else{
            list.insertBefore(draggable, afterElement);
        }
        
        allLiArray.forEach(element => {
            //Находим новую позицию элемента
            const newRect = element.getBoundingClientRect().top;

            //По id находим старю позицию передвинутого элемента
            const targetLiId = element.dataset.id
            const foundLi = allLiPosition.find(item => item.id === targetLiId);
            const liOldPosition = foundLi.top;
            
            //Находм разницу между ними 
            const delta = liOldPosition - newRect;

            //перенсим li обатно на столько же пикселей, насколько отнесли
            element.style.transform = `translateY(${delta}px) `;
            element.style.transition = ``; //выключаем плавность
        });

        const play = () => {
            
            allLiArray.forEach (element => {

                //делаем анимацию плавнее
                element.style.transition = `transform 0.3s`;
                //убираем перенос обратно
                element.style.transform = ``;
            });
        }
        window.requestAnimationFrame(play);

    }   
});

list.addEventListener('drop', (e) => {
    e.preventDefault(); //разрешаем сбрасывать перетаскиваемый элемент
    const allLiNodeList = list.querySelectorAll('li');
    const allLiArray = Array.from(allLiNodeList);
    const draggable = document.querySelector('.dragging');
    const drgIndex = allLiArray.indexOf(draggable);
    const drgElement = tasks[drgIndex];
    const drgId = draggable.dataset.id;

    if (!drgElement) {
        console.log("drgElement undefined");
    } else {
        moveTodo(drgId, drgElement.position);
    }
    
});

render();
loadInitialData()    


