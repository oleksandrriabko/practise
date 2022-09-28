import { useMutation } from '@apollo/react-hooks';
import { SetFormValue } from '../../Form';
import { DocumentNode } from 'graphql';
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

export const UpdateContext = createContext({});

export function useUpdateContext() {
  return useContext(UpdateContext);
}

export function UpdateContextProvider({
  typeName,
  children,
  updateDocument,
  verifyUpdate,
}) {
  const [updateOne, update] = useMutation(updateDocument);
  const [updateItem, setUpdateItem] = useState(null);
  const onUpdate = useCallback(
    async (v) => {
      return updateOne({
        variables: verifyUpdate(v),
      });
    },
    [updateOne, verifyUpdate],
  );
  const updateContext = useMemo(
    () => ({
      typeName,
      updateItem,
      setUpdateItem,
      setUpdateItemValue: (k, v) =>
        setUpdateItem?.((values) => ({ ...values, [k]: v })),
      updating: update.loading,
      updateError: update.error?.message ?? '',
      onUpdate,
    }),
    [
      typeName,
      updateItem,
      setUpdateItem,
      update.loading,
      update.error,
      onUpdate,
    ],
  );
  return (
    <UpdateContext.Provider value={updateContext}>
      {children}
    </UpdateContext.Provider>
  );
}
