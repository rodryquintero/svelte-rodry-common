<script>
  import { store } from "./store";

  export let item = {};
  export let onClick = (e, item) => {};
  let showChildren = false;

  $: title = item.title;
  $: children = item.children;

  const toggleChildren = () => {
    showChildren = !showChildren;
  };
</script>

{#if children}
  <span class="icon" on:click={toggleChildren} title={`${title}`}>
    {#if showChildren}
      &#9660;
    {:else}&#9658;
    {/if}
    {title}</span
  >
{:else}
  <a
    class:active={$store.currentUrl == item.url}
    on:click={(e) => onClick(e, item)}
    class="icon"
    title={`${item.title}`}
    href={`${item.url}`}>{item.title}</a
  >
{/if}

{#if showChildren}
  <ul>
    {#each children as child}
      <li class="child">
        <svelte:self item={child} {onClick} />
      </li>
    {/each}
  </ul>
{/if}

<style>
  .active {
    font-weight: bold;
    color: #0066cc;
  }
  ul {
    margin-left: 0.9rem;
  }

  li {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  span.icon,
  li.child {
    cursor: pointer;
  }

  li.child {
    margin-left: 7px;
  }

  .icon:hover {
    font-weight: bold;
  }

  :global(tree-item.a:active, tree-item.a:focus) {
    font-weight: bold;
  }
</style>
