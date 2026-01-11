

// Получаем данные с сервера
export const fetchTodos = async () => {

    try {
        const response = await fetch('http://localhost:3000/todos');
        const data = await response.json();
        return data;
    } catch (error) {
        throw error;
    }
    
}

// Сохраняем данные на сервере
export const addTodo = async (todoText) => {
    // 1. Формируем объект, который отправим на сервер
    const newTodo = {text: todoText};

    //2. Делаем запрос
    const response = await fetch ('http://localhost:3000/todos', {
        method: `POST`,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTodo)
    });
    return await response.json();
};

export const toggleTodo = async (id) => {
    const response = await fetch ('http://localhost:3000/todos/' + id, {
        method: `PATCH`,
    })
    return await response.json();
};

export const deleteTodo = async (id) =>{
    const response = await fetch ('http://localhost:3000/todos/' + id,{
        method: `DELETE`
    })
    return await response.json();
};