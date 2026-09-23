import { Link } from 'react-router-dom'
import './Dashboard.css'

function Dashboard() {
  return (
    <div className="dashboard">

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="dashboard-logo">
          <div className="logo-icon">✦</div>
          <span>LifePilot <b>AI</b></span>
        </div>

        <nav className="sidebar-nav">
          <Link to="/dashboard" className="active">⌂ Dashboard</Link>
          <Link to="/planner">✦ AI Planner</Link>
          <Link to="/tasks">✓ Tasks</Link>
          <Link to="/goals">◎ Goals</Link>
          <Link to="/calendar">▣ Calendar</Link>
          <Link to="/habits">◉ Habits</Link>
          <Link to="/analytics">↗ Analytics</Link>
          <Link to="/notifications">♢ Notifications</Link>
          <Link to="/settings">⚙ Settings</Link>
        </nav>

        <div className="sidebar-bottom">
          <Link to="/">← Log out</Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">

        {/* Top Bar */}
        <header className="dashboard-header">
          <div className="search-box">
            <span>⌕</span>
            <input
              type="text"
              placeholder="Search tasks, goals..."
            />
          </div>

          <div className="header-right">
            <button className="notification-btn">♢</button>

            <div className="profile">
              <div className="profile-avatar">K</div>
              <div>
                <strong>Welcome!</strong>
                <span>My Profile</span>
              </div>
            </div>
          </div>
        </header>

        {/* Welcome */}
        <section className="welcome-section">
          <div>
            <p className="dashboard-date">Sunday, August 31, 2026</p>
            <h1>Good morning! 👋</h1>
            <p>
              Let's make today productive and meaningful.
            </p>
          </div>

          <Link to="/planner" className="ai-plan-btn">
            ✦ Plan My Day with AI
          </Link>
        </section>

        {/* Stats */}
        <section className="stats-grid">

          <div className="stat-card">
            <div className="stat-top">
              <span>Today's Productivity</span>
              <div className="stat-icon purple">↗</div>
            </div>
            <h2>72%</h2>
            <p className="positive">↑ 8% from yesterday</p>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>Tasks Completed</span>
              <div className="stat-icon green">✓</div>
            </div>
            <h2>8 / 11</h2>
            <p>3 tasks remaining</p>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>Active Goals</span>
              <div className="stat-icon blue">◎</div>
            </div>
            <h2>4</h2>
            <p>2 goals near deadline</p>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>Habit Streak</span>
              <div className="stat-icon orange">🔥</div>
            </div>
            <h2>12 days</h2>
            <p className="positive">Personal best!</p>
          </div>

        </section>

        {/* Dashboard Grid */}
        <section className="dashboard-grid">

          {/* Today's Schedule */}
          <div className="dashboard-card schedule-card">
            <div className="card-heading">
              <div>
                <h2>Today's Schedule</h2>
                <p>Your AI-optimized plan</p>
              </div>

              <Link to="/planner">View all →</Link>
            </div>

            <div className="dashboard-tasks">

              <div className="dashboard-task completed-task">
                <span className="task-time">09:00</span>
                <span className="task-check">✓</span>
                <div>
                  <strong>Morning Workout</strong>
                  <p>Health • 45 min</p>
                </div>
              </div>

              <div className="dashboard-task">
                <span className="task-time">10:00</span>
                <span className="task-dot"></span>
                <div>
                  <strong>Study Data Science</strong>
                  <p>Study • 1 hr 30 min</p>
                </div>
              </div>

              <div className="dashboard-task">
                <span className="task-time">12:00</span>
                <span className="task-dot purple-dot"></span>
                <div>
                  <strong>Complete Assignment</strong>
                  <p>Work • 1 hr</p>
                </div>
              </div>

              <div className="dashboard-task">
                <span className="task-time">14:00</span>
                <span className="task-dot green-dot"></span>
                <div>
                  <strong>Learn Python</strong>
                  <p>Learning • 1 hr</p>
                </div>
              </div>

            </div>
          </div>

          {/* Goals */}
          <div className="dashboard-card">
            <div className="card-heading">
              <div>
                <h2>Goals Progress</h2>
                <p>Keep moving forward</p>
              </div>

              <Link to="/goals">View all →</Link>
            </div>

            <div className="goal-item">
              <div className="goal-title">
                <span>Learn Python</span>
                <strong>65%</strong>
              </div>
              <div className="goal-bar">
                <div className="goal-fill" style={{ width: '65%' }}></div>
              </div>
            </div>

            <div className="goal-item">
              <div className="goal-title">
                <span>Complete DAA Preparation</span>
                <strong>48%</strong>
              </div>
              <div className="goal-bar">
                <div className="goal-fill" style={{ width: '48%' }}></div>
              </div>
            </div>

            <div className="goal-item">
              <div className="goal-title">
                <span>Build Portfolio</span>
                <strong>30%</strong>
              </div>
              <div className="goal-bar">
                <div className="goal-fill" style={{ width: '30%' }}></div>
              </div>
            </div>
          </div>

          {/* AI Insight */}
          <div className="dashboard-card ai-insight">
            <div className="insight-icon">✦</div>
            <div>
              <span>AI INSIGHT</span>
              <h3>You're most productive in the morning.</h3>
              <p>
                Consider scheduling your most important study
                tasks before lunch for better results.
              </p>
            </div>
          </div>

          {/* Habits */}
          <div className="dashboard-card">
            <div className="card-heading">
              <div>
                <h2>Today's Habits</h2>
                <p>Build consistency</p>
              </div>

              <Link to="/habits">View all →</Link>
            </div>

            <div className="habit-list">
              <div className="habit-row">
                <span>📚 Study</span>
                <strong className="habit-done">✓ Done</strong>
              </div>

              <div className="habit-row">
                <span>🏃 Exercise</span>
                <strong className="habit-done">✓ Done</strong>
              </div>

              <div className="habit-row">
                <span>📖 Reading</span>
                <strong className="habit-pending">Pending</strong>
              </div>
            </div>
          </div>

        </section>

      </main>
    </div>
  )
}

export default Dashboard