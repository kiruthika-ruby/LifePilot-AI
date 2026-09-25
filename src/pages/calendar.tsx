import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  LogOut,
  Clock,
  X,
  Trash2,
  Pencil,
  Check,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import "./calendar.css";

type ViewMode = "month" | "week" | "day";

type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  type: "task" | "goal" | "schedule";
  completed?: boolean;
  aiGenerated?: boolean;
  taskId?: string;
};

type ScheduleRow = {
  id: string;
  title: string;
  schedule_date: string;
  start_time: string | null;
  end_time: string | null;
  activity_type: string | null;
  ai_generated: boolean | null;
  completed: boolean | null;
  task_id: string | null;
};

type TaskRow = {
  id: string;
  title: string;
  deadline: string | null;
  completed: boolean | null;
};

type GoalRow = {
  id: string;
  title: string;
  deadline: string | null;
};

const emptyForm = {
  title: "",
  date: "",
  startTime: "09:00",
  endTime: "10:00",
  activityType: "personal",
};

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getStartOfWeek = (date: Date) => {
  const result = new Date(date);
  const day = result.getDay();
  result.setDate(result.getDate() - day);
  result.setHours(0, 0, 0, 0);
  return result;
};

const getWeekDates = (date: Date) => {
  const start = getStartOfWeek(date);

  return Array.from({ length: 7 }, (_, index) => {
    const current = new Date(start);
    current.setDate(start.getDate() + index);
    return current;
  });
};

const formatTime = (time: string | null | undefined) => {
  if (!time) return "";

  const [hours, minutes] = time.split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;

  return `${displayHour}:${String(minutes).padStart(2, "0")} ${suffix}`;
};

const getEventClass = (type: CalendarEvent["type"]) => {
  if (type === "task") return "calendar-event task-event";
  if (type === "goal") return "calendar-event goal-event";
  return "calendar-event schedule-event";
};

