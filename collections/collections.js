// For now, we don't use strict when we declare our global variables.
// The workaround for now is more work than necessary, and Meteor is
// currently very reliant on global already anyway.
// TODO: Set Tournaments into the DeclashApp namespace.

/* global Tournaments:true */

Tournaments = new Mongo.Collection("tournaments");
