import { getAuthCodeFromLocation } from "./utils";

Cypress.Commands.add(
  "kcLogin",
  ({
    user,
    idpHint,
    scope
  }: {
    user: string;
    idpHint?: string;
    scope?: string;
  }) => {
    Cypress.log({ name: "Login" });

    cy.fixture(`users/${user}`).then((userData: UserData) => {
      const authBaseUrl = Cypress.env("auth_base_url");
      const realm = Cypress.env("auth_realm");
      const client_id = Cypress.env("auth_client_id");

      cy.request({
        url: `${authBaseUrl}/realms/${realm}/protocol/openid-connect/auth`,
        followRedirect: Boolean(idpHint),
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
          client_id
        }
      })
        .then(response => {
          const html = document.createElement("html");
          html.innerHTML = response.body;

          const form = html.getElementsByTagName("form")[0];
          const url = form.action;

          return cy.request({
            method: "POST",
            url,
            followRedirect: false,
            form: true,
            body: {
              username: userData.username,
              password: userData.password
            }
          });
        })
        .then(response => {
          const code = getAuthCodeFromLocation(response.headers["location"]);

          cy.request({
            method: "post",
            url: `${authBaseUrl}/realms/${realm}/protocol/openid-connect/token`,
            body: {
              client_id,
              redirect_uri: Cypress.config("baseUrl"),
              code,
              grant_type: "authorization_code"
            },
            form: true,
            followRedirect: false
          }).its("body");
        });
    });
  }
);
