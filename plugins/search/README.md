# Bloodhound Search API Reference
This document explains how the different functions in a search plugin work, and what items are expected to be returned.  All functions can return non-required properties, but only properties listed in this documentation will be utilized.  Reserved properties should never be used by your plugin or it will fail to function properly.

---
## search.searchForShow

###Purpose:

The purpose of this function is to search for a show by a given name and return basic information about it.  You should avoid returning too much information about the show in this function, it will not be used.

###Inputs:

- `name`
  - **Type:** `String`

This is the name of the show that the user is searching for.  It will not be filtered for you.  If you need to filter it or format it a particular way, you should do so.

###Outputs:

You should be returning an object that has the following properties.

####Required Properties:
- `show_id`
  - **Type:** `String`

This is the localized ID that the search provider uses to identify this TV show.

- `name`
  - **Type:** `String`

This is the name of the television show as it's referred to by your search provider.  Behind the scenes, we refer to shows by a global ID that includes the year the show started.  If your search provider adds this to the show name, please remove it.

Example: `Archer (2009)` would become `Archer`

- `started`
  - **Type:** `String`

This is the year that the television show first aired.

####Optional Properties:

*none*

####Reserved Properties:

- `_id`
- `_rev`
- `mod_date`
- `global_id`

---
## search.getShowByID

###Purpose:

The purpose of this function is to get more detailed information about a show.  This is done using the localized ID that we found earlier in the search.  This can't be done on a name alone, a search must be performed first.

###Inputs:

- `id`
  - **Type:** `String`

This is the localized ID of the show that we are searching for.

###Outputs:

You should be returning an object that has the following properties.

####Required Properties:
- `show_id`
-  **Type:** `String`

This is the localized ID that the search provider uses to identify this TV show.

- name
  - **Type:** `String`

This is the name of the television show as it's referred to by your search provider.  Behind the scenes, we refer to shows by a global ID that includes the year the show started.  If your search provider adds this to the show name, please remove it.

Example: `Archer (2009)` would become `Archer`

- `started`
  - **Type:** `String`

This is the year that the television show first aired.

- `status`
  - **Type:** `String`

This describes if the show is cancelled or not.  `DEAD` and `LIVE` are the only values acceptable for this property.

- `seasons`
  - **Type:** `Number`

This is how many seasons of this show there currently are.  This could include seasons that haven't yet aired, but are confirmed to be in production.  

- `runtime`
  - **Type:** `Number`

This is the length (in minutes) of this show.  Special episodes shouldn't factor into this total.  If a show normally airs in a 30 minute timeslot, the value for this property should be `30`.

- `showlink`
  - **Type:** `String`

This is a URL that points to the information about this show.


####Optional Properties:

*none*

####Reserved Properties:

- `_id`
- `_rev`
- `mod_date`
- `global_id`

---
## search.getListingByID

###Purpose:

The purpose of this function is to get full season and episode information about a show.

###Inputs:

- `id`
  - **Type:** `String`

This is the localized ID of the show that we are searching for.

###Outputs:

You should be returning an object that has the following properties.

####Required Properties:
- `show_id`
  -  **Type:** `String`

This is the localized ID that the search provider uses to identify this TV show.

- `total_episodes`
  - **Type:** `Number`

This is the total number of episodes provided by the listing.  This may include episodes that haven't aired yet.

- `seasons`
  - **Type:** `Array`

The seasons object contains all the seasons and episodes for this show.  The seasons object is broken down into sub-objects that we'll describe below

- `seasons.season`
  - **Type:** `String`

This represents the current season the following episodes are in.  It should be preceded with a 0.  Ideally this will be fixed in the future. (see issue #44).

- `seasons.episodes`
  - **Type:** `Array`

This should be an array of episodes that are in that season.  It's an array of sub-objects that we'll describe below.

- `seasons.episodes[x].episode_number`
  - **Type:** `Number`

This is the episode number for this episode.  This number refers to the number of total episodes.  The first episode should be `1` and the last should be the value of `total_episodes`

- `seasons.episodes[x].season_number`
  - **Type:** `String`

This is the episode number for this episode.  This number refers to  the position of this episode in the season.

- `seasons.episodes[x].air_date`
  - **Type:** `String`

This is air date for this episode.  It should be in the format `YYYY-MM-DD`.

- `seasons.episodes[x].title`
  - **Type:** `String`

This is the title of the episode.  If your search provider includes a positional indicator in the title (`S01E01`,`1x01`, etc.), please remove it.

- `seasons.episodes[x].link`
  - **Type:** `String`

This is the same for a description of this episode.


####Optional Properties:

- `seasons.episodes[x].description`
  - **Type:** `String`

This is the description of this episode.

####Reserved Properties:

- `_id`
- `_rev`
- `mod_date`
- `global_id`

---
