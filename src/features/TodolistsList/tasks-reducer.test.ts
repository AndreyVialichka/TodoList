import {TasksStateType, createTasksTC, fetchTasksTC,   removeTasksTC,   tasksReducer} from './tasks-reducer'

import {AddTodolistAC, RemoveTodolistAC, setTososAC} from './todolists-reducer'
import {TaskPriorities, TaskStatuses, TaskType, TodolistType} from '../../api/todolists-api'

let startState: TasksStateType = {};
beforeEach(() => {
    startState = {
        "todolistId1": [
            { id: "1", title: "CSS", status: TaskStatuses.New, todoListId: "todolistId1", description: '',
        startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low },
            { id: "2", title: "JS", status: TaskStatuses.Completed, todoListId: "todolistId1", description: '',
        startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low },
            { id: "3", title: "React", status: TaskStatuses.New, todoListId: "todolistId1", description: '',
        startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low }
        ],
        "todolistId2": [
            { id: "1", title: "bread", status: TaskStatuses.New, todoListId: "todolistId2", description: '',
        startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low },
            { id: "2", title: "milk", status: TaskStatuses.Completed, todoListId: "todolistId2", description: '',
                startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low },
            { id: "3", title: "tea", status: TaskStatuses.New, todoListId: "todolistId2", description: '',
                startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low }
        ]
    };
});

test('correct task should be deleted from correct array', () => {
    const action = removeTasksTC.fulfilled( {taskID:"2",todolistID: "todolistId2"},'',{todolistId: "todolistId2",taskId:"2"} );

    const endState = tasksReducer(startState, action)

    expect(endState["todolistId1"].length).toBe(3);
    expect(endState["todolistId2"].length).toBe(2);
    expect(endState["todolistId2"].every(t => t.id != "2")).toBeTruthy();
});
test('correct task should be added to correct array', () => {
    //const action = addTaskAC("juce", "todolistId2");
    let task:TaskType = {
        description: '',
        title: 'juce',
        status: TaskStatuses.New,
        priority: 0,
        startDate: '',
        deadline: '',
        id: '',
        todoListId: 'todolistId2',
        order: 0,
        addedDate: ''
    }
    //@ts-ignore
    const action = createTasksTC.fulfilled({title:task.title,todolistId:task.todoListId},'',{title:task.title,todolistId:task.todoListId});

    const endState = tasksReducer(startState, action)

    expect(endState["todolistId1"].length).toBe(3);
    expect(endState["todolistId2"].length).toBe(4);
    expect(endState["todolistId2"][0].id).toBeDefined();
    expect(endState["todolistId2"][0].title).toBe("juce");
    expect(endState["todolistId2"][0].status).toBe(TaskStatuses.New);
});

test('new array should be added when new todolist is added', () => {
    let todolist: TodolistType ={
        id: 'blabla',
        title: 'new todolist',
        addedDate: '',
        order: 0
    }
    const action = AddTodolistAC({todolist});

    const endState = tasksReducer(startState, action)


    const keys = Object.keys(endState);
    const newKey = keys.find(k => k != "todolistId1" && k != "todolistId2");
    if (!newKey) {
        throw Error("new key should be added")
    }

    expect(keys.length).toBe(3);
    expect(endState[newKey]).toEqual([]);
});
test('propertry with todolistId should be deleted', () => {
    const action = RemoveTodolistAC({id:"todolistId2"});

    const endState = tasksReducer(startState, action)

    const keys = Object.keys(endState);

    expect(keys.length).toBe(1);
    expect(endState["todolistId2"]).not.toBeDefined();
});

test('empty arrays should be added when we set todolists', () => {
    let todos = [
        {id: "1", title: "title 1", order: 0, addedDate: ""},
        {id: "2", title: "title 2", order: 0, addedDate: ""}
    ]
    const action = setTososAC({todos:todos})

    const endState = tasksReducer({}, action)

    const keys = Object.keys(endState)

    expect(keys.length).toBe(2)
    expect(endState['1']).toBeDefined()
    expect(endState['2']).toBeDefined()
})
test('tasks should be added for todolist', () => {
    const action = fetchTasksTC.fulfilled({tasks:startState["todolistId1"],todolistId: "todolistId1"},'', 'todolistId1');

    const endState = tasksReducer({
        "todolistId2": [],
        "todolistId1": []
    }, action)

    expect(endState["todolistId1"].length).toBe(3)
    expect(endState["todolistId2"].length).toBe(0)
})

