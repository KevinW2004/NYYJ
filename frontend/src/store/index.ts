import {createStore} from 'vuex'

export default createStore({
  state: {
    _todoList: [],
    todoDetail: Object
  },
  getters: {
    getTodoDetail(state) {
      return state.todoDetail;
    }
  },
  mutations: {
    SET_TODO_LIST(state, todoList) {
      state._todoList = todoList
      console.log('SET_TODO_LIST', state._todoList)
    },
    set_todo_detail(state, detail) {
      state.todoDetail = detail
      console.log('set_todo_detail', state.todoDetail)
    }
  },
  actions: {
  },
  modules: {
  }
})
