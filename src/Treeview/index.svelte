<script>
  import { onMount, onDestroy } from "svelte";
  import { store } from "./store";
  import Item from "./Item.svelte";
  export let items = [];
  export let onClick = () => {};

  // ==================================================================

  const onHashChange = () => {
    $store.currentUrl = window.location.hash;
  };

  onMount(() => {
    window.addEventListener("hashchange", onHashChange);
  });

  onDestroy(() => {
    window.removeEventListener("hashchange", onHashChange);
  });
</script>

<ul>
  {#each items as item}
    <li>
      <Item {item} {onClick} />
    </li>
  {/each}
</ul>

<style>
  ul {
    /* font-size: 0.9rem; */
    padding: 2px;
    /* height: 82%; */
  }

  li {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
</style>
