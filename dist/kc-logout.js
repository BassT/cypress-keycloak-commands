"use strict";
Cypress.Commands.add("kcLogout", function () {
    Cypress.log({ name: "Logout" });
    var authBaseUrl = Cypress.env("auth_base_url");
    var realm = Cypress.env("auth_realm");
    return cy.request({
        url: authBaseUrl + "/realms/" + realm + "/protocol/openid-connect/logout"
    });
});
