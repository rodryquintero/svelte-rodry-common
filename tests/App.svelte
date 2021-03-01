<script>
  import { Modal } from "../src/index.js";
  import pkg from "../package.json";

  let showModal = false;

  const toggleModal = () => (showModal = !showModal);
</script>

<svelte:head>
  <title>{pkg.name} (v{pkg.version})</title>
</svelte:head>
<main class="w-full">
  <h1 class="text-center">{pkg.name} (v{pkg.version})</h1>
  <h2>Testing Playground</h2>

  <section class="p-2">
    <div class="rounded border border-gray-200 p-2 shadow">
      <h3>Modal</h3>

      <button on:click={toggleModal}>Show Modal</button>

      <Modal cssClass="w-8/12" show={showModal} onClose={toggleModal}>
        <div slot="title">Modal Title</div>
        <div slot="body">Modal Body</div>
        <div slot="footer" class="grid justify-items-end">
          <button on:click={toggleModal}>Close</button>
        </div>
      </Modal>
    </div>
  </section>
</main>

<style>
  h1 {
    font-size: 2rem;
    padding: 3px;
    font-weight: bold;
    background-color: gainsboro;
  }

  h2 {
    font-size: 1.7rem;
    font-weight: 500;
    padding: 3px;
    text-align: center;
  }

  h3 {
    font-size: 1.5rem;
    text-decoration: underline;
    margin-bottom: 10px;
  }

  button {
    padding: 5px;
    border-radius: 3px;
    border: 1px solid gainsboro;
    background-color: white;
  }
  button:hover {
    box-shadow: 0 0 3px gray;
  }
</style>
