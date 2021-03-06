# API for facia-tool

## config

__`/config/collection/[id]`__ get the configuration and the content of a collection.

__`/config/front/[id]`__ get the configuration and the list of collections of a front.

## find

__`/find/collections?q=[query]`__ find all collections matching the query.

__`/find/fronts?q=[query]`__ find all fronts matching the query.

### query

The query string matches [mongoDB Query and Projection Operators](http://docs.mongodb.org/manual/reference/operator/query/) and is implemented with [sift.js](https://github.com/crcn/sift.js).

### examples

* `/find/fronts?q={ "config.collections" : "collections_id" }` returns all fronts that contains the collection with ID `collections_id`

* `/find/fronts?q={"config.imageUrl":{"$exists":true}}` returns all fronts the have an `imageUrl`

* `/find/fronts?q={"config.webTitle":"Network Front"}` returns all fronts with a given `webTitle`

* `/find/collections?q={"config.type":"dynamic/fast"}` returns all collections of a given `type`

* `/find/collections?q={"collection.live.meta.customKicker":{"$regex":"<"}}` returns all collections containing articles with HTML in their `customKicker`

* `/find/collections?q={"$or":[{"collection.live.meta.customKicker":{"$regex":"<"}}, {"collection.live.meta.trailText":{"$regex":"<"}}]}` returns all collections with HTML either in `customKicker` or `trailText`


Note, the query must be url encoded.

## list

__`/list/fronts`__ list all fronts.

__`/list/collections`__ list all collections.
__`/list/deleted/collections`__ list all collections that are not included in any front.

### query

__`/list/fronts/by/priority/editorial`__ list all _editorial_ fronts.

__`/list/collections/by/front/uk`__ list all collections inside _uk_ front.
__`/list/collections/by/front/uk/and/by/front/politics`__ list all collections shared by _uk_ and _politics_ front.
__`/list/collections/by/metadata/canonical`__ list all collections tagged _Canonical_.
__`/list/collections/by/fornt/uk/and/by/metadata/canonical`__ list all collections tagged _Canonical_ inside front _uk_.

# Filtering

All endpoints accept the following search parameters

_`?env=PROD`_ change environment, defaults to `PROD`

# Working locally

To have a local instance working on your machine you need to define some environment variables

* `AWS_ACCESS_KEY_ID`
* `AWS_SECRET_ACCESS_KEY`
