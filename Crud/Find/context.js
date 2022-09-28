import { useQuery, QueryHookOptions } from '@apollo/react-hooks';
import { DocumentNode } from 'graphql';
import React, { createContext, ReactNode, useContext, useMemo } from 'react';
import {
  selectFindData as defaultSelectFindData,
  selectFindTotal as defaultSelectFindTotal,
} from '../utils';

export const FindContext = createContext({
  idField: 'id',
  data: [],
  total: 0,
  error: '',
  loading: false,
});

export function useFindContext() {
  return useContext(FindContext);
}

export function FindContextProvider({
  idField = 'id',
  children,
  typeName,
  variables,
  findDocument,
  selectFindData = defaultSelectFindData,
  selectFindTotal = defaultSelectFindTotal,
  options,
}) {
  const find = useQuery(findDocument, { variables, ...options });
  const findContext = useMemo(
    () => ({
      idField,
      typeName,
      total: selectFindTotal(typeName, find.data),
      data: selectFindData(typeName, find.data),
      error: find.error?.message ?? '',
      loading: find.loading,
      findDocument,
      variables,
    }),
    [
      idField,
      typeName,
      find.data,
      find.error,
      find.loading,
      findDocument,
      variables,
    ],
  );
  return (
    <FindContext.Provider value={findContext}>{children}</FindContext.Provider>
  );
}
