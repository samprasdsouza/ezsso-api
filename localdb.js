
const { CreateTableCommand, DynamoDBClient } = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({
  region: "local-env" ,// replace with your region in AWS account
  endpoint: "http://localhost:8002"
});

const main = async () => {

  
const command = new CreateTableCommand({
  AttributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" },
      { AttributeName: "email", AttributeType: "S" },
  ],
  KeySchema: [
      { AttributeName: "id", KeyType: "HASH" }
  ],
  ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
  },
  TableName: "UserTable",
  GlobalSecondaryIndexes: [
      {
          IndexName: "UserDetail",
          KeySchema: [
              { AttributeName: "email", KeyType: "HASH" },
          ],
          Projection: {
              ProjectionType: "ALL"
          },
          ProvisionedThroughput: {
              ReadCapacityUnits: 5,
              WriteCapacityUnits: 5
          }
      }
  ]
});

  const response = await client.send(command);
  console.log(response);
  return response;
};



main()