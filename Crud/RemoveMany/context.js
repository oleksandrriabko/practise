import { useMutation } from '@apollo/react-hooks';
import { DocumentNode } from 'graphql';
import { useFindContext } from '../Find';
import { selectRemoveManyCacheWrite as defaultSelectRemoveManyCacheWrite } from '../utils';
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

export const RemoveManyContext = createContext({});

export function useRemoveManyContext() {
  return useContext(RemoveManyContext);
}

export function RemoveManyContextProvider({
  idField = 'id',
  typeName,
  children,
  removeManyDocument,
  selectRemoveManyCacheWrite = defaultSelectRemoveManyCacheWrite,
}) {
  const [confirmRemoveMany, setConfirmRemoveMany] = useState(false);
  const [removeMany, remove] = useMutation(removeManyDocument);
  const { findDocument, variables } = useFindContext();
  const onRemoveMany = useCallback(
    async (items) => {
      const ids = items.map((v) => v?.[idField]);
      return removeMany({
        variables: { ids },
        // optimisticResponse: {
        //   [removeManyField]: items,
        // },
        update: (cache) => {
          if (findDocument) {
            const prev = cache.readQuery({
              query: findDocument,
              variables,
            });
            const data = selectRemoveManyCacheWrite(
              typeName,
              prev,
              ids,
              idField,
            );
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
    [variables, removeMany, findDocument, typeName],
  );
  const removeManyContext = useMemo(
    () => ({
      idField,
      typeName,
      confirmRemoveMany,
      setConfirmRemoveMany,
      removingMany: remove.loading,
      removeManyError: remove.error?.message ?? '',
      onRemoveMany,
    }),
    [
      idField,
      typeName,
      confirmRemoveMany,
      setConfirmRemoveMany,
      remove.loading,
      remove.error,
      onRemoveMany,
    ],
  );
  return (
    <RemoveManyContext.Provider value={removeManyContext}>
      {children}
    </RemoveManyContext.Provider>
  );
}
