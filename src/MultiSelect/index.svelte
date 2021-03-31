<script>
  import { onMount, onDestroy } from "svelte";
  export let items = [];
  export let value = [];
  export let name = "";
  export let onChange = () => {};

  const className = `dropdown-${Date.now()}-${Math.random() * 100}`;

  const onClickOutside = (e) => {
    if (!e.target.className.includes(className)) {
      show = false;
    }
  };

  onMount(() => {
    window.addEventListener("click", onClickOutside);
  });

  onDestroy(() => {
    window.removeEventListener("click", onClickOutside);
  });

  $: itemsTooltip = value.length ? value.join(",") : "";

  let filter = "";
  let show = false;
  let showChecked = false;
  let selectAll = value.length == items.length ? true : false;

  // $: selectTotal = value.length;

  let displayItems = [];

  $: {
    displayItems = !filter
      ? items
      : items.filter((d) => {
          return d.toLowerCase().indexOf(filter.toLowerCase()) != -1;
        });

    if (showChecked) {
      displayItems = displayItems.filter((d) => value.indexOf(d) != -1);
    }
  }

  // METHODS
  // =======================================================
  const trigger = () => {
    show = !show;
  };

  const toggleSelectAll = (e) => {
    const { checked } = e.target;

    if (checked) {
      value = displayItems;
    } else {
      value = [];
    }

    onChange(value);
  };

  // const toggleShowChecked = (e) => {
  //   const { checked } = e.target;
  //   showChecked = checked;
  // };

  const toggleCheck = (e) => {
    const { checked } = e.target;

    if (checked) {
      value = [...value, e.target.value];
    } else {
      value = value.filter((d) => d != e.target.value);
    }

    onChange(value);
  };
</script>

<div class={`${className} dropdown`}>
  <button
    on:click={trigger}
    class={`dropbtn ${className}`}
    class:menu-open={show}
    title={itemsTooltip}
  >
    <span class={`${className}`} style="margin-left: 2px">&#9660;</span>
    {#each value as val}
      <span class={`value ${className}`}> {val}</span>
    {/each}
    <!-- <span>{label}</span>&nbsp; ({selectTotal}/{items.length})
    -->
  </button>
  {#if show}
    <div class={`${className} dropdown-content`}>
      <!-- Filter box -->
      <label for="filter">
        <input
          placeholder="filter"
          autocomplete="off"
          id="filter"
          type="search"
          class="filter"
          bind:value={filter}
        /></label
      >
      <!-- MENU ITEMS MODIFIERS -->
      <div class={`list-actions ${className}`}>
        <!-- Select all -->
        <label for="select-all">
          <input
            on:change={toggleSelectAll}
            id="select-all"
            type="checkbox"
            checked={selectAll}
          />
          <small> Select all </small>
        </label>
        <!-- Show checked only
        <label for="show-checked">
          <input
            on:change={toggleShowChecked}
            id="show-checked"
            type="checkbox"
          />
          <small> Show checked </small>
        </label>-->
      </div>

      <!-- Menu items -->
      {#each displayItems as item}
        <label class={`menu-item ${className}`} for={`${item}`}>
          <input
            class={`${className}`}
            checked={value.indexOf(item) != -1}
            on:change={toggleCheck}
            type="checkbox"
            {name}
            value={item}
            id={`${item}`}
          />
          {item}
        </label>
      {/each}
    </div>
  {/if}
  <!-- </button> -->
</div>

<style>
  span.value {
    font-size: 0.8rem;
    padding: 0 2px;
    border-radius: 3px;
    background-color: gainsboro;
    margin-right: 2px;
  }

  /* The container <div> - needed to position the dropdown content */
  .dropdown {
    position: relative;
    display: inline-block;
  }

  .menu-open {
    border-bottom: 0;
  }

  small {
    font-style: italic;
  }

  .list-actions {
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid gainsboro;
  }

  button {
    display: flex;
    justify-content: space-between;
    border: 1px solid gainsboro;
    border-radius: 3px;
    padding: 5px;
    min-width: 200px;
    white-space: nowrap;
    overflow: hidden;
    max-width: 200px;
    overflow-x: auto;
  }

  /* Dropdown Content (Hidden by Default) */
  .dropdown-content {
    display: flex;
    flex-direction: column;
    position: absolute;
    background-color: white;
    min-width: 200px;
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
    z-index: 1;
    width: 100%;
    font-size: 0.8rem;
    max-height: 200px;
    overflow: auto;
  }

  .dropdown-content label {
    padding: 0px 5px;
  }

  input.filter {
    padding: 3px;
    border-radius: 3px;
    border: 1px solid gainsboro;
    width: 100%;
    font-size: 0.8rem;
    margin-top: 2px;
  }

  label.menu-item:hover {
    background-color: lightyellow;
  }
</style>
