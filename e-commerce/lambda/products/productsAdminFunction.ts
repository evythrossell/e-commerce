import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { ProductRepository } from "./layers/productsLayer/nodejs/productRepository";
import { DynamoDB } from "aws-sdk"
import { Product } from "aws-cdk-lib/aws-servicecatalog";

const productsDdb = process.env.PRODUCTS_DDB!
const ddbClient = new DynamoDB.DocumentClient()

const productRepository = new ProductRepository(ddbClient, productsDdb)

export async function handler(event: APIGatewayProxyEvent,
    context: Context): Promise<APIGatewayProxyResult> {

    const lambdaRequestId = context.awsRequestId
    const apiRequestId = event.requestContext.requestId
    const method = event.httpMethod
    const resource = event.resource

    console.log(`API Gateway requestId: ${apiRequestId} - Lambda RequestId: ${lambdaRequestId}`)

    if (resource === "/products") {
        console.log("POST /products")
        const product = JSON.parse(event.body!) // as ProductRepository
        const productCreated = await productRepository.create(product)
        return {
            statusCode: 201,
            body: JSON.stringify(productCreated)
        }
    } else if (resource === "/products/{id}") {
        const productId = event.pathParameters!.id as string
        if (method == "PUT") {
            console.log(`PUT /products/${productId}`)
            const product = JSON.parse(event.body!) // as ProductRepository
            const productUpdated = await productRepository.updateProduct(productId, product)

            try {
                return {
                    statusCode: 201,
                    body: JSON.stringify(productUpdated)
                }
            } catch (ConditionalCheckFailedException) {
                return {
                    statusCode: 404,
                    body: 'Product not found'
                }
            }
        } else if (method === "DELETE") {
            console.log(`DELETE /products/${productId}`)
            try {
                const product = await productRepository.deleteProduct(productId)
                return {
                    statusCode: 200,
                    body: JSON.stringify(product)
                }
            } catch (error) {
                console.error((<Error>error).message)
            }
        }
    }

    return {
        statusCode: 400,
        body: "Bad Request"
    }
}        
