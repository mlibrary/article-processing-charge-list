This repository hosts the code that prepares and updates apc.lib.umich.edu from source data.
Along with the html and javascript used to present [apc.lib.umich.edu](https://apc.lib.umich.edu).

## Overview

### Data

This source data is a Google Sheet with columns:

* Publisher
* Journal Title
* eISSN
* eISSN Link
* Discount or Waiver
* Campuses Covered
* Coverage Years
* Link to Agreement Info

And ~13,000 rows.

This isn't hand-edited in it's entirety, multiple sheets are used with lookup tables for publisher information, though each lookup table is maintained by hand.

### Converting to json

The ruby code in `bin/update` builds `html/data.json`.  It exports the spreadsheet as tab separated variables(.tsv), and then converts to json. If the `html/data.json` file is changed, then it is added and commited to the git repository in a pull request.

The pull request is reviewed, and when merged, the updates are deployed to production.

### Serving the static content
Otherwise everything is served as static content.  This can be CloudFront, an S3 Bucket, local disk behind Apache, whatever.  The files in question are in the `html` directory:

* `html/data.json`
* `html/index.html`  
* `html/js`  
* `html/css`  

Are all static content.  Data is loaded in the browser, all at once, and processed in-browser.  This is acceptable for the current scale of the data involved. 
