/* Copyright 2013 PayPal */
"use strict";

var chai = require('chai'),
    expect = chai.expect,
    should = chai.should();

var paypal_sdk = require('../');
require('./configure');

describe('SDK', function () {
    describe('Subscription', function () {
        var billing_plan_attributes = {
            "description": "Create Plan for Regular",
            "merchant_preferences": {
                "auto_bill_amount": "yes",
                "cancel_url": "http://www.cancel.com",
                "initial_fail_amount_action": "continue",
                "max_fail_attempts": "1",
                "return_url": "http://www.success.com",
                "setup_fee": {
                    "currency": "USD",
                    "value": "25"
                }
            },
            "name": "Testing1-Regular1",
            "payment_definitions": [
                {
                    "amount": {
                        "currency": "USD",
                        "value": "100"
                    },
                    "charge_models": [
                        {
                            "amount": {
                                "currency": "USD",
                                "value": "10.60"
                            },
                            "type": "SHIPPING"
                        },
                        {
                            "amount": {
                                "currency": "USD",
                                "value": "20"
                            },
                            "type": "TAX"
                        }
                    ],
                    "cycles": "0",
                    "frequency": "MONTH",
                    "frequency_interval": "1",
                    "name": "Regular 1",
                    "type": "REGULAR"
                },
                {
                    "amount": {
                        "currency": "USD",
                        "value": "20"
                    },
                    "charge_models": [
                        {
                            "amount": {
                                "currency": "USD",
                                "value": "10.60"
                            },
                            "type": "SHIPPING"
                        },
                        {
                            "amount": {
                                "currency": "USD",
                                "value": "20"
                            },
                            "type": "TAX"
                        }
                    ],
                    "cycles": "4",
                    "frequency": "MONTH",
                    "frequency_interval": "1",
                    "name": "Trial 1",
                    "type": "TRIAL"
                }
            ],
            "type": "INFINITE"
        };

        var billing_plan_update_attributes = [
            {
                "op": "replace",
                "path": "/",
                "value": {
                    "state": "ACTIVE"
                }
            }
        ];

        var update_merchant_preferences = [
            {
                "op": "replace",
                "path": "/merchant-preferences",
                "value": {
                    "cancel_url": "http://www.paypal123.com",
                    "setup_fee": {
                        "value": "22",
                        "currency": "USD"
                    }
                }
            }
        ];

        var billing_agreement_attributes = {
            "name": "Fast Speed Agreement",
            "description": "Agreement for Fast Speed Plan",
            "start_date": "2015-02-19T00:37:04Z",
            "plan": {
                "id": "P-0NJ10521L3680291SOAQIVTQ"
            },
            "payer": {
                "payment_method": "paypal"
            },
            "shipping_address": {
                "line1": "StayBr111idge Suites",
                "line2": "Cro12ok Street",
                "city": "San Jose",
                "state": "CA",
                "postal_code": "95112",
                "country_code": "US"
            }
        };

        var billing_agreement_attributes_cc = {
            "name": "Fast Speed Agreement",
            "description": "Agreement for the Fast Speed Plan",
            "start_date": "2015-02-19T00:37:04Z",
            "plan": {
                "id": "P-9JJ08935W261554413DRYT4I"
            },
            "payer": {
                "payment_method": "credit_card",
                "payer_info": {
                    "email": "anadas@paypal.com"
                },
                "funding_instruments": [{
                    "credit_card": {
                        "type": "visa",
                        "number": "4417119669820331",
                        "expire_month": "12",
                        "expire_year": "2017",
                        "cvv2": "128",
                        "start_month": "11",
                        "start_year": "2010"
                    }
                }]
            },
            "shipping_address": {
                "line1": "StayBr111idge Suites",
                "line2": "Cro12ok Street",
                "city": "San Jose",
                "state": "CA",
                "postal_code": "95112",
                "country_code": "US"
            }
        };

        var billing_agreement_update_attributes = [
            {
                "op": "replace",
                "path": "/",
                "value": {
                    "description": "New Description",
                    "name": "New Name",
                    "shipping_address": {
                        "line1": "StayBridge Suites",
                        "line2": "Crook Street",
                        "city": "San Jose",
                        "state": "CA",
                        "postal_code": "95112",
                        "country_code": "US"
                    }
                }
            }
        ];
        var billing_agreement_id = 'I-W0CR3PB7KTBB';

        if (process.env.NOCK_OFF !== 'true') {
            require('./mocks/subscription');
        }

        it('billing plan create and get success', function (done) {
            paypal_sdk.billing_plan.create(billing_plan_attributes, function (error, billingPlan) {
                expect(error).equal(null);
                expect(billingPlan.id).to.contain('P-');

                paypal_sdk.billing_plan.get(billingPlan.id, function (error, billingPlan) {
                    expect(error).equal(null);
                    expect(billingPlan.state).to.contain('CREATED');
                    done();
                });
            });
        });

        it('get nonexistent billing plan failure', function (done) {
            paypal_sdk.billing_plan.get('ABRACADABRA', function (error, billingPlan) {
                expect(error.response.name).to.equal('TEMPLATE_ID_INVALID');
                done();
            });
        });

        it('list success', function (done) {
            paypal_sdk.billing_plan.list(function (error, billingPlan_history) {
                expect(error).equal(null);
                done();
            });
        });

        it('activate billing plan success', function (done) {
            paypal_sdk.billing_plan.create(billing_plan_attributes, function (error, billingPlan) {
                expect(error).equal(null);
                expect(billingPlan.state).equal("CREATED");

                paypal_sdk.billing_plan.update(billingPlan.id, billing_plan_update_attributes, function (error, response) {
                    expect(error).equal(null);
                    expect(response.httpStatusCode).equal(200);

                    paypal_sdk.billing_plan.get(billingPlan.id, function (error, billingPlan) {
                        expect(error).equal(null);
                        expect(billingPlan.state).to.contain('ACTIVE');
                        done();
                    });
                });
            });
        });

        it('update merchant preferences for billing plan success', function (done) {
            paypal_sdk.billing_plan.create(billing_plan_attributes, function (error, billingPlan) {
                expect(error).equal(null);
                expect(billingPlan.state).equal("CREATED");

                paypal_sdk.billing_plan.update(billingPlan.id, update_merchant_preferences, function (error, response) {
                    expect(error).equal(null);
                    expect(response.httpStatusCode).equal(200);

                    paypal_sdk.billing_plan.get(billingPlan.id, function (error, billingPlan) {
                        expect(error).equal(null);
                        expect(billingPlan.merchant_preferences.setup_fee.value).to.equal('22');
                        expect(billingPlan.merchant_preferences.cancel_url).to.equal('http://www.paypal123.com');
                        done();
                    });
                });
            });
        });

        it('billing agreement create from billing plan success', function (done) {
            paypal_sdk.billing_plan.create(billing_plan_attributes, function (error, billingPlan) {
                expect(error).equal(null);
                expect(billingPlan.state).equal("CREATED");

                paypal_sdk.billing_plan.update(billingPlan.id, billing_plan_update_attributes, function (error, response) {
                    expect(error).equal(null);
                    expect(response.httpStatusCode).equal(200);

                    billing_agreement_attributes.plan.id = billingPlan.id;
                    paypal_sdk.billing_agreement.create(billing_agreement_attributes, function (error, billingAgreement) {
                        expect(error).equal(null);
                        expect(billingAgreement.name).to.equal(billing_agreement_attributes.name);
                        expect(billingAgreement.plan.id).to.equal(billing_agreement_attributes.plan.id);
                        done();
                    });
                });
            });
        });

        it('billing agreement get success', function (done) {
            paypal_sdk.billing_agreement.get(billing_agreement_id, function (error, billingAgreement) {
                expect(error).equal(null);
                expect(billingAgreement.id).equal(billing_agreement_id);
                done();
            });
        });

        it('billing agreement execute after create from billing plan success', function (done) {
            paypal_sdk.billing_plan.create(billing_plan_attributes, function (error, billingPlan) {
                expect(error).equal(null);

                paypal_sdk.billing_plan.update(billingPlan.id, billing_plan_update_attributes, function (error, response) {
                    expect(error).equal(null);

                    billing_agreement_attributes.plan.id = billingPlan.id;
                    paypal_sdk.billing_agreement.create(billing_agreement_attributes, function (error, billingAgreement) {
                        expect(error).equal(null);
                        expect(billingAgreement).to.have.property('links');

                        for (var index = 0; index < billingAgreement.links.length; index++) {
                            if (billingAgreement.links[index].rel === 'execute') {
                                expect(billingAgreement.links[index].href).to.contain('agreement-execute');
                            }
                        }
                        done();
                    });
                });
            });
        });

        it('search transactions for billing agreement not empty', function (done) {
            var start_date = "2014-07-01";
            var end_date = "2014-07-20";

            paypal_sdk.billing_agreement.search_transactions(billing_agreement_id, start_date, end_date, function (error, response) {
                expect(response).to.have.property('agreement_transaction_list');
                expect(response.agreement_transaction_list).to.be.an('Array');
                expect(response.agreement_transaction_list).to.not.be.empty;
                done();
            });
        });

        it('billing agreement suspend success', function (done) {
            var suspend_note = {
                "note": "Suspending the agreement"
            };

            paypal_sdk.billing_agreement.suspend(billing_agreement_id, suspend_note, function (error, response) {
                expect(error).equal(null);
                done();
            });
        });

        it('billing agreement reactivate success', function (done) {
            var reactivate_note = {
                "note": "Reactivating the agreement"
            };

            paypal_sdk.billing_agreement.reactivate(billing_agreement_id, reactivate_note, function (error, response) {
                expect(error).equal(null);
                expect(response.httpStatusCode).equal(204);
                done();
            });
        });

        it('set outstanding agreement amount fails with cannot increase delinquent amount', function (done) {
            var outstanding_amount = {
                "value": "100000",
                "currency": "USD"
            };

            paypal_sdk.billing_agreement.set_balance(billing_agreement_id, outstanding_amount, function (error, response) {
                expect(error.response.name).equal('RP_CANT_INCREASE_OUTSTANDING_AMOUNT');
                expect(error.response.message).equal('Cannot increase delinquent amount');
                expect(error.response.information_link).equal('https://developer.paypal.com/webapps/developer/docs/api/#RP_CANT_INCREASE_OUTSTANDING_AMOUNT');
                expect(error.httpStatusCode).equal(400);
                done();
            });
        });

        it('bill outstanding agreement amount fails with cannot increase delinquent amount', function (done) {
            var outstanding_amount = {
                "note": "Billing Balance Amount",
                "amount": {
                    "value": "100000",
                    "currency": "USD"
                }
            };

            paypal_sdk.billing_agreement.bill_balance(billing_agreement_id, outstanding_amount, function (error, response) {
                expect(error.response.name).equal('RP_CANT_INCREASE_OUTSTANDING_AMOUNT');
                expect(error.response.message).equal('Cannot increase delinquent amount');
                expect(error.response.information_link).equal('https://developer.paypal.com/webapps/developer/docs/api/#RP_CANT_INCREASE_OUTSTANDING_AMOUNT');
                expect(error.httpStatusCode).equal(400);
                done();
            });
        });

        it('billing agreement cancel fails on invalid status', function (done) {
            var cancel_note = {
                "note": "Canceling the agreement"
            };

            paypal_sdk.billing_agreement.cancel(billing_agreement_id, cancel_note, function (error, response) {
                expect(error.response.name).equal('RP_INVALID_STATUS_TO_CANCEL');
                expect(error.response.message).equal('Invalid profile status for cancel action; profile should be active or suspended');
                expect(error.response.information_link).equal('https://developer.paypal.com/webapps/developer/docs/api/#RP_INVALID_STATUS_TO_CANCEL');
                expect(error.response.debug_id).not.be.empty;
                expect(error.httpStatusCode).equal(400);
                done();
            });
        });
    });
});