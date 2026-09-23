import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import Planner from './pages/Planner'
import Goals from './pages/Goals'
import Habits from './pages/Habits'
import Calendar from './pages/Calendar'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import './App.css'

function Home() {
  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">
          <div className="logo-icon">✦</div>
          <span>LifePilot<span className="logo-ai"> AI</span></span>
        </div>

        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#about">About</a>
        </div>

        <div className="nav-actions">
          <Link to="/login" className="login-btn">Log In</Link>
          <Link to="/login" className="signup-btn">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main>
        <section className="hero">
          <div className="hero-content">
            <div className="badge">
              <span>✦</span>
              AI-Powered Life Planning
            </div>

            <h1>
              Plan Your Life
              <br />
              <span>Smarter with AI.</span>
            </h1>

            <p className="hero-description">
              LifePilot AI helps you organize your tasks, goals, habits,
              and schedule — so you can focus on what truly matters.
            </p>

            <div className="hero-buttons">
              <Link to="/login" className="primary-btn">
                Start Planning
                <span>→</span>
              </Link>

              <a href="#how-it-works" className="secondary-btn">
                See How It Works
              </a>
            </div>

            <div className="trust">
              <div className="avatars">
                <span>👩🏻</span>
                <span>👨🏻</span>
                <span>👩🏽</span>
                <span>👨🏽</span>
              </div>
              <div>
                <strong>10,000+</strong>
                <p>people planning smarter</p>
              </div>
            </div>
          </div>

          {/* Planner Preview */}
          <div className="planner-wrapper">
            <div className="planner-glow"></div>

            <div className="planner-card">
              <div className="planner-header">
                <div>
                  <p className="small-text">TODAY</p>
                  <h3>Your Daily Plan</h3>
                </div>
                <div className="date">Aug 30</div>
              </div>

              <div className="progress-section">
                <div className="progress-info">
                  <span>Daily Progress</span>
                  <strong>72%</strong>
                </div>

                <div className="progress-bar">
                  <div className="progress-fill"></div>
                </div>
              </div>

              <div className="schedule">
                <div className="schedule-item completed">
                  <div className="time">09:00</div>
                  <div className="check">✓</div>
                  <div className="task-info">
                    <strong>Morning Workout</strong>
                    <span>Health • 45 min</span>
                  </div>
                </div>

                <div className="schedule-item">
                  <div className="time">10:00</div>
                  <div className="task-dot"></div>
                  <div className="task-info">
                    <strong>Study Data Science</strong>
                    <span>Study • 1 hr 30 min</span>
                  </div>
                </div>

                <div className="schedule-item">
                  <div className="time">12:00</div>
                  <div className="task-dot purple"></div>
                  <div className="task-info">
                    <strong>Complete Assignment</strong>
                    <span>Work • 1 hr</span>
                  </div>
                </div>

                <div className="schedule-item">
                  <div className="time">14:00</div>
                  <div className="task-dot green"></div>
                  <div className="task-info">
                    <strong>Learn Python</strong>
                    <span>Learning • 1 hr</span>
                  </div>
                </div>
              </div>

              <div className="ai-tip">
                <div className="ai-icon">✦</div>
                <div>
                  <strong>AI Suggestion</strong>
                  <p>
                    You're most productive in the morning.
                    I've prioritized your important tasks.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="features">
          <div className="section-heading">
            <div className="badge">SMART PLANNING</div>
            <h2>Everything you need to stay on track.</h2>
            <p>
              One intelligent platform to manage your entire day,
              your goals, and your future.
            </p>
          </div>

          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon blue">✦</div>
              <h3>AI Daily Planner</h3>
              <p>
                Let AI create a personalized schedule based on your
                tasks, deadlines, and available time.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon purple">✓</div>
              <h3>Smart Task Management</h3>
              <p>
                Organize tasks automatically by urgency and importance.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon green">◎</div>
              <h3>Goals & Habits</h3>
              <p>
                Build better habits and track your progress toward
                meaningful goals.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon orange">↗</div>
              <h3>Productivity Insights</h3>
              <p>
                Understand your productivity patterns and discover
                how to improve.
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="how-section">
          <div className="section-heading">
            <div className="badge">HOW IT WORKS</div>
            <h2>Your day, simplified.</h2>
            <p>Three simple steps to a more organized life.</p>
          </div>

          <div className="steps">
            <div className="step">
              <div className="step-number">01</div>
              <h3>Tell us your priorities</h3>
              <p>
                Add your tasks, goals, deadlines, and available time.
              </p>
            </div>

            <div className="step">
              <div className="step-number">02</div>
              <h3>Let AI plan your day</h3>
              <p>
                LifePilot analyzes everything and creates your
                optimized schedule.
              </p>
            </div>

            <div className="step">
              <div className="step-number">03</div>
              <h3>Get things done</h3>
              <p>
                Follow your plan, track your progress, and improve
                every day.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="about" className="footer">
        <div className="logo">
          <div className="logo-icon">✦</div>
          <span>LifePilot<span className="logo-ai"> AI</span></span>
        </div>

        <p>Plan smarter. Live better.</p>

        <span className="copyright">
          © 2026 LifePilot AI. All rights reserved.
        </span>
      </footer>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/planner" element={<Planner />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/habits" element={<Habits />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App