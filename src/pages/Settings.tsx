import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Settings.css'

function Settings() {
  const [name, setName] = useState('Alex')
  const [email, setEmail] = useState('alex@example.com')
  const [notifications, setNotifications] = useState(true)
  const [smartPlanning, setSmartPlanning] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [saved, setSaved] = useState(false)


  const saveSettings = () => {
    setSaved(true)

    setTimeout(() => {
      setSaved(false)
    }, 2000)
  }

  return (
    <div className="settings-page">

      {/* Sidebar */}
      <aside className="settings-sidebar">

        <div className="settings-logo">
          <div className="logo-icon">✦</div>
          <span>
            LifePilot <b>AI</b>
          </span>
        </div>

        <nav className="settings-nav">
          <Link to="/dashboard">⌂ Dashboard</Link>
          <Link to="/planner">✦ AI Planner</Link>
          <Link to="/tasks">✓ Tasks</Link>
          <Link to="/goals">◎ Goals</Link>
          <Link to="/calendar">▣ Calendar</Link>
          <Link to="/habits">◉ Habits</Link>
          <Link to="/analytics">↗ Analytics</Link>
          <Link to="/settings" className="active">
            ⚙ Settings
          </Link>
        </nav>

        <Link to="/" className="settings-logout">
          ← Log out
        </Link>

      </aside>

      {/* Main */}
      <main className="settings-main">

        <header className="settings-header">
          <div>
            <p className="settings-label">SETTINGS</p>

            <h1>Make LifePilot work for you.</h1>

            <p>
              Customize your profile and planning preferences.
            </p>
          </div>
        </header>

        {/* Profile */}
        <section className="settings-card">

          <div className="settings-card-heading">
            <div>
              <p className="settings-label">PROFILE</p>
              <h2>Your personal details</h2>
              <p>
                This information helps LifePilot personalize your
                experience.
              </p>
            </div>

            <div className="profile-avatar">
              {name.charAt(0).toUpperCase()}
            </div>
          </div>

          <div className="settings-form">

            <div className="form-group">
              <label>Full Name</label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

          </div>

        </section>

        {/* Preferences */}
        <section className="settings-card">

          <div className="settings-card-heading">
            <div>
              <p className="settings-label">PREFERENCES</p>
              <h2>Planning preferences</h2>
              <p>
                Choose how LifePilot helps organize your day.
              </p>
            </div>
          </div>

          <div className="preference-list">

            <div className="preference-item">

              <div>
                <h3>AI Smart Planning</h3>

                <p>
                  Allow LifePilot to prioritize tasks and suggest
                  an optimized schedule.
                </p>
              </div>

              <button
                className={`toggle ${
                  smartPlanning ? 'on' : ''
                }`}
                onClick={() =>
                  setSmartPlanning(!smartPlanning)
                }
              >
                <span></span>
              </button>

            </div>

            <div className="preference-item">

              <div>
                <h3>Notifications</h3>

                <p>
                  Receive reminders for tasks, habits, and upcoming
                  events.
                </p>
              </div>

              <button
                className={`toggle ${
                  notifications ? 'on' : ''
                }`}
                onClick={() =>
                  setNotifications(!notifications)
                }
              >
                <span></span>
              </button>

            </div>

          </div>

        </section>

        {/* Appearance */}
        <section className="settings-card">

          <div className="settings-card-heading">
            <div>
              <p className="settings-label">APPEARANCE</p>
              <h2>Display preferences</h2>
              <p>
                Choose how LifePilot looks on your screen.
              </p>
            </div>
          </div>

          <div className="appearance-options">

            <button className="appearance-option selected">
              <div className="appearance-preview light-preview">
                <div></div>
                <div></div>
              </div>

              <strong>Light</strong>
              <span>Clean & bright</span>
            </button>

            <button
               className={`appearance-option ${
               darkMode ? 'selected' : ''
              }`}
             onClick={() => setDarkMode(true)}
>
           <div className="appearance-preview dark-preview">
             <div></div>
            <div></div>
           </div>

           <strong>Dark</strong>
           <span>Easy on the eyes</span>
           </button>

            <button
              className="appearance-option"
              onClick={() =>
                alert('System theme coming soon!')
              }
            >
              <div className="appearance-preview system-preview">
                <div></div>
                <div></div>
              </div>

              <strong>System</strong>
              <span>Use device setting</span>
            </button>

          </div>

        </section>

        {/* Save */}
        <div className="settings-save">

          {saved && (
            <span className="saved-message">
              ✓ Settings saved successfully
            </span>
          )}

          <button
            className="save-settings-btn"
            onClick={saveSettings}
          >
            Save Changes
          </button>

        </div>

      </main>
    </div>
  )
}

export default Settings