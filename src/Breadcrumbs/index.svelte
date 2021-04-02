<script>
  /**
   * BREADCRUMBS
   * =================================================================
   * @input {array} items           array of breadcrumbs
   * @input {string} style          style attribute
   * @input {string} activeItem     id of breadcrumb to activate
   * -----------------------------------------------------------------
   * @example Items array
   *
   * [
   *  {id:"one",label:"One", url:"#/one"},
   *  {id:"two",label:"Two", url:"#/two"},
   *  {id:"three",label:"Three", url:"#/three"},
   * ]
   */
  import { onMount, onDestroy } from "svelte";
  export let items = [];
  export let style = "";
  export let activeItem = "";

  let currentUrl = window.location.hash;

  const onHashChange = () => {
    currentUrl = window.location.hash;
  };

  onMount(() => {
    window.addEventListener("hashchange", onHashChange);
  });

  onDestroy(() => {
    window.removeEventListener("hashchange", onHashChange);
  });
</script>

<ul class="breadcrumb" {style}>
  {#each items as item}
    <li
      class:active={activeItem ? activeItem == item.id : item.url == currentUrl}
    >
      <a href={item.url}>{item.label}</a>
    </li>
  {/each}
</ul>

<style>
  .active {
    font-weight: bold;
    color: #0066cc;
  }

  .breadcrumb {
    list-style: none;
    overflow: hidden;
    box-shadow: 1px 1px 2px grey;
    border: 1px solid gainsboro;
  }

  .breadcrumb li:before {
    border-bottom: 15px solid transparent;
    border-left: 20px solid #dddddd;
    border-top: 15px solid transparent;
    content: " ";
    display: block;
    height: 0;
    left: 100%;
    margin-left: 1px;
    margin-top: -15px;
    position: absolute;
    top: 50%;
    width: 0;
    z-index: 1;
  }

  .breadcrumb li:after {
    border-bottom: 15px solid transparent;
    border-left: 20px solid #f6f6f6;
    border-top: 15px solid transparent;
    content: " ";
    display: block;
    height: 0;
    left: 100%;
    margin-top: -15px;
    position: absolute;
    top: 50%;
    width: 0;
    z-index: 2;
  }

  .breadcrumb li {
    background: none repeat scroll 0 0 #f6f6f6;
    display: block;
    float: left;
    /* height: 100px; */
    padding: 5px 0 5px 33px;
    position: relative;
  }

  .breadcrumb li:last-child {
    padding-right: 20px;
  }

  .breadcrumb li:first-child {
    padding-left: 14px;
  }
</style>
