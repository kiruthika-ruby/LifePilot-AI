import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Planner.css'

type PlanItem = {
  time: string
  task: string
  duration: string
  type: string
}

type ParsedTask = {
  task: string
  minutes: number
  type: string
  fixedTime?: number
}

function formatTime(totalMinutes: number) {
  const minutesInDay = 24 * 60
  totalMinutes = ((totalMinutes % minutesInDay) + minutesInDay) % minutesInDay

  const hour = Math.floor(totalMinutes / 60)
  const minute = totalMinutes % 60

  const period = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12

  return `${String(displayHour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours > 0 && mins > 0) {
    return `${hours} hr ${mins} min`
  }

  if (hours > 0) {
    return `${hours} hr`
  }

  return `${mins} min`
}

function getType(task: string) {
  const text = task.toLowerCase()

  if (
    text.includes('exam') ||
    text.includes('study') ||
    text.includes('assignment')
  ) {
    return 'Study'
  }

  if (
    text.includes('workout') ||
    text.includes('gym') ||
    text.includes('exercise')
  ) {
    return 'Health'
  }

  if (
    text.includes('read') ||
    text.includes('learn') ||
    text.includes('learning')
  ) {
    return 'Learning'
  }

  if (
    text.includes('meeting') ||
    text.includes('class')
  ) {
    return 'Schedule'
  }

  return 'Priority'
}

function parseDuration(text: string): number {
  const hourMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|hr)/i)
  const minuteMatch = text.match(/(\d+)\s*(?:minutes?|mins?|min)/i)

  let minutes = 60

  if (hourMatch) {
    minutes = Math.round(parseFloat(hourMatch[1]) * 60)
  }

  if (minuteMatch) {
    minutes = parseInt(minuteMatch[1], 10)
  }

  return minutes
}

function parseTime(text: string): number | undefined {
  const match = text.match(
    /(?:at|by|@)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i
  )

  if (!match) return undefined

  let hour = parseInt(match[1], 10)
  const minute = match[2] ? parseInt(match[2], 10) : 0
  const period = match[3]?.toLowerCase()

  if (period === 'pm' && hour < 12) {
    hour += 12
  }

  if (period === 'am' && hour === 12) {
    hour = 0
  }

  return hour * 60 + minute
}

function parseTasks(text: string): ParsedTask[] {
  const tasks: ParsedTask[] = []

  const sentences = text
    .split(/[.!?\n]+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)

  for (const sentence of sentences) {
    const lower = sentence.toLowerCase()

    // Exam / meeting / class with a specific time
    const fixedTime = parseTime(sentence)

    if (
      lower.includes('exam') ||
      lower.includes('meeting') ||
      lower.includes('class')
    ) {
      const taskName = sentence
        .replace(/tomorrow/gi, '')
        .replace(/at\s+\d{1,2}(?::\d{2})?\s*(am|pm)?/gi, '')
        .trim()

      tasks.push({
        task: taskName || 'Important Event',
        minutes: 60,
        type: getType(taskName),
        fixedTime,
      })

      continue
    }

    // "study for 3 hours"
    const studyMatch = sentence.match(
      /(?:study|work on|prepare for)\s*(?:for\s*)?(.+?)(?:\s+for\s+(\d+(?:\.\d+)?)\s*(hours?|hrs?|hr|minutes?|mins?|min))?$/i
    )

    if (studyMatch) {
      const duration = parseDuration(sentence)

      let taskName = sentence
        .replace(/\s+for\s+\d+(?:\.\d+)?\s*(hours?|hrs?|hr|minutes?|mins?|min)/gi, '')
        .trim()

      if (taskName.length > 2) {
        tasks.push({
          task: taskName.charAt(0).toUpperCase() + taskName.slice(1),
          minutes: duration,
          type: getType(taskName),
        })

        continue
      }
    }

    // General task with duration
    const durationMatch = sentence.match(
      /(.+?)\s+(?:for\s+)?(\d+(?:\.\d+)?)\s*(hours?|hrs?|hr|minutes?|mins?|min)/i
    )

    if (durationMatch) {
      let taskName = durationMatch[1]
        .replace(/^(need to|have to|i need to|i have to)\s+/i, '')
        .trim()

      if (taskName.length > 2) {
        tasks.push({
          task: taskName.charAt(0).toUpperCase() + taskName.slice(1),
          minutes: parseDuration(sentence),
          type: getType(taskName),
        })
      }
    }
  }

  return tasks
}

function Planner() {
  const [input, setInput] = useState('')
  const [plan, setPlan] = useState<PlanItem[]>([])
  const [loading, setLoading] = useState(false)

  const generatePlan = () => {
    if (!input.trim()) return

    setLoading(true)

    setTimeout(() => {
      const parsedTasks = parseTasks(input)

      let tasks = parsedTasks

      // Fallback if the sentence structure is difficult to parse
      if (tasks.length === 0) {
        tasks = [
          {
            task: input.trim(),
            minutes: 60,
            type: 'Priority',
          },
        ]
      }

      const sortedTasks = [...tasks].sort((a, b) => {
        if (a.fixedTime !== undefined && b.fixedTime !== undefined) {
          return a.fixedTime - b.fixedTime
        }

        if (a.fixedTime !== undefined) return 1
        if (b.fixedTime !== undefined) return -1

        return 0
      })

      let currentTime = 9 * 60

      const generatedPlan: PlanItem[] = []

      for (const item of sortedTasks) {
        if (item.fixedTime !== undefined) {
          if (currentTime < item.fixedTime) {
            currentTime = item.fixedTime
          }
        }

        generatedPlan.push({
          time: formatTime(currentTime),
          task: item.task,
          duration: formatDuration(item.minutes),
          type: item.type,
        })

        currentTime += item.minutes

        // Add a small break after long tasks
        if (item.minutes >= 90) {
          currentTime += 15
        }
      }

      setPlan(generatedPlan)
      setLoading(false)
    }, 700)
  }

  return (
    <div className="planner-page">

      {/* Sidebar */}
      <aside className="planner-sidebar">
        <div className="planner-logo">
          <div className="logo-icon">✦</div>
          <span>LifePilot <b>AI</b></span>
        </div>

        <nav className="planner-nav">
          <Link to="/dashboard">⌂ Dashboard</Link>
          <Link to="/planner" className="active">✦ AI Planner</Link>
          <Link to="/tasks">✓ Tasks</Link>
          <Link to="/goals">◎ Goals</Link>
          <Link to="/calendar">▣ Calendar</Link>
          <Link to="/habits">◉ Habits</Link>
          <Link to="/analytics">↗ Analytics</Link>
          <Link to="/settings">⚙ Settings</Link>
        </nav>

        <Link to="/" className="planner-logout">
          ← Log out
        </Link>
      </aside>

      {/* Main */}
      <main className="planner-main">

        <header className="planner-header">
          <div>
            <p className="planner-label">AI LIFE PLANNER</p>
            <h1>Plan your day smarter.</h1>
            <p>
              Tell LifePilot what you need to accomplish and let AI
              organize your day.
            </p>
          </div>
        </header>

        {/* AI Input */}
        <section className="planner-input-card">

          <div className="ai-heading">
            <div className="big-ai-icon">✦</div>

            <div>
              <h2>What do you need to accomplish?</h2>
              <p>
                Tell me about your tasks, deadlines, meetings,
                or personal plans.
              </p>
            </div>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Example: I have an exam tomorrow at 4 PM. Study for 3 hours. Complete my assignment for 2 hours. Workout for 1 hour. Read for 30 minutes."
          />

          <div className="planner-actions">
            <span>✦ LifePilot will organize your tasks</span>

            <button onClick={generatePlan} disabled={loading}>
              {loading ? 'Creating your plan...' : '✦ Generate My Plan'}
            </button>
          </div>

        </section>

        {/* Generated Plan */}
        {plan.length > 0 && (
          <section className="generated-plan">

            <div className="plan-heading">
              <div>
                <p className="planner-label">YOUR AI PLAN</p>
                <h2>Here's your optimized day ✨</h2>
                <p>
                  Your tasks and durations are arranged into a
                  practical schedule.
                </p>
              </div>

              <div className="plan-score">
                <strong>92%</strong>
                <span>Optimized</span>
              </div>
            </div>

            <div className="timeline">

              {plan.map((item, index) => (
                <div className="timeline-item" key={index}>

                  <div className="timeline-time">
                    {item.time}
                  </div>

                  <div className="timeline-line">
                    <div className="timeline-dot"></div>
                  </div>

                  <div className="timeline-content">
                    <div>
                      <strong>{item.task}</strong>
                      <p>{item.type} • {item.duration}</p>
                    </div>

                    <span className="plan-duration">
                      {item.duration}
                    </span>
                  </div>

                </div>
              ))}

            </div>

            <div className="ai-message">
              <div>✦</div>
              <p>
                <strong>AI Suggestion:</strong> Your tasks have been
                arranged according to their durations and any specific
                times you mentioned.
              </p>
            </div>

          </section>
        )}

      </main>
    </div>
  )
}

export default Planner