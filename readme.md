## Level 1 of security most basic username and password
-In this form of security we make a simple username and password form and store them on our mongodb database and when user tries to login we simply match their password to the one stored in database.
-It is highly vulnerable as we are storing password in the database in plain text and if anyone gets their hands on our database our security is easily compromised.

## Level 2 of security Encrypting the database
-Here we encrypt the database passwords by using mongoose-encryption library and providing a secret key to encrypt and a cipher method like AES to encrypt the passwords in database.
-And when we receive the login request we decrypt the password from the databse using the key and cipher method and match it, plus here key is very important, so we store it in environment variables file .env
-Now as the key management is very important, also the encryption method a weak encryption method can easily be broken without key.

## Level 3 of security Hashing
-As above we were at risk due to key management and encryption method as, it is bilateral meaning it is used for both encryption and de-cryption as well
-Here we don't use a key to encrypt the passwords but instead we generate their hash by using algorithms like md5, which is unilateral.
-When user tries to login their password is converted into the hash and it is matched with the hash stored in database.
-Now it is secure, but it is very vulnerable to dictonary attack in which a hacker have a list of all possible combinations of letters and numbers with their hashs and they match it with hashs stored in our database
-Now most people's password very simple and common, their hashs are easy to crack, plus with modern computing power, 20 billion hashs can be processed in a second.

## Level 4 of securtiy Bcrypt hashing with salting

-Here we use different encrption algorithm other than md5 which is bcrypt and here instead of key we use salt which is stored along the final hash in database.
-We also have something called as salting rounds in which we do the hashing of same passoword multiple times making it more secure.
-And when the login password is receivied it also wents through the same proccess of hashing and salting genereating final hash, which then matches with the one stored in database.

## Level 5 of security cookies and session

-Now this is a more of data storage rather than security step as in this we store some information of last browsing session in cookie which is stored in the browser
-With the help of cookie a user doesn't need to add his/her login credentials for each time he/she is browsing through their session.

## Level 6 of security oAuth

-Here we authentcate the user with third party apps like google, facebook, twitter and we also get back some important data back from this third party apps about user for our app
-Plus we have done most important step of authentication which is we have delgated our important work of security to this third party apps
-Now this third party apps like google , facebook , twitter spends billions of dollars in this department only, and we don't have to worry about screwing up.