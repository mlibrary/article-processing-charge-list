This repository hosts the code that prepares and updates apc.lib.umich.edu from source data.
Along with the html and javascript used to present [apc.lib.umich.edu](https://apc.lib.umich.edu).

## Overview
The ruby code in `bin/update` builds `html/data.json`.

Otherwise:
`html/index.html`  
`html/js`  
`html/css`  

Are are static content.  Data is loaded all at once, and processed in-browser. 
