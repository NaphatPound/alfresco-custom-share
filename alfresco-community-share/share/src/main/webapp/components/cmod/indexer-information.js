/**
 * CMOD Indexer Information component
 *
 * Manages indexer configuration per CMOD folder: triggers, fields, and indexes.
 *
 * @namespace Alfresco.component
 * @class Alfresco.component.CmodIndexerInformation
 */
(function()
{
   var Dom = YAHOO.util.Dom,
      Event = YAHOO.util.Event,
      CMOD = Alfresco.component.CmodCommon;

   Alfresco.component.CmodIndexerInformation = function(htmlId)
   {
      Alfresco.component.CmodIndexerInformation.superclass.constructor.call(this, "Alfresco.component.CmodIndexerInformation", htmlId);

      this.configFolderNodeId = null;
      this.folders = [];
      this.selectedFolderId = null;
      this.folderConfig = null;

      // Track edit state for each sub-form
      this.editTriggerIndex = -1;
      this.editFieldIndex = -1;
      this.editIndexIndex = -1;

      return this;
   };

   YAHOO.extend(Alfresco.component.CmodIndexerInformation, Alfresco.component.Base,
   {
      onReady: function()
      {
         var me = this;

         // Folder selector
         Event.on(this.id + "-folder-select", "change", this.onFolderChange, this, true);

         // Trigger form
         Event.on(this.id + "-add-trigger-btn", "click", this.onAddTrigger, this, true);
         Event.on(this.id + "-save-trigger-btn", "click", this.onSaveTrigger, this, true);
         Event.on(this.id + "-cancel-trigger-btn", "click", function() { Dom.get(me.id + "-trigger-form").style.display = "none"; }, this, true);

         // Indexer field form
         Event.on(this.id + "-add-idxfield-btn", "click", this.onAddIdxField, this, true);
         Event.on(this.id + "-save-idxfield-btn", "click", this.onSaveIdxField, this, true);
         Event.on(this.id + "-cancel-idxfield-btn", "click", function() { Dom.get(me.id + "-idxfield-form").style.display = "none"; }, this, true);

         // Index form
         Event.on(this.id + "-add-index-btn", "click", this.onAddIndex, this, true);
         Event.on(this.id + "-save-index-btn", "click", this.onSaveIndex, this, true);
         Event.on(this.id + "-cancel-index-btn", "click", function() { Dom.get(me.id + "-index-form").style.display = "none"; }, this, true);

         // Save all
         Event.on(this.id + "-save-all-btn", "click", this.onSaveAll, this, true);

         CMOD.ensureConfigFolder(function(nodeId)
         {
            me.configFolderNodeId = nodeId;
            if (nodeId) me._loadFolders();
         }, this);
      },

      _loadFolders: function()
      {
         var me = this;
         CMOD.loadFolderRegistry(this.configFolderNodeId, function(folders)
         {
            me.folders = folders;
            CMOD.populateFolderSelector(Dom.get(me.id + "-folder-select"), folders, me.selectedFolderId);
         }, this);
      },

      onFolderChange: function()
      {
         this.selectedFolderId = Dom.get(this.id + "-folder-select").value;
         if (this.selectedFolderId)
         {
            this._loadFolderConfig();
         }
         else
         {
            this._renderAllEmpty();
            Dom.get(this.id + "-save-all-btn").style.display = "none";
         }
      },

      _loadFolderConfig: function()
      {
         var me = this;
         CMOD.loadFolderConfig(this.configFolderNodeId, this.selectedFolderId, function(config)
         {
            me.folderConfig = config;
            if (!me.folderConfig.indexerConfig) me.folderConfig.indexerConfig = { triggers: [], fields: [], indexes: [] };
            me._renderTriggers();
            me._renderFields();
            me._renderIndexes();
            Dom.get(me.id + "-save-all-btn").style.display = "inline-block";
         }, this);
      },

      // ---- TRIGGERS ----
      _renderTriggers: function()
      {
         var tbody = Dom.get(this.id + "-triggers-table-body");
         var triggers = this.folderConfig.indexerConfig.triggers || [];
         if (triggers.length === 0)
         {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-message">No triggers defined</td></tr>';
            return;
         }
         var html = "";
         for (var i = 0; i < triggers.length; i++)
         {
            var t = triggers[i];
            html += '<tr>' +
               '<td>' + Alfresco.util.encodeHTML(t.id || String(i + 1)) + '</td>' +
               '<td>' + Alfresco.util.encodeHTML(t.charValue || '') + '</td>' +
               '<td>' + Alfresco.util.encodeHTML(t.hexValue || '') + '</td>' +
               '<td>' + (t.position || 0) + '</td>' +
               '<td><button class="cmod-btn" data-action="edit-trigger" data-index="' + i + '">Edit</button> ' +
               '<button class="cmod-btn cmod-btn-danger" data-action="delete-trigger" data-index="' + i + '">Delete</button></td>' +
               '</tr>';
         }
         tbody.innerHTML = html;
         this._bindTableActions(tbody);
      },

      onAddTrigger: function()
      {
         if (!this.selectedFolderId) return;
         this.editTriggerIndex = -1;
         Dom.get(this.id + "-trigger-form-title").innerHTML = "Add Trigger";
         Dom.get(this.id + "-trigger-char").value = "";
         Dom.get(this.id + "-trigger-hex").value = "";
         Dom.get(this.id + "-trigger-pos").value = "0";
         Dom.get(this.id + "-trigger-form").style.display = "block";
      },

      onSaveTrigger: function()
      {
         var data = {
            id: CMOD.generateId(),
            charValue: Dom.get(this.id + "-trigger-char").value.trim(),
            hexValue: Dom.get(this.id + "-trigger-hex").value.trim(),
            position: parseInt(Dom.get(this.id + "-trigger-pos").value, 10) || 0
         };
         if (this.editTriggerIndex >= 0)
         {
            data.id = this.folderConfig.indexerConfig.triggers[this.editTriggerIndex].id;
            this.folderConfig.indexerConfig.triggers[this.editTriggerIndex] = data;
         }
         else
         {
            this.folderConfig.indexerConfig.triggers.push(data);
         }
         Dom.get(this.id + "-trigger-form").style.display = "none";
         this._renderTriggers();
      },

      // ---- INDEXER FIELDS ----
      _renderFields: function()
      {
         var tbody = Dom.get(this.id + "-fields-table-body");
         var fields = this.folderConfig.indexerConfig.fields || [];
         if (fields.length === 0)
         {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-message">No fields defined</td></tr>';
            return;
         }
         var html = "";
         for (var i = 0; i < fields.length; i++)
         {
            var f = fields[i];
            html += '<tr>' +
               '<td>' + Alfresco.util.encodeHTML(f.id || String(i + 1)) + '</td>' +
               '<td>' + Alfresco.util.encodeHTML(f.name || '') + '</td>' +
               '<td>' + (f.lineNumber || 0) + '</td>' +
               '<td>' + (f.columnPosition || 0) + '</td>' +
               '<td>' + (f.length || 0) + '</td>' +
               '<td><button class="cmod-btn" data-action="edit-idxfield" data-index="' + i + '">Edit</button> ' +
               '<button class="cmod-btn cmod-btn-danger" data-action="delete-idxfield" data-index="' + i + '">Delete</button></td>' +
               '</tr>';
         }
         tbody.innerHTML = html;
         this._bindTableActions(tbody);
      },

      onAddIdxField: function()
      {
         if (!this.selectedFolderId) return;
         this.editFieldIndex = -1;
         Dom.get(this.id + "-idxfield-form-title").innerHTML = "Add Field";
         Dom.get(this.id + "-idxfield-name").value = "";
         Dom.get(this.id + "-idxfield-line").value = "0";
         Dom.get(this.id + "-idxfield-col").value = "0";
         Dom.get(this.id + "-idxfield-len").value = "0";
         Dom.get(this.id + "-idxfield-form").style.display = "block";
      },

      onSaveIdxField: function()
      {
         var data = {
            id: CMOD.generateId(),
            name: Dom.get(this.id + "-idxfield-name").value.trim(),
            lineNumber: parseInt(Dom.get(this.id + "-idxfield-line").value, 10) || 0,
            columnPosition: parseInt(Dom.get(this.id + "-idxfield-col").value, 10) || 0,
            length: parseInt(Dom.get(this.id + "-idxfield-len").value, 10) || 0
         };
         if (this.editFieldIndex >= 0)
         {
            data.id = this.folderConfig.indexerConfig.fields[this.editFieldIndex].id;
            this.folderConfig.indexerConfig.fields[this.editFieldIndex] = data;
         }
         else
         {
            this.folderConfig.indexerConfig.fields.push(data);
         }
         Dom.get(this.id + "-idxfield-form").style.display = "none";
         this._renderFields();
      },

      // ---- INDEXES ----
      _renderIndexes: function()
      {
         var tbody = Dom.get(this.id + "-indexes-table-body");
         var indexes = this.folderConfig.indexerConfig.indexes || [];
         if (indexes.length === 0)
         {
            tbody.innerHTML = '<tr><td colspan="4" class="empty-message">No indexes defined</td></tr>';
            return;
         }
         var html = "";
         for (var i = 0; i < indexes.length; i++)
         {
            var idx = indexes[i];
            html += '<tr>' +
               '<td>' + Alfresco.util.encodeHTML(idx.id || String(i + 1)) + '</td>' +
               '<td>' + Alfresco.util.encodeHTML(idx.fieldRef || '') + '</td>' +
               '<td>' + Alfresco.util.encodeHTML(idx.metadataName || '') + '</td>' +
               '<td><button class="cmod-btn" data-action="edit-index" data-index="' + i + '">Edit</button> ' +
               '<button class="cmod-btn cmod-btn-danger" data-action="delete-index" data-index="' + i + '">Delete</button></td>' +
               '</tr>';
         }
         tbody.innerHTML = html;
         this._bindTableActions(tbody);
      },

      onAddIndex: function()
      {
         if (!this.selectedFolderId) return;
         this.editIndexIndex = -1;
         Dom.get(this.id + "-index-form-title").innerHTML = "Add Index";
         Dom.get(this.id + "-index-fieldref").value = "";
         Dom.get(this.id + "-index-meta").value = "";
         Dom.get(this.id + "-index-form").style.display = "block";
      },

      onSaveIndex: function()
      {
         var data = {
            id: CMOD.generateId(),
            fieldRef: Dom.get(this.id + "-index-fieldref").value.trim(),
            metadataName: Dom.get(this.id + "-index-meta").value.trim()
         };
         if (this.editIndexIndex >= 0)
         {
            data.id = this.folderConfig.indexerConfig.indexes[this.editIndexIndex].id;
            this.folderConfig.indexerConfig.indexes[this.editIndexIndex] = data;
         }
         else
         {
            this.folderConfig.indexerConfig.indexes.push(data);
         }
         Dom.get(this.id + "-index-form").style.display = "none";
         this._renderIndexes();
      },

      // ---- COMMON ----
      _bindTableActions: function(tbody)
      {
         var me = this;
         var buttons = tbody.getElementsByTagName("button");
         for (var i = 0; i < buttons.length; i++)
         {
            Event.on(buttons[i], "click", function(e)
            {
               var btn = e.target || e.currentTarget;
               var action = btn.getAttribute("data-action");
               var idx = parseInt(btn.getAttribute("data-index"), 10);
               me._handleAction(action, idx);
            });
         }
      },

      _handleAction: function(action, idx)
      {
         switch (action)
         {
            case "edit-trigger":
               this.editTriggerIndex = idx;
               var t = this.folderConfig.indexerConfig.triggers[idx];
               Dom.get(this.id + "-trigger-form-title").innerHTML = "Edit Trigger";
               Dom.get(this.id + "-trigger-char").value = t.charValue || "";
               Dom.get(this.id + "-trigger-hex").value = t.hexValue || "";
               Dom.get(this.id + "-trigger-pos").value = t.position || 0;
               Dom.get(this.id + "-trigger-form").style.display = "block";
               break;
            case "delete-trigger":
               if (confirm("Delete this trigger?"))
               {
                  this.folderConfig.indexerConfig.triggers.splice(idx, 1);
                  this._renderTriggers();
               }
               break;
            case "edit-idxfield":
               this.editFieldIndex = idx;
               var f = this.folderConfig.indexerConfig.fields[idx];
               Dom.get(this.id + "-idxfield-form-title").innerHTML = "Edit Field";
               Dom.get(this.id + "-idxfield-name").value = f.name || "";
               Dom.get(this.id + "-idxfield-line").value = f.lineNumber || 0;
               Dom.get(this.id + "-idxfield-col").value = f.columnPosition || 0;
               Dom.get(this.id + "-idxfield-len").value = f.length || 0;
               Dom.get(this.id + "-idxfield-form").style.display = "block";
               break;
            case "delete-idxfield":
               if (confirm("Delete this field?"))
               {
                  this.folderConfig.indexerConfig.fields.splice(idx, 1);
                  this._renderFields();
               }
               break;
            case "edit-index":
               this.editIndexIndex = idx;
               var ix = this.folderConfig.indexerConfig.indexes[idx];
               Dom.get(this.id + "-index-form-title").innerHTML = "Edit Index";
               Dom.get(this.id + "-index-fieldref").value = ix.fieldRef || "";
               Dom.get(this.id + "-index-meta").value = ix.metadataName || "";
               Dom.get(this.id + "-index-form").style.display = "block";
               break;
            case "delete-index":
               if (confirm("Delete this index?"))
               {
                  this.folderConfig.indexerConfig.indexes.splice(idx, 1);
                  this._renderIndexes();
               }
               break;
         }
      },

      _renderAllEmpty: function()
      {
         Dom.get(this.id + "-triggers-table-body").innerHTML = '<tr><td colspan="5" class="empty-message">No triggers defined</td></tr>';
         Dom.get(this.id + "-fields-table-body").innerHTML = '<tr><td colspan="6" class="empty-message">No fields defined</td></tr>';
         Dom.get(this.id + "-indexes-table-body").innerHTML = '<tr><td colspan="4" class="empty-message">No indexes defined</td></tr>';
      },

      onSaveAll: function()
      {
         CMOD.saveFolderConfig(this.configFolderNodeId, this.selectedFolderId, this.folderConfig, function()
         {
            Alfresco.util.PopupManager.displayMessage({ text: "Indexer configuration saved" });
         }, this);
      }
   });
})();
