<script>
  import { Modal, Treeview, Breadcrumbs, Tabulator } from "../src/index.js";
  import MultiSelect from "../src/MultiSelect/index.svelte";
  import SvelteTabs from "./SvelteTabs/index.svelte";

  let activeCrumb = "main";
  const columns = [
    {
      title: "TestID",
      field: "testid",
    },
    {
      title: "Test Name",
      field: "test_name",
      headerFilter: "input",
    },
    {
      title: "Sample Type",
      field: "sample_type",
    },
  ];

  const data = [
    { testid: 1001, test_name: "Glucose", sample_type: "Plasma" },
    { testid: 1002, test_name: "Creatine", sample_type: "Serum" },
    { testid: 1003, test_name: "HDL", sample_type: "Serum" },
    { testid: 1004, test_name: "LDL", sample_type: "Serum" },
    { testid: 1001, test_name: "Glucose", sample_type: "Plasma" },
    { testid: 1002, test_name: "Creatine", sample_type: "Serum" },
    { testid: 1003, test_name: "HDL", sample_type: "Serum" },
    { testid: 1004, test_name: "LDL", sample_type: "Serum" },
    { testid: 1001, test_name: "Glucose", sample_type: "Plasma" },
    { testid: 1002, test_name: "Creatine", sample_type: "Serum" },
    { testid: 1003, test_name: "HDL", sample_type: "Serum" },
    { testid: 1004, test_name: "LDL", sample_type: "Serum" },
    { testid: 1001, test_name: "Glucose", sample_type: "Plasma" },
    { testid: 1002, test_name: "Creatine", sample_type: "Serum" },
    { testid: 1003, test_name: "HDL", sample_type: "Serum" },
    { testid: 1004, test_name: "LDL", sample_type: "Serum" },
    { testid: 1001, test_name: "Glucose", sample_type: "Plasma" },
    { testid: 1002, test_name: "Creatine", sample_type: "Serum" },
    { testid: 1003, test_name: "HDL", sample_type: "Serum" },
    { testid: 1004, test_name: "LDL", sample_type: "Serum" },
    { testid: 1001, test_name: "Glucose", sample_type: "Plasma" },
    { testid: 1002, test_name: "Creatine", sample_type: "Serum" },
    { testid: 1003, test_name: "HDL", sample_type: "Serum" },
    { testid: 1004, test_name: "LDL", sample_type: "Serum" },
  ];

  const crumbs = [
    { id: "main", label: "Main", url: "#/main" },
    { id: "queries", label: "Queries", url: "#/main/queries" },
    {
      id: "order-search",
      label: "Order Search",
      url: "#/main/queries/order-search",
    },
  ];

  const treeviewItems = [
    {
      title: "Main",
      url: "#/main",
      children: [
        { title: "Order Entry", url: "#/order-entry" },
        {
          title: "Queries",
          url: "#/main/queries",
          children: [
            { title: "Order Search", url: "#/main/queries/order-search" },
            { title: "Patient Search", url: "#/main/queries/patient-search" },
          ],
        },
      ],
    },
    {
      title: "Administration",
      url: "#/administration",
      children: [
        { title: "Test", url: "#/administration/tests" },
        { title: "Users", url: "#/administration/users" },
        { title: "QC", url: "#/administration/qc" },
        { title: "ICA", url: "#/administration/ica" },
      ],
    },
    { title: "Monitoring", url: "#/monitoring" },
  ];

  import pkg from "../package.json";

  let showModal = false;

  const items = [
    "Afghanistan",
    "Albania",
    "Algeria",
    "Andorra",
    "Angola",
    "Anguilla",
    "Antigua & Barbuda",
    "Argentina",
    "Armenia",
    "Aruba",
    "Australia",
    "Austria",
    "Azerbaijan",
    "Bahamas",
    "Bahrain",
    "Bangladesh",
    "Barbados",
    "Belarus",
    "Belgium",
    "Belize",
    "Benin",
    "Bermuda",
    "Bhutan",
    "Bolivia",
    "Bosnia &amp; Herzegovina",
    "Botswana",
    "Brazil",
    "British Virgin Islands",
    "Brunei",
    "Bulgaria",
    "Burkina Faso",
    "Burundi",
    "Cambodia",
    "Cameroon",
    "Cape Verde",
    "Cayman Islands",
    "Chad",
    "Chile",
    "China",
    "Colombia",
    "Congo",
    "Cook Islands",
    "Costa Rica",
    "Cote D Ivoire",
    "Croatia",
    "Cruise Ship",
    "Cuba",
    "Cyprus",
    "Czech Republic",
    "Denmark",
    "Djibouti",
    "Dominica",
    "Dominican Republic",
    "Ecuador",
    "Egypt",
    "El Salvador",
    "Equatorial Guinea",
    "Estonia",
    "Ethiopia",
    "Falkland Islands",
    "Faroe Islands",
    "Fiji",
    "Finland",
    "France",
    "French Polynesia",
    "French West Indies",
    "Gabon",
    "Gambia",
    "Georgia",
    "Germany",
    "Ghana",
    "Gibraltar",
    "Greece",
    "Greenland",
    "Grenada",
    "Guam",
    "Guatemala",
    "Guernsey",
    "Guinea",
    "Guinea Bissau",
    "Guyana",
    "Haiti",
    "Honduras",
    "Hong Kong",
    "Hungary",
    "Iceland",
    "India",
    "Indonesia",
    "Iran",
    "Iraq",
    "Ireland",
    "Isle of Man",
    "Israel",
    "Italy",
    "Jamaica",
    "Japan",
    "Jersey",
    "Jordan",
    "Kazakhstan",
    "Kenya",
    "Kuwait",
    "Kyrgyz Republic",
    "Laos",
    "Latvia",
    "Lebanon",
    "Lesotho",
    "Liberia",
    "Libya",
    "Liechtenstein",
    "Lithuania",
    "Luxembourg",
    "Macau",
    "Macedonia",
    "Madagascar",
    "Malawi",
    "Malaysia",
    "Maldives",
    "Mali",
    "Malta",
    "Mauritania",
    "Mauritius",
    "Mexico",
    "Moldova",
    "Monaco",
    "Mongolia",
    "Montenegro",
    "Montserrat",
    "Morocco",
    "Mozambique",
    "Namibia",
    "Nepal",
    "Netherlands",
    "Netherlands Antilles",
    "New Caledonia",
    "New Zealand",
    "Nicaragua",
    "Niger",
    "Nigeria",
    "Norway",
    "Oman",
    "Pakistan",
    "Palestine",
    "Panama",
    "Papua New Guinea",
    "Paraguay",
    "Peru",
    "Philippines",
    "Poland",
    "Portugal",
    "Puerto Rico",
    "Qatar",
    "Reunion",
    "Romania",
    "Russia",
    "Rwanda",
    "Saint Pierre &amp; Miquelon",
    "Samoa",
    "San Marino",
    "Satellite",
    "Saudi Arabia",
    "Senegal",
    "Serbia",
    "Seychelles",
    "Sierra Leone",
    "Singapore",
    "Slovakia",
    "Slovenia",
    "South Africa",
    "South Korea",
    "Spain",
    "Sri Lanka",
    "St Kitts &amp; Nevis",
    "St Lucia",
    "St Vincent",
    "St. Lucia",
    "Sudan",
    "Suriname",
    "Swaziland",
    "Sweden",
    "Switzerland",
    "Syria",
    "Taiwan",
    "Tajikistan",
    "Tanzania",
    "Thailand",
    "Timor L'Este",
    "Togo",
    "Tonga",
    "Trinidad &amp; Tobago",
    "Tunisia",
    "Turkey",
    "Turkmenistan",
    "Turks &amp; Caicos",
    "Uganda",
    "Ukraine",
    "United Arab Emirates",
    "United Kingdom",
    "Uruguay",
    "United States of America",
    "Uzbekistan",
    "Venezuela",
    "Vietnam",
    "Virgin Islands (US)",
    "Yemen",
    "Zambia",
    "Zimbabwe",
  ];
  let selectedCountries = [];

  const toggleModal = () => (showModal = !showModal);

  const setActiveCrumb = (e) => (activeCrumb = e.target.value);
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

  <!-- MULTISELECT -->
  <section class="p-2">
    <div class="rounded border border-gray-200 p-2 shadow">
      <h3>MultiSelect</h3>
      <div class="flex justify-between">
        <label for="country-list">
          Country List
          <MultiSelect
            {items}
            value={selectedCountries}
            onChange={(value) => (selectedCountries = value)}
          />
        </label>
        <div class=" rounded bg-gray-200 w-6/12 ">
          <h5 class="px-2">Items selected</h5>
          <div class="px-2 h-20 overflow-auto">
            {#each selectedCountries as country}
              <small>{country},</small>
            {/each}
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- SVELTE TABS -->
  <section class="p-2">
    <div class="rounded border border-gray-200 p-2 shadow">
      <h3>Svelte Tabs</h3>
      <SvelteTabs />
    </div>
  </section>

  <!-- TREEVIEW -->
  <section class="p-2">
    <div class="rounded border border-gray-200 p-2 shadow">
      <h3>Treeview</h3>
      <div class="w-3/12 bg-gray-200 p-2">
        <Treeview items={treeviewItems} />
      </div>
    </div>
  </section>

  <!-- BREADCRUMBS -->
  <section class="p-2">
    <div class="rounded border border-gray-200 p-2 shadow">
      <h3>Breadcrumbs</h3>
      <Breadcrumbs activeItem={activeCrumb} items={crumbs} />
    </div>
    <hr />
    <div class="flex space-x-4">
      <strong>Set active crumb:</strong>
      <label for="crumb-main">
        <input
          id="crumb-main"
          type="radio"
          name="activeCrumb"
          value="main"
          on:change={setActiveCrumb}
        /> Main</label
      >
      <label for="crumb-queries">
        <input
          id="crumb-queries"
          on:change={setActiveCrumb}
          type="radio"
          name="activeCrumb"
          value="queries"
        /> Queries</label
      >
      <label for="crumb-order-search">
        <input
          id="crumb-order-search"
          type="radio"
          name="activeCrumb"
          value="order-search"
          on:change={setActiveCrumb}
        /> Orders Search</label
      >
      <label for="crumb-clear" style="color:red">
        <input
          id="crumb-clear"
          type="radio"
          name="activeCrumb"
          value=""
          on:change={setActiveCrumb}
        /> Clear</label
      >
    </div>
  </section>

  <!-- BREADCRUMBS -->
  <section class="p-2">
    <div class="rounded border border-gray-200 p-2 shadow">
      <h3>Tabulator</h3>
      <Tabulator {columns} {data} height="300" showHeader={false} />
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

  h5 {
    font-size: 1.1rem;
    font-weight: bold;
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

  * {
    font-family: Arial, Helvetica, sans-serif;
  }
</style>
