"use client";

import { useState } from "react";
import { CopilotSidebar, useFrontendTool } from "@copilotkit/react-core/v2";
import { Check, Circle, ListTodo, Plus, Sparkles, Trash2 } from "lucide-react";
import { z } from "zod";

type Task = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
};

type Filter = "all" | "active" | "completed";

const initialTasks: Task[] = [
  {
    id: "task-1",
    title: "Explore how AG-UI tools work",
    description: "Ask the assistant to explain the task manager flow.",
    completed: false,
  },
  {
    id: "task-2",
    title: "Build a shared-state demo",
    description: "See an agent action update this list in real time.",
    completed: false,
  },
  {
    id: "task-3",
    title: "Celebrate the first agent action",
    description: "",
    completed: true,
  },
];

export default function Page() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  useFrontendTool(
    {
      name: "list_tasks",
      description: "List all tasks and their IDs, descriptions, and completion status.",
      parameters: z.object({}),
      handler: async () => tasks,
    },
    [tasks],
  );

  useFrontendTool(
    {
      name: "add_task",
      description: "Add a task to the user's task list.",
      parameters: z.object({
        title: z.string().min(1).describe("A short task title"),
        description: z.string().optional().describe("Optional details for the task"),
      }),
      handler: async ({ title, description }) => {
        const task: Task = {
          id: crypto.randomUUID(),
          title: title.trim(),
          description: description?.trim() ?? "",
          completed: false,
        };
        if (!task.title) {
          throw new Error("A task title cannot be empty.");
        }
        setTasks((currentTasks) => [task, ...currentTasks]);
        return { success: true, task };
      },
    },
    [],
  );

  useFrontendTool(
    {
      name: "update_task",
      description: "Change the title of an existing task. First list tasks to find its ID.",
      parameters: z.object({
        id: z.string().describe("The ID of the task to update"),
        title: z.string().min(1).describe("The task's new title"),
      }),
      handler: async ({ id, title }) => {
        if (!tasks.some((task) => task.id === id)) {
          throw new Error(`No task was found with ID "${id}".`);
        }
        const updatedTitle = title.trim();
        if (!updatedTitle) {
          throw new Error("A task title cannot be empty.");
        }
        setTasks((currentTasks) =>
          currentTasks.map((task) =>
            task.id === id ? { ...task, title: updatedTitle } : task,
          ),
        );
        return { success: true, id, title: updatedTitle };
      },
    },
    [tasks],
  );

  useFrontendTool(
    {
      name: "set_task_status",
      description: "Mark an existing task complete or active. First list tasks to find its ID.",
      parameters: z.object({
        id: z.string().describe("The ID of the task to update"),
        completed: z.boolean().describe("Whether the task is complete"),
      }),
      handler: async ({ id, completed }) => {
        if (!tasks.some((task) => task.id === id)) {
          throw new Error(`No task was found with ID "${id}".`);
        }
        setTasks((currentTasks) =>
          currentTasks.map((task) =>
            task.id === id ? { ...task, completed } : task,
          ),
        );
        return { success: true, id, completed };
      },
    },
    [tasks],
  );

  useFrontendTool(
    {
      name: "delete_task",
      description: "Delete a task from the user's list. First list tasks to find its ID.",
      parameters: z.object({
        id: z.string().describe("The ID of the task to delete"),
      }),
      handler: async ({ id }) => {
        if (!tasks.some((task) => task.id === id)) {
          throw new Error(`No task was found with ID "${id}".`);
        }
        setTasks((currentTasks) => currentTasks.filter((task) => task.id !== id));
        return { success: true, id };
      },
    },
    [tasks],
  );

  const visibleTasks = tasks.filter((task) => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });
  const completedCount = tasks.filter((task) => task.completed).length;
  const activeCount = tasks.length - completedCount;

  function addTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = newTaskTitle.trim();
    if (!title) return;
    setTasks((currentTasks) => [
      { id: crypto.randomUUID(), title, description: "", completed: false },
      ...currentTasks,
    ]);
    setNewTaskTitle("");
  }

  return (
    <main className="min-h-screen bg-[#f6f7f9] px-5 py-10 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 flex items-center justify-between">
          <a href="#" className="flex items-center gap-3" aria-label="Taskflow home">
            <span className="flex size-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <ListTodo size={21} />
            </span>
            <span className="text-lg font-semibold tracking-tight">Taskflow</span>
          </a>
          <div className="hidden items-center gap-2 rounded-full border border-indigo-100 bg-white px-4 py-2 text-sm text-slate-600 sm:flex">
            <Sparkles size={15} className="text-indigo-600" />
            <span>AG-UI shared-state demo</span>
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1fr_280px]">
          <div>
            <div className="mb-7">
              <p className="mb-2 text-sm font-medium text-indigo-600">YOUR WORKSPACE</p>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Make room for what matters.
              </h1>
              <p className="mt-3 max-w-xl text-slate-500">
                Keep your tasks moving, or ask the AI assistant to manage them with you.
              </p>
            </div>

            <form
              onSubmit={addTask}
              className="mb-5 flex gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
            >
              <label className="sr-only" htmlFor="new-task">
                Add a task
              </label>
              <input
                id="new-task"
                value={newTaskTitle}
                onChange={(event) => setNewTaskTitle(event.target.value)}
                placeholder="What needs to get done?"
                className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={!newTaskTitle.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus size={17} />
                <span className="hidden sm:inline">Add task</span>
              </button>
            </form>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
                  {(["all", "active", "completed"] as const).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setFilter(item)}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition ${
                        filter === item
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-slate-500">
                  {activeCount} remaining
                </span>
              </div>

              {visibleTasks.length > 0 ? (
                <ul className="divide-y divide-slate-100">
                  {visibleTasks.map((task) => (
                    <li
                      key={task.id}
                      className="group flex items-start gap-3 px-5 py-4"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setTasks((currentTasks) =>
                            currentTasks.map((item) =>
                              item.id === task.id
                                ? { ...item, completed: !item.completed }
                                : item,
                            ),
                          )
                        }
                        aria-label={
                          task.completed ? "Mark task active" : "Mark task complete"
                        }
                        className={`mt-0.5 shrink-0 transition ${
                          task.completed
                            ? "text-emerald-500"
                            : "text-slate-300 hover:text-indigo-600"
                        }`}
                      >
                        {task.completed ? <Check size={20} /> : <Circle size={20} />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm font-medium ${
                            task.completed ? "text-slate-400 line-through" : ""
                          }`}
                        >
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {task.description}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setTasks((currentTasks) =>
                            currentTasks.filter((item) => item.id !== task.id),
                          )
                        }
                        aria-label={`Delete ${task.title}`}
                        className="rounded-lg p-1.5 text-slate-300 opacity-0 transition hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100 focus:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-5 py-14 text-center">
                  <p className="text-sm font-medium text-slate-700">
                    {filter === "all" ? "Your list is clear." : `No ${filter} tasks.`}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Add a task or ask the assistant to create one.
                  </p>
                </div>
              )}
            </div>

            <p className="mt-4 text-center text-xs text-slate-400">
              Try asking: “Add a task to review my notes, then mark it complete.”
            </p>
          </div>

          <aside className="h-fit rounded-2xl border border-indigo-100 bg-indigo-50/70 p-5">
            <div className="mb-4 flex size-9 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
              <Sparkles size={18} />
            </div>
            <h2 className="font-semibold">Learn by doing</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              The assistant uses frontend tools to change this task list. Watch
              the UI update when it adds, edits, completes, or removes a task.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-indigo-100 pt-4">
              <div>
                <p className="text-2xl font-semibold">{tasks.length}</p>
                <p className="text-xs text-slate-500">Total tasks</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-emerald-600">
                  {completedCount}
                </p>
                <p className="text-xs text-slate-500">Completed</p>
              </div>
            </div>
          </aside>
        </section>
      </div>

      <CopilotSidebar />
    </main>
  );
}
