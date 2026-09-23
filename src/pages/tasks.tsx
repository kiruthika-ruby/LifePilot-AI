import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './Tasks.css'

type Task = {
  id: string
  title: string
  priority: 'High' | 'Medium' | 'Low'
  completed: boolean
}

function Tasks() {
  const navigate = useNavigate()

  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState('')
  const [priority, setPriority] = useState<Task['priority']>('Medium')
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadTasks()
  }, [])
  const loadTasks = async () => {
  setLoading(true)
  setError('')

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  console.log('=== LIFEPILOT DEBUG ===')
  console.log('USER:', user)
  console.log('USER ID:', user?.id)
  console.log('USER ERROR:', userError)

  if (!user) {
    console.log('NO USER - REDIRECTING TO LOGIN')
    navigate('/login')
    return
  }

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  console.log('TASK DATA:', data)
  console.log('TASK ERROR:', error)

  if (error) {
    setError(error.message)
    setLoading(false)
    return
  }

  setTasks((data || []) as Task[])
  setLoading(false)
}
  const addTask = async () => {
    if (!newTask.trim()) {
      alert('Please enter a task.')
      return
    }

    setAdding(true)
    setError('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      navigate('/login')
      return
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        title: newTask.trim(),
        priority,
        completed: false,
      })
      .select('id, title, priority, completed')
      .single()

    if (error) {
      setError(error.message)
      setAdding(false)
      return
    }

    setTasks((currentTasks) => [data as Task, ...currentTasks])
    setNewTask('')
    setPriority('Medium')
    setAdding(false)
  }

  const toggleTask = async (id: string, completed: boolean) => {
    setError('')

    const { error } = await supabase
      .from('tasks')
      .update({ completed: !completed })
      .eq('id', id)

    if (error) {
      setError(error.message)
      return
    }

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id
          ? { ...task, completed: !completed }
          : task
      )
    )
  }

  const deleteTask = async (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this task?'
    )

    if (!confirmed) return

    setError('')

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)

    if (error) {
      setError(error.message)
      return
    }

    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== id)
    )
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const completedTasks = tasks.filter((task) => task.completed).length

  return (
    <div className="tasks-page">

      {/* Sidebar */}
      <aside className="tasks-sidebar">

        <div className="tasks-logo">
          <div className="logo-icon">✦</div>
          <span>
            LifePilot <b>AI</b>
          </span>
        </div>

        <nav className="tasks-nav">
          <Link to="/dashboard">⌂ Dashboard</Link>
          <Link to="/planner">✦ AI Planner</Link>
          <Link to="/tasks" className="active">✓ Tasks</Link>
          <Link to="/goals">◎ Goals</Link>
          <Link to="/calendar">▣ Calendar</Link>
          <Link to="/habits">◉ Habits</Link>
          <Link to="/analytics">↗ Analytics</Link>
          <Link to="/settings">⚙ Settings</Link>
        </nav>

        <button
          className="logout-link"
          onClick={handleLogout}
        >
          ← Log out
        </button>

      </aside>

      {/* Main */}
      <main className="tasks-main">

        <div className="tasks-header">
          <div>
            <p className="page-label">TASK MANAGEMENT</p>
            <h1>My Tasks</h1>
            <p>Organize your work and stay on track.</p>
          </div>

          <Link to="/planner" className="ai-task-btn">
            ✦ Plan with AI
          </Link>
        </div>

        {/* Add Task */}
        <section className="add-task-card">
          <h2>Add a new task</h2>

          <div className="task-form">

            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="What do you need to do?"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  addTask()
                }
              }}
            />

            <select
              value={priority}
              onChange={(e) =>
                setPriority(e.target.value as Task['priority'])
              }
            >
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>

            <button
              onClick={addTask}
              disabled={adding}
            >
              {adding ? 'Adding...' : '+ Add Task'}
            </button>

          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="task-error">
            {error}
          </div>
        )}

        {/* Stats */}
        <section className="task-stats">

          <div>
            <span>Total Tasks</span>
            <strong>{tasks.length}</strong>
          </div>

          <div>
            <span>Completed</span>
            <strong>{completedTasks}</strong>
          </div>

          <div>
            <span>Remaining</span>
            <strong>{tasks.length - completedTasks}</strong>
          </div>

        </section>

        {/* Task List */}
        <section className="task-list-card">

          <div className="task-list-header">
            <div>
              <h2>Today's Tasks</h2>
              <p>
                Complete your tasks and keep moving forward.
              </p>
            </div>
          </div>

          <div className="task-list">

            {loading ? (

              <div className="empty-tasks">
                <div>⏳</div>
                <h3>Loading tasks...</h3>
                <p>Getting your tasks from Supabase.</p>
              </div>

            ) : tasks.length === 0 ? (

              <div className="empty-tasks">
                <div>✦</div>
                <h3>No tasks yet</h3>
                <p>Add your first task above.</p>
              </div>

            ) : (

              tasks.map((task) => (

                <div
                  className={`task-row ${
                    task.completed ? 'task-completed' : ''
                  }`}
                  key={task.id}
                >

                  <button
                    className="complete-btn"
                    onClick={() =>
                      toggleTask(task.id, task.completed)
                    }
                  >
                    {task.completed ? '✓' : ''}
                  </button>

                  <div className="task-content">
                    <strong>{task.title}</strong>

                    <span
                      className={`priority ${task.priority.toLowerCase()}`}
                    >
                      {task.priority} Priority
                    </span>
                  </div>

                  <button
                    className="delete-btn"
                    onClick={() => deleteTask(task.id)}
                  >
                    Delete
                  </button>

                </div>

              ))

            )}

          </div>

        </section>

      </main>

    </div>
  )
}

export default Tasks