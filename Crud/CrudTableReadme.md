# CRUD Table ⭐

Full functioning table with CRUD controls Filtering and Pagination

```js
import { CrudProvider, CrudTable } from "@elevatejs/material-ui-crud";
```

<!-- Brief summary of what the component is, and what it's for. -->

<!-- STORY -->

#### CRUD Table Source

<!-- SOURCE -->

```js
import {
  CrudProvider,
  CrudTable,
  useSort,
  usePagination
} from "@elevatejs/material-ui-crud";
import {
  Mountain,
  FindMountainsDocument,
  InsertMountainDocument,
  UpdateMountainDocument,
  RemoveManyMountainsDocument
} from "./graphql.generated";

export const MountainsTable = () => {
  const [sort] = useSort();
  const [pagination] = usePagination();
  const variables = React.useMemo(
    () => ({
      sort,
      pagination,
    }),
    [sort, pagination]
  );
  return (
    <CrudProvider<Mountain | null>
      typeName="Mountain"
      variables={variables}
      initialItem={initialMountain}
      findDocument={FindMountainsDocument}
      insertDocument={InsertMountainDocument}
      updateDocument={UpdateMountainDocument}
      removeManyDocument={RemoveManyMountainsDocument}
      verifyInsert={verifyInsert}
      verifyUpdate={verifyUpdate}
    >
      <CrudTable<Mountain | null>
        title="Mountains"
        head={MountainHead}
        form={MountainForm}
        renderRow={(mountain, i) => (
          <MountainRow key={mountain?.id ?? i} mountain={mountain} />
        )}
      />
    </CrudProvider>
  );
}
```

<!-- STORY HIDE START -->

The content here won't be shown in stories.

<!-- STORY HIDE END -->

#### Initial Insert Item

```js
// The initial item used in insert form
const initialMountain: Mountain = {
  name: "",
  location: "",
  meters: 0,
  feet: 0,
};
```

#### Validate Item

Provide your custom validation logic

```js
// Throw any errors client side before running mutations
const verifyMountainInput = (mountain?: Mountain | null) => {
  const meters = Number(mountain?.meters ?? 0);
  const feet = Number(mountain?.feet ?? 0);
  if (!mountain?.name) throw new Error("Name is required");
  if (!mountain?.location) throw new Error("Location is required");
  if (!meters || !(meters > 0)) throw new Error("Meters must be positive");
  if (!feet || !(feet > 0)) throw new Error("Feet must be positive");
  return {
    name: mountain?.name,
    location: mountain?.location,
    meters,
    feet,
  };
};
```

#### Transform Mutation Variables

```js
// Throw any errors client side before running mutation
// Verify the insert input and transform to insert query variables
const verifyInsert = (mountain?: Mountain | null) => {
  return {
    mountain: verifyMountainInput(mountain),
  };
};

// Throw any errors client side before running mutation
// Verify the update input and transform to insert query variables
const verifyUpdate = (mountain?: Mountain | null) => {
  return {
    id: mountain?.id,
    mountainSet: verifyMountainInput(mountain),
  };
};
```

#### Mountain Head

Provide your custom Component to render the tables header

```js
import { CheckboxHeaderRow, HeadSortCell } from "@elevatejs/material-ui-crud";

export function MountainHead() {
  return (
    <CheckboxHeaderRow>
      <HeadSortCell field="name">
        <strong>Name</strong>
      </HeadSortCell>
      <HeadSortCell field="location">
        <strong>Location</strong>
      </HeadSortCell>
      <HeadSortCell field="meters" align="right">
        <strong>Meters</strong>
      </HeadSortCell>
      <HeadSortCell field="feet" align="right">
        <strong>Feet</strong>
      </HeadSortCell>
      <HeadSortCell field="update" />
    </CheckboxHeaderRow>
  );
}
```

#### Mountain Row

Provide your custom Component to render the table row

```js
import { CheckboxHeaderRow, HeadSortCell } from "@elevatejs/material-ui-crud";

export function MountainRow({ mountain }: { mountain?: Mountain | null }) {
  return (
    <CheckboxRow
      labelId={`mountain-row-${mountain?.id}`}
      item={mountain}
      name="name"
    >
      <TableCell>{mountain?.location ?? ""}</TableCell>
      <TableCell align="right">{num(mountain?.meters ?? 0)}</TableCell>
      <TableCell align="right">{num(mountain?.feet ?? 0)}</TableCell>
      <TableCell align="right">
        <UpdateItemButton item={mountain} />
      </TableCell>
    </CheckboxRow>
  );
}

function num(n: number) {
  return n.toLocaleString(undefined, {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });
}
```

#### Mountain Form

Provide your custom Component to render the item form

```js
import TextField from "@material-ui/core/TextField";
import { SetFormValue } from "@elevatejs/material-ui-crud";

export function MountainForm({
  values,
  onSubmit,
  setValue,
}: {
  values?: Mountain | null,
  onSubmit: () => any,
  setValue?: SetFormValue<Mountain>,
}) {
  return (
    <form
      onSubmit={(ev) => {
        ev.preventDefault();
        onSubmit();
      }}
    >
      <TextField
        name="name"
        label="Name"
        margin="normal"
        variant="outlined"
        value={values?.name ?? ""}
        onChange={(ev) => setValue?.("name", ev.target.value)}
        fullWidth
      />
      <TextField
        name="location"
        label="Location"
        margin="normal"
        variant="outlined"
        value={values?.location ?? ""}
        onChange={(ev) => setValue?.("location", ev.target.value)}
        fullWidth
      />
      <TextField
        name="meters"
        label="Meters"
        type="number"
        margin="normal"
        variant="outlined"
        value={values?.meters ?? ""}
        onChange={(ev) => setValue?.("meters", ev.target.value)}
        fullWidth
      />
      <TextField
        name="feet"
        label="Feet"
        type="number"
        margin="normal"
        variant="outlined"
        value={values?.feet ?? ""}
        onChange={(ev) => setValue?.("feet", ev.target.value)}
        fullWidth
      />
      <input type="submit" hidden />
    </form>
  );
}
```
