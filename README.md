# gulp-ionic-versiontoggle
A gulpfile that allows quick building of free / paid Ionic apps, based on the Ionic Framework's gulpfile. It was designed to mostly run on Windows, but with some simple modification, will run just as well on Mac and Linux

## Usage
Use this script after you've already created your app, and keystores and such. 

- Install these dependencies:
  - `gulp`
  - `gulp-util`
  - `bower`
  - `gulp-concat`
  - `gulp-sass`
  - `gulp-minify-css`
  - `gulp-rename`
  - `shelljs`
  - `xmldoc`
- Edit the default variables
  - Set `defaultJarSignerLocation` to the location of `jarsigner`
  - Set `defaultZipAlignLocation` to the location of `zipalign`
  - Set `defaultKeystoreLocation` to the location of your keystore file
  - Set `defaultKeystoreAlias` to your keystore alias
  - Set `defaultPaidPackageID` to the package ID for your PAID app. Repeat for the other PackageID and PackageName vars
- In your `./resources` folder, create two icons:
  - `icon_paid.png`
  - `icon_free.png`
- Run this command to build:
  - `gulp build-android-free --storepass mykeystorepassword` or 
  - `gulp build-android-paid --storepass mykeystorepassword`


## `--prepare-mac`
This additional command is used internally when transferring the code from a PC, to a Mac for building and testing. It does the following:

- Runs `git reset --hard` to clean up the folder
- Runs `git pull` to get the latest version of your code
- Makes a `./resources` folder
- Runs `cordova clean ios` to clear out any old build files
- Removes everything in `plugins` and `platforms` to catch any plugins that weren't `--save`'d to our `package.json` file
- Adds iOS and Android platforms
- Restores the state with `ionic state restore`
- Sets up Ionic's hooks with `ionic hooks add`
- Runs `npm install`, then `bower install`, then finally `ionic io init`

Some commands can be run individually, and additional commands can be run. See the gulpfile for information
