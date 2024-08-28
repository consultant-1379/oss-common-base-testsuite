import * as Constants from '../../modules/Constants.js';
import { chromium } from 'k6/x/browser';
import { group, check, sleep } from 'k6'
import { describe, expect } from 'https://jslib.k6.io/k6chaijs/4.3.4.3/index.js';

export function testGUI() {

  const browser = chromium.launch({
    args: ['ignore-certificate-errors','no-sandbox'], // Extra commandline arguments to include when launching browser process
    debug: false,                        // Log all CDP messages to k6 logging subsystem
    devtools: true,                      // Open up developer tools in the browser by default
    env: {},                             // Environment variables to set before launching browser process
    executablePath: null,                // Override search for browser executable in favor of specified absolute path
    headless: true,                      // Show browser UI or not
    ignoreDefaultArgs: [],               // Ignore any of the default arguments included when launching browser process
    proxy: {},                           // Specify to set browser's proxy config
    slowMo: '1000ms',                    // Slow down input actions and navigations by specified time
    timeout: '60s',                      // Default timeout to use for various actions and navigations
  });

  const context = browser.newContext();
  const page = context.newPage();
  const SystemOverviewPage = context.newPage();

  let runtime

  group("Redirect to IAM", function() {
    runtime = page.goto(Constants.GAS_URL, { waitUntil: 'load' });

    page.waitForSelector('input[id="kc-login-input"]');

    check(page, {
      "Header contains Identity and Access Management": page.locator('div[id="eric-product-name"]').textContent() === 'Identity and Access Management',
    })

    page.screenshot({ path: '/tests/reports/GUI-screenshot/GUI-02-Login.png' });
  })

  group("login into EIC", function() {
    page.locator('input[id="username"]').type(Constants.GAS_USER);
    page.locator('input[id="password"]').type(Constants.GAS_USER_PWD);
    page.locator('input[id="kc-login-input"]').click();

    sleep(2);

    page.waitForSelector("e-systembar-title");

    sleep(2);

    group("Find Launcher", function() {
      check(page, {
        "Page contains Launcher": page.locator('eui-container[default-app="launcher"]').isVisible(),
      })
    })

    page.screenshot({ path: '/tests/reports/GUI-screenshot/GUI-02-AppLauncher.png' });

  })

  group("Open EIC Apps Launcher", function() {
    const element_products_list = page.evaluate(() => {
    let elem = document.querySelector('eui-container').shadowRoot
      .querySelector('e-launcher').shadowRoot
      .querySelector('e-launcher-component').shadowRoot
      .querySelector('e-product-view').shadowRoot
      //There are 3 objects with class .launcher-tile and we want the second element
      .querySelectorAll('.launcher-tile')[1]
      .querySelector('e-card-container').shadowRoot
      .querySelector('e-product-card').shadowRoot
      .querySelector('e-custom-layout-card').click()
    });

    // Wait for the next page to load
    page.waitForLoadState('networkidle');

    page.screenshot({ path: '/tests/reports/GUI-screenshot/GUI-02-EIC.png' });
  })

  group("Check System Monitor Accordion", function() {
    const System_accordion = page.evaluate(() => {
      let elem = document.querySelector('eui-container').shadowRoot
        .querySelector('e-launcher').shadowRoot
        .querySelector('e-launcher-component').shadowRoot
        .querySelector('e-app-view').shadowRoot
        //There are 3 objects with class .launcher-tile and we want the second element
        .querySelectorAll('.launcher-tile')[1]
        .querySelector('e-card-container[group-name="System"]').shadowRoot
        .querySelector('e-app-card[display-name="System Monitor"]').shadowRoot
        .querySelector('eui-icon').shadowRoot
        .querySelector('.icon')
        .click()
    });
    page.waitForLoadState('networkidle');
    page.screenshot({ path: '/tests/reports/GUI-screenshot/GUI-02-SystemMonitor.png' });

    const System_list = page.evaluate(() => {
      let elem = document.querySelector('eui-container').shadowRoot
        .querySelector('e-launcher').shadowRoot
        .querySelector('e-launcher-component').shadowRoot
        .querySelector('e-app-view').shadowRoot
        //There are 3 objects with class .launcher-tile and we want the second element
        .querySelectorAll('.launcher-tile')[1]
        .querySelector('e-card-container[group-name="System"]').shadowRoot
        .querySelector('e-app-card[display-name="System Monitor"]').shadowRoot
        .querySelector('.expandContainer')

        const obj = {
          routeLogViewer: elem.querySelector('e-list-item[display-name="Log Viewer"]').getAttribute("route"),
          routeAlarmViewer: elem.querySelector('e-list-item[display-name="Alarm Viewer"]').getAttribute("route"),
          routeSystemDashboards: elem.querySelector('e-list-item[display-name="System Dashboards"]').getAttribute("route"),
        }

        return obj
    });

    check(page, {
      "Accordion List contains Log Viewer Route": System_list.routeLogViewer === Constants.GAS_URL + "/log/viewer/#log-viewer",
      "Accordion List contains Alarm Viewer Route": System_list.routeAlarmViewer === Constants.GAS_URL + "/log/viewer/#alarm-viewer",
      "Accordion List contains System Dashboards Route": System_list.routeSystemDashboards === Constants.GAS_URL + "/log/viewer/#status-overview",
    })

  })

  describe("Check System Overview Page", (t) => {
    page.goto(Constants.GAS_URL + "/log/viewer/#status-overview" , { waitUntil: 'load' });
    sleep(3);
    //SystemOverviewPage.goto(system_overview_url, { waitUntil: 'load' });
    page.waitForSelector("eui-container");
    page.waitForLoadState('networkidle');

    page.screenshot({ path: '/tests/reports/GUI-screenshot/GUI-02-SystemOverview.png' });

    const system_overview_elem = page.evaluate(() => {
      let elem = document.querySelector('eui-container').shadowRoot
        .querySelector('eui-container-layout-holder').shadowRoot
        .querySelector('eui-app-content').shadowRoot
        .querySelector('e-status-overview').shadowRoot
        .querySelector('e-cnom-lib-placeholder').shadowRoot
        .querySelector('h3').textContent
        return elem
      });

    const system_overview_select = page.evaluate(() => {
      let elem = document.querySelector('eui-container').shadowRoot
        .querySelector('eui-container-layout-holder').shadowRoot
        .querySelector('eui-app-content').shadowRoot
        .querySelector('e-status-overview').shadowRoot
        .querySelector('e-cnom-lib-topology-browser').shadowRoot
        .querySelector('e-cnom-lib-node-tree').shadowRoot
        .querySelector('e-cnom-lib-explorer').shadowRoot
        .querySelector('e-explorer-tree-item').getAttribute("label")
        return elem
    });

    check(system_overview_elem, {
      "Page should contain main page": system_overview_elem === "Use the topology browser to select an item.",
    })
    check(system_overview_select, {
      "Page should contain select dashboards panel": system_overview_select === "Cluster Info",
    })
  })

  describe("Select Dashboard in System Overview Page", (t) => {
    const system_overview_select = page.evaluate(() => {
      let elem = document.querySelector('eui-container').shadowRoot
        .querySelector('eui-container-layout-holder').shadowRoot
        .querySelector('eui-app-content').shadowRoot
        .querySelector('e-status-overview').shadowRoot
        .querySelector('e-cnom-lib-topology-browser').shadowRoot
        .querySelector('e-cnom-lib-node-tree').shadowRoot
        .querySelector('e-cnom-lib-explorer').shadowRoot
        .querySelector('e-explorer-tree-item[label="Cluster Statistics"]').shadowRoot
        .querySelector('.tree__item__span.tree__item__span__leaf')
        .click()
        return elem
    });

    page.waitForLoadState('networkidle');
    sleep(1);

    page.screenshot({ path: '/tests/reports/GUI-screenshot/GUI-02-SelectDashboard.png' });

    const select_button = page.evaluate(() => {
      let elem = document.querySelector('eui-container').shadowRoot
        .querySelector('eui-container-layout-holder').shadowRoot
        .querySelector('eui-app-content').shadowRoot
        .querySelector('e-status-overview').shadowRoot
        .querySelector('e-cnom-lib-topology-browser').shadowRoot
        .querySelectorAll('eui-base-v0-button')[1]
        .click()
    });

    sleep(5);

    const dashboard_elem = page.evaluate(() => {
      let obj = [];
      let elem = document.querySelector('eui-container').shadowRoot
        .querySelector('eui-container-layout-holder').shadowRoot
        .querySelector('eui-app-content').shadowRoot
        .querySelector('e-status-overview').shadowRoot
        .querySelector('e-cnom-lib-dashboard').shadowRoot
        .querySelectorAll('e-cnom-lib-line-chart-widget');

        for(let i = 0; i < elem.length; i++) {
          obj.push(elem[i].getAttribute("tile-title"));
        };

        return obj;
    });

    page.screenshot({ path: '/tests/reports/GUI-screenshot/GUI-02-DashboardSelected.png' });

    check(dashboard_elem, {
      "Dashboard contains Total CPU chart": dashboard_elem[0] === "Total CPU",
      "Dashboard contains Total File Descriptors chart": dashboard_elem[1] === "Total File Descriptors open",
      "Dashboard contains Total RSS Memory chart": dashboard_elem[2] === "Total RSS memory in use",
      "Dashboard contains Total Virtual Memory chart": dashboard_elem[3] === "Total virtual memory in use",
    })
  })

  // 1
  describe("Find element in Log Viewer page", (t) => {
    page.goto(Constants.GAS_URL + "/log/viewer/#log-viewer" , { waitUntil: 'load' });
    page.waitForLoadState('networkidle');

    sleep(10);

    page.screenshot({ path: '/tests/reports/GUI-screenshot/GUI-02-LogViewerPage.png' });

    const element = page.evaluate(() => {
      let elem = document.querySelector('eui-container').shadowRoot
        .querySelector('eui-container-layout-holder').shadowRoot
        .querySelector('eui-app-bar').shadowRoot
        .querySelector('eui-base-v0-breadcrumb').shadowRoot
        .querySelector('span[aria-current="page"]').textContent
        return elem;
      });

      // Log planes
      const planes = page.evaluate(() => {
        let elem = document.querySelector('eui-container').shadowRoot
          .querySelector('eui-container-layout-holder').shadowRoot
           .querySelector('eui-app-content').shadowRoot
           .querySelector('e-log-viewer').shadowRoot
           .querySelectorAll('.filter-item')[0]
           .querySelector('.filter-label').textContent.trim()
          return elem;
        });

        // Severities
        const sever = page.evaluate(() => {
          let elem = document.querySelector('eui-container').shadowRoot
            .querySelector('eui-container-layout-holder').shadowRoot
            .querySelector('eui-app-content').shadowRoot
            .querySelector('e-log-viewer').shadowRoot
            .querySelectorAll('.filter-item')[1]
            .querySelector('.filter-label').textContent.trim()
            return elem;
          });

        // Query
        const query = page.evaluate(() => {
          let elem = document.querySelector('eui-container').shadowRoot
            .querySelector('eui-container-layout-holder').shadowRoot
            .querySelector('eui-app-content').shadowRoot
            .querySelector('e-log-viewer').shadowRoot
            .querySelectorAll('.filter-item')[2]
            .querySelector('.filter-label').textContent.trim()
            return elem;
          });

    check(page, {
     "Open Log Viewer page": element === "Log Viewer",
     "Page contains Log planes": planes === "Log planes",
     "Page contains Severities": sever === "Severities",
     "Page contains Query": query === "Query",
    })
  })

    // 2
    describe("Find element in Alarm Viewer page", (t) => {

      page.goto(Constants.GAS_URL + "/log/viewer/#alarm-viewer" , { waitUntil: 'load' });
      page.waitForLoadState('networkidle');

      sleep(10);

      page.screenshot({ path: '/tests/reports/GUI-screenshot/GUI-02-AlarmViewerPage.png' });

      const AlarmViewerPage = page.evaluate(() => {
        let elem = document.querySelector('eui-container').shadowRoot
          .querySelector('eui-container-layout-holder').shadowRoot
          .querySelector('eui-app-bar').shadowRoot
          .querySelector('eui-base-v0-breadcrumb').shadowRoot
          .querySelector('span[aria-current="page"]').textContent
          return elem;
        });

        // Severity
        const severity = page.evaluate(() => {
          let elem = document.querySelector('eui-container').shadowRoot
            .querySelector('eui-container-layout-holder').shadowRoot
            .querySelector('eui-app-content').shadowRoot
            .querySelector('e-alarm-viewer').shadowRoot
            .querySelector('e-cnom-lib-pill-selection').shadowRoot
            .querySelector('div[class="state"]').textContent.trim()
            return elem;
          });

        // Auto-refresh
        const autorefresh = page.evaluate(() => {
          let elem = document.querySelector('eui-container').shadowRoot
            .querySelector('eui-container-layout-holder').shadowRoot
            .querySelector('eui-app-bar').shadowRoot
            .querySelector('e-cnom-lib-stream-switch').shadowRoot
            .querySelector('span.label.left').textContent.trim()
            return elem;
          });

      check(page, {
       "Open Alarm View page": AlarmViewerPage === "Alarm Viewer",
       "Page contains Severity": severity === "Severity",
       "Page contains Auto-refresh": autorefresh === "Auto-refresh",
      })
    })


  group("close EIC", function() {
    runtime.finally(() => {
      page.close();
      browser.close();
    });
  })
}
