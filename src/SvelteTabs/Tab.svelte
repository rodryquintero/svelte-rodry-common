<script>
  import { getContext, onMount, tick } from "svelte";

  import getId from "./id";
  import { TABS } from "./Tabs.svelte";

  let tabEl;

  const tab = {
    id: getId(),
  };
  const {
    registerTab,
    registerTabElement,
    selectTab,
    selectedTab,
    controls,
  } = getContext(TABS);

  let isSelected;
  $: isSelected = $selectedTab === tab;

  registerTab(tab);

  onMount(async () => {
    await tick();
    registerTabElement(tabEl);
  });
</script>

<li
  bind:this={tabEl}
  role="tab"
  id={tab.id}
  aria-controls={$controls[tab.id]}
  aria-selected={isSelected}
  tabindex={isSelected ? 0 : -1}
  class:svelte-tabs__selected={isSelected}
  class="svelte-tabs__tab"
  on:click={() => selectTab(tab)}
>
  <slot />
</li>

<style>
  .svelte-tabs__tab {
    /* border: none;
		border-bottom: 2px solid transparent;
		color: #000000;
    cursor: pointer;
    list-style: none;
    display: inline-block;
    padding: 0.5em 0.75em; */
    border-radius: 3px 3px 0 0;
    border-style: solid;
    border-width: 1px;
    border-color: gray;
    opacity: 0.5;
    margin-right: -5px;
    color: #191919;
    cursor: pointer;
    list-style: none;
    display: inline-block;
    padding: 0.5em 0.75em;
  }

  .svelte-tabs__tab:focus {
    outline: thin dotted;
  }

  .svelte-tabs__selected {
    /* border-bottom: 2px solid #4f81e5;
    color: #4f81e5; */
    opacity: 1;
    border-top: 3px solid #0066cc;
    color: #191919 !important;
    border-bottom: 2px solid white;
  }
</style>
