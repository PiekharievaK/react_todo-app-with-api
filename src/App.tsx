/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
// import { UserWarning } from './UserWarning';
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { getTodos } from './api/todos';
import { Todo } from './types/Todo';
import { TodoList } from './components/TodoList/TodoList';
import { Footer } from './components/Footer/Footer';
import { Header } from './components/Header/Header';
import { ErrorField } from './components/ErrorField/ErrorField';
import { FilterBy, ERROR } from './types/enums';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filterQwery, setFilterQwery] = useState(FilterBy.All);
  const [errorMessage, setErrorMessage] = useState<ERROR | string>(
    ERROR.no_error,
  );
  const [todosLength, setTodosLength] = useState<number>(0);
  const [todosLoading, setTodosLoading] = useState<number[]>([]);
  // if (!USER_ID) {
  //   return <UserWarning />;
  // }

  useEffect(() => {
    if (
      (todosLoading.length === 0 && todosLength !== todos.length) ||
      errorMessage
    ) {
      setTodosLength(todos.length);
    }
  }, [todosLoading]);

  const loadTodos = useCallback(async () => {
    try {
      setErrorMessage(ERROR.no_error);
      const data = await getTodos();

      setTodos(data);
      setTodosLength(data.length);
    } catch (err) {
      setErrorMessage(ERROR.todos);
    } finally {
    }
  }, []);

  useEffect(() => {
    loadTodos();
  }, []);

  const adIdToLoadingList = useCallback((id: number) => {
    setTodosLoading(prev => [...prev, id]);
  }, []);

  const removeIdFromLoadingList = useCallback((id: number | null) => {
    setTodosLoading(prev => prev.filter(item => item !== id));
  }, []);

  const filteredTodos = (qwery: FilterBy): Todo[] => {
    return todos.filter(item => {
      switch (qwery) {
        case FilterBy.Active:
          return !item.completed;
        case FilterBy.Completed:
          return item.completed;
        default:
          return true;
      }
    });
  };

  const visibleTodos = useMemo(
    () => filteredTodos(filterQwery),
    [todos, filterQwery],
  );

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>
      <div className="todoapp__content">
        <Header
          todosLength={todosLength}
          setErrorMessage={setErrorMessage}
          setTodosLoading={setTodosLoading}
          setTodos={setTodos}
          loadingIdsState={{ adIdToLoadingList, removeIdFromLoadingList }}
          todos={todos}
        />
        {todos.length > 0 && (
          <TodoList
            todos={visibleTodos}
            loadingIdsState={{ adIdToLoadingList, removeIdFromLoadingList }}
            setErrorMessage={setErrorMessage}
            setTodos={setTodos}
            todosLoading={todosLoading}
          />
        )}
        {todos.length > 0 && (
          <Footer
            todos={todos}
            filterQwery={filterQwery}
            setFilterQwery={setFilterQwery}
            loadingIdsState={{ adIdToLoadingList, removeIdFromLoadingList }}
            setErrorMessage={setErrorMessage}
            setTodos={setTodos}
            todosLoading={todosLoading}
          />
        )}
      </div>
      <ErrorField
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
      />
    </div>
  );
};
