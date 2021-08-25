"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
Cypress.Commands.add("kcFakeLogin", function (user, visitUrl) {
    if (visitUrl === void 0) { visitUrl = ""; }
    Cypress.log({ name: "Fake Login" });
    return cy.fixture("users/" + user).then(function (userData) {
        if (!userData.fakeLogin) {
            throw new Error("To use kcFakeLogin command you should define fakeLogin data in fixture");
        }
        var authBaseUrl = Cypress.env("auth_base_url");
        var realm = Cypress.env("auth_realm");
        var _a = userData.fakeLogin, account = _a.account, access_token = _a.access_token, refresh_token = _a.refresh_token, id_token = _a.id_token;
        var state = utils_1.createUUID();
        var nonce = utils_1.decodeToken(access_token).nonce;
        var token = {
            access_token: access_token,
            expires_in: 300,
            refresh_expires_in: 1800,
            refresh_token: refresh_token,
            token_type: "bearer",
            id_token: id_token,
            "not-before-policy": 0,
            session_state: utils_1.createUUID(),
            scope: "openid"
        };
        var localStorageObj = {
            state: state,
            nonce: nonce,
            expires: Date() + 3600
        };
        var localStorageKey = "kc-callback-" + state;
        window.localStorage.setItem(localStorageKey, JSON.stringify(localStorageObj));
        cy.server();
        cy.route("post", authBaseUrl + "/realms/" + realm + "/protocol/openid-connect/token", token);
        cy.route(authBaseUrl + "/realms/" + realm + "/account", account);
        // in case visitUrl is an url with a hash, a second hash should not be added to the url
        var joiningCharacter = visitUrl.indexOf("#") === -1 ? "#" : "&";
        var url = Cypress.config().baseUrl + "/" + visitUrl + joiningCharacter + "state=" + state + "&session_state=" + utils_1.createUUID() + "&code=" + utils_1.createUUID();
        cy.visit(url);
    });
});
