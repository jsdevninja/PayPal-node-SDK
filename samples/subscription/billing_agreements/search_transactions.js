/* Copyright 2014 PayPal */
"use strict";

var paypal = require('../../../');
require('../../configure');

var billingAgreementId = "I-08413VDRU6DE";

var start_date = "2014-07-01";
var end_date = "2014-07-20";

paypal.billing_agreement.search_transactions(billingAgreementId, start_date, end_date, function (error, results) {
    if (error) {
        console.log(error);
        throw error;
    } else {
        console.log("Billing Agreement Transactions Search Response");
        console.log(results);
    }
});

