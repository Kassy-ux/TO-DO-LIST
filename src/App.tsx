import React, {
  useReducer,
  useMemo,
  useCallback,
  useEffect,
  useState,
  useRef
} from 'react';
import { Plus, Moon, Sun, Edit3, Trash2, Check } from 'lucide-react';

// Types
interface Task {
  id: number;
  text: string;
  completed: boolean;
}

interface TaskAction {
  type: 'ADD_TASK' | 'TOGGLE_TASK' | 'DELETE_TASK' | 'UPDATE_TASK';
  text?: string;
  id?: number;
  task?: Task;
}

// Custom hook for input management
const useInput = (initialValue: string) => {
  const [value, setValue] = useState(initialValue);
  const ref = useRef<HTMLInputElement>(null);
  
  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  }, []);
  
  return { value, setValue, onChange, ref };
};

// Reducer function
function tasksReducer(state: Task[], action: TaskAction): Task[] {
  switch (action.type) {
    case 'ADD_TASK':
      return [...state, { id: Date.now(), text: action.text!, completed: false }];
    case 'TOGGLE_TASK':
      return state.map(task =>
        task.id === action.id ? { ...task, completed: !task.completed } : task
      );
    case 'DELETE_TASK':
      return state.filter(task => task.id !== action.id);
    case 'UPDATE_TASK':
      return state.map(task =>
        task.id === action.task!.id ? { ...task, text: action.task!.text } : task
      );
    default:
      return state;
  }
}

// Components
const ThemeToggle: React.FC<{ darkMode: boolean; toggleTheme: () => void }> = ({
  darkMode,
  toggleTheme
}) => (
  <button
    onClick={toggleTheme}
    className="theme-toggle"
    aria-label="Toggle theme"
  >
    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
  </button>
);

const Stats: React.FC<{ total: number; completed: number }> = ({
  total,
  completed
}) => (
  <div className="stats">
    <div className="stat-item">
      <span className="stat-label">All</span>
      <span className="stat-value">{total}</span>
    </div>
    <div className="stat-item">
      <span className="stat-label">Active</span>
      <span className="stat-value">{total - completed}</span>
    </div>
    <div className="stat-item">
      <span className="stat-label">Completed</span>
      <span className="stat-value">{completed}</span>
    </div>
  </div>
);

const TaskForm: React.FC<{
  onSubmit: (e: React.FormEvent) => void;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  buttonText: string;
  inputRef?: React.RefObject<HTMLInputElement>;
  secondaryButtonText?: string;
  onSecondaryButtonClick?: () => void;
}> = ({
  onSubmit,
  value,
  onChange,
  placeholder,

  inputRef,
  secondaryButtonText,
  onSecondaryButtonClick
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };

  

  return (
    <div className="task-form">
      <div className="input-group">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={onChange}
          
          placeholder={placeholder}
          className="task-input"
        />
        <button
          onClick={handleSubmit}
          className="add-button"
          disabled={!value.trim()}
        >
          <Plus size={20} />
        </button>
      </div>
      {secondaryButtonText && (
        <button
          onClick={onSecondaryButtonClick}
          className="cancel-button"
        >
          {secondaryButtonText}
        </button>
      )}
    </div>
  );
};

const TaskItem: React.FC<{
  task: Task;
  onToggle: (id: number) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
}> = ({ task, onToggle, onEdit, onDelete }) => (
  <div className={`task-item ${task.completed ? 'completed' : ''}`}>
    <label className="checkbox-container">
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
        className="checkbox-input"
      />
      <span className="checkbox-custom">
        {task.completed && <Check size={14} />}
      </span>
    </label>
    
    <span className="task-text">{task.text}</span>
    
    <div className="task-actions">
      <button
        onClick={() => onEdit(task)}
        className="action-button edit-button"
        aria-label="Edit task"
      >
        <Edit3 size={16} />
      </button>
      <button
        onClick={() => onDelete(task.id)}
        className="action-button delete-button"
        aria-label="Delete task"
      >
        <Trash2 size={16} />
      </button>
    </div>
  </div>
);

const TaskList: React.FC<{
  tasks: Task[];
  onToggle: (id: number) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
}> = ({ tasks, onToggle, onEdit, onDelete }) => (
  <div className="task-list-container">
    {tasks.length === 0 ? (
      <div className="empty-state">
        <p>No tasks yet. Create one above!</p>
      </div>
    ) : (
      tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))
    )}
  </div>
);

