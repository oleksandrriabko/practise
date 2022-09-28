import { useMutation } from '@apollo/react-hooks';
import { DocumentNode } from 'graphql';
import { useFindContext } from '../Find';
import { selectRemoveCacheWrite as defaultSelectRemoveCacheWrite } from '../utils';
import React, {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

export const RemoveContext = createContext({});

export function useRemoveContext() {
  return useContext(RemoveContext);
}

export function RemoveContextProvider({
  idField = 'id',
  typeName,
  children,
  removeDocument,
  selectRemoveCacheWrite = defaultSelectRemoveCacheWrite,
}) {
  const [removeItem, setRemoveItem] = useState(null);
  const [removeOne, remove] = useMutation(removeDocument);
  const { findDocument, variables } = useFindContext();
  const onRemove = useCallback(
    async (item) => {
      const id = item?.[idField];
      return removeOne({
        variables: { id },
        // optimisticResponse: {
        //   [removeManyField]: items,
        // },
        update: (cache) => {
          if (findDocument) {
            const prev = cache.readQuery({
              query: findDocument,
              variables,
            });
            const data = selectRemoveCacheWrite(typeName, prev, id, idField);
            if (data) {
              cache.writeQuery({
                query: findDocument,
                variables,
                data,
              });
            }
          }
        },
      });
    },
    [variables, removeOne, findDocument, typeName, idField],
  );
  const removeContext = useMemo(
    () => ({
      idField,
      typeName,
      removeItem,
      setRemoveItem,
      removing: remove.loading,
      removeError: remove.error?.message ?? '',
      onRemove,
    }),
    [
      idField,
      typeName,
      removeItem,
      setRemoveItem,
      remove.loading,
      remove.error,
      onRemove,
    ],
  );
  return (
    <RemoveContext.Provider value={removeContext}>
      {children}
    </RemoveContext.Provider>
  );
}
