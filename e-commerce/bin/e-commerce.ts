#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ProductAppStack } from '../lib/productsApp-stack';
import { EcommerceApiStack } from '../lib/e-commerceApi-stack';

const app = new cdk.App();

const env: cdk.Environment = {
  account: "780194067452",
  region: "us-east-1"
}

const tags = {
  cost: "Ecommerce",
  team: "Ecommerce Team"
}

const productsAppStack = new ProductAppStack(app, "ProductsApp", {
  tags: tags,
  env: env
})

const eCommerceApiStack = new EcommerceApiStack(app, "EcommerceApi", {
  productsFetchHandler: productsAppStack.productsFetchHandler,
  tags: tags,
  env: env
})
eCommerceApiStack.addDependency(productsAppStack)