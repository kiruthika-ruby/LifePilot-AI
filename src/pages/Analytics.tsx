import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BarChart3,
  CheckCircle2,
  Clock3,
  Target,
  Flame,
  LogOut,
  TrendingUp,
  ListChecks,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { supabase } from "../lib/supabase";
import "./Analytics.css";

type Task = {
  id: string;
  title: string;
  category: string | null;
  completed: boolean | null;
  estimated_duration: number | null;
  created_at: string;
};

type Goal = {
  id: string;
  title: string;
  progress: number | null;
  deadline: string | null;
};

type Habit = {
  id: string;
  name: string;
  current_streak: number | null;
  longest_streak: number | null;
  completion_percentage: number | null;
};

type HabitLog = {
  habit_id: string;
  completed_date: string;
  completed: boolean | null;
};

type ProductivityLog = {
  log_date: string;
  productivity_percentage: number | null;
  completed_tasks: number | null;
  total_tasks: number | null;
  focus_hours: number | null;
};



const getDayName = (date: Date) =>
  date.toLocaleDateString("en-US", { weekday: "short" });

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

function Analytics() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [, setHabitLogs] = useState<HabitLog[]>([]);
  const [productivityLogs, setProductivityLogs] = useState<
    ProductivityLog[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      const [
        tasksResult,
        goalsResult,
        habitsResult,
        habitLogsResult,
        productivityResult,
      ] = await Promise.all([
        supabase
          .from("tasks")
          .select(
            "id,title,category,completed,estimated_duration,created_at"
          )
          .eq("user_id", user.id),

        supabase
          .from("goals")
          .select("id,title,progress,deadline")
          .eq("user_id", user.id),

        supabase
          .from("habits")
          .select(
            "id,name,current_streak,longest_streak,completion_percentage"
          )
          .eq("user_id", user.id),

        supabase
          .from("habit_logs")
          .select("habit_id,completed_date,completed")
          .eq("user_id", user.id),

        supabase
          .from("productivity_logs")
          .select(
            "log_date,productivity_percentage,completed_tasks,total_tasks,focus_hours"
          )
          .eq("user_id", user.id)
          .order("log_date", { ascending: true }),
      ]);

      if (tasksResult.error) throw tasksResult.error;
      if (goalsResult.error) throw goalsResult.error;
      if (habitsResult.error) throw habitsResult.error;
      if (habitLogsResult.error) throw habitLogsResult.error;

      // productivity_logs may be empty for a new user.
      // We don't fail the entire analytics page for that.
      if (productivityResult.error) {
        console.warn(
          "Productivity logs unavailable:",
          productivityResult.error.message
        );
      }

      setTasks((tasksResult.data || []) as Task[]);
      setGoals((goalsResult.data || []) as Goal[]);
      setHabits((habitsResult.data || []) as Habit[]);
      setHabitLogs((habitLogsResult.data || []) as HabitLog[]);
      setProductivityLogs(
        productivityResult.error
          ? []
          : ((productivityResult.data || []) as ProductivityLog[])
      );
    } catch (err: any) {
      console.error("Analytics error:", err);
      setError(err?.message || "Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- BASIC STATS ---------------- */

  const completedTasks = tasks.filter((task) => task.completed).length;
  const pendingTasks = tasks.length - completedTasks;

  const taskCompletionRate =
    tasks.length > 0
      ? Math.round((completedTasks / tasks.length) * 100)
      : 0;

  const averageGoalProgress =
    goals.length > 0
      ? Math.round(
          goals.reduce((sum, goal) => sum + (goal.progress || 0), 0) /
            goals.length
        )
      : 0;

  const averageHabitConsistency =
    habits.length > 0
      ? Math.round(
          habits.reduce(
            (sum, habit) => sum + (habit.completion_percentage || 0),
            0
          ) / habits.length
        )
      : 0;

  const currentStreak = habits.reduce(
    (max, habit) => Math.max(max, habit.current_streak || 0),
    0
  );

  const longestStreak = habits.reduce(
    (max, habit) => Math.max(max, habit.longest_streak || 0),
    0
  );

  const focusHours = productivityLogs.reduce(
    (sum, log) => sum + (log.focus_hours || 0),
    0
  );

  /* ---------------- TODAY ---------------- */

  const todayKey = formatDateKey(new Date());

  const todayTasks = tasks.filter((task) => {
    return task.created_at.slice(0, 10) === todayKey;
  });

  const todayCompleted = todayTasks.filter(
    (task) => task.completed
  ).length;

  const todayProductivity =
    todayTasks.length > 0
      ? Math.round((todayCompleted / todayTasks.length) * 100)
      : productivityLogs.find((log) => log.log_date === todayKey)
          ?.productivity_percentage || 0;

  /* ---------------- WEEKLY CHART ---------------- */

  const weeklyData = useMemo(() => {
    const result = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      const dateKey = formatDateKey(date);

      const productivityLog = productivityLogs.find(
        (log) => log.log_date === dateKey
      );

      const dayTasks = tasks.filter(
        (task) => task.created_at.slice(0, 10) === dateKey
      );

      const completed = dayTasks.filter(
        (task) => task.completed
      ).length;

      const productivity =
        productivityLog?.productivity_percentage ??
        (dayTasks.length > 0
          ? Math.round((completed / dayTasks.length) * 100)
          : 0);

      result.push({
        day: getDayName(date),
        productivity,
        completed,
      });
    }

    return result;
  }, [tasks, productivityLogs]);

  /* ---------------- TASK STATUS ---------------- */

  const taskStatusData = [
    {
      name: "Completed",
      value: completedTasks,
    },
    {
      name: "Pending",
      value: pendingTasks,
    },
  ];

  /* ---------------- CATEGORY DATA ---------------- */

  const categoryData = useMemo(() => {
    const categoryMap: Record<string, number> = {};

    tasks.forEach((task) => {
      const category = task.category || "Other";
      const duration = task.estimated_duration || 0;

      categoryMap[category] =
        (categoryMap[category] || 0) + duration;
    });

    return Object.entries(categoryMap).map(
      ([category, hours]) => ({
        category,
        hours: Math.round((hours / 60) * 10) / 10,
      })
    );
  }, [tasks]);

  /* ---------------- HABIT DATA ---------------- */

  const habitData = habits.map((habit) => ({
    name: habit.name,
    completion: Math.round(habit.completion_percentage || 0),
  }));

  /* ---------------- GOAL DATA ---------------- */

  const goalData = goals.map((goal) => ({
    name:
      goal.title.length > 18
        ? `${goal.title.slice(0, 18)}...`
        : goal.title,
    progress: goal.progress || 0,
  }));

  /* ---------------- AI-STYLE INSIGHTS ---------------- */

  const insights = useMemo(() => {
    const result: string[] = [];

    if (tasks.length === 0) {
      result.push(
        "Start adding tasks to generate personalized productivity insights."
      );
    } else if (taskCompletionRate >= 80) {
      result.push(
        `You completed ${taskCompletionRate}% of your tasks overall.`
      );
    } else {
      result.push(
        `Your current task completion rate is ${taskCompletionRate}%.`
      );
    }

    if (averageGoalProgress > 0) {
      result.push(
        `Your average goal progress is ${averageGoalProgress}%.`
      );
    }

    if (averageHabitConsistency > 0) {
      result.push(
        `Your habit consistency is currently ${averageHabitConsistency}%.`
      );
    }

    if (currentStreak > 0) {
      result.push(
        `Your current best active habit streak is ${currentStreak} days.`
      );
    }

    if (focusHours > 0) {
      result.push(
        `You have recorded ${focusHours.toFixed(
          1
        )} hours of focus time.`
      );
    }

    return result.slice(0, 4);
  }, [
    tasks.length,
    taskCompletionRate,
    averageGoalProgress,
    averageHabitConsistency,
    currentStreak,
    focusHours,
  ]);

  /* ---------------- LOGOUT ---------------- */

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="analytics-page">
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-icon">
              <BarChart3 size={22} />
            </div>
            <div>
              <h2>LifePilot</h2>
              <span>AI Life Planner</span>
            </div>
          </div>
        </aside>

        <main className="analytics-main">
          <div className="analytics-loading">
            <div className="analytics-spinner"></div>
            <h2>Loading analytics...</h2>
            <p>Analyzing your productivity data.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      {/* SIDEBAR */}

      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <BarChart3 size={22} />
          </div>

          <div>
            <h2>LifePilot</h2>
            <span>AI Life Planner</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/planner">AI Planner</Link>
          <Link to="/tasks">Tasks</Link>
          <Link to="/goals">Goals</Link>
          <Link to="/calendar">Calendar</Link>
          <Link to="/habits">Habits</Link>
          <Link className="active" to="/analytics">
            Analytics
          </Link>
          <Link to="/notifications">Notifications</Link>
          <Link to="/settings">Settings</Link>
        </nav>

        <button className="logout-button" onClick={handleLogout}>
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* MAIN */}

      <main className="analytics-main">
        <header className="analytics-header">
          <div>
            <h1>Productivity Analytics</h1>
            <p>
              Understand your progress and build better habits.
            </p>
          </div>

          <button
            className="refresh-analytics"
            onClick={loadAnalytics}
          >
            Refresh Data
          </button>
        </header>

        {error && (
          <div className="analytics-error">
            {error}
          </div>
        )}

        {/* STAT CARDS */}

        <section className="analytics-stats">
          <div className="analytics-stat-card">
            <div className="stat-icon">
              <TrendingUp size={20} />
            </div>

            <div>
              <span>Today's Productivity</span>
              <strong>{todayProductivity}%</strong>
            </div>
          </div>

          <div className="analytics-stat-card">
            <div className="stat-icon">
              <CheckCircle2 size={20} />
            </div>

            <div>
              <span>Completed Tasks</span>
              <strong>{completedTasks}</strong>
            </div>
          </div>

          <div className="analytics-stat-card">
            <div className="stat-icon">
              <Target size={20} />
            </div>

            <div>
              <span>Goal Progress</span>
              <strong>{averageGoalProgress}%</strong>
            </div>
          </div>

          <div className="analytics-stat-card">
            <div className="stat-icon">
              <Flame size={20} />
            </div>

            <div>
              <span>Best Streak</span>
              <strong>{longestStreak} days</strong>
            </div>
          </div>
        </section>

        {/* WEEKLY PRODUCTIVITY */}

        <section className="analytics-card large-chart-card">
          <div className="card-heading">
            <div>
              <h2>Weekly Productivity</h2>
              <p>Your productivity over the last 7 days.</p>
            </div>

            <TrendingUp size={20} />
          </div>

          <div className="chart-wrapper">
            {weeklyData.some((item) => item.productivity > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="day" />

                  <YAxis
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />

                  <Tooltip
                    formatter={(value: any) => [
                      `${value}%`,
                      "Productivity",
                    ]}
                  />

                  <Line
                    type="monotone"
                    dataKey="productivity"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-empty">
                <BarChart3 size={36} />
                <p>
                  Complete some tasks to see your productivity
                  trend.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* TWO COLUMN */}

        <section className="analytics-grid">
          {/* TASK STATUS */}

          <div className="analytics-card">
            <div className="card-heading">
              <div>
                <h2>Task Completion</h2>
                <p>
                  {taskCompletionRate}% completion rate
                </p>
              </div>

              <ListChecks size={20} />
            </div>

            <div className="pie-chart-wrapper">
              {tasks.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={taskStatusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={55}
                    >
                      {taskStatusData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            index === 0
                              ? "#22c55e"
                              : "#e5e7eb"
                          }
                        />
                      ))}
                    </Pie>

                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="chart-empty">
                  <ListChecks size={34} />
                  <p>No tasks yet.</p>
                </div>
              )}
            </div>

            <div className="task-status-footer">
              <span>
                <b>{completedTasks}</b> completed
              </span>

              <span>
                <b>{pendingTasks}</b> pending
              </span>
            </div>
          </div>

          {/* HABITS */}

          <div className="analytics-card">
            <div className="card-heading">
              <div>
                <h2>Habit Consistency</h2>
                <p>Average {averageHabitConsistency}%</p>
              </div>

              <Flame size={20} />
            </div>

            <div className="habit-chart">
              {habitData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={habitData}>
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                    />

                    <YAxis
                      domain={[0, 100]}
                      tickFormatter={(value) => `${value}%`}
                    />

                    <Tooltip
                      formatter={(value: any) => [
                        `${value}%`,
                        "Consistency",
                      ]}
                    />

                    <Bar
                      dataKey="completion"
                      fill="#8b5cf6"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="chart-empty">
                  <Flame size={34} />
                  <p>No habits yet.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* CATEGORY TIME */}

        <section className="analytics-card">
          <div className="card-heading">
            <div>
              <h2>Time by Category</h2>
              <p>
                Estimated time from your tasks.
              </p>
            </div>

            <Clock3 size={20} />
          </div>

          <div className="category-chart">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="category" />

                  <YAxis
                    tickFormatter={(value) => `${value}h`}
                  />

                  <Tooltip
                    formatter={(value: any) => [
                      `${value}h`,
                      "Estimated time",
                    ]}
                  />

                  <Bar
                    dataKey="hours"
                    fill="#06b6d4"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-empty">
                <Clock3 size={34} />
                <p>
                  Add estimated durations to your tasks to
                  see category time.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* GOALS */}

        <section className="analytics-card">
          <div className="card-heading">
            <div>
              <h2>Goal Progress</h2>
              <p>Your current progress across goals.</p>
            </div>

            <Target size={20} />
          </div>

          {goalData.length > 0 ? (
            <div className="goal-progress-list">
              {goals.map((goal) => (
                <div
                  className="goal-progress-item"
                  key={goal.id}
                >
                  <div className="goal-progress-top">
                    <span>{goal.title}</span>
                    <strong>{goal.progress || 0}%</strong>
                  </div>

                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.min(
                          Math.max(goal.progress || 0, 0),
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="analytics-empty">
              <Target size={38} />
              <h3>No goals yet</h3>
              <p>
                Create a goal to start tracking your progress.
              </p>
            </div>
          )}
        </section>

        {/* INSIGHTS */}

        <section className="analytics-card insights-card">
          <div className="card-heading">
            <div>
              <h2>Productivity Insights</h2>
              <p>Based on your current LifePilot data.</p>
            </div>

            <TrendingUp size={20} />
          </div>

          <div className="insights-list">
            {insights.map((insight, index) => (
              <div className="insight-item" key={index}>
                <div className="insight-number">
                  {index + 1}
                </div>

                <p>{insight}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Analytics; 