import {createStore} from 'vuex'

export default createStore({
  state: {
    _todoList: []
  },
  getters: {
  },
  mutations: {
    SET_TODO_LIST(state, todoList) {
      state._todoList = todoList
      console.log('SET_TODO_LIST', state._todoList)
    }
  },
  actions: {
  },
  modules: {
  }
})
