/**
 * CMOD Common Utilities
 *
 * Shared helper functions for all CMOD admin pages.
 * Handles folder registry, config read/write via Alfresco REST API.
 *
 * @namespace Alfresco.component
 * @class Alfresco.component.CmodCommon
 */
(function()
{
   var Dom = YAHOO.util.Dom;

   Alfresco.component.CmodCommon = {};

   var CMOD = Alfresco.component.CmodCommon;

   /**
    * Config folder path in repository
    */
   CMOD.CONFIG_PATH = "Data Dictionary/CMOD Config";
   CMOD.REGISTRY_FILE = "_cmod_folders.json";

   /**
    * Base URL for Alfresco v1 REST API via Share proxy.
    * The 'alfresco-api' endpoint is the correct proxy for the public REST API,
    * NOT the plain 'alfresco' endpoint which only handles legacy webscripts.
    */
   CMOD.API_BASE = Alfresco.constants.PROXY_URI.replace("/proxy/alfresco/", "/proxy/alfresco-api/-default-/public/alfresco/versions/1/");

   /**
    * Make an authenticated AJAX call via Share proxy to Alfresco
    */
   CMOD.request = function(config)
   {
      var defaultConfig = {
         method: "GET",
         dataObj: null,
         requestContentType: Alfresco.util.Ajax.JSON,
         responseContentType: Alfresco.util.Ajax.JSON
      };
      var mergedConfig = YAHOO.lang.merge(defaultConfig, config);

      Alfresco.util.Ajax.request({
         method: mergedConfig.method,
         url: mergedConfig.url,
         dataObj: mergedConfig.dataObj,
         requestContentType: mergedConfig.requestContentType,
         responseContentType: mergedConfig.responseContentType,
         successCallback: {
            fn: mergedConfig.successCallback || function() {},
            scope: mergedConfig.scope || this
         },
         failureCallback: {
            fn: mergedConfig.failureCallback || function(res) {
               Alfresco.util.PopupManager.displayMessage({ text: "Request failed: " + (res.serverResponse ? res.serverResponse.statusText : "Unknown error") });
            },
            scope: mergedConfig.scope || this
         }
      });
   };

   /**
    * Ensure the CMOD Config folder exists in the repository.
    * Calls back with the folder nodeId.
    */
   CMOD.ensureConfigFolder = function(callback, scope)
   {
      // Try to find the config folder first
      var listUrl = CMOD.API_BASE + "nodes/-root-/children?relativePath=" + encodeURIComponent(CMOD.CONFIG_PATH) + "&include=id";

      CMOD.request({
         url: listUrl,
         successCallback: function(res)
         {
            // Folder exists, but we need its nodeId
            // Get the folder node itself
            var folderUrl = CMOD.API_BASE + "nodes/-root-?relativePath=" + encodeURIComponent(CMOD.CONFIG_PATH);
            CMOD.request({
               url: folderUrl,
               successCallback: function(res2)
               {
                  callback.call(scope || this, res2.json.entry.id);
               },
               failureCallback: function()
               {
                  callback.call(scope || this, null);
               },
               scope: scope
            });
         },
         failureCallback: function()
         {
            // Folder doesn't exist, create it
            CMOD._createConfigFolder(callback, scope);
         },
         scope: scope
      });
   };

   /**
    * Create the CMOD Config folder under Data Dictionary
    */
   CMOD._createConfigFolder = function(callback, scope)
   {
      // First get Data Dictionary nodeId
      var ddUrl = CMOD.API_BASE + "nodes/-root-?relativePath=" + encodeURIComponent("Data Dictionary");

      CMOD.request({
         url: ddUrl,
         successCallback: function(res)
         {
            var ddNodeId = res.json.entry.id;
            var createUrl = CMOD.API_BASE + "nodes/" + ddNodeId + "/children";

            CMOD.request({
               method: "POST",
               url: createUrl,
               dataObj: {
                  name: "CMOD Config",
                  nodeType: "cm:folder"
               },
               successCallback: function(res2)
               {
                  callback.call(scope || this, res2.json.entry.id);
               },
               failureCallback: function()
               {
                  Alfresco.util.PopupManager.displayMessage({ text: "Failed to create CMOD Config folder" });
                  callback.call(scope || this, null);
               },
               scope: scope
            });
         },
         failureCallback: function()
         {
            Alfresco.util.PopupManager.displayMessage({ text: "Failed to locate Data Dictionary folder" });
            callback.call(scope || this, null);
         },
         scope: scope
      });
   };

   /**
    * Load the folder registry (_cmod_folders.json).
    * Returns array of {id, name} objects.
    */
   CMOD.loadFolderRegistry = function(configFolderNodeId, callback, scope)
   {
      CMOD._findFileInFolder(configFolderNodeId, CMOD.REGISTRY_FILE, function(nodeId)
      {
         if (nodeId)
         {
            CMOD._readFileContent(nodeId, function(data)
            {
               callback.call(scope || this, data ? data.folders || [] : []);
            }, scope);
         }
         else
         {
            callback.call(scope || this, []);
         }
      }, scope);
   };

   /**
    * Save the folder registry
    */
   CMOD.saveFolderRegistry = function(configFolderNodeId, folders, callback, scope)
   {
      var data = { folders: folders };
      CMOD._findFileInFolder(configFolderNodeId, CMOD.REGISTRY_FILE, function(nodeId)
      {
         if (nodeId)
         {
            CMOD._updateFileContent(nodeId, data, callback, scope);
         }
         else
         {
            CMOD._createFile(configFolderNodeId, CMOD.REGISTRY_FILE, data, callback, scope);
         }
      }, scope);
   };

   /**
    * Load a folder config file ({folderId}.json)
    */
   CMOD.loadFolderConfig = function(configFolderNodeId, folderId, callback, scope)
   {
      var fileName = folderId + ".json";
      CMOD._findFileInFolder(configFolderNodeId, fileName, function(nodeId)
      {
         if (nodeId)
         {
            CMOD._readFileContent(nodeId, function(data)
            {
               callback.call(scope || this, data || CMOD._emptyFolderConfig(folderId));
            }, scope);
         }
         else
         {
            callback.call(scope || this, CMOD._emptyFolderConfig(folderId));
         }
      }, scope);
   };

   /**
    * Save a folder config file
    */
   CMOD.saveFolderConfig = function(configFolderNodeId, folderId, config, callback, scope)
   {
      var fileName = folderId + ".json";
      CMOD._findFileInFolder(configFolderNodeId, fileName, function(nodeId)
      {
         if (nodeId)
         {
            CMOD._updateFileContent(nodeId, config, callback, scope);
         }
         else
         {
            CMOD._createFile(configFolderNodeId, fileName, config, callback, scope);
         }
      }, scope);
   };

   /**
    * Return an empty folder config structure
    */
   CMOD._emptyFolderConfig = function(folderId)
   {
      return {
         folderId: folderId,
         fieldDefinitions: [],
         fieldInformation: {},
         fieldMapping: {},
         indexerConfig: {
            triggers: [],
            fields: [],
            indexes: []
         }
      };
   };

   /**
    * Find a file by name in a folder. Calls back with nodeId or null.
    */
   CMOD._findFileInFolder = function(folderNodeId, fileName, callback, scope)
   {
      var url = CMOD.API_BASE + "nodes/" + folderNodeId + "/children?maxItems=100";

      CMOD.request({
         url: url,
         successCallback: function(res)
         {
            var entries = res.json.list.entries || [];
            for (var i = 0; i < entries.length; i++)
            {
               if (entries[i].entry.name === fileName)
               {
                  callback.call(scope || this, entries[i].entry.id);
                  return;
               }
            }
            callback.call(scope || this, null);
         },
         failureCallback: function()
         {
            callback.call(scope || this, null);
         },
         scope: scope
      });
   };

   /**
    * Read file content as JSON
    */
   CMOD._readFileContent = function(nodeId, callback, scope)
   {
      var url = CMOD.API_BASE + "nodes/" + nodeId + "/content";

      CMOD.request({
         url: url,
         successCallback: function(res)
         {
            callback.call(scope || this, res.json);
         },
         failureCallback: function()
         {
            callback.call(scope || this, null);
         },
         scope: scope
      });
   };

   /**
    * Update file content with JSON data
    */
   CMOD._updateFileContent = function(nodeId, data, callback, scope)
   {
      var url = CMOD.API_BASE + "nodes/" + nodeId + "/content";

      Alfresco.util.Ajax.request({
         method: "PUT",
         url: url,
         dataStr: JSON.stringify(data),
         requestContentType: "application/json",
         responseContentType: Alfresco.util.Ajax.JSON,
         successCallback: {
            fn: function(res)
            {
               if (callback) callback.call(scope || this, true);
            },
            scope: scope
         },
         failureCallback: {
            fn: function()
            {
               Alfresco.util.PopupManager.displayMessage({ text: "Failed to save configuration" });
               if (callback) callback.call(scope || this, false);
            },
            scope: scope
         }
      });
   };

   /**
    * Create a new JSON file in a folder
    */
   CMOD._createFile = function(folderNodeId, fileName, data, callback, scope)
   {
      var url = CMOD.API_BASE + "nodes/" + folderNodeId + "/children";

      // Create node first
      CMOD.request({
         method: "POST",
         url: url,
         dataObj: {
            name: fileName,
            nodeType: "cm:content",
            properties: {
               "cm:title": fileName
            }
         },
         successCallback: function(res)
         {
            var newNodeId = res.json.entry.id;
            // Now set the content
            CMOD._updateFileContent(newNodeId, data, callback, scope);
         },
         failureCallback: function()
         {
            Alfresco.util.PopupManager.displayMessage({ text: "Failed to create config file: " + fileName });
            if (callback) callback.call(scope || this, false);
         },
         scope: scope
      });
   };

   /**
    * Populate a folder selector dropdown from the registry
    */
   CMOD.populateFolderSelector = function(selectEl, folders, selectedId)
   {
      selectEl.innerHTML = '<option value="">-- Select Folder --</option>';
      for (var i = 0; i < folders.length; i++)
      {
         var opt = document.createElement("option");
         opt.value = folders[i].id;
         opt.textContent = folders[i].name;
         if (selectedId && folders[i].id === selectedId)
         {
            opt.selected = true;
         }
         selectEl.appendChild(opt);
      }
   };

   /**
    * Generate a simple unique ID for folders/fields
    */
   CMOD.generateId = function()
   {
      return "cmod_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6);
   };

})();
