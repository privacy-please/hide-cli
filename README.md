hide-cli
===

A simple cli tool that will deeply rename everything in a target directory to obscure its contents.

## Install
```
npm i -g hide-cli
```

## Use
```
hide path/to/hide [--key|-k] [--hide|-h] [--show|-s]
```

### Defaults
By default, if you pass no options, the target directory's contents will be toggled based on whether or not some of the content is already obscured.

### Options
- `key` a key to use when encoding the names of the folder contents
- `hide` a flag to force the contents to hide
- `show` a flag to force the contents to show

## Example
```
hide my/secret-stuff -k secretkey
```

## How it works

### Hiding
1. Creates a UUID for each file path
2. Encodes the file name using a key rotation cypher with a given key, if no key is given it uses the target directory's full path as the key
3. Renames the file to mapped UUID
4. Stores map of UUID to encoded file names inside a `records` file within the target directory

### Showing
1. Reads the `records` file to build the UUID to encoded name map
2. Decodes the file name mapped from its UUID using the rotation cypher and the given key, if no key is given it uses the target directory's full path as the key
3. Renames the file to the decoded file name

## Notes
- If you don't specify a key and you move the directory, the key used to encode the records will no longer match and you'll need to move the directory back to it's previous location to decode
- All this does is rename the files and folders and remove the extensions. The content of the files remains unchanged.
- **DANGER** Be careful where you point this, it will deeply rename the contents of whatever you target. 