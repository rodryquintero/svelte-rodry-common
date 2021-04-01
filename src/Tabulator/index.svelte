<script>
  // ** TABULATOR **
  //
  // @documentation
  //
  //     columns: {title:"Progress", field:"progress", sorter:"number", hozAlign:"left", formatter:"progress", width:200,  editable:true},
  //
  // ----------------------------------------------
  import html2canvas from "html2canvas";
  import Tabulator from "tabulator-tables";
  import "tabulator-tables/dist/css/tabulator.css";
  import "tabulator-tables/dist/css/bootstrap/tabulator_bootstrap.css";
  export let columns = [];
  export let data = [];
  export let height = "";
  export let layout = "fitColumns";
  export let rowClick = () => {};
  export let rowDblClick = () => {};
  export let loading = false;
  export let rowFormatter = formatRow;
  export let cssClass = "";
  export let index = "id";
  export let exportFileName = "file";
  export let showHeader = true;
  export let txtFormatter = null;
  export let htmlFormatter = (list, options, setFileContents) => {
    const thead = `<tr>${list[0].columns
      .map((col) => {
        return `<th style="padding: 5px; vertical-align:top">${col.value}</th>`;
      })
      .join("")}</tr>`;

    const tbody = list
      .filter((row) => row.type == "row")
      .map((row) => {
        const line = row.columns.map(
          (d) =>
            ` <td style="border: 1px solid gainsboro; padding: 5px; vertical-align:top">${d.value}</td>`
        );
        return `<tr>${line.join("")}</tr>`;
      });

    const content = `<table style="font-family: monospace;border-collapse: collapse; width:100%;">
      <thead style="text-align: left; background-color: gainsboro;">
         ${thead}
        </thead>
      <tbody>
        ${tbody.join("")}
      </tbody>
    </table>`;
    setFileContents(content, "text/plain");
    return null;
  };

  // wrapping div element
  let el;

  // first and last items
  $: firstItem = data.length > 0 && data[0][index];
  $: lastItem = data.length > 0 && data[data.length - 1][index];

  // const evenRowColor = "#EFEFEF";

  const config = { columns, data, height, layout, rowClick };

  let table;
  $: table && table.replaceData(data);
  $: table && table.setColumns(columns);
  // $: table && table.clearHeaderFilter();

  const action = (node, config) => {
    table = new Tabulator(node, {
      height: height, // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
      data: data, //assign data to table
      layout: layout, //fit columns to width of table (optional)
      columns: columns,
      headerFilterPlaceholder: "filtro",
      resizableColumns: true,
      rowClick: rowClick,
      rowDblClick: rowDblClick,
      rowFormatter: rowFormatter,
      clipboard: "copy",
      clipboardCopyStyled: true,
      clipboardCopyConfig: {
        formatCells: false, //show raw cell values without formatter
      },
      dataTree: true,
      dataTreeStartExpanded: false,
      index: index,
      dataFiltered: function (filters, rows) {
        hits = [];
        gotoRowIndex = null;
        activeRowId = null;
      },
      dataLoaded: function (data) {
        // clear header filters when getting new data set
        this.clearHeaderFilter();
      },
    });

    return {
      destroy() {
        table.destroy();
      },
    };
  };

  // search parameters
  let searchText = "";
  $: hits = [];
  $: gotoRowIndex = null;
  let activeRowId = null;

  /**
   * SEARCH TEXT
   * -----------------------------------------------------------
   * Searches for given text and highlights the matches
   */
  const search = () => {
    if (!searchText) {
      hits = [];
      gotoRowIndex = null;
      activeRowId = null;
      return true;
    }

    // get column field names
    const fieldNames = columns.map((c) => c.field);
    hits = data
      .filter((d) => {
        const rowValues = fieldNames.map((v) => d[v]);
        const rowText = rowValues.join("");

        return rowText.toLowerCase().includes(searchText.toLowerCase());
      })
      .map((d) => d[index]);

    table.redraw(true);
  };

  function formatRow(row) {
    const data = row.getData();
    const rowId = data[index];

    if (!searchText) {
      return;
    }

    // paint row yellow
    if (hits.includes(rowId)) {
      row.getElement().style.backgroundColor = "lightyellow";
    } else {
      row.getElement().style.backgroundColor = null;
    }
  }

  /**
   * SCROLL DOWN TO ROW
   * --------------------------------------------------
   * Scroll down to row after search filter
   */
  function goDown() {
    if (hits.length == 0) {
      return;
    }

    if (gotoRowIndex === null) {
      activeRowId = hits[0];
      gotoRowIndex = 0;
    } else {
      if (gotoRowIndex >= hits.length - 1) {
        gotoRowIndex = hits.length - 1;
      } else {
        gotoRowIndex++;
        activeRowId = hits[gotoRowIndex];
      }
    }

    table.scrollToRow(activeRowId);
  }

  function goUp() {
    if (hits.length == 0) {
      return;
    }

    if (gotoRowIndex > 0) {
      gotoRowIndex--;
      activeRowId = hits[gotoRowIndex];
    }

    table.scrollToRow(activeRowId);
  }

  /**
   * NAVIGATION FUNCTIONS
   */

  const scrollToBottom = () => {
    table.scrollToRow(lastItem);
  };
  const scrollToTop = () => {
    table.scrollToRow(firstItem);
  };

  const copyTable = (node) => {
    table.copyToClipboard("all");
  };

  const exportCSV = () => {
    const ts = new Date().toISOString().replace(":", "_").replace(".", "_");
    const fileName = `${exportFileName}_${ts}.csv`;
    table.download("csv", fileName);
  };

  const exportTXT = () => {
    const ts = new Date().toISOString().replace(":", "_").replace(".", "_");
    const fileName = `${exportFileName}_${ts}.txt`;

    // decide to use formatter functions
    if (txtFormatter) {
      table.download(txtFormatter, fileName);
    } else {
      table.download("csv", fileName, {
        delimiter: "\t",
        columnHeaders: false,
      });
    }
  };

  const exportHTML = () => {
    const ts = new Date().toISOString().replace(":", "_").replace(".", "_");
    const fileName = `${exportFileName}_${ts}.html`;

    if (htmlFormatter) {
      table.download(htmlFormatter, fileName);
    } else {
      table.download("html", fileName);
    }
  };

  export const takeScreenShot = () => {
    const ts = new Date().toISOString().replace(":", "_").replace(".", "_");
    const fileName = `${exportFileName}_${ts}.png`;
    const container = document.querySelector(
      ".tabulator-svelte-table  .tabulator-tableHolder"
    );

    html2canvas(container).then(function (canvas) {
      const link = document.createElement("a");
      document.body.appendChild(link);
      link.download = fileName;
      link.href = canvas.toDataURL("image/png");
      link.target = "_blank";
      link.click();
      document.body.removeChild(link);
    });
  };

  // const exportPDF = () => {
  //   const ts = new Date().toISOString().replace(":", "_").replace(".", "_");
  //   const fileName = `${exportFileName}_${ts}.pdf`;

  //   table.download("pdf", fileName);
  // };
