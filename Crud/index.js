import React, { ComponentType } from 'react';
import { TableCard, TableToolbar, Table } from '../Table';
import { ConfirmRemoveManyDialog, InsertDialog, UpdateDialog } from '../Dialog';
import { FormComponent } from '../Form';

export * from './context';

export function CrudTable({ title, head: Head, form: Form, renderRow }) {
  return (
    <>
      <TableCard header={<TableToolbar title={title} />}>
        <Table head={<Head />} renderRow={renderRow} />
      </TableCard>
      <ConfirmRemoveManyDialog />
      <InsertDialog form={Form} />
      <UpdateDialog form={Form} />
    </>
  );
}
