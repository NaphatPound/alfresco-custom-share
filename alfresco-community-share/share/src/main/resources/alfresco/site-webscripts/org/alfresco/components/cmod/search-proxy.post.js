var body = null;

try {
   var contentStr = "" + requestbody.content;
   if (contentStr && contentStr !== "null" && contentStr !== "undefined" && contentStr.length > 0) {
      body = JSON.parse(contentStr);
   }
} catch(e) {
   model.result = JSON.stringify({
      list: { entries: [] },
      error: "Failed to parse request: " + e.message
   });
   body = null;
}

if (body)
{
   if (!body.query || !body.query.query)
   {
      model.result = JSON.stringify({
         list: { entries: [] },
         error: "No query provided"
      });
   }
   else
   {
      var payload = JSON.stringify(body);
      var connector = remote.connect("alfresco-api");
      var result = connector.post(
         "/-default-/public/search/versions/1/search",
         payload,
         "application/json"
      );

      if (result.status.code == 200)
      {
         model.result = result.response;
      }
      else
      {
         var altConnector = remote.connect("alfresco");
         var altResult = altConnector.post(
            "/api/-default-/public/search/versions/1/search",
            payload,
            "application/json"
         );

         if (altResult.status.code == 200)
         {
            model.result = altResult.response;
         }
         else
         {
            model.result = JSON.stringify({
               list: { entries: [] },
               error: "Search failed (status " + result.status.code + ")"
            });
         }
      }
   }
}
else if (!model.result)
{
   model.result = JSON.stringify({
      list: { entries: [] },
      error: "Empty request body"
   });
}
