# brain-gal

## Render a certain subtree of your Brain as a single web page gallery

TheBrain allows a rich way to build a complex network or graph of various data. In this case, the `example` folder builds a gallery of little cards or tiles that represent movie posters of animated feature films, where the data for all of this lives entirely in TheBrain.

## Missing piece

TheBrain has the ability to select a certain set of thoughts and then export an outline from a given thought. However this action takes many individual UI steps to achieve. It would be better to automate this using TheBrain 15's new Local API support (simple built-in server) and a single script that can reproduce this, `local-brain-text-outline.js`.

TheBrain API is documented at `https://api.bra.in/v1/docs.json`.

### Desired output

The example of the output is `_brain-outline.export.txt` which is just a text outline exported with the root being the home thought, and everything else being indented by tabs as a text outline below that. Ignoring indentation:
* lines that start with `-` (hyphen) are thought notes in Markdown or plain text;
* lines starting with `#` (pound sign) are references to a thought (by name) that exists elsewhere in the outline;
* lines that start with `+` are thought attachments, in this case URLs;
* and any other line is just the title or name of a thought, tag or type

### More details about `local-brain-text-outline.js` command-line script

* The API key for TB15 Local API access is in `build/api-key.txt`
* `localhost:8001` is the base URL for the API
* Auth header is `"Authorization: Bearer {apiKey}"` without the quotes
* The command-line arguments take a mandatory `brain ID` and a second argument, `root thought ID`.
* The `/api/app/state` route will tell if the app is open before other API requests are made.

## Folders

* `build/` - ignored build output or working data
* `example/` - `tailwind.css` and JSX code used by the Bray framework as component templates that can be executed to produce a styled web page
* `outline2jsx.js` - script that can turn the text outline output of TheBrain into the `data.jsx` main outline which calls subcomponents to eventually compute the divs and content of the output web page
