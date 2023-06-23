import {errorAppStatusAC, SetAppErrorActionType, setAppStatusAC, SetAppStatusActionType} from '../app/app-reducer'
import {ResponseType} from '../api/todolists-api'
import {Dispatch} from 'redux'

export const handleServerAppError = <D>(data: ResponseType<D>, dispatch: Dispatch<SetAppErrorActionType | SetAppStatusActionType>) => {
    if (data.messages.length) {
        dispatch(errorAppStatusAC( {error: data.messages[0]} ))
    } else {
        dispatch(errorAppStatusAC( {error:'Some error occurred'} ))
    }
    dispatch(setAppStatusAC( { status:'failed'} ))
}

export const handleServerNetworkError = (error: { message: string }, dispatch: Dispatch<SetAppErrorActionType | SetAppStatusActionType>) => {
    dispatch(errorAppStatusAC({error: error.message ? error.message : 'Some error occurred'}))
    dispatch(setAppStatusAC({ status:'failed'}))
}
