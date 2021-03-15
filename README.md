# svelte-rodry-common

Many Svelte components that I commonly use. Some are built by me and others are modified version of existing components to be used with Svelte.

![Svelte Logo](https://svelte.dev/svelte-logo-horizontal.svg)

## Pre-requisites

These components are designed to be used with the following packages

- [Tailwind CSS](https://tailwindcss.com/)
- [Fontawesome Free](https://fontawesome.com/v5.9.0/how-to-use/on-the-web/referencing-icons/basic-use)

Make sure your project has these installed.

## Components

### Modal

Very simple modal window using Tailwind css classes.

### Properties

| Property | Type       | Description                                                                                                           |
| -------- | ---------- | --------------------------------------------------------------------------------------------------------------------- |
| show     | _Boolean_  | Shows or hides the Modal                                                                                              |
| cssClass | _String_   | Custom CSS classes to add to the Modal window                                                                         |
| onClose  | _Function_ | Runs when the built in close button is pressed. Use if you want to control the open/close state from your application |

### Slots

The Modal accepts 3 slots

| Slot   | Description                                                        |
| ------ | ------------------------------------------------------------------ |
| title  | Title of the modal window                                          |
| body   | Main content of the modal                                          |
| footer | Footer of the modal window. Use to put custom buttons to the modal |

### Example

Simple Modal script

```javascript
<script>
  import { Modal } from "svelte-rodry-common";
  import pkg from "../package.json";

  let showModal = false;

  const toggleModal = () => (showModal = !showModal);
</script>

<Modal cssClass="w-8/12" show={showModal} onClose={toggleModal}>
  <div slot="title">This is a test modal</div>
  <div slot="body">
  Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.
  </div>
  <div slot="footer" class="grid justify-items-end">
      <button on:click={toggleModal}>Close</button>
  </div>
</Modal>
```

### Tabs

Recompiled version of `svelte-tabs` with the latest version of Svelte. This fixes an error related to the older Svelte version used by the package.

_Coming soon..._

### Tabulator

Sveltified version of `tabulator-tables`.

_Coming soon..._

### Treeview

Based on the Treeview examples shown in several REPLs. It uses _Fontawesome_ icons

_Coming soon..._
