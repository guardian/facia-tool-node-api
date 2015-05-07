# API for facia-tool

## config

_`/config/collection/[id]`_ get the configuration and the content of a collection

_`/config/front/[id]`_ get the configuration and the list of collections of a front

## find

_`/find/collections?q=[query]`_ find all collections matching the query.

_`/find/fronts?q=[query]`_ find all fronts matching the query.

### query

The query string matches [mongoDB Query and Projection Operators](http://docs.mongodb.org/manual/reference/operator/query/) and is implemented with [sift.js](https://github.com/crcn/sift.js).

For example

`/find/fronts?q={ "config.collections" : "collections_id" }` returns all fronts that contains the collection with ID `collections_id`

`/find/fronts?q={"config.imageUrl":{"$exists":true}}` returns all fronts the have an `imageUrl`

`/find/fronts?q={"config.webTitle":"Network Front"}` returns all fronts with a given `webTitle`

`/find/collections?q={"config.type":"dynamic/fast"}` returns all collections of a given `type`

`/find/collections?q={"collection.live.meta.customKicker":{"$regex":"<"}}` returns all collections containing articles with HTML in their `customKicker`

Note, the query must be url encoded.

# Filtering

All endpoint accept the following search parameters

_`?env=PROD`_ change environment, defaults to `PROD`
