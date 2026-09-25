import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './habits.css'

type Habit = {
  id: string
  name: string
  description: string | null
  frequency: string
  target_count: number
  current_streak: number
  longest_streak: number
  completion_percentage: number
  completedToday: boolean
}

function getToday() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getPreviousDate(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`)
  date.setDate(date.getDate() - 1)

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function Habits() {
  const navigate = useNavigate()

  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')

  const [habitName, setHabitName] = useState('')
  const [category, setCategory] = useState('Health')

  useEffect(() => {
    loadHabits()
  }, [])

  async function loadHabits() {
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

    const { data: habitData, error: habitError } = await supabase
      .from('habits')
      .select(
        `
        id,
        name,
        description,
        frequency,
        target_count,
        current_streak,
        longest_streak,
        completion_percentage
        `
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (habitError) {
      console.error('HABIT LOAD ERROR:', habitError)
      setError(habitError.message)
      setLoading(false)
      return
    }

    const today = getToday()

    const { data: logData, error: logError } = await supabase
      .from('habit_logs')
      .select('habit_id, completed')
      .eq('user_id', user.id)
      .eq('completed_date', today)

    if (logError) {
      console.error('HABIT LOG LOAD ERROR:', logError)
    }

    const completedMap = new Map<string, boolean>()

    ;(logData || []).forEach((log) => {
      completedMap.set(log.habit_id, log.completed)
    })

    const formattedHabits: Habit[] = (habitData || []).map((habit) => ({
      ...habit,
      current_streak: Number(habit.current_streak || 0),
      longest_streak: Number(habit.longest_streak || 0),
      completion_percentage: Number(habit.completion_percentage || 0),
      completedToday: completedMap.get(habit.id) || false,
    }))

    setHabits(formattedHabits)
    setLoading(false)
  }

  async function addHabit() {
    if (!habitName.trim()) {
      setError('Please enter a habit name.')
      return
    }

    setAdding(true)
    setError('')

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      setError('Please login again.')
      setAdding(false)
      return
    }

    const { data, error: insertError } = await supabase
      .from('habits')
      .insert({
        user_id: user.id,
        name: habitName.trim(),
        description: category,
        frequency: 'Daily',
        target_count: 1,
        current_streak: 0,
        longest_streak: 0,
        completion_percentage: 0,
      })
      .select()
      .single()

    if (insertError) {
      console.error('HABIT INSERT ERROR:', insertError)

      setError(
        `${insertError.message}${
          insertError.hint ? ` | ${insertError.hint}` : ''
        }`
      )

      setAdding(false)
      return
    }

    if (data) {
      const newHabit: Habit = {
        id: data.id,
        name: data.name,
        description: data.description,
        frequency: data.frequency,
        target_count: Number(data.target_count || 1),
        current_streak: Number(data.current_streak || 0),
        longest_streak: Number(data.longest_streak || 0),
        completion_percentage: Number(
          data.completion_percentage || 0
        ),
        completedToday: false,
      }

      setHabits((previous) => [newHabit, ...previous])
    }

    setHabitName('')
    setCategory('Health')
    setAdding(false)
  }

  async function toggleHabit(habit: Habit) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      navigate('/login')
      return
    }

    const today = getToday()
    const newCompletedStatus = !habit.completedToday

    const { error: logError } = await supabase
      .from('habit_logs')
      .upsert(
        {
          habit_id: habit.id,
          user_id: user.id,
          completed_date: today,
          completed: newCompletedStatus,
        },
        {
          onConflict: 'habit_id,completed_date',
        }
      )

    if (logError) {
      console.error('HABIT LOG ERROR:', logError)
      setError(logError.message)
      return
    }

    const { data: logs, error: logsError } = await supabase
      .from('habit_logs')
      .select('completed_date, completed')
      .eq('habit_id', habit.id)
      .eq('user_id', user.id)
      .eq('completed', true)
      .order('completed_date', { ascending: false })

    if (logsError) {
      console.error('HABIT STREAK ERROR:', logsError)
      setError(logsError.message)
      return
    }

    const completedDates = (logs || []).map(
      (log) => log.completed_date
    )

    let streak = 0
    let checkDate = today

    while (completedDates.includes(checkDate)) {
      streak++
      checkDate = getPreviousDate(checkDate)
    }

    let longestStreak = streak

    const sortedDates = [...completedDates].sort()

    let currentRun = 0
    let previousDate = ''

    for (const date of sortedDates) {
      if (!previousDate) {
        currentRun = 1
      } else {
        const expectedNext = new Date(
          `${previousDate}T00:00:00`
        )

        expectedNext.setDate(expectedNext.getDate() + 1)

        const year = expectedNext.getFullYear()
        const month = String(
          expectedNext.getMonth() + 1
        ).padStart(2, '0')
        const day = String(expectedNext.getDate()).padStart(2, '0')

        const expectedDate = `${year}-${month}-${day}`

        if (date === expectedDate) {
          currentRun++
        } else {
          currentRun = 1
        }
      }

      longestStreak = Math.max(longestStreak, currentRun)
      previousDate = date
    }

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29)

    const thirtyDaysAgoString =
      `${thirtyDaysAgo.getFullYear()}-` +
      `${String(thirtyDaysAgo.getMonth() + 1).padStart(2, '0')}-` +
      `${String(thirtyDaysAgo.getDate()).padStart(2, '0')}`

    const last30DaysCompleted = completedDates.filter(
      (date) => date >= thirtyDaysAgoString && date <= today
    ).length

    const completionPercentage = Math.round(
      (last30DaysCompleted / 30) * 100
    )

    const { error: updateError } = await supabase
      .from('habits')
      .update({
        current_streak: streak,
        longest_streak: longestStreak,
        completion_percentage: completionPercentage,
        updated_at: new Date().toISOString(),
      })
      .eq('id', habit.id)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('HABIT UPDATE ERROR:', updateError)
      setError(updateError.message)
      return
    }

    setHabits((previous) =>
      previous.map((item) =>
        item.id === habit.id
          ? {
              ...item,
              completedToday: newCompletedStatus,
              current_streak: streak,
              longest_streak: longestStreak,
              completion_percentage:
                completionPercentage,
            }
          : item
      )
    )
  }

  async function deleteHabit(id: string) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this habit?'
    )

    if (!confirmed) return

    setError('')

    const { error: logError } = await supabase
      .from('habit_logs')
      .delete()
      .eq('habit_id', id)

    if (logError) {
      console.error('HABIT LOG DELETE ERROR:', logError)
      setError(logError.message)
      return
    }

    const { error: habitError } = await supabase
      .from('habits')
      .delete()
      .eq('id', id)

    if (habitError) {
      console.error('HABIT DELETE ERROR:', habitError)
      setError(habitError.message)
      return
    }

    setHabits((previous) =>
      previous.filter((habit) => habit.id !== id)
    )
  }

  async function logout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const completedCount = habits.filter(
    (habit) => habit.completedToday
  ).length

  const averageCompletion =
    habits.length > 0
      ? Math.round(
          habits.reduce(
            (total, habit) =>
              total + habit.completion_percentage,
            0
          ) / habits.length
        )
      : 0

  return (
    <div className="habits-page">
      <aside className="sidebar">
        <div className="logo">
          <span>✦</span>
          LifePilot AI
        </div>

        <nav>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/planner">AI Planner</Link>
          <Link to="/tasks">Tasks</Link>
          <Link to="/goals">Goals</Link>
          <Link to="/calendar">Calendar</Link>
          <Link to="/habits" className="active">
            Habits
          </Link>
          <Link to="/analytics">Analytics</Link>
          <Link to="/settings">Settings</Link>
        </nav>

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </aside>

      <main className="habits-main">
        <header className="page-header">
          <div>
            <h1>Habit Tracker</h1>
            <p>
              Build consistency, track your streaks, and improve
              every day.
            </p>
          </div>
        </header>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <section className="habit-summary">
          <div className="summary-card">
            <span>Total Habits</span>
            <strong>{habits.length}</strong>
          </div>

          <div className="summary-card">
            <span>Completed Today</span>
            <strong>
              {completedCount}/{habits.length}
            </strong>
          </div>

          <div className="summary-card">
            <span>Average Progress</span>
            <strong>{averageCompletion}%</strong>
          </div>
        </section>

        <section className="add-habit-card">
          <h2>Add New Habit</h2>

          <div className="habit-form">
            <input
              type="text"
              placeholder="Example: Study for 1 Hour"
              value={habitName}
              onChange={(event) =>
                setHabitName(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  addHabit()
                }
              }}
            />

            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
            >
              <option value="Health">Health</option>
              <option value="Learning">Learning</option>
              <option value="Fitness">Fitness</option>
              <option value="Personal">Personal</option>
              <option value="Other">Other</option>
            </select>

            <button
              onClick={addHabit}
              disabled={adding}
            >
              {adding ? 'Adding...' : '+ Add Habit'}
            </button>
          </div>
        </section>

        <section className="habits-section">
          <div className="section-heading">
            <div>
              <h2>Your Habits</h2>
              <p>Stay consistent with your daily routine.</p>
            </div>
          </div>

          {loading ? (
            <div className="empty-state">
              <p>Loading your habits...</p>
            </div>
          ) : habits.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🌱</div>
              <h3>No habits yet</h3>
              <p>
                Add your first habit and start building a
                consistent routine.
              </p>
            </div>
          ) : (
            <div className="habits-grid">
              {habits.map((habit) => (
                <div
                  className={`habit-card ${
                    habit.completedToday
                      ? 'completed'
                      : ''
                  }`}
                  key={habit.id}
                >
                  <div className="habit-card-top">
                    <div>
                      <span className="habit-category">
                        {habit.description || 'Personal'}
                      </span>

                      <h3>{habit.name}</h3>
                      <p>{habit.frequency}</p>
                    </div>

                    <button
                      className={`check-btn ${
                        habit.completedToday
                          ? 'checked'
                          : ''
                      }`}
                      onClick={() =>
                        toggleHabit(habit)
                      }
                    >
                      {habit.completedToday ? '✓' : '○'}
                    </button>
                  </div>

                  <div className="habit-stats">
                    <div>
                      <span>🔥 Streak</span>
                      <strong>
                        {habit.current_streak} days
                      </strong>
                    </div>

                    <div>
                      <span>🏆 Best</span>
                      <strong>
                        {habit.longest_streak} days
                      </strong>
                    </div>

                    <div>
                      <span>📈 Progress</span>
                      <strong>
                        {Math.round(
                          habit.completion_percentage
                        )}
                        %
                      </strong>
                    </div>
                  </div>

                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(
                            0,
                            habit.completion_percentage
                          )
                        )}%`,
                      }}
                    />
                  </div>

                  <div className="habit-card-footer">
                    <span>
                      {habit.completedToday
                        ? 'Completed today 🎉'
                        : 'Not completed today'}
                    </span>

                    <button
                      className="delete-habit"
                      onClick={() =>
                        deleteHabit(habit.id)
                      }
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default Habits