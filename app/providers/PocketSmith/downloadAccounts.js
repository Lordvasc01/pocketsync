'use strict';

const api = require('./api');
const { processAccounts } = require('../../core/helpers');
const schema = require('./schemas/account');

/**
 * Fetch and normalize accounts
 * @param ctx
 * @return {function(): Promise<*|Knex.QueryBuilder>}
 */
const downloadAccounts = (ctx) => async () => {
  return processAccounts(ctx, schema, fetchAccounts, getAccountProviderRef, normalizeAccount);
};

/**
 * Fetch accounts from API and store in `apis` table
 * @param ctx
 * @return {Promise<*|Knex.QueryBuilder>}
 */
const fetchAccounts = async (ctx) => {
  const req = api(ctx);

  // fetch accounts
  const me = await req.fetchMe();
  return req.fetchTransactionAccounts(me.id);
};

/**
 * account provider ref getter
 * @param transaction
 * @return {*}
 */
const getAccountProviderRef = (transaction) => {
  return transaction.id;
};

/**
 * Normalize API data from account fetch
 * @param row
 * @return {*}
 */
const normalizeAccount = (row) => {
  const data = row.data;

  // normalize
  return {
    user_id: row.user_id,
    provider_id: row.provider_id,
    provider_ref: row.provider_ref,
    name: data.name,
    currency: data.currency_code.toUpperCase(),
    // starting_balance: toLowestCommonUnit(data.starting_balance),
  };
};

module.exports = {
  downloadAccounts,
  getAccountProviderRef,
  normalizeAccount,
};
