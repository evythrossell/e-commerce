import * as lambda from "aws-cdk-lib/aws-lambda"
import * as lambdaNodeJS from "aws-cdk-lib/aws-lambda-nodejs"
import * as cdk from "aws-cdk-lib"
import * as dynamodb from "aws-cdk-lib/aws-dynamodb"

import { Construct } from "constructs"

export class ProductAppStack extends cdk.Stack {
    readonly productsFetchHandler: lambdaNodeJS.NodejsFunction
    readonly productsDb: dynamodb.Table
    readonly productsAdminHandler: lambdaNodeJS.NodejsFunction

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props)

        this.productsDb = new dynamodb.Table(this, "ProductsDb", {
            tableName: "products",
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            partitionKey: {
                name: "id",
                type: dynamodb.AttributeType.STRING
            },
            billingMode: dynamodb.BillingMode.PROVISIONED,
            readCapacity: 1,
            writeCapacity: 1
        })
        this.productsFetchHandler = new lambdaNodeJS.NodejsFunction(this,
            "ProductsFetchFunction", {
            functionName: "ProductsFetchFunction",
            entry: "lambda/products/productsFetchFunction.ts",
            handler: "handler",
            runtime: lambda.Runtime.NODEJS_20_X,
            memorySize: 512,
            timeout: cdk.Duration.seconds(5),
            bundling: {
                minify: true,
                sourceMap: false
            },
            environment: {
                PRODUCTS_DB: this.productsDb.tableName
            }
        })
        this.productsDb.grantReadData(this.productsFetchHandler)

        this.productsAdminHandler = new lambdaNodeJS.NodejsFunction(this,
            "ProductsAdminFunction", {
            functionName: "ProductsAdminFunction",
            entry: "lambda/products/productsAdminFunction.ts",
            handler: "handler",
            runtime: lambda.Runtime.NODEJS_20_X,
            memorySize: 512,
            timeout: cdk.Duration.seconds(5),
            bundling: {
                minify: true,
                sourceMap: false
            },
            environment: {
                PRODUCTS_DB: this.productsDb.tableName
            }
        })
        this.productsDb.grantWriteData(this.productsAdminHandler)
    }
}