// Main App Component
const App: React.FC = () => {
  const [tasks, dispatch] = useReducer(tasksReducer, [
    { id: 1, text: 'Complete online JavaScript course', completed: true },
    { id: 2, text: 'Jog around the park 3x', completed: false },
    { id: 3, text: '10 minutes meditation', completed: false },
    { id: 4, text: 'Read for 1 hour', completed: false },
    { id: 5, text: 'Pick up groceries', completed: false },
    { id: 6, text: 'Complete Todo App on Frontend Mentor', completed: false }
  ]);
  
  const [darkMode, setDarkMode] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const taskInput = useInput('');
  const editInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && editInput.current) editInput.current.focus();
  }, [isEditing]);

  const taskCount = useMemo(() => tasks.length, [tasks]);
  const completedCount = useMemo(
    () => tasks.filter(task => task.completed).length,
    [tasks]
  );

  const handleAddTask = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (taskInput.value.trim()) {
        dispatch({ type: 'ADD_TASK', text: taskInput.value });
        taskInput.setValue('');
      }
    },
    [taskInput]
  );

  const handleToggleTask = useCallback((id: number) => {
    dispatch({ type: 'TOGGLE_TASK', id });
  }, []);

  const handleDeleteTask = useCallback((id: number) => {
    dispatch({ type: 'DELETE_TASK', id });
  }, []);

  const handleEditTask = useCallback(
    (task: Task) => {
      setIsEditing(true);
      setCurrentTask(task);
      taskInput.setValue(task.text);
    },
    [taskInput]
  );

  const handleUpdateTask = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (taskInput.value.trim() && currentTask) {
        dispatch({
          type: 'UPDATE_TASK',
          task: { ...currentTask, text: taskInput.value }
        });
        setIsEditing(false);
        setCurrentTask(null);
        taskInput.setValue('');
      }
    },
    [taskInput, currentTask]
  );

  const cancelEdit = useCallback(() => {
    setIsEditing(false);
    setCurrentTask(null);
    taskInput.setValue('');
  }, [taskInput]);

  const toggleTheme = useCallback(() => {
    setDarkMode(prev => !prev);
  }, []);

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <style >{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .app {
          min-height: 100vh;
          transition: all 0.3s ease;
        }

        .app.dark {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #ffffff;
        }

        .app.light {
          background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
          color: #333333;
        }

        .hero {
          text-align: center;
          padding: 3rem 2rem;
          position: relative;
        }

        .title {
          font-size: 3rem;
          font-weight: 700;
          letter-spacing: 0.5rem;
          text-transform: uppercase;
          margin-bottom: 2rem;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }

        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 0 2rem 3rem;
          position: relative;
        }

        .theme-toggle {
          position: absolute;
          top: -1rem;
          right: 2rem;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .theme-toggle:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }

        .stats {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin-bottom: 2rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          backdrop-filter: blur(10px);
        }

        .stat-item {
          text-align: center;
        }

        .stat-label {
          display: block;
          font-size: 0.9rem;
          opacity: 0.8;
          margin-bottom: 0.25rem;
        }

        .stat-value {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .task-form {
          margin-bottom: 2rem;
        }

        .input-group {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .task-input {
          flex: 1;
          padding: 1rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          background: rgba(255, 255, 255, 0.9);
          color: #333;
          transition: all 0.3s ease;
        }

        .dark .task-input {
          background: rgba(0, 0, 0, 0.3);
          color: #ffffff;
        }

        .dark .task-input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }

        .task-input:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
        }

        .add-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 8px;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          color: white;
        }

        .add-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }

        .add-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .cancel-button {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 8px;
          padding: 0.75rem 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          color: inherit;
        }

        .cancel-button:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .task-list-container {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1rem;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .task-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          margin-bottom: 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .task-item:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateX(5px);
        }

        .task-item:last-child {
          margin-bottom: 0;
        }

        .task-item.completed {
          opacity: 0.6;
        }

        .task-item.completed .task-text {
          text-decoration: line-through;
        }

        .checkbox-container {
          position: relative;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .checkbox-input {
          opacity: 0;
          position: absolute;
          cursor: pointer;
        }

        .checkbox-custom {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.5);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          background: transparent;
        }

        .checkbox-input:checked + .checkbox-custom {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-color: transparent;
          color: white;
        }

        .checkbox-container:hover .checkbox-custom {
          border-color: rgba(255, 255, 255, 0.8);
          transform: scale(1.1);
        }

        .task-text {
          flex: 1;
          font-size: 1rem;
          line-height: 1.4;
        }

        .task-actions {
          display: flex;
          gap: 0.5rem;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .task-item:hover .task-actions {
          opacity: 1;
        }

        .action-button {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 6px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          color: inherit;
        }

        .action-button:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }

        .delete-button:hover {
          background: rgba(239, 68, 68, 0.3);
          color: #ef4444;
        }

        .edit-button:hover {
          background: rgba(59, 130, 246, 0.3);
          color: #3b82f6;
        }

        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
          opacity: 0.7;
        }

        .empty-state p {
          font-size: 1.1rem;
        }

        @media (max-width: 640px) {
          .container {
            padding: 0 1rem 2rem;
          }

          .title {
            font-size: 2rem;
            letter-spacing: 0.3rem;
          }

          .stats {
            gap: 1rem;
            flex-wrap: wrap;
          }

          .theme-toggle {
            right: 1rem;
          }

          .task-actions {
            opacity: 1;
          }
        }
      `}</style>
      
      <div className="hero">
        <h1 className="title">TODO</h1>
      </div>

      <div className="container">
        <ThemeToggle darkMode={darkMode} toggleTheme={toggleTheme} />
        <Stats total={taskCount} completed={completedCount} />

        <TaskForm
          onSubmit={isEditing ? handleUpdateTask : handleAddTask}
          value={taskInput.value}
          onChange={taskInput.onChange}
          placeholder={isEditing ? 'Edit task...' : 'Create a new todo...'}
          buttonText={isEditing ? 'Update' : 'Add'}

          secondaryButtonText={isEditing ? 'Cancel' : undefined}
          onSecondaryButtonClick={isEditing ? cancelEdit : undefined}
        />

        <TaskList
          tasks={tasks}
          onToggle={handleToggleTask}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
        />
      </div>
    </div>
  );
};

export default App;