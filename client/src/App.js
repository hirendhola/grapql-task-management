import { useQuery, useMutation } from "@apollo/client"
import { useState } from "react"
import "./App.css"
import { GET_TODOS, GET_ALL_USERS, GET_USER_BY_ID } from "./apollo/query/query.js"
import { CREATE_USER, CREATE_TODO, UPDATE_TODO, DELETE_TODO } from "./apollo/mutation/mutation.js"
import Spinner from "./Spinner.js"

function App() {
  const { data: todosData } = useQuery(GET_TODOS)
  const { data: usersData } = useQuery(GET_ALL_USERS)


  const [createUser] = useMutation(CREATE_USER)
  const [createTodo] = useMutation(CREATE_TODO)
  const [updateTodo] = useMutation(UPDATE_TODO)
  const [deleteTodo] = useMutation(DELETE_TODO)

  const [filter, setFilter] = useState("all")
  const [newUserName, setNewUserName] = useState("")
  const [newUserEmail, setNewUserEmail] = useState("")
  const [newTodoTitle, setNewTodoTitle] = useState("")
  const [newTodoUserId, setNewTodoUserId] = useState("")
  const [selectedUserId, setSelectedUserId] = useState("")

  const { data: selectedUserData, refetch: refetchUser } = useQuery(GET_USER_BY_ID, {
    variables: { id: selectedUserId },
    skip: !selectedUserId,
  })

  const [loading, setLoading] = useState(false);

  if (!todosData || !usersData) return <div className="spinner-container"><Spinner /></div>

  const filteredTodos = todosData.getTodos.filter((todo) => {
    if (filter === "all") return true
    if (filter === "completed") return todo.completed
    if (filter === "incomplete") return !todo.completed
    return false
  })

  const handleCreateUser = async (e) => {
    e.preventDefault()
    setLoading(true)
    await createUser({
      variables: { name: newUserName, email: newUserEmail },
      refetchQueries: [{ query: GET_ALL_USERS }],
    })
    setLoading(false)
    setNewUserName("")
    setNewUserEmail("")
  }

  const handleCreateTodo = async (e) => {
    e.preventDefault()
    setLoading(true)
    await createTodo({
      variables: { title: newTodoTitle, userId: newTodoUserId, id: newTodoUserId },
      refetchQueries: [{ query: GET_TODOS }, {
        query: GET_USER_BY_ID, variables: { id: selectedUserId }
      }],
    })
    setLoading(false)
    setNewTodoTitle("")
    setNewTodoUserId("")
  }

  const handleUpdateTodo = async (id, completed) => {
    setLoading(true)
    await updateTodo({
      variables: { id, completed: !completed },
      refetchQueries: [{ query: GET_TODOS }, {
        query: GET_USER_BY_ID, variables: { id: selectedUserId }
      }],
    })
    setLoading(false)
  }

  const handleDeleteTodo = async (id) => {
    setLoading(true)
    await deleteTodo({
      variables: { id },
      refetchQueries: [{ query: GET_TODOS }, {
        query: GET_USER_BY_ID, variables: { id: selectedUserId }
      }],
    })
    setLoading(false)
  }

  const handleUserSelect = async (userId) => {
    if (userId === selectedUserId) return;
    setLoading(true)
    setSelectedUserId(userId)
    console.log("clicked")
    await refetchUser({ id: userId })
    setLoading(false)
    console.log(selectedUserData)
  }


  return (
    <div className="container">
      {
        loading && <div className="on">
          <Spinner />
        </div>
      }
      <div className="app">
        <header>
          <h1>Task Manager</h1>
          <div className="filter-buttons">
            <button onClick={() => setFilter("all")} className={filter === "all" ? "active" : ""}>
              All
            </button>
            <button onClick={() => setFilter("completed")} className={filter === "completed" ? "active" : ""}>
              Completed
            </button>
            <button onClick={() => setFilter("incomplete")} className={filter === "incomplete" ? "active" : ""}>
              Incomplete
            </button>
          </div>
        </header>
        <main>
          <form onSubmit={handleCreateUser} className="form">
            <input
              type="text"
              placeholder="Name"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              required
            />
            <button type="submit">Create User</button>
          </form>
          <form onSubmit={handleCreateTodo} className="form">
            <input
              type="text"
              placeholder="Todo Title"
              value={newTodoTitle}
              onChange={(e) => setNewTodoTitle(e.target.value)}
              required
            />
            <select
              value={newTodoUserId}
              onChange={(e) => setNewTodoUserId(e.target.value)}
              required
              className="select-user"
            >
              <option value="">Select User</option>
              {usersData.getAllUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
            <button type="submit">Create Todo</button>
          </form>
          <div className="user-list">
            <h2>Users</h2>
            <ul>
              {usersData.getAllUsers.map((user) => (
                <li
                  key={user.id}
                  onClick={() => handleUserSelect(user.id)}
                  className={selectedUserId === user.id ? "selected" : ""}
                >
                  {user.name} ({user.email})
                </li>
              ))}
            </ul>
          </div>
          {selectedUserData?.getUserById && (
            <div className="user-todos">
              <h2>Task for {selectedUserData.getUserById.name}</h2>
              {selectedUserData.getUserById.todos.length > 0 ? selectedUserData.getUserById.todos.map((todo) => (
                <div key={todo.id} className={`todo-item ${todo.completed ? "completed" : ""}`}>
                  <div className="todo-content">
                    <h3>{todo.title}</h3>
                    <p className="user-email">{todo.user ? todo.user.email : "No user assigned"}</p>
                  </div>
                  <div className="todo-actions">
                    <button onClick={() => handleUpdateTodo(todo.id, todo.completed)}>
                      {todo.completed ? "Mark Incomplete" : "Mark Complete"}
                    </button>
                    <button onClick={() => handleDeleteTodo(todo.id)}>Delete</button>
                  </div>
                </div>
              )) : <p>No Task</p>}
            </div>
          )}
          <div className="all-todos">
            <h2>All Tasks</h2>
            {filteredTodos.map((todo) => (
              <div key={todo.id} className={`todo-item ${todo.completed ? "completed" : ""}`}>
                <div className="todo-content">
                  <h3>{todo.title}</h3>
                  <p className="user-email">{todo.user ? todo.user.email : "No user assigned"}</p>
                </div>
                <div className="todo-actions">
                  <button onClick={() => handleUpdateTodo(todo.id, todo.completed)}>
                    {todo.completed ? "Mark Incomplete" : "Mark Complete"}
                  </button>
                  <button onClick={() => handleDeleteTodo(todo.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}

export default App

