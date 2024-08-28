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
  const ldapPage = context.newPage();

  let runtime

  group("Redirect to IAM", function() {
    runtime = page.goto(Constants.GAS_URL, { waitUntil: 'load' });

    page.waitForSelector('input[id="kc-login-input"]');

    check(page, {
      "Header contains Identity and Access Management": page.locator('div[id="eric-product-name"]').textContent() === 'Identity and Access Management',
    })

    page.screenshot({ path: '/tests/reports/GUI-screenshot/GUI-03-Login.png' });
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

    page.screenshot({ path: '/tests/reports/GUI-screenshot/GUI-03-AppLauncher.png' });

  })

  describe("Check External LDAP Configuration Accordion", (t) => {
    page.goto(Constants.GAS_URL + "#launcher?productName=eic:product" , { waitUntil: 'load' });

    page.waitForLoadState('networkidle');
    sleep(3)
    page.screenshot({ path: '/tests/reports/GUI-screenshot/GUI-03-EIC.png' });

    const LDAP_url = page.evaluate(() => {
      let elem = document.querySelector('eui-container').shadowRoot
        .querySelector('e-launcher').shadowRoot
        .querySelector('e-launcher-component').shadowRoot
        .querySelector('e-app-view').shadowRoot
        //There are 3 objects with class .launcher-tile and we want the second element
        .querySelectorAll('.launcher-tile')[1]
        .querySelector('e-card-container[group-name="Security"]').shadowRoot
        .querySelector('e-app-card[display-name="External LDAP Configuration"]').shadowRoot
        .querySelector('e-base-link').getAttribute("url")
        return elem
      });

    console.log("LDAP url: " + LDAP_url);

    check(page, {
      "Check LDAP URL": LDAP_url === Constants.IAM_URL + "/auth/admin",
      })

  })

  describe("External LDAP Configuration page", (t) => {
    page.goto(Constants.IAM_URL + "/auth/admin/master/console/#/realms/master/user-federation", { waitUntil: 'load' });

    sleep(10);

    //page.waitForSelector("#view");
    page.waitForLoadState('networkidle');

    page.screenshot({ path: '/tests/reports/GUI-screenshot/GUI-03-LDAP.png' });

    const UserFederation = page.evaluate(() => {
      let elem = document.querySelector('#view h1 span.ng-binding').textContent.trim()
        return elem;
      });

    const FormControl = page.evaluate(() => {
      let elem = document.querySelector('#view div.blank-slate-pf-main-action select option.ng-binding')
      //.querySelector('option.ng-binding')
      .textContent.trim()
        return elem;
      });

    check(page, {
      "Open User Federation page": UserFederation === "User Federation",
      "Form Control check (Add provider...)": FormControl  === "Add provider...",
      })

  })

  describe("Connected Systems page", (t) => {

    page.goto(Constants.GAS_URL + "/subsystemsmgmt-ui/#connected-systems" , { waitUntil: 'load' });

    page.waitForLoadState('networkidle');
    sleep(5);

    page.screenshot({ path: '/tests/reports/GUI-screenshot/GUI-03-ConnectedSystems.png' });

    const ConnectedSystemPage = page.evaluate(() => {
      let elem = document.querySelector('eui-container').shadowRoot
        .querySelector('eui-container-layout-holder').shadowRoot
        .querySelector('eui-app-bar').shadowRoot
        .querySelector('eui-base-v0-breadcrumb').shadowRoot
        .querySelector('span[aria-current="page"]').textContent
        return elem;
      });

    // Systems
    const systems = page.evaluate(() => {
      let elem = document.querySelector('eui-container').shadowRoot
        .querySelector('eui-container-layout-holder').shadowRoot
        .querySelector('eui-app-content').shadowRoot
        .querySelector('e-connected-systems').shadowRoot
        .querySelector('eui-layout-v0-multi-panel-tile').shadowRoot
        .querySelector('.eui__tile__header__centre__title').textContent.trim()
        return elem;
      });

    check(page, {
      "Open Alarm View page": ConnectedSystemPage === "Connected Systems",
      "Page contains Systems": systems === "Systems",
      })

  })

  group("close EIC", function() {
    runtime.finally(() => {
      page.close();
      browser.close();
    });
  })
}
