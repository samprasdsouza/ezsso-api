const express = require("express");
const { getAllItems, insertItem, getSingleItemById } = require("../controllers");
const { v4: uuidv4 } = require('uuid');
const { genJwtToken } = require("../utils/tokenIssuer");
const bcrypt = require('bcrypt');
const { comparePasswords } = require("../utils/decrypt");
const { doLogin, login} = require("../controllers/routersController");

const router = express.Router();


router
  .route("/login")
  .get(login)
  .post(doLogin);

router.get('/', async (req, res, next) => {
    try {
        console.log('testing the api routes');

        return res.code(200).send('ok')
    } catch (error) {
        next(error);
    }
});

router.post('/signUp', async (req, res, next) => {
    try {
        console.log(req.body);
        const id = uuidv4();

        const { firstName, lastName, email, password } = req.body;
        const hashPassword = async (password) => {
            console.log('password', password);
            try {
                // Generate a salt
                const saltRounds = 10;
                const salt = await bcrypt.genSalt(saltRounds);

                // Hash the password with the generated salt
                const hashedPassword = await bcrypt.hash(password, salt);

                return hashedPassword;
            } catch (error) {
                throw error;
            }
        }

        const convertToDynamoDBFormat = (itemObject) => {
            const dynamoDBItem = {};
            for (const [key, value] of Object.entries(itemObject)) {
                dynamoDBItem[key] = { S: value };
            }
            return dynamoDBItem;
        }

        console.log('jere');
        const hashedPassword = await hashPassword(password)
        console.log(hashedPassword);
        const dynamoDBItem = convertToDynamoDBFormat({ id, firstName, lastName, email, hashedPassword });
        const response = await insertItem('UserTable', dynamoDBItem)

        const payload = {
            ...{
                userEmail: dynamoDBItem.email,
                firstName: dynamoDBItem.firstName,
                lastName: dynamoDBItem.lastName,
                shareEmail: undefined,
                uid: dynamoDBItem.id,
                // global SessionID for the logout functionality.
                // globalSessionID: globalSessionToken
            }
        };
        const val = await genJwtToken(payload)
        console.log('token', val);
        return payload;
    } catch (error) {
        next(error)
    }
})




module.exports = router;
