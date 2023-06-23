import {todolistsAPI, TodolistType} from "../../api/todolists-api";
import {Dispatch} from "redux";
import {ActionsType, RequestStatusType, setAppStatusAC} from "../../app/app-reducer";
import {AxiosError} from "axios";
import {handleServerAppError, handleServerNetworkError} from "../../utils/error-utils";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";


//Types
export type RemoveTodolistActionType = ReturnType<typeof RemoveTodolistAC>
export type AddTodolistActionType = ReturnType<typeof AddTodolistAC>
export type ChangeTodolistTitleActionType = ReturnType<typeof ChangeTodolistTitleAC>
export type ChangeTodolistFilterActionType = ReturnType<typeof ChangeTodolistFilterAC>
export type setTososType = ReturnType<typeof setTososAC>
export type ChangeTodolistEntityStatusAT = ReturnType<typeof ChangeTodolistEntityStatusAC>

const initialState: Array<TodolistDomainType> = []
export type FilterValueType = "all" | "active" | "completed"
export type TodolistDomainType = TodolistType & {
    filter: FilterValueType
    entityStatus: RequestStatusType
}

export type ActionType = RemoveTodolistActionType | AddTodolistActionType |
    ChangeTodolistTitleActionType | ChangeTodolistFilterActionType |
    setTososType | ActionsType | ChangeTodolistEntityStatusAT

const slice = createSlice({
    name: 'todolists',
    initialState: initialState,
    reducers: {
        RemoveTodolistAC: (state, action: PayloadAction<{ id: string }>) => {
            const index = state.findIndex(tl => tl.id === action.payload.id);
            if (index > -1) {
                state.splice(index, 1);
            }
        },
        AddTodolistAC: (state, action: PayloadAction<{ todolist: TodolistType }>) => {
            state.unshift({...action.payload.todolist, filter: "all", entityStatus: "idle"})
        },
        ChangeTodolistTitleAC: (state, action: PayloadAction<{ id: string, title: string }>) => {
            const index = state.findIndex(tl => tl.id === action.payload.id);
            state[index].title = action.payload.title
        },
        ChangeTodolistFilterAC: (state, action: PayloadAction<{ id: string, filter: FilterValueType }>) => {
            const index = state.findIndex(tl => tl.id === action.payload.id);
            state[index].filter = action.payload.filter
        },
        setTososAC: (state, action: PayloadAction<{ todos: TodolistType[] }>) => {
           return  action.payload.todos.map((t) => ({...t, filter: 'all', entityStatus: "idle"}))
        },
        ChangeTodolistEntityStatusAC: (state, action: PayloadAction<{ id: string, entityStatus: RequestStatusType }>) => {
            const index = state.findIndex(tl => tl.id === action.payload.id);
            state[index].entityStatus = action.payload.entityStatus
        },

    }
})



export const todolistsReducer = slice.reducer;
export const {
    RemoveTodolistAC, AddTodolistAC, ChangeTodolistFilterAC,
    ChangeTodolistTitleAC, setTososAC, ChangeTodolistEntityStatusAC
} = slice.actions


//Thunks
export const fetchTodolistsTC = () => {
    return (dispatch: Dispatch<ActionType>) => {
        dispatch(setAppStatusAC({status: "loading"}))
        todolistsAPI.getTodolists()
            .then((res) => {
                dispatch(setTososAC({todos: res.data}))
                dispatch(setAppStatusAC({status: "succeeded"}))
            })
            .catch((error: AxiosError) => handleServerNetworkError({message: error.message}, dispatch))
    }
}

export const removeTodolistsTC = (todolistId: string) => {
    return (dispatch: Dispatch<ActionType>) => {
        dispatch(setAppStatusAC({status: "loading"}))
        dispatch(ChangeTodolistEntityStatusAC({id: todolistId, entityStatus: 'loading'}))
        todolistsAPI.deleteTodolist(todolistId)
            .then((res) => {
                if (res.data.resultCode === 0) {
                    dispatch(RemoveTodolistAC({id: todolistId}))
                    dispatch(setAppStatusAC({status: "succeeded"}))
                } else {
                    handleServerAppError(res.data, dispatch)
                }
            })
            .catch((error: AxiosError) => {
                handleServerNetworkError({message: error.message}, dispatch)
                dispatch(ChangeTodolistEntityStatusAC({id: todolistId, entityStatus: 'idle'}))
            })
    }
}
export const addTodolistsTC = (title: string) => {
    return (dispatch: Dispatch<ActionType>) => {
        dispatch(setAppStatusAC({status: "loading"}))
        todolistsAPI.createTodolist(title)
            .then((res) => {
                if (res.data.resultCode === 0) {
                    dispatch(AddTodolistAC({todolist: res.data.data.item}))
                } else {
                    handleServerAppError(res.data, dispatch)
                }
            })
            .catch((error: AxiosError) => handleServerNetworkError({message: error.message}, dispatch))
            .finally(() => {
                dispatch(setAppStatusAC({status: "idle"}))
            })
    }
}
export const changeTodolistTitleTC = (id: string, title: string) => {
    return (dispatch: Dispatch<ActionType>) => {
        dispatch(setAppStatusAC({status: "loading"}))
        todolistsAPI.updateTodolist(id, title)
            .then((res) => {
                dispatch(ChangeTodolistTitleAC({id: id, title}))
                dispatch(setAppStatusAC({status: "succeeded"}))
            })
    }
}