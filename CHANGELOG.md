# Changelog

## [Unreleased]

## [0.2.0] - 2020-05-13

### Added

- Searching commands which search using fzf and ripgrep: `fzf-quick-open.runFzfSearch, fzf-quick-open.runFzfSearchPwd`

## [0.1.0] - 2020-04-30

### Added

- Windows support by using null-terminated strings from `fzf` and `xargs`. Thanks to [NgrNxk](https://github.com/NgrNxk) for the fix!

## [0.0.8] - 2020-04-16

### Added

- Setting `fzf-quick-open.codeCmd` to override the command used to launch `code`. Useful if you use `code-insiders`.

## [0.0.7] - 2020-04-06

### Changed

- Upgrade some package dependencies

## [0.0.6] - 2020-02-09

### Added

- New commands which always use active document `pwd` on every invocation:
  - `fzf: Open file in PWD using fzf`
  - `fzf: Add workspace folder from PWD using fzf`

## [0.0.3] - 2020-01-18

### Added

- Initial release with `open file` and `add workspace folder functionality`
