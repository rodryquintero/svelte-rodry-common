<script>
  import { Tabs, Tab, TabList, TabPanel } from "../../src/SvelteTabs/index.js";
</script>

<Tabs>
  <TabList>
    <Tab>One</Tab>
    <Tab>Two</Tab>
    <Tab>Three</Tab>
  </TabList>

  <TabPanel>
    <div class="p-2">
      <h2>Panel One</h2>
    </div>
  </TabPanel>

  <TabPanel>
    <div class="p-2">
      <h2>Panel Two</h2>
    </div>
  </TabPanel>

  <TabPanel>
    <div class="p-2">
      <h2>Panel Three</h2>
    </div>
  </TabPanel>
</Tabs>

<style>
  /* your styles go here */
</style>
