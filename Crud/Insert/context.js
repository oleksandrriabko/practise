import { useMutation } from '@apollo/react-hooks';
import { SetFormValue } from '../../Form';
import { DocumentNode } from 'graphql';
import { useFindContext } from '../Find';
import { selectInsertCacheWrite as defaultSelectInsertCacheWrite } from '../utils';
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

export const InsertContext = createContext({});

export function useInsertContext() {
  return useContext(InsertContext);
}

export function InsertContextProvider({
  children,
  initialItem,
  insertDocument,
  selectInsertCacheWrite = defaultSelectInsertCacheWrite,
  verifyInsert,
  typeName,
}) {
  const [insertItem, setInsertItem] = useState(null);
  const [insertOne, insert] = useMutation(insertDocument);
  const { findDocument, variables } = useFindContext();
  const onInsert = useCallback(
    async (v) => {
      return insertOne({
        variables: verifyInsert(v),
        update: (cache, result) => {
          if (findDocument && selectInsertCacheWrite) {
            const prev = cache.readQuery({
              query: findDocument,
              variables,
            });
            const data = selectInsertCacheWrite(typeName, prev, result);
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
    [
      typeName,
      insertOne,
      verifyInsert,
      selectInsertCacheWrite,
      variables,
      findDocument,
    ],
  );
  const insertContext = useMemo(
    () => ({
      typeName,
      initialItem,
      insertItem,
      setInsertItem,
      setInsertItemValue: (k, v) =>
        setInsertItem((values) => ({ ...values, [k]: v })),
      inserting: insert.loading,
      insertError: insert.error?.message ?? '',
      onInsert,
    }),
    [
      typeName,
      initialItem,
      insertItem,
      setInsertItem,
      insert.loading,
      insert.error,
      onInsert,
    ],
  );
  return (
    <InsertContext.Provider value={insertContext}>
      {children}
    </InsertContext.Provider>
  );
}
