This part of the package manages the items that you display in your app.

## SETUP

The only requirement for this package is to link the appropriate Firebase url (www.firebase.com). 

1. If you already have a Firebase account, login, go to your Dashboard and create a new app.
2. Open this workspace by pressing "Manage this app".
   In your browser, remember the url (i.e. something like: [your-app-name].firebaseio.com
3. Then go to your package in the folder www/js and open app.js
4. At the top, replace FBURL with [your-app-name].firebaseio.com on line 11


## HOSTING

Next is to host your admin panel. You will need to host it in an environment that supports Angular.

A good option is Cloud9:

1. go to www.c9.io
2. create an account or login
3. in your dashboard, create a new workspace (select nodejs)
4. open this workspace
5. delete all files in there
6. upload (drag and drop) all the files from this package to the workspace
7. open index.html and then press Run (green button in top)

Your admin panel should be served now on something like [name-workspace]-[username].c9users.io
Note: if you are not active for two days, you will need to login to your workspace and press again the green button Run to activate the admin. This can be overcome by uploading all your files to a custom server. Feel free to email me if you wish to do this.

