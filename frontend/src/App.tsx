import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Controller, useForm } from "react-hook-form";
import "./App.css";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  FormHelperText,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";

type Category = {
  id: string;
  name: string;
};

type Todo = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  category: Category;
};

type FormValues = {
  text: string;
  categoryId: string;
};

type PendingAction = {
  id: string;
  type: "delete" | "complete";
  timerId: number;
  todo: Todo;
};

type SnackbarAction = {
  id: string;
  message: string;
  onUndo: () => void;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3001",
});

const sortTodos = (items: Todo[]) =>
  [...items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

const filterPendingDeletes = (
  items: Todo[],
  pending: Map<string, PendingAction>,
) => items.filter((item) => pending.get(item.id)?.type !== "delete");

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [snackbarQueue, setSnackbarQueue] = useState<SnackbarAction[]>([]);
  const [activeSnackbar, setActiveSnackbar] = useState<SnackbarAction | null>(
    null,
  );
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const pendingActions = useRef(new Map<string, PendingAction>());
  const hasAppliedFilter = useRef(false);

  const { handleSubmit, register, control, reset, formState } =
    useForm<FormValues>({
      defaultValues: {
        text: "",
        categoryId: "",
      },
    });

  const enqueueSnackbar = useCallback((action: SnackbarAction) => {
    setSnackbarQueue((prev) => [...prev, action]);
  }, []);

  useEffect(() => {
    if (activeSnackbar || snackbarQueue.length === 0) {
      return;
    }

    const [next, ...rest] = snackbarQueue;
    setActiveSnackbar(next);
    setSnackbarQueue(rest);
    setSnackbarOpen(true);
  }, [activeSnackbar, snackbarQueue]);

  const handleSnackbarClose = () => setSnackbarOpen(false);
  const handleSnackbarExited = () => setActiveSnackbar(null);

  const handleUndo = useCallback(
    async (todoId: string) => {
      const pending = pendingActions.current.get(todoId);
      if (!pending) {
        return;
      }

      window.clearTimeout(pending.timerId);
      pendingActions.current.delete(todoId);

      if (pending.type === "delete") {
        setTodos((prev) => sortTodos([...prev, pending.todo]));
        return;
      }

      try {
        const response = await api.patch<Todo>(`/todos/${todoId}`, {
          completed: false,
        });
        setTodos((prev) =>
          prev.map((todo) => (todo.id === todoId ? response.data : todo)),
        );
      } catch {
        setError("Failed to undo completion.");
      }
    },
    [setTodos],
  );

  const scheduleDelete = useCallback(
    (todo: Todo, type: PendingAction["type"]) => {
      const timerId = window.setTimeout(async () => {
        try {
          await api.delete(`/todos/${todo.id}`);
          setTodos((prev) => prev.filter((item) => item.id !== todo.id));
        } catch {
          setError("Failed to delete task.");
        } finally {
          pendingActions.current.delete(todo.id);
        }
      }, 5000);

      pendingActions.current.set(todo.id, {
        id: todo.id,
        type,
        timerId,
        todo,
      });

      enqueueSnackbar({
        id: todo.id,
        message: type === "delete" ? "Task deleted." : "Task completed.",
        onUndo: () => handleUndo(todo.id),
      });
    },
    [enqueueSnackbar, handleUndo],
  );

  const fetchCategories = useCallback(async () => {
    const response = await api.get<Category[]>("/categories");
    setCategories(response.data);
  }, []);

  const fetchTodos = useCallback(async (category?: string) => {
    const params = category && category !== "all" ? { category } : undefined;
    const response = await api.get<Todo[]>("/todos", { params });
    setTodos(
      sortTodos(filterPendingDeletes(response.data, pendingActions.current)),
    );
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await Promise.all([fetchCategories(), fetchTodos()]);
    } catch {
      setError("Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  }, [fetchCategories, fetchTodos]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (!hasAppliedFilter.current) {
      hasAppliedFilter.current = true;
      return;
    }

    setLoading(true);
    void fetchTodos(filter)
      .catch(() => setError("Failed to load tasks."))
      .finally(() => setLoading(false));
  }, [filter, fetchTodos]);

  const onSubmit = useCallback(
    async (values: FormValues) => {
      setFormError(null);
      setError(null);

      try {
        const response = await api.post<Todo>("/todos", values);
        setTodos((prev) => sortTodos([response.data, ...prev]));
        reset();
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const message =
            (err.response?.data as { message?: string })?.message ??
            "Failed to create task.";
          setFormError(message);
          return;
        }
        setFormError("Failed to create task.");
      }
    },
    [reset],
  );

  const handleToggleCompleted = useCallback(
    async (todo: Todo, checked: boolean) => {
      setError(null);
      setFormError(null);

      if (!checked) {
        if (pendingActions.current.has(todo.id)) {
          await handleUndo(todo.id);
          return;
        }

        try {
          const response = await api.patch<Todo>(`/todos/${todo.id}`, {
            completed: false,
          });
          setTodos((prev) =>
            prev.map((item) => (item.id === todo.id ? response.data : item)),
          );
        } catch {
          setError("Failed to update task.");
        }
        return;
      }

      if (pendingActions.current.has(todo.id)) {
        return;
      }

      try {
        const response = await api.patch<Todo>(`/todos/${todo.id}`, {
          completed: true,
        });
        setTodos((prev) =>
          prev.map((item) => (item.id === todo.id ? response.data : item)),
        );
        scheduleDelete(response.data, "complete");
      } catch {
        setError("Failed to update task.");
      }
    },
    [handleUndo, scheduleDelete],
  );

  const handleDelete = useCallback(
    (todo: Todo) => {
      setError(null);
      setFormError(null);

      if (pendingActions.current.has(todo.id)) {
        return;
      }

      setTodos((prev) => prev.filter((item) => item.id !== todo.id));
      scheduleDelete(todo, "delete");
    },
    [scheduleDelete],
  );

  const emptyState = useMemo(() => !loading && todos.length === 0, [
    loading,
    todos.length,
  ]);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Todo Manager
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Create task
          </Typography>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              sx={{ alignItems: { xs: "stretch", md: "flex-start" } }}
            >
              <TextField
                label="Task text"
                fullWidth
                error={Boolean(formState.errors.text)}
                helperText={formState.errors.text?.message}
                {...register("text", {
                  required: "Task text is required.",
                  minLength: {
                    value: 2,
                    message: "Task text must be at least 2 characters.",
                  },
                })}
              />

              <Controller
                name="categoryId"
                control={control}
                rules={{ required: "Category is required." }}
                render={({ field }) => (
                  <FormControl
                    fullWidth
                    error={Boolean(formState.errors.categoryId)}
                  >
                    <InputLabel id="category-label">Category</InputLabel>
                    <Select
                      {...field}
                      labelId="category-label"
                      label="Category"
                    >
                      {categories.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      {formState.errors.categoryId?.message}
                    </FormHelperText>
                  </FormControl>
                )}
              />

              <Button
                variant="contained"
                type="submit"
                sx={{ minWidth: 120 }}
                disabled={formState.isSubmitting}
              >
                Add task
              </Button>
            </Stack>
            {formError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {formError}
              </Alert>
            )}
          </Box>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{
              alignItems: { xs: "flex-start", sm: "center" },
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h6">Tasks</Typography>
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel id="filter-label">Filter</InputLabel>
              <Select
                labelId="filter-label"
                label="Filter"
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <Divider sx={{ my: 2 }} />

          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={28} />
            </Box>
          )}

          {emptyState && (
            <Stack sx={{ alignItems: "center", py: 4 }} spacing={1}>
              <InboxOutlinedIcon sx={{ fontSize: 42 }} color="disabled" />
              <Typography color="text.secondary">No tasks</Typography>
            </Stack>
          )}

          {!loading && todos.length > 0 && (
            <List>
              {todos.map((todo) => (
                <ListItem
                  key={todo.id}
                  divider
                  sx={{ pr: 8 }}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDelete(todo)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemIcon>
                    <Checkbox
                      checked={todo.completed}
                      onChange={(event) =>
                        void handleToggleCompleted(todo, event.target.checked)
                      }
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={todo.text}
                    secondary={todo.completed ? "Completed" : "Not completed"}
                  />
                  <Chip label={todo.category.name} size="small" sx={{ ml: 2 }} />
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      </Stack>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        slotProps={{ transition: { onExited: handleSnackbarExited } }}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="info"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                if (activeSnackbar) {
                  void activeSnackbar.onUndo();
                }
                handleSnackbarClose();
              }}
            >
              Undo
            </Button>
          }
        >
          {activeSnackbar?.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default App;
