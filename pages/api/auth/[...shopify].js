import Shopify, { ShopifyAuth } from "@lib/shopify";
import { DataType } from "@shopify/shopify-api";

export default ShopifyAuth({
  afterAuth: async (req, res, { accessToken, shop }) => {
    // Provide HOST_NAME here just in case it was not provided by env variable
    // This might occur during the first deploy to Vercel when you don't yet know
    // what domain your app is being hosted on
    Shopify.Context.update({
      HOST_NAME: process.env.HOST,
    });

    const response = await Shopify.Webhooks.Registry.register({
      shop,
      accessToken,
      path: "/api/webhooks/shopify",
      topic: "APP_UNINSTALLED",
      webhookHandler: (topic, shop, body) => {
        console.log("APP_UNINSTALLED handler was executed");
      },
    });

    if (!response.success) {
      console.log(
        `Failed to register APP_UNINSTALLED webhook: ${response.result}`
      );
    } else {
      console.log("APP_UNINSTALLED Webhook was successfully registered");
    }

    //////For scriptTags in shopify.
    // Load the current session to get the `accessToken`.
    const session = await Shopify.Utils.loadCurrentSession(req, res);

    // Create a new client for the specified shop.
    const client = new Shopify.Clients.Rest(session.shop, session.accessToken);
    console.log(session.accessToken);
    // const client = new Shopify.Clients.Rest(
    //   "kadwey-store-new.myshopify.com",
    //   accessToken
    // );

    const body = {
      script_tag: {
        event: "onload",
        src: "https://shopify-app-boilerplate-vercel.vercel.app/scripts/firstScript.js",
      },
    };
    const data = await client.post({
      path:  `script_tags`,
      headers: {
      
        "X-Shopify-Access-Token": session.accessToken,
        "Accept" : "*/*",
        
      },
      data: body,
      type: DataType.JSON,
    });

    // // Redirect to app with shop parameter upon auth
    // ctx.redirect(`/?shop=${shop}&host=${host}`);
  },
});
