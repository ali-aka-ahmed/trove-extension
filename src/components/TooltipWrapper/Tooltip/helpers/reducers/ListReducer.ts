import { Reducer } from 'react';
import { toArray } from '../../../../../utils';

export enum ListReducerActionType {
  Add,
  Clear,
  Remove,
  Update,
  UpdateOrAdd,
}

export type ListReducerAction<T> =
  | {
      type:
        | ListReducerActionType.Add
        | ListReducerActionType.Update
        | ListReducerActionType.UpdateOrAdd;
      data: T | T[];
    }
  | {
      type: ListReducerActionType.Clear;
      data?: T | T[];
    }
  | {
      type: ListReducerActionType.Remove;
      data: T | T[] | T[keyof T][] | T[keyof T];
    };

const ListReducer = <T>(key?: keyof T): Reducer<T[], ListReducerAction<T>> => (
  state: T[],
  action: ListReducerAction<T>,
) => {
  switch (action.type) {
    case ListReducerActionType.Add: {
      const dataToAdd = toArray(action.data);
      return [...state, ...dataToAdd];
    }
    case ListReducerActionType.Clear: {
      return toArray(action.data || []);
    }
    case ListReducerActionType.Remove: {
      if (!key) {
        const dataToRemove = toArray(action.data) as T[];
        return [...state.filter((post) => !dataToRemove.includes(post))];
      } else {
        const dataToRemove = toArray(action.data);
        if (dataToRemove.length > 0 && key in (dataToRemove[0] as T)) {
          return [
            ...state.filter((data) => !dataToRemove.some((dataR: T) => data[key] === dataR[key])),
          ];
        } else {
          return [...state.filter((data) => !dataToRemove.includes(data[key]))];
        }
      }
    }
    case ListReducerActionType.Update: {
      const dataToUpdate = toArray(action.data);
      if (!key) {
        // Implement if we need it
      } else {
        dataToUpdate.forEach((dataU) => {
          const idx = state.findIndex((data) => data[key] === dataU[key]);
          state[idx] = dataU;
        });
      }

      return [...state];
    }
    case ListReducerActionType.UpdateOrAdd: {
      const dataToUpdate = toArray(action.data);
      if (!key) {
        // Implement if we need it
      } else {
        dataToUpdate.forEach((dataU) => {
          const idx = state.findIndex((data) => data[key] === dataU[key]);
          if (idx === -1) {
            state.push(dataU); // Add
          } else {
            state[idx] = dataU; // Update
          }
        });
      }

      return [...state];
    }
    default:
      return state;
  }
};

export default ListReducer;
