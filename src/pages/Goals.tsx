import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './goals.css'

type Goal = {
  id: string
  title: string
  description: string | null
  goal_type: 'Short-term' | 'Long-term'
  progress: number
  deadline: string | null
}

function Goals() {
  const navigate = useNavigate()

  const [goals, setGoals] = useState<Goal[]>([])

  const [title, setTitle] = useState('')
  const [goalType, setGoalType] =
    useState<Goal['goal_type']>('Short-term')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')
  const [progress, setProgress] = useState('0')

  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadGoals()
  }, [])

  // =========================
  // LOAD GOALS FROM SUPABASE
  // =========================
  const loadGoals = async () => {
    setLoading(true)
    setError('')

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      navigate('/login')
      return
    }

    const { data, error } = await supabase
      .from('goals')
      .select(
        'id, title, description, goal_type, progress, deadline'
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('GOALS LOAD ERROR:', error)
      setError(error.message)
      setLoading(false)
      return
    }

    setGoals((data || []) as Goal[])
    setLoading(false)
  }

  // =========================
  // ADD GOAL
  // =========================
  const addGoal = async () => {
    if (!title.trim()) {
      alert('Please enter a goal title.')
      return
    }

    const progressNumber = Number(progress)

    if (
      Number.isNaN(progressNumber) ||
      progressNumber < 0 ||
      progressNumber > 100
    ) {
      alert('Progress must be between 0 and 100.')
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
      .from('goals')
      .insert({
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        goal_type: goalType,
        progress: progressNumber,
        deadline: deadline || null,
      })
      .select(
        'id, title, description, goal_type, progress, deadline'
      )
      .single()

    if (error) {
      console.error('GOAL INSERT ERROR:', error)
      setError(error.message)
      setAdding(false)
      return
    }

    setGoals((currentGoals) => [
      data as Goal,
      ...currentGoals,
    ])

    setTitle('')
    setGoalType('Short-term')
    setDescription('')
    setDeadline('')
    setProgress('0')
    setAdding(false)
  }

  // =========================
  // UPDATE PROGRESS
  // =========================
  const updateProgress = async (
    id: string,
    amount: number
  ) => {
    const goal = goals.find((item) => item.id === id)

    if (!goal) return

    const newProgress = Math.min(
      100,
      goal.progress + amount
    )

    setError('')

    const { error } = await supabase
      .from('goals')
      .update({
        progress: newProgress,
      })
      .eq('id', id)

    if (error) {
      console.error('GOAL UPDATE ERROR:', error)
      setError(error.message)
      return
    }

    setGoals((currentGoals) =>
      currentGoals.map((item) =>
        item.id === id
          ? {
              ...item,
              progress: newProgress,
            }
          : item
      )
    )
  }

  // =========================
  // DELETE GOAL
  // =========================
  const deleteGoal = async (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this goal?'
    )

    if (!confirmed) return

    setError('')

    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('GOAL DELETE ERROR:', error)
      setError(error.message)
      return
    }

    setGoals((currentGoals) =>
      currentGoals.filter((goal) => goal.id !== id)
    )
  }

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const completedGoals = goals.filter(
    (goal) => goal.progress >= 100
  ).length

  return (
    <div className="goals-page">

      {/* SIDEBAR */}
      <aside className="goals-sidebar">

        <div className="goals-logo">
          <div className="logo-icon">✦</div>

          <span>
            LifePilot <b>AI</b>
          </span>
        </div>

        <nav className="goals-nav">
          <Link to="/dashboard">
            ⌂ Dashboard
          </Link>

          <Link to="/planner">
            ✦ AI Planner
          </Link>

          <Link to="/tasks">
            ✓ Tasks
          </Link>

          <Link
            to="/goals"
            className="active"
          >
            ◎ Goals
          </Link>

          <Link to="/calendar">
            ▣ Calendar
          </Link>

          <Link to="/habits">
            ◉ Habits
          </Link>

          <Link to="/analytics">
            ↗ Analytics
          </Link>

          <Link to="/settings">
            ⚙ Settings
          </Link>
        </nav>

        <button
          className="goals-logout"
          onClick={handleLogout}
        >
          ← Log out
        </button>

      </aside>

      {/* MAIN */}
      <main className="goals-main">

        {/* HEADER */}
        <header className="goals-header">

          <div>
            <p className="goals-label">
              GOALS
            </p>

            <h1>
              Turn plans into progress.
            </h1>

            <p>
              Set meaningful goals and track how far you've come.
            </p>
          </div>

        </header>

        {/* STATS */}
        <section className="goal-stats">

          <div>
            <span>Total Goals</span>
            <strong>{goals.length}</strong>
          </div>

          <div>
            <span>Completed</span>
            <strong>{completedGoals}</strong>
          </div>

          <div>
            <span>In Progress</span>
            <strong>
              {goals.length - completedGoals}
            </strong>
          </div>

        </section>

        {/* CREATE GOAL */}
        <section className="add-goal-card">

          <div>
            <p className="goals-label">
              CREATE A GOAL
            </p>

            <h2>
              What do you want to achieve?
            </h2>
          </div>

          <div className="goal-form">

            <input
              type="text"
              placeholder="Example: Learn JavaScript"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
            />

            <select
              value={goalType}
              onChange={(e) =>
                setGoalType(
                  e.target.value as Goal['goal_type']
                )
              }
            >
              <option value="Short-term">
                Short-term
              </option>

              <option value="Long-term">
                Long-term
              </option>
            </select>

            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
            />

            <input
              type="date"
              value={deadline}
              onChange={(e) =>
                setDeadline(e.target.value)
              }
            />

            <input
              type="number"
              min="0"
              max="100"
              placeholder="Progress %"
              value={progress}
              onChange={(e) =>
                setProgress(e.target.value)
              }
            />

            <button
              onClick={addGoal}
              disabled={adding}
            >
              {adding
                ? 'Adding...'
                : '+ Add Goal'}
            </button>

          </div>

        </section>

        {/* ERROR */}
        {error && (
          <div className="task-error">
            {error}
          </div>
        )}

        {/* GOALS LIST */}
        <section className="goals-list-card">

          <div className="goals-list-heading">

            <div>
              <h2>
                Your Goals
              </h2>

              <p>
                Keep moving forward, one step at a time.
              </p>
            </div>

          </div>

          <div className="goals-list">

            {loading ? (

              <div className="empty-goals">
                <div>⏳</div>

                <h3>
                  Loading goals...
                </h3>

                <p>
                  Getting your goals from Supabase.
                </p>
              </div>

            ) : goals.length === 0 ? (

              <div className="empty-goals">
                <div>◎</div>

                <h3>
                  No goals yet
                </h3>

                <p>
                  Create your first goal and start making progress.
                </p>
              </div>

            ) : (

              goals.map((goal) => {

                const percentage = Math.min(
                  Math.round(goal.progress),
                  100
                )

                const completed =
                  percentage >= 100

                return (
                  <div
                    className="goal-card"
                    key={goal.id}
                  >

                    <div className="goal-top">

                      <div>

                        <span className="goal-category">
                          {goal.goal_type}
                        </span>

                        <h3>
                          {goal.title}
                        </h3>

                        {goal.description && (
                          <p>
                            {goal.description}
                          </p>
                        )}

                      </div>

                      <div className="goal-percent">
                        {percentage}%
                      </div>

                    </div>

                    <div className="goal-progress">

                      <div className="progress-info">

                        <span>
                          Progress: {percentage}%
                        </span>

                        <span>
                          {completed
                            ? 'Completed 🎉'
                            : goal.deadline
                              ? `Deadline: ${goal.deadline}`
                              : 'No deadline'}
                        </span>

                      </div>

                      <div className="goal-progress-bar">

                        <div
                          className="goal-progress-fill"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />

                      </div>

                    </div>

                    <div className="goal-actions">

                      {!completed && (
                        <>
                          <button
                            onClick={() =>
                              updateProgress(
                                goal.id,
                                1
                              )
                            }
                          >
                            +1 Progress
                          </button>

                          <button
                            onClick={() =>
                              updateProgress(
                                goal.id,
                                5
                              )
                            }
                          >
                            +5 Progress
                          </button>
                        </>
                      )}

                      <button
                        className="delete-goal"
                        onClick={() =>
                          deleteGoal(goal.id)
                        }
                      >
                        Delete
                      </button>

                    </div>

                  </div>
                )
              })
            )}

          </div>

        </section>

      </main>

    </div>
  )
}

export default Goals