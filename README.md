# Keap XML-RPC for JavaScript

> **Legacy maintenance project.** This package only implements Keap's classic
> Infusionsoft XML-RPC API. It does not contain a REST client, and it should not
> be the starting point for a new Keap integration.

For new work, use the [Keap REST API v2](https://developer.keap.com/docs/restv2/)
and Keap's [official JavaScript or TypeScript SDK](https://github.com/infusionsoft/keap-sdk).

## Why this project still exists

This package is retained for existing integrations and for verified cases where
the XML-RPC API exposes a classic capability or data shape that the REST API
does not provide.

Examples represented by this package that may still require XML-RPC include:

- arbitrary `DataService` access to classic Infusionsoft tables and fields that
  are not modeled as REST resources;
- older follow-up sequence and action-set controls, including retrieving the
  next campaign step, pausing or resuming a sequence, rescheduling a step, and
  running an action set;
- classic saved-search and quick-search operations; and
- selected legacy email-template, merge-field, invoice, payment, and shipping
  operations without a direct one-for-one REST v2 equivalent.

This is not a permanent or exhaustive list. Keap continues to add REST v2
coverage, so check the current REST documentation before choosing XML-RPC.

Contact relationships are a good example of that changing coverage. They were
historically a reason to retain XML-RPC, but REST v2 now supports linking,
unlinking, and listing linked contacts. New relationship code should therefore
use REST v2.

## Maintenance policy

The goal of this repository is compatibility, not expansion:

- security and runtime compatibility fixes are welcome;
- fixes for existing XML-RPC behavior are welcome;
- new REST endpoints will not be duplicated here; and
- the generated service and table definitions date from January 2014 and may
  not reflect every subsequent Keap schema change.

Where REST offers an equivalent operation, prefer REST. A single application
can use Keap's REST SDK for normal work and this package only for the remaining
legacy calls.

## Installation

```sh
npm install keap-xmlrpc
```

Existing projects using the former package name can move over without code
changes:

```sh
npm uninstall infusionsoft-javascript-api
npm install keap-xmlrpc
```

Then replace `require('infusionsoft-javascript-api')` with
`require('keap-xmlrpc')`. Version `0.3.2` of the former package name is a
compatibility alias, but it is deprecated and should only be used as a short
migration bridge.

## Authentication

Create a `DataContext` with a Keap bearer token. Depending on the integration,
this may be an OAuth access token, Personal Access Token, or Service Account
Key. See Keap's current [authentication documentation](https://developer.keap.com/authentication/)
and [PAT/SAK documentation](https://developer.keap.com/pat-and-sak/).

Keep tokens out of source control and logs.

```javascript
var keapXmlRpc = require('keap-xmlrpc')

var infusionsoft = new keapXmlRpc.DataContext(
  process.env.KEAP_ACCESS_TOKEN
)
```

## Fluent table queries

The generated table definitions expose field names and the `DataContext`
exposes pluralized queryables:

```javascript
var keapXmlRpc = require('keap-xmlrpc')
var Contact = keapXmlRpc.api.tables.Contact
var infusionsoft = new keapXmlRpc.DataContext(
  process.env.KEAP_ACCESS_TOKEN
)

infusionsoft.Contacts
  .where(Contact.FirstName, 'Brandon')
  .like(Contact.LastName, 'V%')
  .select(Contact.Id, Contact.Email)
  .orderByDescending(Contact.LastName)
  .take(100)
  .toArray()
  .then(function (contacts) {
    console.log(contacts)
  })
  .catch(function (error) {
    console.error(error)
  })
```

Queries use the XML-RPC `DataService` and automatically fetch additional pages
when necessary. Joins are performed locally, may load an entire inner table,
and are not suitable for large datasets.

## Direct XML-RPC services

Generated services can also be called directly:

```javascript
infusionsoft.ContactService.findByEmail(
  'person@example.com',
  ['Id', 'FirstName', 'LastName', 'Email']
).then(function (contacts) {
  console.log(contacts)
})
```

The package currently exposes these classic services:

- `APIEmailService`
- `AffiliateProgramService`
- `APIAffiliateService`
- `ContactService`
- `DataService`
- `DiscountService`
- `FileService`
- `FunnelService`
- `InvoiceService`
- `OrderService`
- `ProductService`
- `SearchService`
- `ShippingService`
- `WebFormService`

Consult Keap's [XML-RPC documentation](https://developer.keap.com/docs/xml-rpc/)
for current server behavior. The presence of a generated method in this package
does not guarantee that Keap still enables it for every product or account.

## Development

Install dependencies and run the compatibility tests:

```sh
yarn install
yarn test
yarn audit
```

## License

Copyright (c) 2013 Brandon Valosek

Modified work Copyright 2018 Justin Handley

Released under the MIT license. See [LICENSE.txt](LICENSE.txt).
