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
  //const SystemOverviewPage = context.newPage();

  let runtime

  describe("Redirect to IAM", (t) => {
    runtime = page.goto(Constants.GAS_URL, { waitUntil: 'load' });

    page.waitForSelector('input[id="kc-login-input"]');

    check(page, {
      "Header should contain Identity and Access Management": page.locator('div[id="eric-product-name"]').textContent() === 'Identity and Access Management',
    })

    page.screenshot({ path: '/tests/reports/GUI-screenshot/GUI-01-Login.png' });
  })

  describe("login into EIC", (t) => {
    page.locator('input[id="username"]').type(Constants.GAS_USER);
    page.locator('input[id="password"]').type(Constants.GAS_USER_PWD);
    page.locator('input[id="kc-login-input"]').click();

    sleep(2);

    page.waitForSelector("e-systembar-title");

    sleep(2);

    group("Find Launcher", function() {
      check(page, {
        "Page should contain Launcher": page.locator('eui-container[default-app="launcher"]').isVisible(),
      })
    })

    page.screenshot({ path: '/tests/reports/GUI-screenshot/GUI-01-AppLauncher.png' });
  })

  describe("Find System Bar Container", (t) => {
    const element_title_bar = page.evaluate(() => {
      let elem = document.querySelector('e-systembar-title').shadowRoot
        .querySelector('.product-action').textContent
        return elem;
      });
      console.log("TITLE BAR ELEMENT");
      console.log(element_title_bar);

    check(page, {
      "Page should contain System Bar Title": page.locator('e-systembar-title[slot="system-left"]').isVisible(),
      "Page should contain System Bar Title with text": element_title_bar === "Ericsson Portal",
      "Page should contain System Bar Actions": page.locator('eui-system-bar-actions[slot="action"]').isVisible(),
    })
  })

  //Using Describe instead that Group
  //Descube catches any internal exceptions and marks them as assertions failed
  //Instead Group incountering internal exceptions stops tests but doesn't make the assertion failed
  describe("Find App Bar", (t) => {
    const element_app_bar = page.evaluate(() => {
      let elem = document.querySelector('eui-container').shadowRoot
        .querySelector('eui-app-bar').shadowRoot
        .querySelector('#menu-toggle').innerHTML
        return elem;
      });

    const element_title_holder = page.evaluate(() => {
    let elem = document.querySelector('eui-container').shadowRoot
      .querySelector('eui-app-bar').shadowRoot
      .querySelector('eui-app-bar-breadcrumb').shadowRoot
      .querySelector('#breadcrumb').textContent
      return elem;
    });

    console.log("MENU TOGGLE");
    console.log(element_app_bar)
    console.log("TITLE HOLDER");
    console.log(element_title_holder)
    check(element_app_bar, {
      "Page should contain Menu Toggle": element_app_bar != null,
    })
    check(element_title_holder, {
      "Page should contain Title Holder": element_title_holder === "Products and Applications",
    })
  })

  describe("Find Search Item", (t) => {
    const element_search = page.evaluate(() => {
      let elem = document.querySelector('eui-container').shadowRoot
      .querySelector('e-launcher').shadowRoot
      .querySelector('e-launcher-component').shadowRoot
      .querySelector('e-product-view').shadowRoot
      //There are 3 objects with class .launcher-tile and we want the first element
      .querySelectorAll('.launcher-tile')[0]
      .querySelector('e-action-bar').shadowRoot
      .querySelector('e-search-component').shadowRoot
      .querySelector('e-groupable-combo-box').shadowRoot
      .querySelector('.dropdown').innerHTML
        return elem;
      });
    console.log("SEARCH ITEM");
    console.log(element_search)
    check(element_search, {
      "Page should contain Find Search Item": element_search != null,
    })
  })

  describe("Find Products", (t) => {
    const element_prod_list = page.evaluate(() => {
      let elem = document.querySelector('eui-container').shadowRoot
        .querySelector('e-launcher').shadowRoot
        .querySelector('e-launcher-component').shadowRoot
        .querySelector('e-product-view').shadowRoot
        //There are 3 objects with class .launcher-tile and we want the second element
        .querySelectorAll('.launcher-tile')[1]
        .querySelector('e-card-container').shadowRoot
        .querySelector('e-product-card').shadowRoot
        .querySelector('e-custom-layout-card').getAttribute("card-title")
        return elem;
      });
      console.log("APPS LIST ELEMENT");
      console.log(element_prod_list);

    check(element_prod_list, {
      "Page should contain Products": element_prod_list === "Ericsson Intelligent Controller",
    })
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

    page.screenshot({ path: '/tests/reports/GUI-screenshot/GUI-01-EIC.png' });
  })

  group("Check User Management Accordion", function() {
    const user_accordion = page.evaluate(() => {
      let elem = document.querySelector('eui-container').shadowRoot
        .querySelector('e-launcher').shadowRoot
        .querySelector('e-launcher-component').shadowRoot
        .querySelector('e-app-view').shadowRoot
        //There are 3 objects with class .launcher-tile and we want the second element
        .querySelectorAll('.launcher-tile')[1]
        .querySelector('e-card-container[group-name="Security"]').shadowRoot
        .querySelector('e-app-card[display-name="User Administration"]').shadowRoot
        .querySelector('eui-icon').shadowRoot
        .querySelector('.icon')
        .click()
    });

    page.waitForLoadState('networkidle');

    page.screenshot({ path: '/tests/reports/GUI-screenshot/GUI-01-UserAdmin.png' });

    const user_accordion_list = page.evaluate(() => {
      let elem = document.querySelector('eui-container').shadowRoot
        .querySelector('e-launcher').shadowRoot
        .querySelector('e-launcher-component').shadowRoot
        .querySelector('e-app-view').shadowRoot
        //There are 3 objects with class .launcher-tile and we want the second element
        .querySelectorAll('.launcher-tile')[1]
        .querySelector('e-card-container[group-name="Security"]').shadowRoot
        .querySelector('e-app-card[display-name="User Administration"]').shadowRoot
        .querySelector('.expandContainer')

        const obj = {
          routeUser: elem.querySelector('e-list-item[display-name="User management"]').getAttribute("route"),
          routeSec: elem.querySelector('e-list-item[display-name="Security defenses"]').getAttribute("route"),
          routeAuth: elem.querySelector('e-list-item[display-name="Authentication"]').getAttribute("route"),
          routeClient: elem.querySelector('e-list-item[display-name="Client management"]').getAttribute("route")
        }

        return obj
    });

    check(user_accordion_list, {
      "Accordion List should contain User Route": user_accordion_list.routeUser === "#user-mgmt/user-admin",
      "Accordion List should contain Security Route": user_accordion_list.routeSec === "#user-mgmt/security-defenses",
      "Accordion List should contain Auth Route": user_accordion_list.routeAuth === "#user-mgmt/password-policy",
      "Accordion List should contain Client Route": user_accordion_list.routeClient === "#user-mgmt/client-mgmt",
    })
  })

  describe("Check User Management Page", (t) => {
    page.goto(Constants.GAS_URL + "#user-mgmt/user-admin" , { waitUntil: 'load' });
    sleep(10);
    const users_elem = page.evaluate(() => {
      let elem = document.querySelector('eui-container').shadowRoot
        .querySelector('e-user-mgmt').shadowRoot
        .querySelector('e-eo-users-table')
      const isVisible = Boolean(elem.parentNode);
      return isVisible;
    });

    check(users_elem, {
      "Users Table Content is visible": users_elem === true,
    })

    page.screenshot({ path: '/tests/reports/GUI-screenshot/GUI-01-UserMgmt.png' });
  })

  describe("Check Security Defenses Page", (t) => {
    page.goto(Constants.GAS_URL + "#user-mgmt/security-defenses" , { waitUntil: 'load' });
    sleep(3);
    const bfp_elem = page.evaluate(() => {
        let elem = document.querySelector('eui-container').shadowRoot
          .querySelector('e-security-defenses').shadowRoot
          .querySelector('e-brute-force')
        const isVisible = Boolean(elem.parentNode);
        return isVisible;
    });

    check(bfp_elem, {
      "Brute Force Protection Content is visible": bfp_elem === true,
    })

    page.screenshot({ path: '/tests/reports/GUI-screenshot/GUI-01-BFP.png' });

      const bfp_list = page.evaluate(() => {
      let elem = document.querySelector('eui-container').shadowRoot
        .querySelector('e-security-defenses').shadowRoot
        .querySelector('e-brute-force').shadowRoot

        const obj = {
          status: elem.querySelector('eui-switch[class="status__field"]').parentNode,
          permanentLockout: elem.querySelector('eui-switch[class="permanentLockout__field"]').parentNode,
          maxLoginFailure: elem.querySelector('eui-spinner[class="maxLoginFailures__field"]').parentNode,
          lockoutIncrement: elem.querySelector('eui-spinner[class="lockoutDurationIncrememt__field"]').parentNode,
          lockoutDuration: elem.querySelector('eui-spinner[class="maximumLockoutDuration__field"]').parentNode,
          loginFailureCountReset: elem.querySelector('eui-spinner[class="loginFailureCountReset__field"]').parentNode,
          quickLoginCheck: elem.querySelector('eui-spinner[class="quickLoginCheck__field"]').parentNode,
          quickLoginLockoutDuration: elem.querySelector('eui-spinner[class="quickLoginMinimumLockoutDuration__field"]').parentNode,
        }

        console.log(obj.status.innerHTML);
        return obj
    });
    check(bfp_list, {
      "Page should contain BFP Status": Boolean(bfp_list.status) === true,
      "Page should contain BFP Permanent Lockout": Boolean(bfp_list.permanentLockout) === true,
      "Page should contain BFP MaxLoginFailure": Boolean(bfp_list.maxLoginFailure) === true,
      "Page should contain BFP Lockout Increment": Boolean(bfp_list.lockoutIncrement) === true,
      "Page should contain BFP Lockout Duration": Boolean(bfp_list.lockoutDuration) === true,
      "Page should contain BFP Login Failure Count Reset": Boolean(bfp_list.loginFailureCountReset) === true,
      "Page should contain BFP Quick Login Check": Boolean(bfp_list.loginFailureCountReset) === true,
      "Page should contain BFP Quick Login Lockout Duration": Boolean(bfp_list.loginFailureCountReset) === true,
    })
  })

  describe("Check Auth Management Page", (t) => {
    page.goto(Constants.GAS_URL + "#user-mgmt/password-policy" , { waitUntil: 'load' });
    sleep(3);
    const pp_elem = page.evaluate(() => {
      let elem = document.querySelector('eui-container').shadowRoot
        .querySelector('e-password-policy').shadowRoot
        .querySelector('e-password-policy-form')
      const isVisible = Boolean(elem.parentNode);
      return isVisible;
    });

    check(pp_elem, {
      "Password Policy Content is visible": pp_elem === true,
    })

    page.screenshot({ path: '/tests/reports/GUI-screenshot/GUI-01-PP.png' });

      const pp_list = page.evaluate(() => {
      let elem = document.querySelector('eui-container').shadowRoot
        .querySelector('e-password-policy').shadowRoot
        .querySelector('e-password-policy-form').shadowRoot

        const obj = {
          notRecentlyUsed: elem.querySelector('eui-text-field[class="Not recently used"]').parentNode,
          minLength: elem.querySelector('eui-text-field[class="Minimum length"]').parentNode,
          notUserName: elem.querySelectorAll('eui-icon[name="check"]')[0].parentNode,
          specialChar: elem.querySelector('eui-text-field[class="Special characters"]').parentNode,
          uppercase: elem.querySelector('eui-text-field[class="Uppercase characters"]').parentNode,
          lowercase: elem.querySelector('eui-text-field[class="Lowercase characters"]').parentNode,
          digits: elem.querySelector('eui-text-field[class="Digits"]').parentNode,
          notEmail: elem.querySelectorAll('eui-icon[name="check"]')[1].parentNode,
        }

        console.log(obj.notRecentlyUsed.innerHTML);
        return obj
    });
    check(pp_list, {
      "Page should contain PP Not Recently Used": Boolean(pp_list.notRecentlyUsed) === true,
      "Page should contain PP Min Length": Boolean(pp_list.minLength) === true,
      "Page should contain PP Not User Name": Boolean(pp_list.notUserName) === true,
      "Page should contain PP Special Char": Boolean(pp_list.specialChar) === true,
      "Page should contain PP Uppercase": Boolean(pp_list.uppercase) === true,
      "Page should contain PP Lowercase": Boolean(pp_list.lowercase) === true,
      "Page should contain PP Digits": Boolean(pp_list.digits) === true,
      "Page should contain PP Not E-Mail": Boolean(pp_list.notEmail) === true,
    })
  })

  describe("Check Client Management Page", (t) => {
    page.goto(Constants.GAS_URL + "#user-mgmt/client-mgmt" , { waitUntil: 'load' });
    sleep(3);
    const clients_elem = page.evaluate(() => {
      let elem = document.querySelector('eui-container').shadowRoot
        .querySelector('e-client-mgmt').shadowRoot
        .querySelector('e-clients-table')
      const isVisible = Boolean(elem.parentNode);
      return isVisible;
    });

    check(clients_elem, {
      "Clients Table Content is visible": clients_elem === true,
    })

    page.screenshot({ path: '/tests/reports/GUI-screenshot/GUI-01-ClientMgmt.png' });
  })

  group("close EIC", function() {
    runtime.finally(() => {
      page.close();
      browser.close();
    });
  })
}