function Calendar() {
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [currentDate, setCurrentDate] = useState(new Date());

  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const [form, setForm] = useState(emptyForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [userId, setUserId] = useState<string | null>(null);

  /* ---------------- GET CURRENT USER ---------------- */

  useEffect(() => {
    const initialize = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      setUserId(user.id);
      await loadCalendarData(user.id);
    };

    initialize();
  }, [navigate]);

  /* ---------------- LOAD DATA ---------------- */

  const loadCalendarData = async (currentUserId = userId) => {
    if (!currentUserId) return;

    setLoading(true);
    setError("");

    try {
      const [tasksResult, goalsResult, schedulesResult] = await Promise.all([
        supabase
          .from("tasks")
          .select("id,title,deadline,completed")
          .eq("user_id", currentUserId)
          .not("deadline", "is", null),

        supabase
          .from("goals")
          .select("id,title,deadline")
          .eq("user_id", currentUserId)
          .not("deadline", "is", null),

        supabase
          .from("schedules")
          .select(
            "id,title,schedule_date,start_time,end_time,activity_type,ai_generated,completed,task_id"
          )
          .eq("user_id", currentUserId)
          .order("schedule_date", { ascending: true })
          .order("start_time", { ascending: true }),
      ]);

      if (tasksResult.error) throw tasksResult.error;
      if (goalsResult.error) throw goalsResult.error;
      if (schedulesResult.error) throw schedulesResult.error;

      const taskEvents: CalendarEvent[] = (
        (tasksResult.data || []) as TaskRow[]
      ).map((task) => ({
        id: `task-${task.id}`,
        title: task.title,
        date: task.deadline!.slice(0, 10),
        type: "task",
        completed: task.completed ?? false,
        taskId: task.id,
      }));

      const goalEvents: CalendarEvent[] = (
        (goalsResult.data || []) as GoalRow[]
      ).map((goal) => ({
        id: `goal-${goal.id}`,
        title: goal.title,
        date: goal.deadline!.slice(0, 10),
        type: "goal",
      }));

      const scheduleEvents: CalendarEvent[] = (
        (schedulesResult.data || []) as ScheduleRow[]
      ).map((schedule) => ({
        id: schedule.id,
        title: schedule.title,
        date: schedule.schedule_date.slice(0, 10),
        startTime: schedule.start_time || undefined,
        endTime: schedule.end_time || undefined,
        type: "schedule",
        completed: schedule.completed ?? false,
        aiGenerated: schedule.ai_generated ?? false,
        taskId: schedule.task_id || undefined,
      }));

      setEvents([...taskEvents, ...goalEvents, ...scheduleEvents]);
    } catch (err: any) {
      console.error("Calendar load error:", err);
      setError(err?.message || "Failed to load calendar data.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- MODAL ---------------- */

  const openAddModal = (selectedDate?: string) => {
    setEditingEvent(null);

    setForm({
      ...emptyForm,
      date: selectedDate || formatDateKey(currentDate),
    });

    setError("");
    setShowModal(true);
  };

  const openEditModal = (event: CalendarEvent) => {
    if (event.type !== "schedule") return;

    setEditingEvent(event);

    setForm({
      title: event.title,
      date: event.date,
      startTime: event.startTime || "09:00",
      endTime: event.endTime || "10:00",
      activityType: "personal",
    });

    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingEvent(null);
    setForm(emptyForm);
    setError("");
  };

  /* ---------------- SAVE EVENT ---------------- */

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      setError("Please login again.");
      return;
    }

    if (!form.title.trim()) {
      setError("Please enter an event title.");
      return;
    }

    if (!form.date) {
      setError("Please select a date.");
      return;
    }

    if (form.startTime >= form.endTime) {
      setError("End time must be after start time.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (editingEvent) {
        /* -------- UPDATE EXISTING EVENT -------- */

        const { error: updateError } = await supabase
          .from("schedules")
          .update({
            title: form.title.trim(),
            schedule_date: form.date,
            start_time: form.startTime,
            end_time: form.endTime,
            activity_type: form.activityType,
          })
          .eq("id", editingEvent.id)
          .eq("user_id", userId);

        if (updateError) throw updateError;
      } else {
        /* -------- INSERT NEW EVENT INTO SUPABASE -------- */

        const { error: insertError } = await supabase
          .from("schedules")
          .insert({
            user_id: userId,
            title: form.title.trim(),
            schedule_date: form.date,
            start_time: form.startTime,
            end_time: form.endTime,
            activity_type: form.activityType,
            ai_generated: false,
            completed: false,
          });

        if (insertError) throw insertError;
      }

      /* Reload from database */
      await loadCalendarData(userId);

      closeModal();
    } catch (err: any) {
      console.error("Save event error:", err);
      setError(err?.message || "Failed to save event.");
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- DELETE EVENT ---------------- */

  const handleDeleteEvent = async (event: CalendarEvent) => {
    if (event.type !== "schedule") return;
    if (!userId) return;

    const confirmed = window.confirm(
      `Delete "${event.title}" from your calendar?`
    );

    if (!confirmed) return;

    try {
      const { error: deleteError } = await supabase
        .from("schedules")
        .delete()
        .eq("id", event.id)
        .eq("user_id", userId);

      if (deleteError) throw deleteError;

      setEvents((previous) =>
        previous.filter((calendarEvent) => calendarEvent.id !== event.id)
      );
    } catch (err: any) {
      console.error("Delete event error:", err);
      setError(err?.message || "Failed to delete event.");
    }
  };

  /* ---------------- COMPLETE EVENT ---------------- */

  const handleToggleSchedule = async (event: CalendarEvent) => {
    if (event.type !== "schedule") return;
    if (!userId) return;

    const newCompleted = !event.completed;

    try {
      const { error: updateError } = await supabase
        .from("schedules")
        .update({
          completed: newCompleted,
        })
        .eq("id", event.id)
        .eq("user_id", userId);

      if (updateError) throw updateError;

      setEvents((previous) =>
        previous.map((item) =>
          item.id === event.id
            ? {
                ...item,
                completed: newCompleted,
              }
            : item
        )
      );
    } catch (err: any) {
      console.error("Complete event error:", err);
      setError(err?.message || "Failed to update event.");
    }
  };

  /* ---------------- DATE NAVIGATION ---------------- */

  const goPrevious = () => {
    const next = new Date(currentDate);

    if (viewMode === "month") {
      next.setMonth(next.getMonth() - 1);
    } else if (viewMode === "week") {
      next.setDate(next.getDate() - 7);
    } else {
      next.setDate(next.getDate() - 1);
    }

    setCurrentDate(next);
  };

  const goNext = () => {
    const next = new Date(currentDate);

    if (viewMode === "month") {
      next.setMonth(next.getMonth() + 1);
    } else if (viewMode === "week") {
      next.setDate(next.getDate() + 7);
    } else {
      next.setDate(next.getDate() + 1);
    }

    setCurrentDate(next);
  };

  const goToday = () => {
    setCurrentDate(new Date());
  };

  /* ---------------- MONTH DATA ---------------- */

  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const startDay = firstDay.getDay();

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: Array<Date | null> = [];

    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    while (days.length < 42) {
      days.push(null);
    }

    return days;
  }, [currentDate]);

  /* ---------------- WEEK DATA ---------------- */

  const weekDates = useMemo(() => {
    return getWeekDates(currentDate);
  }, [currentDate]);

  /* ---------------- DAY EVENTS ---------------- */

  const getEventsForDate = (date: Date) => {
    const dateKey = formatDateKey(date);

    return events.filter((event) => event.date === dateKey);
  };

  /* ---------------- HEADER TITLE ---------------- */

  const headerTitle = useMemo(() => {
    if (viewMode === "month") {
      return currentDate.toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      });
    }

    if (viewMode === "week") {
      const start = weekDates[0];
      const end = weekDates[6];

      return `${start.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      })} - ${end.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })}`;
    }

    return currentDate.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, [currentDate, viewMode, weekDates]);

  /* ---------------- SUMMARY ---------------- */

  const scheduleCount = events.filter((event) => event.type === "schedule")
    .length;

  const taskCount = events.filter((event) => event.type === "task").length;

  const goalCount = events.filter((event) => event.type === "goal").length;

  /* ---------------- LOGOUT ---------------- */

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  /* ---------------- RENDER EVENT ---------------- */

  const renderEvent = (event: CalendarEvent) => {
    return (
      <div
        key={event.id}
        className={`${getEventClass(event.type)} ${
          event.completed ? "completed-event" : ""
        }`}
      >
        <div className="calendar-event-main">
          <strong>{event.title}</strong>

          {event.startTime && (
            <span>
              <Clock size={12} />
              {formatTime(event.startTime)}
              {event.endTime && ` - ${formatTime(event.endTime)}`}
            </span>
          )}
        </div>

        {event.type === "schedule" && (
          <div className="calendar-event-actions">
            <button
              type="button"
              title="Complete"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleSchedule(event);
              }}
            >
              <Check size={13} />
            </button>

            <button
              type="button"
              title="Edit"
              onClick={(e) => {
                e.stopPropagation();
                openEditModal(event);
              }}
            >
              <Pencil size={13} />
            </button>

            <button
              type="button"
              title="Delete"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteEvent(event);
              }}
            >
              <Trash2 size={13} />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="calendar-page">
      {/* SIDEBAR */}

      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <CalendarDays size={22} />
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
          <Link className="active" to="/calendar">
            Calendar
          </Link>
          <Link to="/habits">Habits</Link>
          <Link to="/analytics">Analytics</Link>
          <Link to="/notifications">Notifications</Link>
          <Link to="/settings">Settings</Link>
        </nav>

        <button className="logout-button" onClick={handleLogout}>
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* MAIN */}

      <main className="calendar-main">
        <header className="calendar-header">
          <div>
            <h1>Calendar</h1>
            <p>Organize your tasks, goals and schedule.</p>
          </div>

          <button className="add-event-button" onClick={() => openAddModal()}>
            <Plus size={18} />
            Add Event
          </button>
        </header>

        {/* ERROR */}

        {error && !showModal && (
          <div className="calendar-error">
            {error}
          </div>
        )}

        {/* SUMMARY */}

        <div className="calendar-summary">
          <div className="summary-card">
            <span>Total Events</span>
            <strong>{events.length}</strong>
          </div>

          <div className="summary-card">
            <span>Scheduled</span>
            <strong>{scheduleCount}</strong>
          </div>

          <div className="summary-card">
            <span>Tasks</span>
            <strong>{taskCount}</strong>
          </div>

          <div className="summary-card">
            <span>Goals</span>
            <strong>{goalCount}</strong>
          </div>
        </div>

        {/* CALENDAR TOOLBAR */}

        <section className="calendar-container">
          <div className="calendar-toolbar">
            <div className="calendar-navigation">
              <button onClick={goPrevious} title="Previous">
                <ChevronLeft size={19} />
              </button>

              <button onClick={goToday}>Today</button>

              <button onClick={goNext} title="Next">
                <ChevronRight size={19} />
              </button>

              <h2>{headerTitle}</h2>
            </div>

            <div className="view-switcher">
              <button
                className={viewMode === "month" ? "active" : ""}
                onClick={() => setViewMode("month")}
              >
                Month
              </button>

              <button
                className={viewMode === "week" ? "active" : ""}
                onClick={() => setViewMode("week")}
              >
                Week
              </button>

              <button
                className={viewMode === "day" ? "active" : ""}
                onClick={() => setViewMode("day")}
              >
                Day
              </button>
            </div>
          </div>

          {loading ? (
            <div className="calendar-loading">
              <div className="calendar-spinner"></div>
              <p>Loading your calendar...</p>
            </div>
          ) : (
            <>
              {/* MONTH VIEW */}

              {viewMode === "month" && (
                <div className="month-calendar">
                  <div className="weekday-row">
                    {[
                      "Sunday",
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                    ].map((day) => (
                      <div key={day}>{day}</div>
                    ))}
                  </div>

                  <div className="month-grid">
                    {monthDays.map((day, index) => {
                      if (!day) {
                        return (
                          <div
                            className="calendar-day empty-day"
                            key={`empty-${index}`}
                          />
                        );
                      }

                      const dayEvents = getEventsForDate(day);

                      const isToday =
                        formatDateKey(day) === formatDateKey(new Date());

                      return (
                        <div
                          className={`calendar-day ${
                            isToday ? "today-day" : ""
                          }`}
                          key={formatDateKey(day)}
                          onDoubleClick={() =>
                            openAddModal(formatDateKey(day))
                          }
                        >
                          <div className="day-number-row">
                            <span className={isToday ? "today-number" : ""}>
                              {day.getDate()}
                            </span>

                            <button
                              className="day-add-button"
                              onClick={() =>
                                openAddModal(formatDateKey(day))
                              }
                              title="Add event"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          <div className="day-events">
                            {dayEvents.slice(0, 4).map(renderEvent)}

                            {dayEvents.length > 4 && (
                              <span className="more-events">
                                +{dayEvents.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* WEEK VIEW */}

              {viewMode === "week" && (
                <div className="week-calendar">
                  {weekDates.map((date) => {
                    const dayEvents = getEventsForDate(date);

                    const isToday =
                      formatDateKey(date) === formatDateKey(new Date());

                    return (
                      <div className="week-column" key={formatDateKey(date)}>
                        <div
                          className={`week-column-header ${
                            isToday ? "today-week-header" : ""
                          }`}
                        >
                          <span>
                            {date.toLocaleDateString("en-IN", {
                              weekday: "short",
                            })}
                          </span>

                          <strong>{date.getDate()}</strong>
                        </div>

                        <button
                          className="week-add-button"
                          onClick={() =>
                            openAddModal(formatDateKey(date))
                          }
                        >
                          <Plus size={14} />
                          Add
                        </button>

                        <div className="week-events">
                          {dayEvents.length === 0 ? (
                            <p className="empty-day-text">No events</p>
                          ) : (
                            dayEvents.map(renderEvent)
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* DAY VIEW */}

              {viewMode === "day" && (
                <div className="day-calendar">
                  <div className="day-view-header">
                    <div>
                      <span>
                        {currentDate.toLocaleDateString("en-IN", {
                          weekday: "long",
                        })}
                      </span>

                      <h2>
                        {currentDate.toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </h2>
                    </div>

                    <button
                      className="add-event-button"
                      onClick={() =>
                        openAddModal(formatDateKey(currentDate))
                      }
                    >
                      <Plus size={18} />
                      Add Event
                    </button>
                  </div>

                  <div className="day-events-list">
                    {getEventsForDate(currentDate).length === 0 ? (
                      <div className="empty-calendar-state">
                        <CalendarDays size={42} />
                        <h3>No events for this day</h3>
                        <p>Add an event to start planning your day.</p>

                        <button
                          className="add-event-button"
                          onClick={() =>
                            openAddModal(formatDateKey(currentDate))
                          }
                        >
                          <Plus size={18} />
                          Add Event
                        </button>
                      </div>
                    ) : (
                      getEventsForDate(currentDate).map(renderEvent)
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* LEGEND */}

          <div className="calendar-legend">
            <div>
              <span className="legend-dot task-dot"></span>
              Tasks
            </div>

            <div>
              <span className="legend-dot goal-dot"></span>
              Goals
            </div>

            <div>
              <span className="legend-dot schedule-dot"></span>
              Scheduled Events
            </div>
          </div>
        </section>
      </main>

      {/* ADD / EDIT MODAL */}

      {showModal && (
        <div className="calendar-modal-overlay">
          <div className="calendar-modal">
            <div className="modal-header">
              <div>
                <h2>
                  {editingEvent ? "Edit Event" : "Add Calendar Event"}
                </h2>

                <p>
                  {editingEvent
                    ? "Update your scheduled activity."
                    : "Create a personal schedule that stays saved."}
                </p>
              </div>

              <button
                className="modal-close-button"
                onClick={closeModal}
                disabled={saving}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEvent}>
              <div className="form-group">
                <label>Event Title</label>

                <input
                  type="text"
                  placeholder="e.g. Study DAA"
                  value={form.title}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      title: e.target.value,
                    })
                  }
                  autoFocus
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date</label>

                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        date: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Type</label>

                  <select
                    value={form.activityType}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        activityType: e.target.value,
                      })
                    }
                  >
                    <option value="personal">Personal</option>
                    <option value="study">Study</option>
                    <option value="work">Work</option>
                    <option value="health">Health</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Time</label>

                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        startTime: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>End Time</label>

                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        endTime: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {error && (
                <div className="calendar-form-error">
                  {error}
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-event-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingEvent
                    ? "Update Event"
                    : "Save Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Calendar;