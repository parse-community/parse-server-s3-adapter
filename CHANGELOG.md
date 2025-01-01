# [4.0.0](https://github.com/parse-community/parse-server-s3-adapter/compare/3.0.0...4.0.0) (2025-01-01)


### Features

* Migrate S3 Client from AWS SDK v2 to v3  ([#231](https://github.com/parse-community/parse-server-s3-adapter/issues/231)) ([8ac6014](https://github.com/parse-community/parse-server-s3-adapter/commit/8ac6014d2945e211c1c6cddd3675037c49729cca))


### BREAKING CHANGES

* The AWS S3 credentials are now set under `s3overrides.credentials` instead of directly under the `s3overrides` key; see the [migration guide](https://github.com/parse-community/parse-server-s3-adapter?#migration-guide-from-3x-to-4x) for more details. ([8ac6014](8ac6014))

# [3.0.0](https://github.com/parse-community/parse-server-s3-adapter/compare/2.2.0...3.0.0) (2024-10-22)


### Features

* Add support for Node 20, 22; remove support for Node 14, 16 ([#226](https://github.com/parse-community/parse-server-s3-adapter/issues/226)) ([da5a94f](https://github.com/parse-community/parse-server-s3-adapter/commit/da5a94fa180ba57dfae33659e18db4704582e8e6))


### BREAKING CHANGES

* Removes support for Node 14, 16. ([da5a94f](da5a94f))

# [2.2.0](https://github.com/parse-community/parse-server-s3-adapter/compare/2.1.0...2.2.0) (2023-05-15)


### Features

* Upgrade aws-sdk from 2.1362.0 to 2.1363.0 ([#192](https://github.com/parse-community/parse-server-s3-adapter/issues/192)) ([3c3a953](https://github.com/parse-community/parse-server-s3-adapter/commit/3c3a953ebbe9654c05893ab127b80b7913818008))

# [2.1.0](https://github.com/parse-community/parse-server-s3-adapter/compare/2.0.2...2.1.0) (2023-05-12)


### Features

* Add option to generate pre-signed URL with expiration time ([#180](https://github.com/parse-community/parse-server-s3-adapter/issues/180)) ([d92363d](https://github.com/parse-community/parse-server-s3-adapter/commit/d92363d68a609b1db089bf83028b4f6780c9491c))

## [2.0.2](https://github.com/parse-community/parse-server-s3-adapter/compare/2.0.1...2.0.2) (2023-04-21)


### Bug Fixes

* Remove development dependencies from production ([#190](https://github.com/parse-community/parse-server-s3-adapter/issues/190)) ([73b17e4](https://github.com/parse-community/parse-server-s3-adapter/commit/73b17e40f124212020cf72e700976f8d3cbb22d5))

## [2.0.1](https://github.com/parse-community/parse-server-s3-adapter/compare/2.0.0...2.0.1) (2023-04-21)


### Bug Fixes

* Security upgrade xml2js and aws-sdk ([#181](https://github.com/parse-community/parse-server-s3-adapter/issues/181)) ([66fad32](https://github.com/parse-community/parse-server-s3-adapter/commit/66fad32dd94b5280f29a12fbdf24d9427eb8c2eb))

# [2.0.0](https://github.com/parse-community/parse-server-s3-adapter/compare/1.6.3...2.0.0) (2023-04-21)


### Features

* Add support for Node 16, 18, remove support for Node 12, 15 ([#189](https://github.com/parse-community/parse-server-s3-adapter/issues/189)) ([993534c](https://github.com/parse-community/parse-server-s3-adapter/commit/993534c57cc7009363a740bbbb04a0e4e56c7f0c))


### BREAKING CHANGES

* Removes support for Node 12 and 15 which have reached their End-of-Life date and are not officially maintained anymore. ([993534c](993534c))

## [1.6.3](https://github.com/parse-community/parse-server-s3-adapter/compare/1.6.2...1.6.3) (2023-04-21)


### Bug Fixes

* upgrade aws-sdk from 2.906.0 to 2.907.0 ([#166](https://github.com/parse-community/parse-server-s3-adapter/issues/166)) ([e224f0a](https://github.com/parse-community/parse-server-s3-adapter/commit/e224f0aa3388b03307e06700aa0dbe9251fae1a9))

## 1.6.2
[Full Changelog](https://github.com/parse-community/parse-server-s3-adapter/compare/1.6.1...1.6.2)

### Breaking Changes
none
### Notable Changes
none
### Other Changes
- Upgrade to AWS SDK 2.905.0 (Antonio Davi Macedo Coelho de Castro) [#163](https://github.com/parse-community/parse-server-s3-adapter/pull/163)
___

## 1.6.1
[Full Changelog](https://github.com/parse-community/parse-server-s3-adapter/compare/1.6.0...1.6.1)
### Breaking Changes
none
### Notable Changes
none
### Other Changes
- Upgraded to AWS SDK 2.879.0 (Manuel Trezza) [#132](https://github.com/parse-community/parse-server-s3-adapter/pull/132)
___
## 1.6.0
[Full Changelog](https://github.com/parse-community/parse-server-s3-adapter/compare/1.5.0...1.6.0)
- NEW: Support passing baseUrl param as a function [#106](https://github.com/parse-community/parse-server-s3-adapter/pull/106). Thanks to [uzaysan](https://github.com/uzaysan)

## 1.5.0
[Full Changelog](https://github.com/parse-community/parse-server-s3-adapter/compare/1.4.0...1.5.0)
- NEW: Add file ACL override parameter [#90](https://github.com/parse-community/parse-server-s3-adapter/pull/90). Thanks to [Manuel](https://github.com/mtrezza)
- NEW: Added support for metadata and tagging files [#83](https://github.com/parse-community/parse-server-s3-adapter/pull/83). Thanks to [stevestencil](https://github.com/stevestencil)

## 1.4.0
[Full Changelog](https://github.com/parse-community/parse-server-s3-adapter/compare/1.3.0...1.4.0)
- NEW: Support endpoint in S3Overrides [#79](https://github.com/parse-community/parse-server-s3-adapter/pull/79). Thanks to [Kyle Barron](https://github.com/kylebarron)
- NEW: Support filename validation and AWS directories [#76](https://github.com/parse-community/parse-server-s3-adapter/pull/76). Thanks to [Mike Patnode](https://github.com/mpatnode)

## 1.3.0
[Full Changelog](https://github.com/parse-community/parse-server-s3-adapter/compare/1.2.3...1.3.0)
- CHANGE: Conform to FilesAdapter Interface [#73](https://github.com/parse-community/parse-server-s3-adapter/pull/73). Thanks to [Diamond Lewis](https://github.com/dplewis)
- CHANGE: Add airbnb style guide to linter [#72](https://github.com/parse-community/parse-server-s3-adapter/pull/72). Thanks to [Diamond Lewis](https://github.com/dplewis)
- NEW: Support byte range requests [#71](https://github.com/parse-community/parse-server-s3-adapter/pull/71). Thanks to [Diamond Lewis](https://github.com/dplewis)

## 1.2.3
[Full Changelog](https://github.com/parse-community/parse-server-s3-adapter/compare/1.2.2...1.2.3)
- Another attempt at getting travis/npm working together [#69](https://github.com/parse-community/parse-server-s3-adapter/pull/69)

## 1.2.2
[Full Changelog](https://github.com/parse-server-modules/parse-server-s3-adapter/compare/v1.0.6...1.2.2)
- Dependency Security Updates
- Fix tests [#69](https://github.com/parse-community/parse-server-s3-adapter/pull/68) thanks to [davimacedo](https://github.com/davimacedo)

## [v1.0.6](https://github.com/parse-server-modules/parse-server-s3-adapter/tree/v1.0.6) (2016-12-6)

[Full Changelog](https://github.com/parse-server-modules/parse-server-s3-adapter/compare/v1.0.5...v1.0.6)

**Closed issues:**

- commit bb933cc breaks adapter for me [\#31](https://github.com/parse-server-modules/parse-server-s3-adapter/issues/31)
- getFileLocation does not URI encode filename in directAccess cases [\#28](https://github.com/parse-server-modules/parse-server-s3-adapter/issues/28)
- Ability to Resize Images [\#27](https://github.com/parse-server-modules/parse-server-s3-adapter/issues/27)

**Merged pull requests:**

- Add lint to project. [\#34](https://github.com/parse-server-modules/parse-server-s3-adapter/pull/34) ([acinader](https://github.com/acinader))
- Handle immutable configuration [\#33](https://github.com/parse-server-modules/parse-server-s3-adapter/pull/33) ([acinader](https://github.com/acinader))
- Revert "also using base url as endpoint in order to use aws s3 compat… [\#32](https://github.com/parse-server-modules/parse-server-s3-adapter/pull/32) ([acinader](https://github.com/acinader))
- Encode File URI [\#30](https://github.com/parse-server-modules/parse-server-s3-adapter/pull/30) ([davimacedo](https://github.com/davimacedo))
- Add s3overrides option format [\#24](https://github.com/parse-server-modules/parse-server-s3-adapter/pull/24) ([viawest-davidsix](https://github.com/viawest-davidsix))
- Use baseUrl as S3 endpoint [\#23](https://github.com/parse-server-modules/parse-server-s3-adapter/pull/23) ([dpoetzsch](https://github.com/dpoetzsch))
- v1.0.5 - changelog [\#22](https://github.com/parse-server-modules/parse-server-s3-adapter/pull/22) ([acinader](https://github.com/acinader))

## [v1.0.5](https://github.com/parse-server-modules/parse-server-s3-adapter/tree/v1.0.5) (2016-08-16)
[Full Changelog](https://github.com/parse-server-modules/parse-server-s3-adapter/compare/v1.0.4...v1.0.5)

**Closed issues:**

- Files are not deleted on AWS S3 after being deleted on Parse-Dashboard. [\#17](https://github.com/parse-server-modules/parse-server-s3-adapter/issues/17)
- Use AWS SDK & CLI standard configuration [\#14](https://github.com/parse-server-modules/parse-server-s3-adapter/issues/14)

**Merged pull requests:**

- 24 hours in seconds is 86400, not 86400000 [\#21](https://github.com/parse-server-modules/parse-server-s3-adapter/pull/21) ([joeyslack](https://github.com/joeyslack))
- Fix bug that put credentials on the wrong object. [\#19](https://github.com/parse-server-modules/parse-server-s3-adapter/pull/19) ([acinader](https://github.com/acinader))
- Use default AWS credential provider. [\#15](https://github.com/parse-server-modules/parse-server-s3-adapter/pull/15) ([acinader](https://github.com/acinader))
- Add an optional global cache control for all s3 uploaded files. [\#13](https://github.com/parse-server-modules/parse-server-s3-adapter/pull/13) ([KBog](https://github.com/KBog))

## [v1.0.4](https://github.com/parse-server-modules/parse-server-s3-adapter/tree/v1.0.4) (2016-07-18)
[Full Changelog](https://github.com/parse-server-modules/parse-server-s3-adapter/compare/v1.0.3...v1.0.4)

**Merged pull requests:**

- get signature version from environment or default [\#12](https://github.com/parse-server-modules/parse-server-s3-adapter/pull/12) ([ststroppel](https://github.com/ststroppel))
- Updates changelog [\#11](https://github.com/parse-server-modules/parse-server-s3-adapter/pull/11) ([flovilmart](https://github.com/flovilmart))

## [v1.0.3](https://github.com/parse-server-modules/parse-server-s3-adapter/tree/v1.0.3) (2016-05-24)
[Full Changelog](https://github.com/parse-server-modules/parse-server-s3-adapter/compare/v1.0.2...v1.0.3)

**Merged pull requests:**

- Updates changelog and version [\#10](https://github.com/parse-server-modules/parse-server-s3-adapter/pull/10) ([flovilmart](https://github.com/flovilmart))
- Adding ability to ignore bucketPrefix for public URLs [\#9](https://github.com/parse-server-modules/parse-server-s3-adapter/pull/9) ([blacha](https://github.com/blacha))

## [v1.0.2](https://github.com/parse-server-modules/parse-server-s3-adapter/tree/v1.0.2) (2016-04-25)
[Full Changelog](https://github.com/parse-server-modules/parse-server-s3-adapter/compare/v1.0.1...v1.0.2)

**Closed issues:**

- Is it possible to save to a customized folder dynamically? [\#4](https://github.com/parse-server-modules/parse-server-s3-adapter/issues/4)
- The S3 file adapter seems not working [\#2](https://github.com/parse-server-modules/parse-server-s3-adapter/issues/2)

**Merged pull requests:**

- Adds option to specify an alternate baseUrl \(e.g. CloudFront\) [\#6](https://github.com/parse-server-modules/parse-server-s3-adapter/pull/6) ([flavordaaave](https://github.com/flavordaaave))

## [v1.0.1](https://github.com/parse-server-modules/parse-server-s3-adapter/tree/v1.0.1) (2016-03-31)
**Merged pull requests:**

- 1.0.1 [\#3](https://github.com/parse-server-modules/parse-server-s3-adapter/pull/3) ([flovilmart](https://github.com/flovilmart))
- Fixed bug whereby region was ignored. [\#1](https://github.com/parse-server-modules/parse-server-s3-adapter/pull/1) ([jsuresh](https://github.com/jsuresh))



\* *This Change Log was automatically generated by [github_changelog_generator](https://github.com/skywinder/Github-Changelog-Generator)*
