import {
    AddTodolistAC,
    AddTodolistActionType,
    RemoveTodolistAC,
    RemoveTodolistActionType, setTososAC,
    setTososType
} from "./todolists-reducer";
import {todolistsAPI, TaskStatuses, TaskType} from "../../api/todolists-api";
import {Dispatch} from "redux";
import {AppRootStateType} from "../../app/store";
import {ActionsType, setAppStatusAC} from "../../app/app-reducer";
import {AxiosError} from "axios";
import {handleServerAppError, handleServerNetworkError} from "../../utils/error-utils";
import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import { action } from "@storybook/addon-actions";



//Types

export type ChangeTaskStatusActionType = ReturnType<typeof changeTaskStatusAC>
export type ChangeTaskTitleActionType = ReturnType<typeof changeTaskTitleusAC>



export type TasksStateType = {
    [key: string]: Array<TaskType>
}

export type ActionType = ChangeTaskStatusActionType
    | AddTodolistActionType
    | ChangeTaskTitleActionType
    | RemoveTodolistActionType | setTososType 
    | ActionsType

const initialState: TasksStateType = {}

const slice = createSlice({
    name: 'tasksReducer',
    initialState,
    reducers: {

        changeTaskStatusAC: (state, action: PayloadAction<{ taskId: string, status: TaskStatuses, todolistId: string }>) => {
            const tasks = state[action.payload.todolistId];
            const index = tasks.findIndex(t => t.id === action.payload.taskId);
            if (index > -1) {
                tasks[index].status = action.payload.status
            }
        },
        changeTaskTitleusAC: (state, action: PayloadAction<{ taskId: string, title: string, todolistId: string }>) => {
            const tasks = state[action.payload.todolistId];
            const index = tasks.findIndex(t => t.id === action.payload.taskId);
            if (index > -1) {
                tasks[index].title = action.payload.title
            }
        },


    },
    extraReducers: (builder) => {
        builder.addCase(AddTodolistAC, (state, action) => {
            state[action.payload.todolist.id] = []
        });
        builder.addCase(RemoveTodolistAC, (state, action) => {
            delete state[action.payload.id]
        });
        builder.addCase(setTososAC, (state, action) => {
            action.payload.todos.forEach((t: any) => {
                state[t.id] = []
            })
        });
        builder.addCase(fetchTasksTC.fulfilled, (state, action) => {
            debugger
            state[action.payload.todolistId] = action.payload.tasks
        });
        builder.addCase(createTasksTC.fulfilled, (state,action) => {
            //@ts-ignore
                state[action.payload.res.data.item.todoListId].unshift(action.payload.res.data.item)
                debugger
        })
        builder.addCase(removeTasksTC.fulfilled, (state,action) => {
            const tasks = state[action.payload.todolistID];
            const index = tasks.findIndex(t => t.id === action.payload.taskID);
            if (index > -1) {
                tasks.splice(index, 1)
            }
    })
    }

})


export const tasksReducer = slice.reducer;
export const {
 changeTaskStatusAC, changeTaskTitleusAC
} = slice.actions



export const fetchTasksTC = createAsyncThunk('tasks/fetchTasks', async (todolistId:string,thunkAPI) => {
    const {dispatch} = thunkAPI
    dispatch(setAppStatusAC({status: "loading"}))
    const res = await todolistsAPI.getTasks(todolistId)
    dispatch(setAppStatusAC({status: "succeeded"}))
    return {tasks: res.data.items, todolistId}
})

export const createTasksTC = createAsyncThunk('tasks/createTask', async (param : { todolistId:string,title:string },thunkAPI) => {
    const {dispatch} = thunkAPI
    dispatch(setAppStatusAC({status: "loading"}))
    try {
        const res = await todolistsAPI.createTask(param.todolistId, param.title)
        if (res.data.resultCode === 0) {
            dispatch(setAppStatusAC({status: "succeeded"}))
        } else {
            handleServerAppError(res.data, dispatch)
        }
        return {res: res.data}
    } catch (error){
        //@ts-ignore
        handleServerNetworkError({message: error.message}, dispatch)
    }
})

export const removeTasksTC = createAsyncThunk('tasks/removeTasks', async (param:{todolistId:string,taskId:string},thunkAPI) => {
    const {dispatch} = thunkAPI
    dispatch(setAppStatusAC({status: "loading"}))
    const res = await todolistsAPI.deleteTask(param.todolistId, param.taskId)
    if (res.data.resultCode === 0) {
        dispatch(setAppStatusAC({status: "succeeded"}))
    }
    return {taskID: param.taskId, todolistID:param.todolistId}
})

export const updateTaskStatusTC = (taskId: string, todolistId: string, status: TaskStatuses) => (dispatch: Dispatch<ActionType>, getState: () => AppRootStateType) => {
    dispatch(setAppStatusAC({status: "loading"}))
    const allTasksFromState = getState().tasks;
    const tasksForCurrentTodolist = allTasksFromState[todolistId]
    const task = tasksForCurrentTodolist.find(t => {
        return t.id === taskId
    })
    if (task) {
        todolistsAPI.updateTask(todolistId, taskId, {
            title: task.title,
            startDate: task.startDate,
            priority: task.priority,
            description: task.description,
            deadline: task.deadline,
            status: status
        }).then(res => {
            if (res.data.resultCode === 0) {
                const action = changeTaskStatusAC({taskId, status, todolistId})
                dispatch(action)
                dispatch(setAppStatusAC({status: "succeeded"}))
            } else {
                handleServerAppError(res.data, dispatch)
            }
        })
            .catch((error) => {
                handleServerNetworkError({message: error.message}, dispatch)
            })
    }
}