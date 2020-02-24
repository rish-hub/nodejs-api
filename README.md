# Operation with Users and Posts and Comments
 
Node.js REST apis

## Quick Start

Folder
    server   

```bash
# Install dependencies for server cd server
npm install
yarn install

npm i  
yarn start

# Run the Express server  
npm run server

 

# Server runs on http://localhost:5000  
```

You will need to create a config.json in the server config folder with (already included though for a smooth run )
node modules are not included.

```
module.exports = {
  mongoURI: 'YOUR_OWN_MONGO_URI',
  secretOrKey: 'YOUR_OWN_SECRET'
};
```

## App Info
Node.js APIs
0> api/auth/
  
  Login functionalty
  provide username and password and get token 

1> api/user/fetchUsers

fetch Users and save it in master db
role admin is given by default.
password: is same as the user name 

2> api/user/fetchPostsComments

fetch 
    comments and posts
    map them 
    save them in different db with the name of respective users (username is used for naming of the table) 

3> api/user/allposts 

fetch all the posts from all the different dbs (named after different users)with collection `posts`.
only admin can access.

4> api/user/allUsers

fetch all the users' details 
only admin can access.
    
5> api/user/posts

fetch posts related to the logged in users

6> api/user/

fetch user detials related to the logged in users
 
### Author

Rishabh Jain

### Version

1.0.0
 
