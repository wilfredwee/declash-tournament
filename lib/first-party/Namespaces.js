// For now, we don't use strict when we declare our global variables.
// The workaround for now is more work than necessary, and Meteor is
// currently very reliant on global already anyway.

/* global DeclashApp:true */

// Namespaces must live in a lib folder because it is guaranteed to load first.
DeclashApp = {};

DeclashApp.helpers = {};

DeclashApp.client = {};
DeclashApp.client.constants = {};
DeclashApp.client.templates = {};
DeclashApp.client.templates.pages = {};
DeclashApp.client.manualTestScripts = {};
