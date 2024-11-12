class Task {
    constructor(year, month, day, type, description) {
        this.year = year;
        this.month = month;
        this.day = day;
        this.type = type;
        this.description = description;
    }

    // Método para validar se todos os campos da tarefa foram preenchidos corretamente
    validateData() {
        for (let key in this) {
            if (this[key] === undefined || this[key] === "") {
                console.error(`The field ${key} is required.`);
                return false; // Retorna falso se algum campo estiver vazio ou indefinido
            }
        }
        return true; // Retorna verdadeiro se todos os campos forem válidos
    }
}

class Database {
    constructor() {
        this.initDatabase();
    }

    // Inicializa o banco de dados no localStorage
    initDatabase() {
        const id = localStorage.getItem('id');
        if (id === null) {
            localStorage.setItem('id', '0'); // Inicializa o id no localStorage
        }
    }

    // Carrega todas as tarefas armazenadas no localStorage
    loadTasks() {
        const tasks = [];
        const id = localStorage.getItem('id');

        for (let i = 1; i <= id; i++) {
            try {
                const task = JSON.parse(localStorage.getItem(i));
                if (task !== null) {
                    task.id = i; // Adiciona o ID à tarefa para referência
                    tasks.push(task);
                }
            } catch (e) {
                console.error(`Error loading task with id ${i}:`, e);
            }
        }
        return tasks; // Retorna um array com todas as tarefas
    }

    // Cria uma nova tarefa no banco de dados
    createTask(task) {
        const id = this.getNextId();
        localStorage.setItem(id, JSON.stringify(task));
        localStorage.setItem('id', id.toString());
    }

    // Remove uma tarefa do banco de dados
    removeTask(id) {
        localStorage.removeItem(id);
    }

    // Atualiza uma tarefa no banco de dados
    updateTask(task) {
        const taskId = task.id;
        // Verifique se a tarefa existe antes de atualizar
        if (localStorage.getItem(taskId)) {
            console.log(task);
            
            localStorage.setItem(taskId, JSON.stringify(task));
            console.log(`Task with ID ${taskId} updated successfully.`);
        } else {
            console.error('Task not found.');
        }
    }

    // Obtém o próximo ID de tarefa disponível
    getNextId() {
        const currentId = localStorage.getItem('id');
        return parseInt(currentId) + 1;
    }
}


const database = new Database();

// Função para registrar uma nova tarefa
function registerTask() {
    const year = document.getElementById('year').value;
    const month = document.getElementById('month').value;
    const day = document.getElementById('day').value;
    const type = document.getElementById('type').value;
    const description = document.getElementById('description').value;

    const task = new Task(year, month, day, type, description);

    if (task.validateData()) {
        database.createTask(task);
        alert('Task registered successfully!');
        resetForm(); // Limpa o formulário após o registro
    } else {
        alert('Please fill in all fields.');
    }
}

// Função para limpar o formulário após o registro
function resetForm() {
    document.getElementById('year').value = '';
    document.getElementById('month').value = '';
    document.getElementById('day').value = '';
    document.getElementById('type').value = '';
    document.getElementById('description').value = '';
}

function loadEditForm(task) {
    document.getElementById('editTaskId').value = task.id;
    document.getElementById('editYear').value = task.year;
    document.getElementById('editMonth').value = task.month;
    document.getElementById('editDay').value = task.day;
    document.getElementById('editType').value = task.type;
    document.getElementById('editDescription').value = task.description;
}

// Função para carregar tarefas na lista de tarefas
function loadTasks(tasks = database.loadTasks()) {
    const listTasks = document.getElementById('listTasks');
    listTasks.innerHTML = ''; // Limpa a lista existente

    tasks.forEach((t) => {
        const row = listTasks.insertRow();

        row.insertCell(0).innerHTML = `${t.day}/${t.month}/${t.year}`;

        // Converte o tipo de tarefa de número para texto
        row.insertCell(1).innerHTML = getTaskTypeName(t.type);
        row.insertCell(2).innerHTML = t.description;

        // Cria e adiciona o botão de deletar
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-danger';
        deleteBtn.id = t.id;
        deleteBtn.innerHTML = 'Delete';
        deleteBtn.onclick = () => {
            if (confirm('Are you sure you want to delete this task?')) {
                database.removeTask(t.id);
                loadTasks(); // Atualiza a lista de tarefas
            }
        };

        row.insertCell(3).append(deleteBtn);

        // Botão de editar
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-warning';
        editBtn.id = `edit-${t.id}`;
        editBtn.innerHTML = 'Edit';
        
        editBtn.setAttribute('data-toggle', 'modal')
        editBtn.setAttribute('data-target', '#editTaskModal')    
        
        editBtn.onclick = () => {
            loadEditForm(t);
        } // Carrega a tarefa no formulário de edição
        row.insertCell(4).append(editBtn);
    });
}

// Função auxiliar para obter o nome do tipo de tarefa
function getTaskTypeName(type) {
    switch (type) {
        case '1':
            return 'Studies';
        case '2':
            return 'Work';
        case '3':
            return 'Home';
        case '4':
            return 'Health';
        case '5':
            return 'Family';
        default:
            return 'Unknown';
    }
}

// Função para buscar tarefas com base nos critérios do formulário
function searchTasks() {
    const year = document.getElementById('year').value;
    const month = document.getElementById('month').value;
    const day = document.getElementById('day').value;
    const type = document.getElementById('type').value;
    const description = document.getElementById('description').value;

    const task = new Task(year, month, day, type, description);
    const tasks = database.searchTasks(task);

    loadTasks(tasks); // Carrega as tarefas filtradas
}

// Carrega as tarefas ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    if (document.body.contains(document.getElementById('listTasks'))) {
        loadTasks();
    }});

    document.getElementById('editForm').addEventListener('submit', (event) => {
        event.preventDefault();
    
        const taskId = parseInt(document.getElementById('editTaskId').value); // Garanta que o ID seja um número
        const year = document.getElementById('editYear').value;
        const month = document.getElementById('editMonth').value;
        const day = document.getElementById('editDay').value;
        const type = document.getElementById('editType').value;
        const description = document.getElementById('editDescription').value;
    
        // Cria a tarefa atualizada
        const updatedTask = new Task(year, month, day, type, description);
        updatedTask.id = taskId; // Definindo o ID para garantir que a tarefa tenha o ID correto
    
        // Verifica se os dados estão corretos
        if (updatedTask.validateData()) {
            // Usa o método updateTask da classe Database para atualizar a tarefa
            database.updateTask(updatedTask);
    
            // Fecha o modal
            $('#editTaskModal').modal('hide');
    
            // Atualiza a lista de tarefas na página
            loadTasks();
    
            alert('Task updated successfully!');
        } else {
            alert('Please fill in all fields.');
        }
    });