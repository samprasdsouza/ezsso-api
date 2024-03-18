
const { PutItemCommand, ScanCommand, DynamoDBClient, GetItemCommand } = require("@aws-sdk/client-dynamodb");
const { log } = require("console");

const DocumentClient = new DynamoDBClient({
    region: "local-env" ,// replace with your region in AWS account
    endpoint: "http://localhost:8002"
  });


  const getAllItems = async (TABLE_NAME) => {
    const params = {
        TableName: TABLE_NAME,
    };

    try {
        const command = new ScanCommand(params);
        const response = await DocumentClient.send(command);
        return response.Items;
    } catch (error) {
        console.error("Error scanning table:", error);
        throw error;
    }
};



const getSingleItemById = async (tableName, id) => {
    const params = {
      TableName: tableName,
      Key: {
        id: { S: id } // Assuming 'id' is a string. Modify accordingly if it's another type.
      }
    };
  
    try {
      const command = new GetItemCommand(params);
      const { Item } = await DocumentClient.send(command);
      return Item; // Return the item if found
    } catch (err) {
      console.error("Unable to read item:", err);
      throw err;
    }
  };
  
const insertItem = async (TABLE_NAME, itemObject) => {
    const params = {
        TableName: TABLE_NAME,
        Item: itemObject,
    };

    try {
        console.log(params);
        const command = new PutItemCommand(params);
        return await DocumentClient.send(command);
    } catch (error) {
        console.error("Error inserting item:", error);
        throw error;
    }
};

const generateUpdateQuery = (fields) => {
	let exp = {
		UpdateExpression: 'set',
		ExpressionAttributeNames: {},
		ExpressionAttributeValues: {},
	};
	Object.entries(fields).forEach(([key, item]) => {
		exp.UpdateExpression += ` #${key} = :${key},`;
		exp.ExpressionAttributeNames[`#${key}`] = key;
		exp.ExpressionAttributeValues[`:${key}`] = item;
	});
	exp.UpdateExpression = exp.UpdateExpression.slice(0, -1);
	return exp;
};

const updateItem = async (TABLE_NAME, id, itemObject) => {
	const expression = generateUpdateQuery(itemObject);
	const params = {
		TableName: TABLE_NAME,
		Key: {
			id,
		},
		ConditionExpression: 'attribute_exists(id)',
		...expression,
		ReturnValues: 'UPDATED_NEW',
	};
	return await DocumentClient.update(params).promise();
};

const deleteSingleItemById = async (TABLE_NAME, id) => {
	const params = {
		TableName: TABLE_NAME,
		Key: {
			id,
		},
	};
	return await DocumentClient.delete(params).promise();
};

module.exports = {
	DocumentClient,
	getAllItems,
	getSingleItemById,
	insertItem,
	updateItem,
	deleteSingleItemById,
};