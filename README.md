## Instagram Node.js
Instagram's private API.
Based on awesome project [Instagram-API](https://github.com/mgp25/Instagram-API)

## Installation

    $ npm install instanode

## Testing

After install you can check how it work. Go to node_modules/instanode/test directory and make changes in *test.js* file.

    const TEST_USERNAME = 'PLACE_YOUR_USERNAME_HERE'; 
    const TEST_PASSWORD = 'PLACE_YOUR_PASSWORD_HERE';

And run mocha test

    mocha test.js
or

    node node_modules/.bin/mocha test.js

## Initializing

To use the library, you'll need to enter your Instagram username and password. We can't implement OAuth 
authentication be-course it is closed API.

    let Instanode = require('instanode');

    let instaClient = new Instanode(YOUR_USERNAME, YOUR_PASSWORD);
    instanode.login((err, result) => {
        console.log(result); // This is user signature object. Save it for next use without additional login
    });
    
After that, you can do other API calls.
Also you can just save *result* object as JSON string or other format and in next time use saved signature in instance

    let instaClient = new Instanode(userSignatureObject);

## Post a photo

It is very easy. Just make sure you have user-signature object or loggined instanode instance.
  
    instaClient.uploadPhoto(PATH_TO_PHOTO_JPG, {caption: 'Caption for this photo'}, (err, result) => {
        console.log(result); // Result should contain some information about new photo
    });

If you have only saved user-signature and don't want use instance with signature, you can pass it as option

    instaClient.uploadPhoto(PATH_TO_PHOTO_JPG, {
        caption: 'Caption for this photo',
        userSignature: userSignature
      }, (err, result) => {
        console.log(result); // Result should contain some information about new photo
      });

## Terms and conditions
- You will NOT use this API for marketing purposes (spam, massive sending...).
- We do NOT give support to anyone that wants this API to send massive messages or similar.
- We reserve the right to block any user of this repository that does not meet these conditions.

## Legal
This code is in no way affiliated with, authorized, maintained, sponsored or endorsed by Instagram 
or any of its affiliates or subsidiaries. This is an independent and unofficial API. Use at your own risk.