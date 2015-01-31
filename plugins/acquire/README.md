# Bloodhound Acquire API Reference
This document explains how the different functions in a acquire plugin work, and what items are expected to be returned.  All functions can return non-required properties, but only properties listed in this documentation will be utilized.  Reserved properties should never be used by your plugin or it will fail to function properly.

---
## acquire.findShowURLs

###Purpose:

The purpose of this function is to search for a show and return a name and link of where to acquire this episode.

###Inputs:

- `name`
  - **Type:** `String`

This will be the global id for the episode.  It consists of the name of the series and the year the show started airing.

Example: a_simple_test_show_2015

- `episode`
  - **Type:** `String`

This is a string that represents the season number and episode number of a specific episode.

Example: For Season 1 Episode 1: S01E01

- `ep_name`
  - **Type:** `String`

This is the title of the episode that we are searching for.

Example: A Simple Test Show

###Outputs:

You should be returning an object that has the following properties.

####Required Properties:
- `suggestions`
  - **Type:** `Array`

This is an array of recommended matches for the episode.  There's no limit to the amount of results you can put in this array, but it's a good idea to keep it small (< 4).  If there are no results found, create the array, but leave it empty.

- `results`
  - **Type:** `Array`

This is an array of total matches for the episode.  You should not include results that appear in suggestions in this array as well.  There's no limit to the amount of results you can put in this array, it's a good idea to keep it small (< 40).  If there are no results found, create the array, but leave it empty.

- `match.link`
  - **Type:** `String`

This is the location of where the user can acquire the show.  This link should be as close as possible to the episode if a link to the episode itself isn't possible.

- `match.name`
  - **Type:** `String`

This is the friendly name of the episode.  It should be whatever the acquire provider calls the episode internally.

####Optional Properties:

- `match.meta.size`
  - **Type:** `String`

This is the total size of the file.  It should be a human readable format.

Example: 150 MB

- `match.meta.quality`
  - **Type:** `String`

This is the quality or resolution of the file.  

Example: 480p

- `match.meta.languages`
  - **Type:** `Array`

This is an array of all of the languages supported for this file.

Example: ["English"]

- `match.meta.prices`
  - **Type:** `Object`

This is an object that lists all of the prices for each type of file.

- `match.meta.prices.sd`
  - **Type:** `Number`

The price for the SD version of the file.  Please do not include the currency symbol.

- `match.meta.prices.hd`
  - **Type:** `Number`

The price for the HD version of the file.  Please do not include the currency symbol.

- `match.meta.previews`
  - **Type:** `Object`

This is an object that lists all of the preview types for the file.

- `match.meta.previews.img`
  - **Type:** `String`

This is a link to a preview image for this file.

- `match.meta.previews.video`
  - **Type:** `Object`

This is a link to the preview video clip for this file.


####Reserved Properties:

- `_id`
- `_rev`
- `mod_date`
- `global_id`
- `name`
- `episode`

---