</script>

{#if loading}
  <div class="loader"><i class="fas fa-sync fa-spin fa-3x" /></div>
{:else}
  {#if showHeader}
    <div class="toolbar-actions">
      <!-- SEARCH FORM -->
      <div style="display: inline-flex">
        <form
          class="btn-group"
          style="display:flex"
          on:submit|preventDefault={search}
        >
          <input
            bind:value={searchText}
            type="search"
            name="search"
            placeholder="Search Text"
            style="border-radius: 4px 0 0 4px"
            class="form-control"
          />

          <!-- SEARCH HIT POSITION -->
          <button type="button" class="btn btn-default btn-large">
            {#if hits.length > 0}
              {gotoRowIndex ? gotoRowIndex + 1 : 0}/{hits.length}
            {:else}0/0{/if}
          </button>

          <!-- UP/DOWN BUTTONS FOR SEARCH NAVIGATION -->
          <button
            type="button"
            class="btn btn-default btn-large"
            on:click={goDown}
          >
            <span class="icon icon-down-dir" />
          </button>
          <button
            type="button"
            class="btn btn-default btn-large"
            on:click={goUp}
          >
            <span class="icon icon-up-dir" />
          </button>
        </form>
      </div>

      <!-- NAVIGATION -->
      <div class="btn-group">
        <button
          type="button"
          class="btn btn-default btn-large"
          on:click={scrollToBottom}
        >
          <span class="icon icon-down-bold" />
        </button>
        <button
          type="button"
          class="btn btn-default btn-large"
          on:click={scrollToTop}
        >
          <span class="icon icon-up-bold" />
        </button>
      </div>

      <!-- EXPORT -->
      <div class="btn-group">
        <button
          type="button"
          class="btn btn-default btn-large"
          on:click={copyTable}
        >
          <span class="icon icon-popup" />
        </button>

        <!-- SCREENSHOT -->
        <button
          type="button"
          class="btn btn-default btn-large"
          on:click={takeScreenShot}
        >
          <span class="icon icon-camera" />&nbsp;
        </button>

        <button
          type="button"
          class="btn btn-default btn-large"
          on:click={exportTXT}
        >
          <span class="icon icon-install" />&nbsp; TXT
        </button>

        <button
          type="button"
          class="btn btn-default btn-large"
          on:click={exportCSV}
        >
          <span class="icon icon-install" />&nbsp; CSV
        </button>

        <button
          type="button"
          class="btn btn-default btn-large"
          on:click={exportHTML}
        >
          <span class="icon icon-install" />&nbsp; HTML
        </button>
      </div>
    </div>
  {/if}

  <!-- TABULATOR -->
  <div
    id="tabulator-id"
    bind:this={el}
    class="tabulator-svelte-table"
    style="padding:0 5px"
  >
    <div class={cssClass} use:action={config} />
  </div>
{/if}

<style>
  .loader {
    width: 100%;
    padding: 5rem;
    text-align: center;
  }

  .header {
    padding: 5px;
    font-size: 0.8rem;
  }

  :global(.tabulator-col, .tabulator-header) {
    background-color: #8D8D8D !important;
    color: white;
  }
</style>
