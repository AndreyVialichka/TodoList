import React, {useCallback, useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {AppRootStateType} from '../../app/store'
import {
    addTodolistsTC,
    ChangeTodolistFilterAC,
    changeTodolistTitleTC,
    fetchTodolistsTC,
    FilterValueType,
    removeTodolistsTC,
    TodolistDomainType
} from './todolists-reducer'
import {createTasksTC, removeTasksTC, TasksStateType, updateTaskStatusTC,changeTaskTitleusAC} from './tasks-reducer'
import {TaskStatuses} from '../../api/todolists-api'
import {Grid, Paper} from '@material-ui/core'
import {AddItemForm} from '../../components/AddItemForm/AddItemForm'
import {Todolist} from './Todolist/Todolist'
import { Redirect } from 'react-router-dom'

type PropsType = {
    demo?: boolean
}

export const TodolistsList: React.FC<PropsType> = ({demo = false}) => {
    const todolists = useSelector<AppRootStateType, Array<TodolistDomainType>>(state => state.todolists)
    const tasks = useSelector<AppRootStateType, TasksStateType>(state => state.tasks)
    const isLoggedIn = useSelector<AppRootStateType, boolean>(state => state.auth.isLoggedIn)

    const dispatch = useDispatch()

    useEffect(() => {
        if (demo || !isLoggedIn) {
            return;
        }
        const thunk = fetchTodolistsTC()
        dispatch(thunk)
    }, [])

    const removeTask = useCallback(function (id: string, todolistId: string) {
        const thunk = removeTasksTC({taskId:id,todolistId:todolistId})
        dispatch(thunk)
    }, [])

    const addTask = useCallback(function (title: string, todolistId: string) {
        debugger
        const thunk = createTasksTC({todolistId, title})
        dispatch(thunk)
    }, [])

    const changeStatus = useCallback(function (id: string, status: TaskStatuses, todolistId: string) {
        const thunk = updateTaskStatusTC(id, todolistId,status)
        dispatch(thunk)
    }, [])

    const changeTaskTitle = useCallback(function (id: string, newTitle: string, todolistId: string) {
        const thunk = changeTaskTitleusAC({
            taskId: id,
            title:newTitle,
            todolistId
        })
        dispatch(thunk)
    }, [])

    const changeFilter = useCallback(function (value: FilterValueType, todolistId: string) {
        const action = ChangeTodolistFilterAC({id: todolistId, filter: value})
        dispatch(action)
    }, [])

    const removeTodolist = useCallback(function (id: string) {
        const thunk = removeTodolistsTC(id)
        dispatch(thunk)
    }, [])

    const changeTodolistTitle = useCallback(function (id: string, title: string) {
        const thunk = dispatch(changeTodolistTitleTC( id, title))
        dispatch(thunk)
    }, [])

    const addTodolist = useCallback((title: string) => {
        const thunk = addTodolistsTC(title)
        dispatch(thunk)
    }, [dispatch])

    if (!isLoggedIn) {
        return <Redirect to={"/login"} />
    }

    return <>
        <Grid container style={{padding: '20px'}}>
            <AddItemForm addItem={addTodolist}/>
        </Grid>
        <Grid container spacing={3}>
            {
                todolists.map(tl => {
                    let allTodolistTasks = tasks[tl.id]

                    return <Grid item key={tl.id}>
                        <Paper style={{padding: '10px'}}>
                            <Todolist
                                todolist={tl}
                                tasks={allTodolistTasks}
                                removeTask={removeTask}
                                changeFilter={changeFilter}
                                addTask={addTask}
                                changeTaskStatus={changeStatus}
                                removeTodolist={removeTodolist}
                                changeTaskTitle={changeTaskTitle}
                                changeTodolistTitle={changeTodolistTitle}
                                demo={demo}
                            />
                        </Paper>
                    </Grid>
                })
            }
        </Grid>
    </>
}
