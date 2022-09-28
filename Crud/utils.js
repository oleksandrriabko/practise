export function pluralize(str) {
  if (!str) return '';
  if (str[str.length - 1] === 's') return str;
  return `${str}s`;
}

export function selectFindData(typeName, data) {
  return data?.[`find${pluralize(typeName)}`]?.data ?? [];
}

export function selectFindTotal(typeName, data) {
  return data?.[`find${pluralize(typeName)}`]?.total ?? 0;
}

export function selectInsertCacheWrite(typeName, prev, result) {
  const findField = `find${pluralize(typeName)}`;
  const inserted = result?.data?.[`insert${typeName}`];
  if (!inserted) return null;
  const prevResult = prev?.[findField];
  const prevData = prevResult?.data ?? [];
  const newData = [].concat(prevData, inserted);
  return {
    [findField]: {
      ...prevResult,
      data: newData,
    },
  };
}

export function selectRemoveManyCacheWrite(
  typeName,
  prev,
  ids,
  idField = 'id',
) {
  const findField = `find${pluralize(typeName)}`;
  const prevResult = prev?.[findField];
  const prevData = prevResult?.data ?? [];
  const newData = prevData.filter((v) => !ids.includes(v?.[idField]));
  return {
    [findField]: {
      ...prevResult,
      data: newData,
    },
  };
}

export function selectRemoveCacheWrite(typeName, prev, id, idField = 'id') {
  const findField = `find${pluralize(typeName)}`;
  const prevResult = prev?.[findField];
  const prevData = prevResult?.data ?? [];
  const newData = prevData.filter((v) => !id !== v?.[idField]);
  return {
    [findField]: {
      ...prevResult,
      data: newData,
    },
  };
}
