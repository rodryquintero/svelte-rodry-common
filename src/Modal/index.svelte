<script>
  export let show = false;
  export let cssClass = "";
  export let onClose = () => {};

  function hide() {
    show = false;
    onClose();
  }
</script>

<style>
  .modal {
    transition: opacity 0.25s ease;
  }
  /* body.modal-active {
    overflow-x: hidden;
    overflow-y: visible !important;
  } */

  span.close {
    cursor: pointer;
    color: gray;
    font-weight: bolder;
  }

  span.close:hover {
    text-shadow: 0 0 3px gray;
  }
</style>

{#if show}
  <div
    class="fixed bottom-0 inset-x-0 px-4 pb-4 sm:inset-0 sm:flex sm:items-center
    sm:justify-center">
    <div class="fixed inset-0 transition-opacity">
      <div class="absolute inset-0 bg-gray-500 opacity-75" />
    </div>

    <div
      class={`bg-white rounded-lg overflow-hidden shadow-xl transform
      transition-all ${cssClass}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-headline">

      <!-- TITLE -->
      <div class="bg-white px-4 pt-3">
        <!-- SLOT -->
        <div class="flex">
          <div class="w-11/12">
            <slot name="title" />
          </div>

          <!-- CLOSE DIALOG "x" -->
          <div class="w-1/12 text-right">
            <span on:click={hide} class="close">X</span>
          </div>
        </div>
      </div>

      <!-- BODY -->
      <div class="bg-white px-4 pt-3 pb-3">
        <!-- SLOT -->
        <slot name="body" />
      </div>

      <!-- FOOTER -->
      <div class="bg-gray-300 px-4 py-3">
        <!-- SLOT -->
        <slot name="footer" />
      </div>
    </div>
  </div>
{/if}
