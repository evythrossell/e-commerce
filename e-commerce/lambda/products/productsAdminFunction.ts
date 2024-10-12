import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";

export async function handler(event: APIGatewayProxyEvent,
    context: Context) : Promise<APIGatewayProxyResult> {

        const lambdaRequestId = context.awsRequestId
        const apiRequestId = event.requestContext.requestId
        const method = event.httpMethod
        const resource = event.resource

        console.log(`API Gateway requestId: ${apiRequestId} - Lambda RequestId: ${lambdaRequestId}`)

        if (resource === "/products") {
            console.log("POST /products")
            return {
                statusCode: 201,
                body: "POST /products"
            } 
        } else if (resource === "/products/{id}") {
            const productId = event.pathParameters!.id as string
            if (method == "PUT") {
                console.log(`PUT /products/${productId}`)
            return {
                statusCode: 201,
                body: `PUT /products/${productId}`
            } 
            } else if (method === "DELETE") {
                console.log(`DELETE /products/${productId}`)
                return {
                    statusCode: 200,
                    body: `DELETE /products/${productId}`
                }
            }
        }

        return {
            statusCode: 400,
            body: "Bad Request"
        }
}        
