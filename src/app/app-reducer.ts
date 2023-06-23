import {Dispatch} from 'redux'
import {authAPI} from '../api/todolists-api'
import {setIsLoggedInAC} from '../features/Login/auth-reducer'
import { PayloadAction, createSlice } from '@reduxjs/toolkit'

const initialState: InitialStateType = {
    status: 'idle',
    error: null,
    isInitialized: false
}

const slice = createSlice({
    name: 'app',
    initialState: initialState,
    reducers: {
        setAppStatusAC: (state, action: PayloadAction<{ status: RequestStatusType }>) => {
            state.status = action.payload.status
        },
        errorAppStatusAC: (state, action: PayloadAction<{ error: null | string }>) => {
            state.error = action.payload.error
        },
        setAppIsInitializedAC: (state, action: PayloadAction<{ value: boolean }>) => {
            state.isInitialized = action.payload.value
        },
    }
})

export const appReducer = slice.reducer;
export const {setAppStatusAC, errorAppStatusAC, setAppIsInitializedAC} = slice.actions

export type RequestStatusType = 'idle' | 'loading' | 'succeeded' | 'failed'
export type InitialStateType = {
    // происходит ли сейчас взаимодействие с сервером
    status: RequestStatusType
    // если ошибка какая-то глобальная произойдёт - мы запишем текст ошибки сюда
    error: string | null
    // true когда приложение проинициализировалось (проверили юзера, настройки получили и т.д.)
    isInitialized: boolean
}


export const initializeAppTC = () => (dispatch: Dispatch) => {
    dispatch(setAppIsInitializedAC({value:false}));
    authAPI.me().then(res => {
        if (res.data.resultCode === 0) {
            dispatch(setIsLoggedInAC({value:true}));
        } else {

        }

        dispatch(setAppIsInitializedAC({value:true}));
    })
}

export type SetAppErrorActionType = ReturnType<typeof errorAppStatusAC>
export type SetAppStatusActionType = ReturnType<typeof setAppStatusAC>


export type ActionsType =
    | SetAppErrorActionType
    | SetAppStatusActionType
    | ReturnType<typeof setAppIsInitializedAC>
