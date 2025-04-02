import React, { useEffect, useRef, useState } from 'react';
import { ERROR } from '../../types/enums';
import { addTodo, changeTodoParams, USER_ID } from '../../api/todos';
import { Todo } from '../../types/Todo';

type Props = {
  todosLength: number;
  setErrorMessage: (value: ERROR | string) => void;
  setTodosLoading: (id: number[]) => void;
  setTodos: (callback: (prev: Todo[]) => Todo[]) => void;
  loadingIdsState: {
    adIdToLoadingList: (id: number) => void;
    removeIdFromLoadingList: (id: number | null) => void;
  };
  todos: Todo[];
};

export const Header: React.FC<Props> = React.memo(
  ({
    todosLength,
    setErrorMessage,
    setTodosLoading,
    setTodos,
    loadingIdsState,
    todos,
  }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [completed, setCompleted] = useState(
      todos.every(item => item.completed === true),
    );
    const inputField = useRef<HTMLInputElement>(null);

    useEffect(() => {
      inputField.current?.focus();
    }, [todosLength, isLoading]);

    useEffect(() => {
      if (todos?.length < 0) {
        return;
      }

      setCompleted(!todos.every(item => item.completed === true));
    }, [todos]);

    const addItem = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (inputField.current) {
        const value = inputField.current.value;
        let id = 0;

        try {
          if (value.trim() === '') {
            throw new Error(ERROR.title);
          }

          const todo: Omit<Todo, 'id'> = {
            title: value.trim(),
            userId: USER_ID,
            completed: false,
          };

          setIsLoading(true);
          setTodosLoading([id]);

          setTodos(prev => {
            id =
              prev.length > 0
                ? Math.max(...prev.map((item: Todo) => item.id)) + 1
                : 1;

            setTodosLoading([id]);

            return [...prev, { ...todo, id }];
          });

          const res = await addTodo(todo);

          setTodos(prev => {
            return prev.map(item => {
              if (item.id === id) {
                return res as Todo;
              }

              return item;
            });
          });

          inputField.current.focus();
          inputField.current.value = '';
        } catch (err) {
          const error = err as Error;

          setTodos(prev => prev.filter(item => id !== item.id));
          setErrorMessage(error.message || ERROR.add);
        } finally {
          setIsLoading(false);
          setTodosLoading([]);
        }
      }
    };

    const CompleteAll = () => {
      const status = completed;
      const notInStatus = todos.filter(item => item.completed !== status);

      notInStatus.forEach(async item => {
        loadingIdsState.adIdToLoadingList(item.id);
        try {
          await changeTodoParams(item.id, { completed: status });
          setTodos(prev =>
            prev.map(todo =>
              todo.completed !== status ? { ...todo, completed: status } : todo,
            ),
          );
        } catch (error) {
          setErrorMessage(ERROR.update);
          throw new Error(ERROR.update);
        } finally {
          loadingIdsState.removeIdFromLoadingList(item.id);
        }
      });
    };

    return (
      <header className="todoapp__header">
        {todos.length > 0 && (
          <button
            type="button"
            className={`todoapp__toggle-all ${!completed && 'active'}`}
            data-cy="ToggleAllButton"
            onClick={() => CompleteAll()}
          />
        )}

        <form onSubmit={addItem}>
          <input
            data-cy="NewTodoField"
            type="text"
            className="todoapp__new-todo"
            placeholder="What needs to be done?"
            ref={inputField}
            disabled={isLoading}
          />
        </form>
      </header>
    );
  },
);

Header.displayName = 'Header';
