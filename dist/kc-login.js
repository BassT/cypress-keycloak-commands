"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
Cypress.Commands.add("kcLogin", function (_a) {
    var user = _a.user, idpHint = _a.idpHint, scope = _a.scope;
    Cypress.log({ name: "Login" });
    cy.fixture("users/" + user).then(function (userData) {
        var authBaseUrl = Cypress.env("auth_base_url");
        var realm = Cypress.env("auth_realm");
        var client_id = Cypress.env("auth_client_id");
        cy.request({
            url: authBaseUrl + "/realms/" + realm + "/protocol/openid-connect/auth",
            followRedirect: false,
            qs: {
                scope: scope
                    ? scope.includes("openid")
                        ? scope
                        : ["openid", scope].join(" ")
                    : "opendid",
                response_type: "code",
                approval_prompt: "auto",
                redirect_uri: Cypress.config("baseUrl"),
                kc_idp_hint: idpHint,
                client_id: client_id
            }
        })
            .then(function (response) {
            var html = document.createElement("html");
            html.innerHTML = response.body;
            var form = html.getElementsByTagName("form")[0];
            var url = form.action;
            return cy.request({
                method: "POST",
                url: url,
                followRedirect: false,
                form: true,
                body: {
                    username: userData.username,
                    password: userData.password
                }
            });
        })
            .then(function (response) {
            var code = utils_1.getAuthCodeFromLocation(response.headers["location"]);
            cy.request({
                method: "post",
                url: authBaseUrl + "/realms/" + realm + "/protocol/openid-connect/token",
                body: {
                    client_id: client_id,
                    redirect_uri: Cypress.config("baseUrl"),
                    code: code,
                    grant_type: "authorization_code"
                },
                form: true,
                followRedirect: false
            }).its("body");
        });
    });
});
